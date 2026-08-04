/* SKLZ — mobile navigation.
 *
 * Builds a bottom tab bar and an overflow drawer from whatever nav items the
 * page already has, so pages do not need editing individually and a new page
 * inherits the behaviour automatically.
 *
 * FIVE TABS, NOT NINE
 * A bar with nine tiny icons is a worse hamburger. Five is what fits a thumb
 * comfortably; everything else goes in the drawer behind the last one. The
 * five chosen are the ones a trader opens repeatedly during a session — the
 * rest are things you visit occasionally and can afford one extra tap.
 */
(function () {
  'use strict';

  if (window.__sklzMobileNav) return;
  window.__sklzMobileNav = true;

  var MOBILE = 820;

  // the five that earn a permanent slot
  var PRIMARY = [
    { href: '/dashboard.html', icon: '\u25C8', label: 'Home' },
    { href: '/copydash.html', icon: '\uD83D\uDCC8', label: 'Trade' },
    { href: '/scanner.html', icon: '\uD83D\uDD0D', label: 'Scanner' },
    { href: '/signals.html', icon: '\uD83D\uDCE1', label: 'Signals' },
    { href: '', icon: '\u2261', label: 'More', drawer: true }
  ];

  // everything else, in the order it is likely to be wanted
  var SECONDARY = [
    { href: '/journal.html', icon: '\uD83D\uDCD2', label: 'Journal' },
    { href: '/tradegpt.html', icon: '\uD83E\uDDE0', label: 'TradeGPT' },
    { href: '/bot.html', icon: '\uD83D\uDDA5\uFE0F', label: 'Bot monitor' },
    { href: '/copytrade.html', icon: '\u21C4', label: 'Copy trading' },
    { href: '/marketplace.html', icon: '\uD83C\uDFC6', label: 'Traders' },
    { href: '/indicators.html', icon: '\uD83D\uDCCA', label: 'Indicators' },
    { href: '/lotcalc.html', icon: '\uD83E\uDDEE', label: 'Lot calculator' },
    { href: '/academy.html', icon: '\uD83C\uDF93', label: 'Academy' },
    { href: '/partner.html', icon: '\uD83E\uDD1D', label: 'Affiliate' },
    { href: '/account.html', icon: '\uD83D\uDD11', label: 'Login & security' },
    { href: '/pricing.html', icon: '\uD83D\uDCB3', label: 'Billing' }
  ];

  function here() {
    var p = location.pathname;
    return p === '/' ? '/dashboard.html' : p;
  }

  function esc(s) {
    var d = document.createElement('div');
    d.textContent = s == null ? '' : s;
    return d.innerHTML;
  }

  function buildBar() {
    if (document.querySelector('.mnav')) return;
    var cur = here();
    var bar = document.createElement('nav');
    bar.className = 'mnav';
    bar.innerHTML = PRIMARY.map(function (t) {
      if (t.drawer) {
        return '<a href="#" data-drawer="1"><span class="ic">' + t.icon +
               '</span>' + esc(t.label) + '</a>';
      }
      var on = cur === t.href ? ' class="on"' : '';
      return '<a href="' + t.href + '"' + on + '><span class="ic">' + t.icon +
             '</span>' + esc(t.label) + '</a>';
    }).join('');
    document.body.appendChild(bar);

    var more = bar.querySelector('[data-drawer]');
    if (more) {
      more.addEventListener('click', function (e) {
        e.preventDefault();
        toggleDrawer(true);
      });
    }
  }

  function buildDrawer() {
    if (document.querySelector('.mdrawer')) return;
    var cur = here();
    var d = document.createElement('div');
    d.className = 'mdrawer';
    d.innerHTML =
      '<div class="panel"><div class="grab"></div>' +
      SECONDARY.map(function (t) {
        var on = cur === t.href
          ? ' style="color:var(--gold,#F5A623)"' : '';
        return '<a href="' + t.href + '"' + on + '><span>' + t.icon +
               '</span>' + esc(t.label) + '</a>';
      }).join('') +
      '<a href="#" id="m-logout"><span>\u23FB</span>Log out</a>' +
      '</div>';
    document.body.appendChild(d);

    // tapping the backdrop closes it — the panel itself does not
    d.addEventListener('click', function (e) {
      if (e.target === d) toggleDrawer(false);
    });

    var out = d.querySelector('#m-logout');
    if (out) {
      out.addEventListener('click', function (e) {
        e.preventDefault();
        try { localStorage.removeItem('sklz_access'); } catch (err) {}
        location.href = '/';
      });
    }
  }

  function toggleDrawer(open) {
    var d = document.querySelector('.mdrawer');
    if (d) d.classList.toggle('open', !!open);
  }

  function buildHeader() {
    if (document.querySelector('.mhead')) return;
    // only where a desktop sidebar exists — standalone pages keep their own
    if (!document.querySelector('.side')) return;

    var h = document.createElement('div');
    h.className = 'mhead';
    var title = (document.querySelector('h1') || {}).textContent || 'SKLZ Labs';
    h.innerHTML =
      '<a href="/dashboard.html"><img src="/sklz-logo.png" alt="SKLZ"/></a>' +
      '<span style="font-size:14px;font-weight:600">' +
        esc(title.slice(0, 22)) + '</span>' +
      '<span class="more" data-drawer="1">\u2261</span>';
    document.body.insertBefore(h, document.body.firstChild);

    h.querySelector('[data-drawer]').addEventListener('click', function () {
      toggleDrawer(true);
    });
  }

  // Tables get data-labels so CSS can render them as cards. Done here rather
  // than in markup so every existing table inherits it.
  function labelTables() {
    document.querySelectorAll('table').forEach(function (t) {
      if (t.__labelled) return;
      var heads = Array.prototype.map.call(
        t.querySelectorAll('thead th'),
        function (th) { return th.textContent.trim(); });
      if (!heads.length) return;
      t.classList.add('mobile-cards');
      t.querySelectorAll('tbody tr').forEach(function (tr) {
        Array.prototype.forEach.call(tr.children, function (td, i) {
          if (heads[i]) td.setAttribute('data-label', heads[i]);
        });
      });
      t.__labelled = true;
    });
  }

  function apply() {
    if (window.innerWidth > MOBILE) return;
    buildHeader();
    buildBar();
    buildDrawer();
    labelTables();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', apply);
  } else {
    apply();
  }

  // tables often render after data arrives, so re-label as the DOM changes
  var pending = null;
  new MutationObserver(function () {
    if (window.innerWidth > MOBILE) return;
    clearTimeout(pending);
    pending = setTimeout(labelTables, 250);
  }).observe(document.documentElement, { childList: true, subtree: true });

  window.addEventListener('resize', function () {
    if (window.innerWidth <= MOBILE) apply();
  });
})();
