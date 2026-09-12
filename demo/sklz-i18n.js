/* SKLZ demo — localisation runtime (en / ar / ru).
 *
 * One architecture for every demo surface. Dictionaries are bundled here, so
 * T() is synchronous and the first paint never waits on a network call. The
 * only late-arriving thing is still the demo token's brand/language, which
 * calls setLocale() afterwards and re-renders in place — no reload.
 *
 * Locale priority:
 *   1. manual choice for this browser (localStorage, sklz_lang)
 *   2. language configured on the demo link token
 *   3. browser language, when it is one we speak
 *   4. English
 *
 * Presentation only. API enum values, broker facts, symbols, tickets and
 * prices are never translated or re-formatted — see NUM() and the notes in
 * the desk namespace.
 */
(function (global) {
  "use strict";

  var STORE_KEY = "sklz_lang";
  var SUPPORTED = ["en", "ar", "ru"];
  var META = {
    en: { label: "EN", name: "English",  dir: "ltr", bcp: "en" },
    ar: { label: "ع",  name: "العربية",  dir: "rtl", bcp: "ar" },
    ru: { label: "RU", name: "Русский",  dir: "ltr", bcp: "ru" }
  };

  var DICT = global.SKLZ_I18N_DICT || {};
  var locale = "en";
  var tokenLocale = null;
  var manual = null;
  var listeners = [];
  var missing = Object.create(null);

  /* ---------------------------------------------------------------- store */
  function readStore() {
    try {
      var v = localStorage.getItem(STORE_KEY);
      return SUPPORTED.indexOf(v) > -1 ? v : null;
    } catch (e) { return null; }
  }
  function writeStore(v) {
    try { localStorage.setItem(STORE_KEY, v); } catch (e) {}
  }

  function fromNavigator() {
    var list = (navigator.languages && navigator.languages.length)
      ? navigator.languages : [navigator.language || ""];
    for (var i = 0; i < list.length; i++) {
      var base = String(list[i] || "").toLowerCase().split("-")[0];
      if (SUPPORTED.indexOf(base) > -1) return base;
    }
    return null;
  }

  function resolve() {
    return manual || tokenLocale || fromNavigator() || "en";
  }

  /* ------------------------------------------------------------ lookup */
  function raw(code, key) {
    var d = DICT[code];
    return d && Object.prototype.hasOwnProperty.call(d, key) ? d[key] : undefined;
  }

  /** Translate. Missing keys fall back to English, then to "" — a raw key is
   *  never shown to a prospect. */
  function T(key, vars) {
    var s = raw(locale, key);
    if (s === undefined) {
      s = raw("en", key);
      if (s === undefined) {
        if (!missing[key]) {
          missing[key] = true;
          if (global.SKLZ_I18N_DEBUG) console.warn("[i18n] missing key:", key);
        }
        return "";
      }
      if (locale !== "en" && !missing[locale + ":" + key]) {
        missing[locale + ":" + key] = true;
        if (global.SKLZ_I18N_DEBUG)
          console.warn("[i18n] untranslated (" + locale + "):", key);
      }
    }
    if (vars) {
      s = s.replace(/\{(\w+)\}/g, function (m, k) {
        return Object.prototype.hasOwnProperty.call(vars, k) ? vars[k] : m;
      });
    }
    return s;
  }

  /* ------------------------------------------------- numbers and dates */
  /** Trading data stays in Latin digits in every locale. A price, lot size,
   *  ticket or account number must read identically to the broker terminal;
   *  Arabic-Indic digits here would be a readability and support problem. */
  function NUM(n, opts) {
    if (n === null || n === undefined || n === "") return "";
    var loc = locale === "ar" ? "ar-u-nu-latn" : META[locale].bcp;
    try { return new Intl.NumberFormat(loc, opts || {}).format(n); }
    catch (e) { return String(n); }
  }

  function DATE(d, opts) {
    var date = (d instanceof Date) ? d : new Date(d);
    if (isNaN(date.getTime())) return "";
    var loc = locale === "ar" ? "ar-u-nu-latn" : META[locale].bcp;
    try {
      return new Intl.DateTimeFormat(loc, opts || {
        day: "numeric", month: "short"
      }).format(date);
    } catch (e) { return date.toDateString(); }
  }

  /** "Sep 12 · 18:00" / "12 سبتمبر · 18:00" / "12 сент. · 18:00" */
  function DATETIME(d) {
    var date = (d instanceof Date) ? d : new Date(d);
    if (isNaN(date.getTime())) return "";
    var loc = locale === "ar" ? "ar-u-nu-latn" : META[locale].bcp;
    var day, time;
    try {
      day = new Intl.DateTimeFormat(loc, { day: "numeric", month: "short" }).format(date);
      time = new Intl.DateTimeFormat(loc, {
        hour: "2-digit", minute: "2-digit", hour12: false
      }).format(date);
    } catch (e) { return date.toISOString().slice(0, 16).replace("T", " "); }
    return day + " · " + time;
  }

  /** Countdown. Latin digits, localised unit labels and word order. */
  function REMAINING(ms) {
    if (ms == null || ms <= 0) return T("demo.expired");
    var mins = Math.floor(ms / 60000);
    var h = Math.floor(mins / 60), m = mins % 60;
    var parts = h > 0
      ? T("time.hm", { h: h, m: m })
      : T("time.m", { m: m });
    return T("time.remaining", { t: parts });
  }

  /* --------------------------------------------------------------- DOM */
  /** data-i18n="key"                 -> textContent
   *  data-i18n-html="key"            -> innerHTML (only where inline markup
   *                                     genuinely belongs inside the sentence)
   *  data-i18n-attr="placeholder:key;title:key;aria-label:key"
   */
  /** data-i18n-vars values written as __some.key__ are themselves translated,
   *  so a composed label ("Sunday · 18:00") stays one sentence in the
   *  dictionary while its day name follows the locale. */
  function varsOf(el) {
    var raw = el.getAttribute("data-i18n-vars");
    if (!raw) return null;
    var v;
    try { v = JSON.parse(raw); } catch (e) { return null; }
    for (var k in v) {
      if (!Object.prototype.hasOwnProperty.call(v, k)) continue;
      if (typeof v[k] === "string" && /^__[\w.]+__$/.test(v[k])) {
        v[k] = T(v[k].slice(2, -2));
      }
    }
    return v;
  }

  function translateTree(root) {
    root = root || document;
    var els = root.querySelectorAll("[data-i18n]");
    for (var i = 0; i < els.length; i++) {
      var v = T(els[i].getAttribute("data-i18n"), varsOf(els[i]));
      if (v !== "") els[i].textContent = v;
    }
    els = root.querySelectorAll("[data-i18n-html]");
    for (i = 0; i < els.length; i++) {
      var h = T(els[i].getAttribute("data-i18n-html"), varsOf(els[i]));
      if (h !== "") els[i].innerHTML = h;
    }
    els = root.querySelectorAll("[data-i18n-attr]");
    for (i = 0; i < els.length; i++) {
      var spec = els[i].getAttribute("data-i18n-attr").split(";");
      for (var j = 0; j < spec.length; j++) {
        var pair = spec[j].split(":");
        if (pair.length !== 2) continue;
        var val = T(pair[1].trim(), varsOf(els[i]));
        if (val !== "") els[i].setAttribute(pair[0].trim(), val);
      }
    }
    return root;
  }

  function applyDocumentLocale() {
    var html = document.documentElement;
    html.setAttribute("lang", META[locale].bcp);
    html.setAttribute("dir", META[locale].dir);
    html.classList.toggle("rtl", META[locale].dir === "rtl");
    html.classList.toggle("lang-ar", locale === "ar");
    html.classList.toggle("lang-ru", locale === "ru");
    var t = document.querySelector("title[data-i18n]");
    if (t) document.title = T(t.getAttribute("data-i18n")) || document.title;
    var md = document.querySelector('meta[name="description"][data-i18n]');
    if (md) {
      var mv = T(md.getAttribute("data-i18n"));
      if (mv) md.setAttribute("content", mv);
    }
  }

  /* ------------------------------------------------------------- public */
  function setLocale(code, opts) {
    if (SUPPORTED.indexOf(code) < 0) return locale;
    opts = opts || {};
    if (opts.manual) { manual = code; writeStore(code); }
    if (code === locale && !opts.force) { applyDocumentLocale(); return locale; }
    locale = code;
    applyDocumentLocale();
    translateTree(document);
    for (var i = 0; i < listeners.length; i++) {
      try { listeners[i](locale); } catch (e) { /* a bad listener must not
        take the page down */ }
    }
    return locale;
  }

  /** Called once the demo token resolves. Never overrides a manual choice,
   *  and never writes back to the token. */
  function setTokenLocale(code) {
    if (SUPPORTED.indexOf(code) < 0) return locale;
    tokenLocale = code;
    if (manual) return locale;
    return setLocale(code);
  }

  function onChange(fn) { if (typeof fn === "function") listeners.push(fn); }

  function init() {
    manual = readStore();
    locale = resolve();
    applyDocumentLocale();
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", function () {
        translateTree(document);
      });
    } else {
      translateTree(document);
    }
  }

  /* ------------------------------------------------------- switcher UI */
  function mountSwitcher(host, opts) {
    if (!host) return null;
    opts = opts || {};
    var wrap = document.createElement("div");
    wrap.className = "i18n-switch" + (opts.className ? " " + opts.className : "");
    wrap.setAttribute("role", "group");
    wrap.setAttribute("aria-label", T("a11y.language"));
    SUPPORTED.forEach(function (code) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "i18n-opt" + (code === locale ? " on" : "");
      b.dataset.lang = code;
      b.textContent = META[code].label;
      b.title = META[code].name;
      b.setAttribute("lang", META[code].bcp);
      b.setAttribute("aria-label", META[code].name);
      b.setAttribute("aria-pressed", code === locale ? "true" : "false");
      b.addEventListener("click", function () {
        setLocale(code, { manual: true });
      });
      wrap.appendChild(b);
    });
    host.appendChild(wrap);
    onChange(function (cur) {
      wrap.querySelectorAll(".i18n-opt").forEach(function (b) {
        var on = b.dataset.lang === cur;
        b.classList.toggle("on", on);
        b.setAttribute("aria-pressed", on ? "true" : "false");
      });
      wrap.setAttribute("aria-label", T("a11y.language"));
    });
    return wrap;
  }

  /* ----------------------------------------------------- AI output language
   * Every AI draft request carries an explicit output-language directive, so
   * a prospect reading Arabic or Russian never gets an English draft back.
   * It is a PRESENTATION instruction only: it tells the model what language
   * to write in and forbids it from touching the verified trade facts the
   * endpoint supplies — prices, ticket numbers, symbols, lot sizes, SL/TP.
   * English adds nothing, so the instruction goes through unchanged.
   */
  function aiDirective(instruction) {
    var text = instruction == null ? "" : String(instruction);
    var d = raw(locale, "ai.langDirective") || "";
    if (!d) return text;
    return text ? text + " " + d : d;
  }

  /* ------------------------------------------------------- server strings
   * A few display strings arrive from the platform API in English
   * (/api/orders/packages sends `who`, `setup.label`, `monthly.label`,
   * `activation.label` and `activation.breakdown`). The backend is out of
   * scope for this change, so the closed vocabulary it uses is mapped here
   * and anything unrecognised is printed verbatim — never invented, never
   * silently claimed to be localised. Money figures inside `breakdown` are
   * reproduced exactly as the server sent them.
   */
  var SRV_MAP = {
    "one-time setup": "srv.oneTimeSetup",
    "per month": "srv.perMonth",
    "due today": "srv.dueToday",
    "for traders and signal providers": "srv.whoDesk",
    "for established signal businesses": "srv.whoPro",
    "the full business layer": "srv.whoOS",
    "custom implementations quoted from": "srv.customFrom"
  };
  var SRV_BREAKDOWN = /^(.+?)\s+setup\s*\+\s*(.+?)\s+first month$/i;

  /** Returns the localised form, or undefined when the vocabulary does not
   *  cover this string. Callers decide what an unmapped string should do. */
  function srvLookup(raw) {
    var key = SRV_MAP[raw.toLowerCase()];
    if (key) return T(key);
    var m = SRV_BREAKDOWN.exec(raw);
    if (m) return T("srv.breakdown", { setup: m[1], monthly: m[2] });
    return undefined;
  }

  function SRV(text) {
    var raw = String(text == null ? "" : text).trim();
    if (!raw) return "";
    var hit = srvLookup(raw);
    return hit === undefined ? raw : hit;   /* unmapped: verbatim */
  }

  /** Free server prose shown to a prospect — today only the note that comes
   *  with the trailing-stop state. English readers get exactly what the API
   *  returned. In another locale an unmapped string would be an English
   *  sentence appearing mid-demo, so a neutral localised line stands in its
   *  place instead. No broker fact is translated, invented or restated here:
   *  the structured values (trigger pips, trailing distance, current stop,
   *  ticket, symbol, prices) are rendered separately and are unaffected. */
  function SRVNOTE(text) {
    var raw = String(text == null ? "" : text).trim();
    if (!raw) return "";
    if (locale === "en") return raw;
    var hit = srvLookup(raw);
    return hit === undefined ? T("srv.noteFallback") : hit;
  }

  global.I18N = {
    T: T, t: T, SRV: SRV, SRVNOTE: SRVNOTE, aiDirective: aiDirective, NUM: NUM, DATE: DATE, DATETIME: DATETIME,
    REMAINING: REMAINING,
    setLocale: setLocale, setTokenLocale: setTokenLocale,
    get locale() { return locale; },
    get dir() { return META[locale].dir; },
    isRTL: function () { return META[locale].dir === "rtl"; },
    supported: SUPPORTED.slice(), meta: META,
    onChange: onChange, translateTree: translateTree,
    mountSwitcher: mountSwitcher, missing: missing, init: init
  };

  init();
})(window);
