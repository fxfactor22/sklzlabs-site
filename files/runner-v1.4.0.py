"""Learning runner — three entry streams + end-of-day review, interactive.

Commands while it runs (type + Enter):
  buy EURUSD your reason here     forced BUY, note = "your reason here"
  sell GBPUSD london sweep        forced SELL with your note
  scan                            run the famous-strategy scanners once now
  auto on / auto off              enable/disable automatic scanner entries
  review                          run the end-of-day AI review right now
  status                          positions + today's tally
  quit                            stop the runner (open trades stay in MT5)

Everything is journaled. The review PROPOSES; it never changes parameters.
"""
from __future__ import annotations

import json
import os
import threading
import time
import urllib.request
from datetime import datetime, timezone

from basket_engine.learn.capture import Journal
from basket_engine.learn.entries import EntryController
from basket_engine.learn.review import summarize, ai_review
from basket_engine.learn.scanners import SCANNERS
from basket_engine.learn import journal_push


class LearningRunner:
    def __init__(self, io, tf_min=60, lookback=24, risk_pct=0.5,
                 auto=False, symbols=None, log=print) -> None:
        path = os.path.join(os.path.dirname(__file__), "..", "..",
                            "learning_journal.jsonl")
        self.journal = Journal(path)
        self.ec = EntryController(io, self.journal, tf_min, lookback, risk_pct, log)
        self.io = io
        self.tf_min = tf_min
        self.lookback = lookback
        self.auto = auto
        self.symbols = symbols or ["EURUSD", "GBPUSD", "XAUUSD"]
        self.log = log
        self._auto_seen: set = set()
        # --- v1.4.0 remote control (dashboard START/PAUSE) ---
        self.entries_blocked = False
        self._remote_state = "run"
        t = threading.Thread(target=self._command_loop, daemon=True)
        t.start()

    # ---- v1.4.0 remote control: poll dashboard command every 30s ----
    def _command_loop(self):
        api = os.environ.get("SKLZ_API_URL", "").rstrip("/")
        key = os.environ.get("SKLZ_BOT_KEY", "") or os.environ.get("BOT_INGEST_KEY", "")
        bot = os.environ.get("SKLZ_BOT_NAME", "learning-runner")
        if not (api and key):
            return                      # telemetry env not set; run local-only
        while True:
            try:
                req = urllib.request.Request(
                    f"{api}/api/bot/command?bot_name={bot}",
                    headers={"Authorization": f"Bearer {key}"})
                with urllib.request.urlopen(req, timeout=30) as r:
                    cmd = (json.loads(r.read().decode()).get("command") or "run")
                if cmd != self._remote_state:
                    self._remote_state = cmd
                    if cmd == "pause":
                        self.auto = False
                        self.entries_blocked = True
                        self.log("[REMOTE] PAUSED from dashboard - no new entries; "
                                 "existing positions still managed.")
                    else:
                        self.entries_blocked = False
                        self.log("[REMOTE] RUN from dashboard - entries allowed. "
                                 "(type 'auto on' to re-enable auto entries)")
            except Exception:
                pass                    # never let remote control kill the runner
            time.sleep(30)

    # ---- forced ----
    def cmd_buy(self, parts):  self._forced(+1, parts)
    def cmd_sell(self, parts): self._forced(-1, parts)
    def _forced(self, side, parts):
        if len(parts) < 2:
            self.log("usage: buy SYMBOL your reason for the entry"); return
        if self.entries_blocked:
            self.log("Entries are PAUSED from the dashboard. Press START there to resume.")
            return
        symbol = parts[1].upper()
        note = " ".join(parts[2:]) or "manual"
        self.ec.forced_entry(symbol, side, note)

    # ---- scanners ----
    def scan_once(self) -> int:
        n = 0
        for sym in self.symbols:
            if not self.io.has_symbol(sym):
                continue
            # market-open guard: never scan on frozen weekend/closed data
            if hasattr(self.io, "market_live") and not self.io.market_live(sym):
                continue
            for name, fn in SCANNERS.items():
                sig = fn(self.io, sym, self.tf_min, self.lookback)
                if not sig:
                    continue
                key = (sym, name, sig[0])
                if key in self._auto_seen:
                    continue          # don't re-fire the same setup every loop
                self._auto_seen.add(key)
                side, detail = sig
                self.log(f"[scan] {name} on {sym}: {detail}")
                if self.auto and not self.entries_blocked:
                    self.ec.auto_entry(name, sym, side, detail)
                    n += 1
        return n

    # ---- exits: reconcile closed positions into the journal ----
    def sync_exits(self) -> None:
        open_tickets = {p["ticket"] for p in self.io.my_positions()}
        rows = self.journal.load_day()
        entered = {r["ticket"] for r in rows if r.get("type") == "entry" and r.get("ticket")}
        exited = {r["ticket"] for r in rows if r.get("type") == "exit"}
        for tk in entered - exited - open_tickets:
            # position closed — fetch the EXACT realized P/L from deal history
            pnl = self.io.realized_pnl(tk)
            if pnl is None:
                pnl = 0.0
                self.log(f"[exit] ticket {tk} closed (P/L pending in history)")
            else:
                self.log(f"[exit] ticket {tk} closed: {pnl:+.2f} realized")
            self.journal.record_exit(tk, 0.0, pnl)

    # ---- review ----
    def review(self) -> dict:
        closed = self.journal.reconcile()
        stats = summarize(closed)
        rep = ai_review(stats, closed)
        self.log("\n" + "=" * 58)
        self.log("  END-OF-DAY REVIEW  (AI proposes — you decide)")
        self.log("=" * 58)
        self.log(f"  {rep.get('headline','')}")
        self.log(f"  forced vs auto: {rep.get('forced_vs_auto','')}")
        self.log(f"  winning pattern: {rep.get('winning_pattern','')}")
        props = rep.get("proposals", [])
        if props:
            self.log("  PROPOSED CHANGES (apply manually if you agree):")
            for i, p in enumerate(props, 1):
                self.log(f"   {i}. [{p.get('confidence','?')}] {p.get('change')}: "
                         f"{p.get('suggestion')}")
                self.log(f"      reason: {p.get('reason')}")
                self.log(f"      caution: {p.get('caution')}")
        else:
            self.log("  No proposals (small sample or no AI key).")
        self.log(f"  coach: {rep.get('note_to_trader','')}")
        self.log("=" * 58 + "\n")
        # persist the review beside the journal
        rpath = os.path.join(os.path.dirname(self.journal.path),
                             f"review-{datetime.now(timezone.utc):%Y-%m-%d}.json")
        import json
        with open(rpath, "w", encoding="utf-8") as f:
            json.dump({"stats": stats, "review": rep}, f, indent=2)
        # push the day's closed trades into the SKLZ Journal (honest timeline)
        try:
            journal_push.push(closed, log=self.log)
        except Exception as exc:  # noqa: BLE001
            self.log(f"[journal] push error: {exc}")
        return rep

    def status(self):
        pos = self.io.my_positions()
        closed = self.journal.reconcile()
        s = summarize(closed)
        self.log(f"  open positions: {len(pos)} | today: {s['trades']} closed, "
                 f"{s['win_rate']:.0%} win, {s['total_pnl']:+.2f} P/L | "
                 f"auto-entries: {'ON' if self.auto else 'OFF'}")
        for p in pos:
            self.log(f"    #{p['ticket']} {'BUY' if p['side']>0 else 'SELL'} "
                     f"{p['lots']} {p['symbol']} @ {p['open_price']} "
                     f"({p['profit']:+.2f})")
