/* SKLZ demo — the private 48-hour commercial offer.
 *
 * One module, loaded by every demo surface, because an offer that renders
 * differently on the website and in the OS is an offer nobody trusts.
 *
 * READ THIS BEFORE CHANGING ANYTHING HERE.
 *
 *  - The server decides. `GET /api/demo-links/{token}` returns an `offer`
 *    object and `offer.eligible` is the only thing that grants anything.
 *    This file never works out eligibility from the presence of a token,
 *    from localStorage, from the page it is on, or from a countdown that
 *    has not run out yet. A public showcase link comes back ineligible
 *    and therefore renders nothing at all.
 *  - The deadline is the server's. `seconds_remaining` is read on every
 *    hydration and re-read periodically; the browser only interpolates
 *    between reads so the digits move. Nothing is stored, so a refresh,
 *    a second device or a cleared browser all show the same deadline.
 *  - The discount is SETUP ONLY, and the monthly figure is printed beside
 *    it precisely so nobody has to infer that it did not change.
 *  - The promo code is a SALES-ASSISTED reference. Checkout does not
 *    accept it and is not asked to. The copy says "quote this code when
 *    activating", never "enter it at checkout", because the second one
 *    would be a lie the prospect discovers at the worst moment.
 *  - No price is computed here. Every figure is printed exactly as the
 *    server sent it, from the one live package configuration.
 */
(function (global) {
  "use strict";

  var T = function (k, v) {
    return (global.I18N && global.I18N.T) ? global.I18N.T(k, v) : "";
  };

  var OFFER = {
    loaded: false,      /* a server answer has been adopted */
    eligible: false,    /* the server said yes */
    seen: false,        /* it was eligible at least once this visit */
    percent: 50,
    code: "",
    redemption: "",
    deadline: null,     /* ms epoch, derived from the server's seconds */
    packages: null,
    reason: ""
  };

  var hosts = [];       /* every mounted surface, re-rendered together */
  var ticking = false;
  var source = null;    /* {api, token} once watch() is armed */

  /* ------------------------------------------------------------ adopt */
  /** Take the server's answer. Anything other than an explicit eligible
   *  offer clears the state — there is no "probably still valid". */
  function adopt(data) {
    var o = (data && data.offer) || null;
    OFFER.loaded = true;
    OFFER.reason = (o && o.reason) || "";
    if (!o || o.eligible !== true) {
      OFFER.eligible = false;
      OFFER.code = "";
      OFFER.deadline = null;
      OFFER.packages = null;
      render();
      return OFFER;
    }
    OFFER.eligible = true;
    OFFER.seen = true;
    OFFER.percent = o.setup_discount_percent || 50;
    OFFER.code = o.promo_code || "";
    OFFER.redemption = o.redemption || "";
    OFFER.packages = o.packages || null;
    var secs = Number(o.seconds_remaining);
    OFFER.deadline = isFinite(secs) ? Date.now() + secs * 1000 : null;
    render();
    start();
    return OFFER;
  }

  function remaining() {
    if (!OFFER.deadline) return 0;
    return Math.max(0, OFFER.deadline - Date.now());
  }

  /** Live right now: the server said eligible AND its own deadline has
   *  not passed while the tab sat open. */
  function active() {
    return OFFER.eligible && remaining() > 0;
  }

  /** The offer was live and has since run out. This is the only state
   *  that earns the "ended" copy; a link that never qualified renders
   *  nothing rather than advertising an offer it cannot have. */
  function ended() {
    return OFFER.seen && !active();
  }

  /* ------------------------------------------------- re-sync with server */
  /** The browser's clock is a display. This re-reads the server's, on the
   *  events where drift would actually be visible: coming back to the tab,
   *  and every few minutes while it is open. */
  function watch(api, token) {
    if (!api || !token) return;
    source = { api: api, token: token };
    var last = 0;
    function resync() {
      if (Date.now() - last < 30000) return;      /* never hammer it */
      last = Date.now();
      fetch(source.api + "/api/demo-links/" + encodeURIComponent(source.token))
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (d) { if (d) adopt(d); })
        .catch(function () { /* offline: keep the last server answer */ });
    }
    document.addEventListener("visibilitychange", function () {
      if (!document.hidden) resync();
    });
    setInterval(resync, 5 * 60 * 1000);
  }

  /* ----------------------------------------------------------- clock */
  function clock(ms) {
    var t = Math.max(0, Math.floor(ms / 1000));
    var h = Math.floor(t / 3600), m = Math.floor(t % 3600 / 60), s = t % 60;
    function p(n) { return (n < 10 ? "0" : "") + n; }
    /* Latin digits in every locale: this is a deadline a prospect reads
       off against a clock, not prose. */
    return p(h) + ":" + p(m) + ":" + p(s);
  }

  function start() {
    if (ticking) return;
    ticking = true;
    setInterval(function () {
      var live = active();
      hosts.forEach(function (h) {
        var el = h.el.querySelector("[data-offer-clock]");
        if (el) el.textContent = clock(remaining());
      });
      /* the moment it runs out, every surface changes together */
      if (!live && OFFER.seen && OFFER.deadline &&
          Date.now() >= OFFER.deadline) render();
    }, 1000);
  }

  /* ------------------------------------------------------------ style */
  var STYLED = false;
  function style() {
    if (STYLED) return;
    STYLED = true;
    var css = document.createElement("style");
    css.textContent = [
      ".sklz-offer{border:1px solid rgba(245,166,35,.42);border-radius:14px;",
      " background:linear-gradient(180deg,rgba(245,166,35,.10),rgba(245,166,35,.03));",
      " padding:14px 16px;display:flex;flex-direction:column;gap:10px;",
      " font-size:13.5px;line-height:1.55}",
      ".sklz-offer .o-tag{font-size:10.5px;letter-spacing:.1em;",
      " text-transform:uppercase;color:#F5A623;font-weight:700}",
      ".sklz-offer .o-head{font-size:19px;font-weight:700;letter-spacing:-.02em}",
      ".sklz-offer .o-sub{opacity:.72;font-size:12.5px}",
      ".sklz-offer .o-clock{font-family:ui-monospace,Menlo,monospace;",
      " font-size:22px;font-weight:650;letter-spacing:.02em;direction:ltr;",
      " unicode-bidi:isolate}",
      ".sklz-offer .o-code{display:flex;align-items:center;gap:8px;flex-wrap:wrap}",
      ".sklz-offer .o-code b{font-family:ui-monospace,Menlo,monospace;",
      " font-size:15px;letter-spacing:.04em;border:1px dashed rgba(245,166,35,.5);",
      " border-radius:8px;padding:5px 10px;direction:ltr;unicode-bidi:isolate}",
      ".sklz-offer .o-btn{border:0;border-radius:9px;padding:8px 14px;",
      " font:inherit;font-weight:700;cursor:pointer;background:#F5A623;color:#12100A}",
      ".sklz-offer .o-ghost{background:transparent;color:inherit;",
      " border:1px solid rgba(245,166,35,.45)}",
      ".sklz-offer a.o-btn{text-decoration:none;display:inline-block}",
      ".sklz-offer.o-slim{flex-direction:row;align-items:center;gap:12px;",
      " flex-wrap:wrap;padding:10px 13px;font-size:12.5px}",
      ".sklz-offer.o-slim .o-clock{font-size:16px}",
      ".sklz-offer.o-slim .o-note{flex:1 1 100%;margin:0}",
      ".sklz-offer.o-done{border-color:rgba(255,255,255,.16);background:none}",
      ".sklz-pkgs{display:grid;gap:14px;",
      " grid-template-columns:repeat(auto-fit,minmax(230px,1fr))}",
      ".sklz-pkg{border:1px solid rgba(245,166,35,.28);border-radius:14px;",
      " padding:16px;display:flex;flex-direction:column;gap:9px}",
      ".sklz-pkg .p-name{font-weight:700;font-size:15px}",
      ".sklz-pkg .p-was{opacity:.55;text-decoration:line-through;font-size:13px;",
      " direction:ltr;unicode-bidi:isolate}",
      ".sklz-pkg .p-now{font-size:27px;font-weight:680;letter-spacing:-.03em;",
      " direction:ltr;unicode-bidi:isolate}",
      ".sklz-pkg .p-lbl{font-size:11px;opacity:.62;text-transform:uppercase;",
      " letter-spacing:.09em}",
      ".sklz-pkg .p-mon{font-size:15px;direction:ltr;unicode-bidi:isolate}",
      /* el.hidden is set whenever there is nothing to show, but a
         class rule in an author stylesheet beats the UA's
         [hidden]{display:none}. Without this the host stayed a visible
         empty bordered box — a stray rectangle on the public showcase
         and on every visit with no offer. */
      ".sklz-offer[hidden]{display:none!important}",
      "[data-logo]{overflow:hidden}",
      ".sklz-brand-logo{max-width:100%;max-height:100%;width:auto;",
      " height:auto;object-fit:contain;display:block;margin:auto}",
      "@media(max-width:620px){.sklz-offer .o-head{font-size:17px}",
      " .sklz-offer .o-clock{font-size:19px}",
      " .sklz-pkgs{grid-template-columns:1fr}}"
    ].join("");
    document.head.appendChild(css);
  }

  /* ----------------------------------------------------------- render */
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function banner(slim, sales) {
    var head = '<div class="o-tag">' + esc(T("offer.title")) + "</div>" +
      '<div class="o-head">' + esc(T("offer.headline")) + "</div>";
    var sub = '<div class="o-sub">' + esc(T("offer.monthlyUnchanged")) + "</div>";
    var timer = '<div><div class="o-sub">' + esc(T("offer.endsIn")) + "</div>" +
      '<div class="o-clock" data-offer-clock>' + clock(remaining()) + "</div></div>";
    var code = OFFER.code
      ? '<div class="o-code"><span class="o-sub">' + esc(T("offer.promoCode")) +
        '</span><b data-offer-code>' + esc(OFFER.code) + "</b>" +
        '<button type="button" class="o-btn o-ghost" data-offer-copy>' +
        esc(T("offer.copyCode")) + "</button></div>"
      : "";
    var note = '<div class="o-sub o-note">' + esc(T("offer.quote")) + "</div>";
    var cta = sales
      ? '<a class="o-btn" href="' + esc(sales) + '" target="_blank" ' +
        'rel="noopener">' + esc(T("offer.cta")) + "</a>"
      : "";
    /* The compact variant carries the redemption sentence too.
       Without it the Signal Desk showed a promo code a few hundred pixels
       above its own full-price "Continue to secure checkout" button, with
       nothing saying the discount is applied by SKLZ rather than by that
       button. Same translated string as the full card — no new wording,
       and still no mention of checkout. */
    if (slim) return head + timer + code + note;
    return head + sub + timer + code + note + cta;
  }

  function done() {
    return '<div class="o-tag">' + esc(T("offer.ended")) + "</div>" +
      '<div class="o-sub">' + esc(T("offer.endedBody")) + "</div>";
  }

  function render() {
    style();
    hosts.forEach(function (h) {
      var live = active();
      h.el.classList.toggle("o-done", !live);
      if (live) {
        h.el.hidden = false;
        h.el.innerHTML = banner(h.slim, h.sales);
        wire(h.el);
      } else if (ended()) {
        h.el.hidden = false;
        h.el.innerHTML = done();
      } else {
        /* never eligible — a showcase or a no-token visit. Show nothing;
           there is no offer to have ended. */
        h.el.hidden = true;
        h.el.innerHTML = "";
      }
    });
    renderPackages();
  }

  function wire(root) {
    var b = root.querySelector("[data-offer-copy]");
    if (!b) return;
    b.addEventListener("click", function () {
      try {
        navigator.clipboard.writeText(OFFER.code);
        b.textContent = T("offer.copied");
        setTimeout(function () { b.textContent = T("offer.copyCode"); }, 1800);
      } catch (e) { /* a clipboard refusal is not worth an error toast */ }
    });
  }

  /* ------------------------------------------------- package pricing */
  var pkgHosts = [];

  function mountPackages(el, sales) {
    if (!el) return null;
    style();
    pkgHosts.push({ el: el, sales: sales || "" });
    renderPackages();
    return el;
  }

  function renderPackages() {
    var order = ["signal_desk", "signal_desk_pro", "pro_trader_os"];
    pkgHosts.forEach(function (h) {
      if (!active() || !OFFER.packages) { h.el.hidden = true; return; }
      h.el.hidden = false;
      h.el.className = "sklz-pkgs";
      h.el.innerHTML = order.map(function (k) {
        var p = OFFER.packages[k];
        if (!p) return "";
        /* Setup and monthly, separately and never added together. The
           combined "due today" aggregate is ambiguous and has no place
           in an offer that only moves one of the two figures. */
        return '<div class="sklz-pkg">' +
          '<div class="p-name">' + esc(p.name) + "</div>" +
          '<div class="p-lbl">' + esc(T("offer.setup")) + "</div>" +
          '<div class="p-was">' + esc(p.normal_setup.display) + "</div>" +
          '<div class="p-now">' + esc(p.offer_setup.display) + "</div>" +
          '<div class="p-lbl">' + esc(T("offer.monthly")) + "</div>" +
          '<div class="p-mon">' + esc(p.monthly.display) + "</div>" +
          '<div class="o-sub">' + esc(T("offer.perMonth")) + "</div>" +
          (h.sales
            ? '<a class="o-btn" style="margin-top:auto;text-align:center" ' +
              'href="' + esc(h.sales) + '" target="_blank" rel="noopener">' +
              esc(T("offer.cta")) + "</a>"
            : "") +
          "</div>";
      }).join("");
    });
  }

  /* ------------------------------------------------------------- mount */
  /** opts: {slim:true} for the compact desk/OS strip, {sales:url} to add
   *  the activation CTA. Safe to call before the server has answered —
   *  the host stays hidden until it has. */
  function mount(el, opts) {
    if (!el) return null;
    style();
    opts = opts || {};
    el.className = "sklz-offer" + (opts.slim ? " o-slim" : "");
    el.hidden = true;
    hosts.push({ el: el, slim: !!opts.slim, sales: opts.sales || "" });
    render();
    return el;
  }

  /* --------------------------------------------------- BTC discovery
   * The demo should open on an instrument that is actually tradeable when
   * a cold prospect clicks the link — which is very often a Friday night.
   * The broker symbol is NOT hardcoded: this reads the list the server
   * returned and picks from it, using the exact `symbol` string the
   * server sent. If the server exposes no BTC instrument, the server's
   * own default stands.
   */
  function preferredSymbol(list, serverDefault) {
    var arr = (list || []).map(function (raw) {
      return (typeof raw === "string") ? { symbol: raw } : (raw || {});
    }).filter(function (s) { return s.symbol; });
    if (!arr.length) return serverDefault || "";

    function isBtc(s) {
      var hay = ((s.symbol || "") + " " + (s.label || "")).toUpperCase();
      return hay.indexOf("BTC") > -1 || hay.indexOf("BITCOIN") > -1;
    }
    var crypto = arr.filter(function (s) {
      return String(s["class"] || "").toLowerCase() === "crypto";
    });
    /* class metadata is preferred when the server sends it, but a server
       that omits it must not cost the prospect the instrument. */
    var btc = (crypto.length ? crypto : arr).filter(isBtc);
    if (!btc.length) return serverDefault || "";
    var open = btc.filter(function (s) { return s.always_open === true; });
    return (open[0] || btc[0]).symbol;
  }

  /* ------------------------------------------------ the provider's logo
   * This lives in the offer module rather than in sklz-os.js because this
   * is the only file every surface loads — the Signal Desk has a runtime
   * of its own. One painter means the logo cannot appear on three pages
   * and be quietly forgotten on the fourth.
   *
   * A [data-logo] element keeps whatever it already holds (normally the
   * initials mark) as its fallback and gets it straight back if the image
   * fails. A prospect must never find a broken-image icon where their own
   * logo was promised.
   */
  function paintLogo(name, url) {
    style();
    var src = String(url || "").trim();
    Array.prototype.forEach.call(
      document.querySelectorAll("[data-logo]"), function (el) {
        if (el.getAttribute("data-logo-fallback") === null) {
          el.setAttribute("data-logo-fallback", el.innerHTML);
        }
        var back = el.getAttribute("data-logo-fallback") || "";
        if (el.getAttribute("data-logo-src") === src) return;
        el.setAttribute("data-logo-src", src);
        if (!src) { el.innerHTML = back; return; }
        var img = new Image();
        img.alt = name || "";
        img.className = "sklz-brand-logo";
        img.decoding = "async";
        img.onload = function () { el.innerHTML = ""; el.appendChild(img); };
        img.onerror = function () { el.innerHTML = back; };
        img.src = src;
      });
  }

  global.SKLZOffer = {
    paintLogo: paintLogo,
    adopt: adopt, mount: mount, mountPackages: mountPackages,
    watch: watch, active: active, ended: ended, state: OFFER,
    remaining: remaining, preferredSymbol: preferredSymbol,
    refresh: render
  };

  if (global.I18N && global.I18N.onChange) global.I18N.onChange(render);
})(window);
