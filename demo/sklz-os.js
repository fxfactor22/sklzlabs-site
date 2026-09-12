/* SKLZ PRO TRADER OS — shared runtime.

   Live data comes from the same endpoints the Signal Desk already uses.
   Everything else on these pages is labelled demonstration content, and
   this file never invents a trade, a price, a ticket or a result. */

const API = "https://api.sklzlabs.com";
const TOKEN = new URLSearchParams(location.search).get("t") || "";

/* One sales destination for every commercial CTA on every surface, so a
   price or a route can never drift between the site, the OS and the bot. */
const SALES_LINK = "https://t.me/sklzlabsnew_bot?start=demo_channel";

/* How long we will wait for personalisation before giving up on it.
   The page is already on screen by then — this only decides how long
   the fallback identity stays visible. */
const BRAND_TIMEOUT_MS = 6000;

/* The provider's own identity, from their private demo link.
   These defaults are what the page paints with immediately; the real
   values replace them when (and only if) the brand call returns. */
const BRAND = {
  name: "SKLZ Pro Trader OS",
  channel: "SKLZ Signals",
  language: "en",
  logo: "",
  loaded: false,
};

function initials(s) {
  return (s || "SK").trim().split(/\s+/).slice(0, 2)
    .map(w => w[0]).join("").toUpperCase();
}

/* NOTHING on any page waits for this. The shell, the navigation and every
   CTA are on screen before it is called; a slow or dead brand endpoint can
   only delay personalisation, never first paint. */
async function loadBrand() {
  if (!TOKEN) return BRAND;
  const ctl = typeof AbortController === "function" ? new AbortController() : null;
  const bail = setTimeout(() => { if (ctl) ctl.abort(); }, BRAND_TIMEOUT_MS);
  try {
    const r = await fetch(`${API}/api/demo-links/${TOKEN}`,
      ctl ? { signal: ctl.signal } : undefined);
    if (!r.ok) return BRAND;
    const d = await r.json();
    BRAND.name = d.provider_name || BRAND.name;
    BRAND.channel = d.telegram_channel || BRAND.channel;
    BRAND.language = d.language || BRAND.language;
    BRAND.logo = d.logo_url || "";
    BRAND.secondsLeft = d.seconds_remaining;
    BRAND.loaded = true;
  } catch (e) { /* timed out or unreachable — the fallback identity stands */ }
  finally { clearTimeout(bail); }
  return BRAND;
}

/* Render first, hydrate second. Call this LAST on a page, never await it.
   `then` runs once the brand call has settled either way, so a page can
   repaint the few places that embed the provider's name in content. */
function hydrateBrand(then) {
  loadBrand().then(() => {
    paintBrand();
    if (typeof then === "function") { try { then(BRAND); } catch (e) {} }
  });
}

function paintBrand() {
  document.querySelectorAll("[data-brand]").forEach(el => {
    el.textContent = BRAND.name;
  });
  document.querySelectorAll("[data-channel]").forEach(el => {
    el.textContent = BRAND.channel;
  });
  document.querySelectorAll("[data-initials]").forEach(el => {
    el.textContent = initials(BRAND.name);
  });
  if (BRAND.loaded && !paintBrand._titled &&
      !document.title.startsWith(BRAND.name)) {
    paintBrand._titled = true;
    document.title = `${BRAND.name} · ${document.title}`;
  }
}

/* Controls that represent functionality delivered during implementation.
   They are never silent and never pretend to be live: the button carries a
   PREVIEW pill (see .btn.preview) and says what ships with it. */
function mountPreviewControls() {
  document.addEventListener("click", e => {
    const el = e.target.closest("[data-preview]");
    if (!el) return;
    e.preventDefault();
    toast(`${el.dataset.preview} — comes with implementation`);
  });
}

/* Pricing is read from the platform's central package config so these
   pages can never drift from what Stripe actually charges. */
async function loadPackages() {
  const ctl = typeof AbortController === "function" ? new AbortController() : null;
  const bail = setTimeout(() => { if (ctl) ctl.abort(); }, BRAND_TIMEOUT_MS);
  try {
    const r = await fetch(`${API}/api/orders/packages`,
      ctl ? { signal: ctl.signal } : undefined);
    if (!r.ok) return null;
    return await r.json();
  } catch (e) { return null; }
  finally { clearTimeout(bail); }
}

function renderPackages(d, host) {
  if (!d || !host) return false;
  const order = ["signal_desk", "signal_desk_pro", "pro_trader_os"];
  /* One product, three depths — not three products. The step label and the
     "everything in…" chain are what stop a prospect asking whether the Desk
     and the OS compete. */
  const step = {
    signal_desk: "Step 1 · the engine",
    signal_desk_pro: "Step 2 · the engine at scale",
    pro_trader_os: "Step 3 · the whole business",
  };
  const blurb = {
    signal_desk: "The trading and distribution engine. Your desk, live.",
    signal_desk_pro: "The same engine for an established, paying audience.",
    pro_trader_os: "The engine plus the business around it — site, members, academy.",
  };
  const feat = {
    signal_desk: ["MT5 execution → Telegram", "Signal lifecycle updates",
      "AI communication centre", "VPS + Runner setup"],
    signal_desk_pro: ["Everything in Signal Desk", "Multi-account copying available",
      "Lead capture + qualification", "Priority implementation"],
    pro_trader_os: ["Everything in Pro", "Public trader website",
      "Live sessions + Academy", "Private community"],
  };
  host.innerHTML = order.map((k, i) => {
    const p = (d.packages || {})[k];
    if (!p) return "";
    const hero = k === "pro_trader_os";
    return `<div class="card ${hero ? "glow raise" : ""}" style="display:flex;
        flex-direction:column;gap:14px${hero ? ";border-color:rgba(245,166,35,.35)" : ""}">
      <span class="tag ${hero ? "gold" : ""}" style="align-self:flex-start">
        ${step[k] || ""}</span>
      <div>
        <div class="h-md">${p.name}</div>
        <div class="tiny" style="margin-top:5px">${blurb[k] || ""}</div>
      </div>
      <div>
        <div style="font-size:34px;font-weight:650;letter-spacing:-.03em">
          ${p.setup.display}</div>
        <div class="tiny">${p.setup.label}</div>
        <div style="font-size:17px;margin-top:9px">+ ${p.monthly.display}
          <span class="tiny">${p.monthly.label}</span></div>
      </div>
      <div class="stack" style="gap:7px;font-size:13px;color:var(--dim)">
        ${(feat[k] || []).map(f => `<div>· ${f}</div>`).join("")}
      </div>
      <a class="btn ${hero ? "gold" : ""} full" style="margin-top:auto"
         target="_blank" rel="noopener"
         href="${SALES_LINK}">GET MY TRADING DESK</a>
    </div>`;
  }).join("");
  return true;
}

/* ── AI drafting, on the platform's own verified-facts endpoint ──
   The model is handed facts from the ledger; it is never asked what
   happened. Nothing is sent anywhere without an explicit click. */
async function aiDraft(intent, instruction) {
  if (!TOKEN) return { ok: false, reason: "no demo token in this link" };
  try {
    const r = await fetch(`${API}/api/demo-links/${TOKEN}/ai-draft`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ intent, instruction: instruction || "" }),
    });
    return await r.json();
  } catch (e) {
    return { ok: false, reason: "could not reach the AI centre" };
  }
}

async function aiSend(text) {
  if (!TOKEN) return { ok: false, reason: "no demo token in this link" };
  try {
    const r = await fetch(`${API}/api/demo-links/${TOKEN}/ai-send`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const d = await r.json();
    if (!r.ok) {
      const det = d.detail && d.detail.detail ? d.detail.detail : d.detail;
      return { ok: false, reason: String(det || "refused") };
    }
    return d;
  } catch (e) { return { ok: false, reason: "send failed" }; }
}

/* ── nav ── */
function mountNav() {
  const panes = [...document.querySelectorAll(".pane")];
  const links = [...document.querySelectorAll(".nav a[data-pane]")];
  function go(id, push) {
    panes.forEach(p => p.classList.toggle("on", p.id === "pane-" + id));
    links.forEach(a => a.classList.toggle("on", a.dataset.pane === id));
    if (push) history.replaceState(null, "", "#" + id);
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  links.forEach(a => a.addEventListener("click", e => {
    e.preventDefault(); go(a.dataset.pane, true);
  }));
  const start = (location.hash || "").replace("#", "");
  go(links.some(a => a.dataset.pane === start) ? start : links[0].dataset.pane);
  window.go = go;
}

function toast(msg) {
  let t = document.getElementById("toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "toast"; t.className = "toast";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add("on");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove("on"), 3200);
}

/* A countdown that never claims a session is live when it is not. */
function countdown(el, target) {
  function tick() {
    const ms = target - Date.now();
    if (ms <= 0) { el.textContent = "starting soon"; return; }
    const h = Math.floor(ms / 3600000);
    const m = Math.floor(ms % 3600000 / 60000);
    const s = Math.floor(ms % 60000 / 1000);
    el.textContent = `${h}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
    setTimeout(tick, 1000);
  }
  tick();
}

function tokenLink(path) {
  return TOKEN ? `${path}?t=${encodeURIComponent(TOKEN)}` : path;
}
