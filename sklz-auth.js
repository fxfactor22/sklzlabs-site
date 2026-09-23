/* SKLZ — one admin session for the whole static site.
 *
 * The backend has always returned BOTH tokens from /api/auth/login, and
 * login.html has always stored both. Nothing ever spent the refresh one:
 * no page called /api/auth/refresh, so a session lasted exactly one
 * access-token lifetime and then every admin page decided the operator
 * had been logged out. The Demo Generator made it worse by deleting the
 * access token on the first 401, so the next page load could not even
 * try.
 *
 * This is the only place that talks to the auth endpoints. The access JWT
 * stays short-lived — that is the point of it — and the refresh token is
 * what makes the SESSION long-lived.
 *
 * Security note: none of this is an authorisation decision. Every admin
 * route re-checks is_platform_admin server-side; a 403 is final here and
 * is never retried, refreshed around, or hidden.
 */
(function (global) {
  "use strict";

  var API = "https://api.sklzlabs.com";
  var ACCESS = "sklz_access";
  var REFRESH = "sklz_refresh";

  function get(k) { try { return localStorage.getItem(k) || ""; } catch (e) { return ""; } }
  function set(k, v) { try { localStorage.setItem(k, v || ""); } catch (e) {} }
  function drop(k) { try { localStorage.removeItem(k); } catch (e) {} }

  function hasSession() { return !!(get(ACCESS) || get(REFRESH)); }

  function clearSession() { drop(ACCESS); drop(REFRESH); }

  function toLogin(next) {
    var n = next || (location.pathname + location.search);
    location.href = "/login.html?next=" + encodeURIComponent(n);
  }

  /* One refresh at a time. Several panels loading at once used to mean
     several parallel rotations of the same refresh token, and whichever
     lost the race invalidated the winner. */
  var inFlight = null;

  function refresh() {
    if (inFlight) return inFlight;
    var rt = get(REFRESH);
    if (!rt) return Promise.resolve(false);

    inFlight = fetch(API + "/api/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: rt })
    }).then(function (r) {
      if (!r.ok) return false;
      return r.json().then(function (d) {
        if (!d || !d.access_token) return false;
        set(ACCESS, d.access_token);
        /* Supabase rotates refresh tokens: storing the new one is what
           lets the session outlive a browser restart. */
        if (d.refresh_token) set(REFRESH, d.refresh_token);
        return true;
      });
    }).catch(function () {
      /* A network failure is not an invalid session. Say "not now",
         keep the credentials, and let the caller surface the outage. */
      return null;
    }).then(function (ok) {
      inFlight = null;
      return ok;
    });

    return inFlight;
  }

  /* fetch with the session attached, one silent refresh, one retry. */
  function authFetch(url, options) {
    var opts = Object.assign({}, options || {});
    opts.headers = Object.assign({}, opts.headers || {});

    function send() {
      var t = get(ACCESS);
      var h = Object.assign({}, opts.headers);
      if (t) h.Authorization = "Bearer " + t;
      return fetch(url, Object.assign({}, opts, { headers: h }));
    }

    return send().then(function (r) {
      /* 403 means "you, specifically, may not". A new token would be the
         same person. Never refresh, never retry. */
      if (r.status !== 401) return r;

      return refresh().then(function (ok) {
        if (ok === null) return r;          /* offline — keep the session */
        if (!ok) { clearSession(); return r; }
        return send();                       /* exactly one retry */
      });
    });
  }

  /* Who is signed in, through the same path as everything else. Returns
     null when there is no usable session, and throws only on a network
     failure so a caller can tell "signed out" from "offline". */
  function me() {
    if (!hasSession()) return Promise.resolve(null);
    return authFetch(API + "/api/auth/me").then(function (r) {
      if (r.status === 401) return null;
      if (!r.ok) return null;
      return r.json();
    });
  }

  /* Cosmetic only, and deliberately not a rule.
   *
   * Platform-admin authority has exactly one definition:
   * rules.is_platform_admin() on the server, which the protected routes
   * call and which /api/auth/me now reports as `is_platform_admin`. This
   * reads that answer and nothing else.
   *
   * It must NOT re-derive the decision. profiles.role is a different
   * field from the auth user's role the server actually tests, and the
   * ADMIN_EMAILS allowlist has no business in a public JavaScript file at
   * all — an allowlisted admin would have been hidden from the menu while
   * the API happily served them.
   *
   * Absent or false means hide: a cosmetic gate fails closed, and an
   * older API that does not send the field simply shows nothing extra.
   */
  function isAdmin(profile) {
    return !!(profile && profile.is_platform_admin === true);
  }

  function logout() {
    var t = get(ACCESS);
    var done = t
      ? fetch(API + "/api/auth/logout", {
          method: "POST", headers: { Authorization: "Bearer " + t }
        }).catch(function () {})
      : Promise.resolve();
    return done.then(function () { clearSession(); });
  }

  /* ── session lifetime ───────────────────────────────────────────
   * The access JWT expires in minutes (Supabase setting) and, until now,
   * only two pages knew how to refresh it — every other page treated the
   * first 401 as "logged out". Two things fix that for the whole site:
   *
   *   1. a 72-hour session cap, measured from login: after that the
   *      credentials are dropped and the next page asks you to sign in.
   *   2. a fetch interceptor: any request to the API that carries OUR
   *      access token gets a fresh one attached first (when the JWT is
   *      about to expire) and one silent refresh + retry on a 401. Pages
   *      keep their plain fetch() calls; nothing per page changes.
   *
   * Only requests bearing the stored access token are touched — a Runner
   * key, a copy key or a demo token is never refreshed or replaced.
   */
  var LOGIN_AT = "sklz_login_at";
  var SESSION_MAX_MS = 72 * 3600 * 1000;
  var REFRESH_AHEAD_S = 120;          /* refresh when < 2 min of JWT left */

  function jwtExp(t) {
    try {
      var p = t.split(".")[1];
      p = p.replace(/-/g, "+").replace(/_/g, "/");
      var j = JSON.parse(atob(p + "===".slice((p.length + 3) % 4)));
      return +j.exp || 0;
    } catch (e) { return 0; }
  }

  function sessionExpired() {
    if (!hasSession()) return false;
    var at = +get(LOGIN_AT) || 0;
    if (!at) { set(LOGIN_AT, String(Date.now())); return false; }
    return Date.now() - at > SESSION_MAX_MS;
  }

  function markLogin() { set(LOGIN_AT, String(Date.now())); }

  /* Refresh ahead of expiry, so a request never has to fail first. */
  function ensureFresh() {
    if (sessionExpired()) { clearSession(); drop(LOGIN_AT); return Promise.resolve(false); }
    var t = get(ACCESS);
    if (!t) return get(REFRESH) ? refresh() : Promise.resolve(false);
    var exp = jwtExp(t);
    if (!exp) return Promise.resolve(true);
    if (exp - Date.now() / 1000 > REFRESH_AHEAD_S) return Promise.resolve(true);
    return refresh();
  }

  var nativeFetch = global.fetch ? global.fetch.bind(global) : null;

  function bearerOf(headers) {
    if (!headers) return "";
    var v = "";
    if (typeof Headers !== "undefined" && headers instanceof Headers) {
      v = headers.get("Authorization") || headers.get("authorization") || "";
    } else {
      v = headers.Authorization || headers.authorization || "";
    }
    return /^Bearer\s+/i.test(v) ? v.replace(/^Bearer\s+/i, "") : "";
  }

  function withBearer(init, token) {
    var out = Object.assign({}, init || {});
    if (typeof Headers !== "undefined" && out.headers instanceof Headers) {
      var h = new Headers(out.headers); h.set("Authorization", "Bearer " + token);
      out.headers = h;
    } else {
      out.headers = Object.assign({}, out.headers || {}, { Authorization: "Bearer " + token });
    }
    return out;
  }

  if (nativeFetch && !global.__sklzFetchWrapped) {
    global.__sklzFetchWrapped = true;
    global.fetch = function (input, init) {
      var url = (typeof input === "string") ? input : (input && input.url) || "";
      var b = bearerOf(init && init.headers);
      var ours = url.indexOf(API) === 0 && b && (b === get(ACCESS) || b === get(REFRESH));
      if (!ours) return nativeFetch(input, init);
      return ensureFresh().then(function () {
        var t = get(ACCESS);
        if (!t) return nativeFetch(input, init);
        return nativeFetch(input, withBearer(init, t)).then(function (r) {
          if (r.status !== 401) return r;
          return refresh().then(function (ok) {
            if (!ok) { if (ok === false) clearSession(); return r; }
            return nativeFetch(input, withBearer(init, get(ACCESS)));
          });
        });
      });
    };
  }

  /* Keep the token warm while a dashboard sits open for hours. */
  if (hasSession()) {
    if (sessionExpired()) { clearSession(); drop(LOGIN_AT); }
    else { setInterval(function () { ensureFresh(); }, 5 * 60 * 1000); }
  }

  var _clear = clearSession;
  clearSession = function () { _clear(); drop(LOGIN_AT); };

  global.SKLZAuth = {
    API: API, fetch: authFetch, me: me, isAdmin: isAdmin,
    refresh: refresh, logout: logout, hasSession: hasSession,
    clearSession: clearSession, toLogin: toLogin, markLogin: markLogin,
    ensureFresh: ensureFresh, sessionMaxHours: 72,
    token: function () { return get(ACCESS); }
  };
})(window);
