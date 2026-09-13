/* SKLZ PRO TRADER OS — shared runtime.

   Live data comes from the same endpoints the Signal Desk already uses.
   Everything else on these pages is labelled demonstration content, and
   this file never invents a trade, a price, a ticket or a result. */

const API = "https://api.sklzlabs.com";
/* A prospect's own private link always wins. The public showcase token is
   only a fallback, so the public site opens a working desk instead of an
   expiry screen — see sklz-showcase.js. */
const TOKEN = new URLSearchParams(location.search).get("t")
  || window.SKLZ_SHOWCASE_TOKEN || "";

/* One sales destination for every commercial CTA on every surface, so a
   price or a route can never drift between the site, the OS and the bot. */
const SALES_LINK = "https://t.me/sklzlabsnew_bot?start=demo_channel";

/* How long we will wait for personalisation before giving up on it.
   The page is already on screen by then, so waiting costs the prospect
   nothing — this only decides how long the fallback identity stays up.
   It is set well above the worst cold start we have measured (~13s):
   at 6s the request was being killed at 6.2s while the answer was on
   its way, and the demo lost the one thing it most wants to show — the
   prospect's own name on the product. */
const BRAND_TIMEOUT_MS = 20000;

/* One retry, and only when the first attempt was cut off by our own
   timeout. A refused or malformed answer is an answer; we do not ask
   twice for it, and we never loop. */
const BRAND_RETRIES = 1;

/* The provider's own identity, from their private demo link.
   These defaults are what the page paints with immediately; the real
   values replace them when (and only if) the brand call returns. */
const BRAND = {
  name: "SKLZ Pro Trader OS",
  channel: "SKLZ Signals",
  language: "en",        /* display default */
  tokenLanguage: null,   /* only set when the demo link actually carries one */
  logo: "",
  loaded: false,
};

function initials(s) {
  return (s || "SK").trim().split(/\s+/).slice(0, 2)
    .map(w => w[0]).join("").toUpperCase();
}

/* One GET with a deadline. Resolves {data} on success, or {timedOut:true}
   when our own timer cut it off, or {} for anything else. It never throws
   and never writes to the console, so a dead endpoint stays invisible to
   the prospect. */
async function _getJSON(url, timeoutMs) {
  const ctl = typeof AbortController === "function" ? new AbortController() : null;
  let timedOut = false;
  const bail = setTimeout(() => { timedOut = true; if (ctl) ctl.abort(); },
    timeoutMs);
  try {
    const r = await fetch(url, ctl ? { signal: ctl.signal } : undefined);
    if (!r.ok) return {};
    return { data: await r.json() };
  } catch (e) {
    return timedOut ? { timedOut: true } : {};
  } finally { clearTimeout(bail); }
}

/* NOTHING on any page waits for this. The shell, the navigation and every
   CTA are on screen before it is called; a slow or dead brand endpoint can
   only delay personalisation, never first paint. */
async function loadBrand() {
  if (!TOKEN) return BRAND;
  const url = `${API}/api/demo-links/${TOKEN}`;
  for (let attempt = 0; attempt <= BRAND_RETRIES; attempt++) {
    const r = await _getJSON(url, BRAND_TIMEOUT_MS);
    if (r.data) {
      const d = r.data;
      BRAND.name = d.provider_name || BRAND.name;
      BRAND.channel = d.telegram_channel || BRAND.channel;
      BRAND.language = d.language || BRAND.language;
      BRAND.tokenLanguage = d.language || null;
      BRAND.logo = d.logo_url || "";
      /* null means the link does not expire (the public showcase). */
      BRAND.secondsLeft = d.seconds_remaining;
      BRAND.purpose = d.purpose || "private_demo";
      BRAND.loaded = true;
      /* The offer travels with the brand call, because it is one demo
         link and one server answer. Adopting it here means every surface
         that hydrates a brand also has the server's offer decision —
         there is no second place for a page to get it wrong. */
      if (window.SKLZOffer) SKLZOffer.adopt(d);
      return BRAND;
    }
    /* Only a timeout earns a second ask, and only once. */
    if (!r.timedOut) break;
  }
  return BRAND;   /* fallback identity stands; nothing is shown to anyone */
}

/* Render first, hydrate second. Call this LAST on a page, never await it.
   `then` runs once the brand call has settled either way, so a page can
   repaint the few places that embed the provider's name in content. */
function hydrateBrand(then) {
  loadBrand().then(() => {
    /* The demo link carries the prospect's language. Adopting it re-renders
       in place; a manual choice in this browser still wins (see I18N). */
    if (window.I18N && BRAND.tokenLanguage)
      I18N.setTokenLocale(BRAND.tokenLanguage);
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
    toast(I18N.T("demo.previewToast", { name: I18N.T(el.dataset.preview) }));
  });
}

/* Pricing is read from the platform's central package config so these
   pages can never drift from what Stripe actually charges. */
/* Same deadline as the brand call — it shares the helper and the same
   cold start — but a single attempt: the Pricing pane already has an
   honest "could not be loaded" state, and re-asking for prices is not
   worth a second round trip. */
async function loadPackages() {
  const r = await _getJSON(`${API}/api/orders/packages`, BRAND_TIMEOUT_MS);
  return r.data || null;
}

function renderPackages(d, host) {
  if (!d || !host) return false;
  const order = ["signal_desk", "signal_desk_pro", "pro_trader_os"];
  /* One product, three depths — not three products. The step label and the
     "everything in…" chain are what stop a prospect asking whether the Desk
     and the OS compete. */
  const T = I18N.T;
  const step = {
    signal_desk: T("pkg.step1"),
    signal_desk_pro: T("pkg.step2"),
    pro_trader_os: T("pkg.step3"),
  };
  const blurb = {
    signal_desk: T("pkg.blurb1"),
    signal_desk_pro: T("pkg.blurb2"),
    pro_trader_os: T("pkg.blurb3"),
  };
  const feat = {
    signal_desk: [T("pkg.f.mt5Telegram"), T("pkg.f.lifecycle"),
      T("pkg.f.aiCentre"), T("pkg.f.vps")],
    signal_desk_pro: [T("pkg.f.everythingDesk"), T("pkg.f.multiCopy"),
      T("pkg.f.leadCapture"), T("pkg.f.priority")],
    pro_trader_os: [T("pkg.f.everythingPro"), T("pkg.f.website"),
      T("pkg.f.liveAcademy"), T("pkg.f.community")],
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
        <div class="tiny">${I18N.SRV(p.setup.label)}</div>
        <div style="font-size:17px;margin-top:9px">+ ${p.monthly.display}
          <span class="tiny">${I18N.SRV(p.monthly.label)}</span></div>
      </div>
      <div class="stack" style="gap:7px;font-size:13px;color:var(--dim)">
        ${(feat[k] || []).map(f => `<div>· ${f}</div>`).join("")}
      </div>
      <a class="btn ${hero ? "gold" : ""} full" style="margin-top:auto"
         target="_blank" rel="noopener"
         href="${SALES_LINK}">${T("pkg.cta")}</a>
    </div>`;
  }).join("");
  return true;
}

/* ── AI drafting, on the platform's own verified-facts endpoint ──
   The model is handed facts from the ledger; it is never asked what
   happened. Nothing is sent anywhere without an explicit click. */
async function aiDraft(intent, instruction) {
  if (!TOKEN) return { ok: false, reason: I18N.T("ai.noToken") };
  try {
    const r = await fetch(`${API}/api/demo-links/${TOKEN}/ai-draft`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      /* The active locale is requested explicitly, and the directive
         forbids the model from altering any verified trade fact. */
      body: JSON.stringify({ intent,
        instruction: I18N.aiDirective(instruction || "") }),
    });
    return await r.json();
  } catch (e) {
    return { ok: false, reason: I18N.T("ai.noAICentre") };
  }
}

async function aiSend(text) {
  if (!TOKEN) return { ok: false, reason: I18N.T("ai.noToken") };
  try {
    const r = await fetch(`${API}/api/demo-links/${TOKEN}/ai-send`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const d = await r.json();
    if (!r.ok) {
      const det = d.detail && d.detail.detail ? d.detail.detail : d.detail;
      return { ok: false, reason: String(det || I18N.T("ai.refusedShort")) };
    }
    return d;
  } catch (e) { return { ok: false, reason: I18N.T("ai.sendFailed") }; }
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
    if (ms <= 0) { el.textContent = I18N.T("os.startingSoon"); return; }
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
