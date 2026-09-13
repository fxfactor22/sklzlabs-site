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

  global.SKLZAuth = {
    API: API, fetch: authFetch, me: me, isAdmin: isAdmin,
    refresh: refresh, logout: logout, hasSession: hasSession,
    clearSession: clearSession, toLogin: toLogin,
    token: function () { return get(ACCESS); }
  };
})(window);
