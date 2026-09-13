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
 *  - The promo code is a REFERENCE, never a coupon. Stripe does not
 *    accept it and is not asked to. What earns the discount is the
 *    prospect's own demo token, which the server re-validates on every
 *    checkout. So the copy says "applied automatically at checkout"
 *    only where the server will in fact apply it, and "quote this code
 *    when activating" everywhere else. Neither sentence is ever printed
 *    beside a button that would charge the full price.
 *  - PAY NOW prices nothing. It posts a package name, the token and the
 *    name of the surface it was clicked on. The server decides
 *    eligibility again, computes the figure again from its own price
 *    list, and REFUSES rather than quietly selling at full price when
 *    the window has closed. A refusal re-reads the offer, which is what
 *    turns the card from "50% off" into "ended".
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

  /* Card checkout. `ready` stays null until the server has been asked
     and is never assumed true: no PAY NOW button exists until the one
     public endpoint that knows says the Stripe products are live. */
  var CHECKOUT = {
    api: "", token: "", surface: "",
    ready: null,
    busy: false,
    /* The chooser being open, and any failure the prospect was shown,
       are STATE rather than DOM. A re-render happens for reasons that
       have nothing to do with this purchase — a five-minute re-sync, the
       tab regaining focus, a language switch — and each one rebuilds the
       card's innerHTML. Holding both here is what stops a prospect's
       half-finished choice, or the message explaining why their payment
       did not start, from silently disappearing underneath them. */
    open: false,
    error: ""
  };

  /* ------------------------------------------------------------ adopt */
  /** Take the server's answer. Anything other than an explicit eligible
   *  offer clears the state — there is no "probably still valid". */
  function adopt(data) {
    var o = (data && data.offer) || null;
    OFFER.loaded = true;
    OFFER.reason = (o && o.reason) || "";
    if (!o || o.eligible !== true) {
      /* Nothing left to choose or to retry. */
      CHECKOUT.open = false;
      CHECKOUT.error = "";
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
  var lastSync = 0;

  /** Re-read the server's answer. `force` exists for the one case where
   *  the browser has just been told it is out of date — a refused
   *  checkout — and must not sit behind the rate limit. */
  function resync(force) {
    if (!source) return;
    if (!force && Date.now() - lastSync < 30000) return;   /* never hammer it */
    lastSync = Date.now();
    fetch(source.api + "/api/demo-links/" + encodeURIComponent(source.token))
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) { if (d) adopt(d); })
      .catch(function () { /* offline: keep the last server answer */ });
  }

  /** surface: which demo page this is, by the server's own name for it
   *  ("experience", "os", "signal_desk", "portal"). It travels with a
   *  checkout so a cancelled payment returns the prospect to the page
   *  they left — and it is a NAME rather than a URL precisely so the
   *  browser cannot choose the destination. */
  function watch(api, token, surface) {
    if (!api || !token) return;
    source = { api: api, token: token };
    CHECKOUT.api = api;
    CHECKOUT.token = token;
    CHECKOUT.surface = surface || "";
    askCheckout();
    document.addEventListener("visibilitychange", function () {
      if (!document.hidden) resync();
    });
    setInterval(resync, 5 * 60 * 1000);
  }

  /* --------------------------------------------------- card checkout */
  /** Can a card actually be charged for these packages right now?
   *
   *  The one authority is the same public endpoint the pricing pages
   *  read: `stripe.available` is false until the six Signal Desk
   *  products exist in Stripe. Nothing is offered until it answers yes —
   *  a PAY NOW that fails in front of a prospect is worse than no PAY
   *  NOW, and the sales route is still there behind it. */
  function askCheckout() {
    if (!CHECKOUT.api || CHECKOUT.ready !== null) return;
    CHECKOUT.ready = false;
    fetch(CHECKOUT.api + "/api/orders/packages")
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        CHECKOUT.ready = !!(d && d.stripe && d.stripe.available);
        render();
      })
      .catch(function () { /* stays false */ });
  }

  /** Three things must all be true before a PAY NOW button exists: the
   *  server said this link carries an offer, the offer has not run out,
   *  and card checkout is live. */
  function canPay() {
    return CHECKOUT.ready === true && !!CHECKOUT.token && active();
  }

  function fail(msg) {
    CHECKOUT.error = msg || "";
    Array.prototype.forEach.call(
      document.querySelectorAll("[data-offer-err]"), function (el) {
        el.textContent = CHECKOUT.error;
        el.hidden = !CHECKOUT.error;
      });
  }

  function pay(key, btn) {
    if (CHECKOUT.busy) return;
    CHECKOUT.busy = true;
    var label = btn.textContent;
    btn.disabled = true;
    btn.textContent = T("offer.opening");
    fail("");

    function stop(msg) {
      CHECKOUT.busy = false;
      btn.disabled = false;
      btn.textContent = label;
      fail(msg);
    }

    fetch(CHECKOUT.api + "/api/billing/checkout-package", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      /* A package, a token and a surface name. No amount, no percentage
         and no code — the server would not read them if they were here. */
      body: JSON.stringify({ package: key, demo_token: CHECKOUT.token,
                             surface: CHECKOUT.surface })
    }).then(function (r) {
      return r.json().catch(function () { return {}; })
        .then(function (d) { return { ok: r.ok, d: d || {} }; });
    }).then(function (res) {
      if (res.ok && res.d.url) { location.href = res.d.url; return; }
      /* The server refused and created nothing. It does not fall back to
         full price and neither does this: re-read the offer instead. */
      var detail = String((res.d && res.d.detail) || "");
      var gone = detail.indexOf("offer_not_available") === 0;
      stop(T(gone ? "offer.endedBody" : "offer.checkoutError"));
      /* Only an offer refusal means our copy of the offer is stale. Any
         other failure leaves the offer exactly as it was, and re-reading
         it would only throw away what the prospect is looking at. */
      if (gone) resync(true);
    }).catch(function () {
      stop(T("offer.checkoutError"));
    });
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
      /* the same reason, one level in: the chooser and the error line
         are toggled with el.hidden and must actually disappear */
      ".sklz-offer [hidden]{display:none!important}",
      ".sklz-offer .o-choose-h{font-weight:700;font-size:13px}",
      ".sklz-offer .o-rows{display:grid;gap:10px;margin:8px 0;",
      " grid-template-columns:repeat(auto-fit,minmax(188px,1fr))}",
      ".sklz-offer .o-row{border:1px solid rgba(245,166,35,.28);",
      " border-radius:11px;padding:11px 12px;display:flex;min-width:0;",
      " flex-direction:column;gap:5px}",
      ".sklz-offer .o-rname{font-weight:700}",
      ".sklz-offer .o-rprice{display:flex;align-items:baseline;gap:7px;",
      " flex-wrap:wrap}",
      ".sklz-offer .o-rprice b{font-size:21px;letter-spacing:-.02em;",
      " direction:ltr;unicode-bidi:isolate}",
      ".sklz-offer .p-was{opacity:.55;text-decoration:line-through;",
      " font-size:13px;direction:ltr;unicode-bidi:isolate}",
      /* Only the AMOUNT is forced LTR. The sentence around it is the
         page's language and must not be reversed with it — a whole line
         set to direction:ltr puts Arabic words in the wrong order. An
         isolated amount inside ordinary text is what the bidi algorithm
         is for. */
      ".sklz-offer .o-amt{direction:ltr;unicode-bidi:isolate}",
      ".sklz-offer .o-due{font-weight:700}",
      ".sklz-pkgs .p-due{font-weight:700}",
      ".sklz-offer .o-pay{margin-top:auto}",
      ".sklz-offer .o-err{color:#FF9C8A;font-size:12.5px}",
      ".sklz-offer.o-slim [data-offer-choose]{flex:1 1 100%}",
      /* The package grid is mounted on its own host, outside .sklz-offer,
         so the shared button and error rules are repeated for it rather
         than inherited. Its CTA has been an unstyled link until now;
         giving it the same button as everywhere else is the point of
         having one offer module. */
      ".sklz-pkgs .o-btn{border:0;border-radius:9px;padding:8px 14px;",
      " font:inherit;font-weight:700;cursor:pointer;background:#F5A623;",
      " color:#12100A}",
      ".sklz-pkgs a.o-btn{text-decoration:none;display:inline-block;",
      " text-align:center}",
      ".sklz-pkgs .o-pay{margin-top:auto}",
      ".sklz-pkgs .o-err{color:#FF9C8A;font-size:12.5px}",
      ".sklz-pkgs [hidden]{display:none!important}",
      "[data-logo]{overflow:hidden}",
      ".sklz-brand-logo{max-width:100%;max-height:100%;width:auto;",
      " height:auto;object-fit:contain;display:block;margin:auto}",
      "@media(max-width:620px){.sklz-offer .o-head{font-size:17px}",
      " .sklz-offer .o-clock{font-size:19px}",
      " .sklz-offer .o-rows{grid-template-columns:1fr}",
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

  /** The package chooser.
   *
   *  Every figure printed here is a string the server sent. Nothing is
   *  added up: the two amounts charged today are shown as the two
   *  amounts they are, which is also how the first invoice will read.
   *  The setup figure is struck through and replaced rather than
   *  described, so there is no wording to disagree with the number. */
  function chooser() {
    var order = ["signal_desk", "signal_desk_pro", "pro_trader_os"];
    var rows = order.map(function (k) {
      var p = OFFER.packages && OFFER.packages[k];
      if (!p) return "";
      return '<div class="o-row">' +
        '<div class="o-rname">' + esc(p.name) + "</div>" +
        '<div class="o-rprice"><span class="p-was">' +
          esc(p.normal_setup.display) + "</span> <b>" +
          esc(p.offer_setup.display) + "</b> " +
          '<span class="o-sub">' + esc(T("offer.setup")) + "</span></div>" +
        '<div><span class="o-amt">' + esc(p.monthly.display) + "</span> " +
          '<span class="o-sub">' + esc(T("offer.perMonth")) + "</span></div>" +
        '<div class="o-due">' + esc(T("offer.dueToday",
          { amount: dueToday(p) })) + "</div>" +
        '<button type="button" class="o-btn o-pay" data-offer-pay="' +
          esc(k) + '">' + esc(T("offer.payNow")) + "</button>" +
        "</div>";
    }).join("");
    return '<div class="o-choose-h">' + esc(T("offer.choose")) + "</div>" +
      '<div class="o-rows">' + rows + "</div>" +
      '<div class="o-sub">' + esc(T("offer.secure")) + "</div>" + errLine();
  }

  /* The ONE figure on these cards the server does not send as a string.
   *
   * The offer payload gives the discounted setup and the monthly
   * separately and deliberately carries no aggregate. The checkout does
   * charge both on the first invoice, so a prospect about to press PAY
   * NOW is entitled to read the number Stripe will show them — which
   * means adding the server's own two figures for THIS package here.
   *
   * Both inputs move with the server's price list, so this cannot drift
   * from it; only the formatting is ours, and it follows the same rule
   * (whole dollars stay whole, Latin digits in every locale). The right
   * home for it is the offer payload itself — move it there the next
   * time that payload changes.
   */
  function money(v) {
    var n = Math.round(Number(v) * 100) / 100;
    if (!isFinite(n)) return "";
    return "$" + n.toLocaleString("en-US", {
      minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });
  }

  function dueToday(p) {
    var s = Number(p && p.offer_setup && p.offer_setup.usd);
    var m = Number(p && p.monthly && p.monthly.usd);
    return (isFinite(s) && isFinite(m)) ? money(s + m) : "";
  }

  /** The failure line, rendered from state so it survives a re-render. */
  function errLine() {
    return '<div class="o-err" data-offer-err' +
      (CHECKOUT.error ? "" : " hidden") + ">" + esc(CHECKOUT.error) + "</div>";
  }

  function banner(slim, sales) {
    /* With a card route live the discount is not something to claim from
       a person later — the server has already applied it to the figures
       below. The tag says so. Without a card route this is still the
       48-hour offer it was. */
    var head = '<div class="o-tag">' +
      esc(T(canPay() ? "offer.titleApplied" : "offer.title")) + "</div>" +
      '<div class="o-head">' + esc(T("offer.headline")) + "</div>";
    var sub = '<div class="o-sub">' + esc(T("offer.monthlyUnchanged")) + "</div>";
    var timer = '<div><div class="o-sub">' + esc(T("offer.endsIn")) + "</div>" +
      '<div class="o-clock" data-offer-clock>' + clock(remaining()) + "</div></div>";
    var code = OFFER.code
      ? '<div class="o-code"><span class="o-sub">' +
        esc(T(canPay() ? "offer.offerRef" : "offer.promoCode")) +
        '</span><b data-offer-code>' + esc(OFFER.code) + "</b>" +
        '<button type="button" class="o-btn o-ghost" data-offer-copy>' +
        esc(T("offer.copyCode")) + "</button></div>"
      : "";
    /* Which sentence is true depends on what the button below it does.
       With card checkout live the discount really is applied by the
       server during checkout; without it the code is quoted to a person.
       The page never prints one of these beside the other one's button. */
    var note = '<div class="o-sub o-note">' +
      esc(T(canPay() ? "offer.quoteCheckout" : "offer.quote")) + "</div>";
    var cta = canPay()
      ? '<div' + (CHECKOUT.open ? " hidden" : "") +
        '><button type="button" class="o-btn" data-offer-claim>' +
        esc(T("offer.cta")) + "</button></div>" +
        '<div data-offer-choose' + (CHECKOUT.open ? "" : " hidden") + ">" +
        chooser() + "</div>"
      : (sales
        ? '<a class="o-btn" href="' + esc(sales) + '" target="_blank" ' +
          'rel="noopener">' + esc(T("offer.cta")) + "</a>"
        : "");
    /* The compact variant carries the redemption sentence too.
       Without it the Signal Desk showed a promo code a few hundred pixels
       above its own full-price "Continue to secure checkout" button, with
       nothing saying the discount is applied by SKLZ rather than by that
       button. Same translated string as the full card — no new wording,
       and still no mention of checkout. */
    /* The compact strip carries the same route. It used to end at the
       promo code, which left a desk showing a 50%-off code above its own
       full-price button; both routes now reach the same priced-by-the-
       server checkout. */
    if (slim) return head + timer + code + note + cta;
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
    if (b) b.addEventListener("click", function () {
      try {
        navigator.clipboard.writeText(OFFER.code);
        b.textContent = T("offer.copied");
        setTimeout(function () { b.textContent = T("offer.copyCode"); }, 1800);
      } catch (e) { /* a clipboard refusal is not worth an error toast */ }
    });

    var claim = root.querySelector("[data-offer-claim]");
    var box = root.querySelector("[data-offer-choose]");
    if (claim && box) claim.addEventListener("click", function () {
      CHECKOUT.open = true;
      box.hidden = false;
      claim.parentElement.hidden = true;
      var first = box.querySelector("[data-offer-pay]");
      if (first && first.scrollIntoView)
        first.scrollIntoView({ block: "nearest", behavior: "smooth" });
    });

    Array.prototype.forEach.call(
      root.querySelectorAll("[data-offer-pay]"), function (el) {
        el.addEventListener("click", function () {
          pay(el.getAttribute("data-offer-pay"), el);
        });
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
          '<div class="p-due">' + esc(T("offer.dueToday",
            { amount: dueToday(p) })) + "</div>" +
          /* The same decision as the banner: a card button only where a
             card can actually be charged, the sales route otherwise. */
          (canPay()
            ? '<button type="button" class="o-btn o-pay" ' +
              'data-offer-pay="' + esc(k) + '">' +
              esc(T("offer.payNow")) + "</button>"
            : (h.sales
              ? '<a class="o-btn" style="margin-top:auto;text-align:center" ' +
                'href="' + esc(h.sales) + '" target="_blank" rel="noopener">' +
                esc(T("offer.cta")) + "</a>"
              : "")) +
          "</div>";
      }).join("") +
        errLine().replace("<div ", '<div style="grid-column:1/-1" ');
      wire(h.el);
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
    /* canPay() is the one answer to "is there a card route right now",
       and resync() is how a surface with its own checkout tells the
       offer card that the server has just contradicted it. */
    canPay: canPay,
    resync: function () { resync(true); },
    refresh: render
  };

  if (global.I18N && global.I18N.onChange) global.I18N.onChange(render);
})(window);
