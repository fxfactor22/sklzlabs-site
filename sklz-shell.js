/* SKLZ Labs — shared app shell (v2, 13 Nov 2026)
 *
 * One navigation for twenty pages. On a page that has the classic
 * <aside class="side"> this replaces its contents; on a page without one
 * (journal, TradeGPT, copy dashboard, bot monitor, track record) it adds a
 * slim app bar with a drawer. Every page gets the mobile bottom tabs.
 *
 * Two workspaces, one toggle: TRADE (the tools) and PARTNER (commissions,
 * links, customers, payouts). The choice is remembered per browser.
 *
 * It supersedes sklz-mobile.js (sets its guard flag) and the inline
 * `.lnav-btn` hamburgers. Nothing here touches page content or data.
 */
(function () {
  'use strict';
  if (window.__sklzShell) return;
  window.__sklzShell = true;
  window.__sklzMobileNav = true;              // retire the old bottom bar

  var I = {
    home: '<path d="m3 11 9-8 9 8v9a2 2 0 0 1-2 2h-4v-7H9v7H5a2 2 0 0 1-2-2z"/>',
    engine: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/>',
    signal: '<path d="M2 20h.01M7 20v-4M12 20v-8M17 20V8M22 4v16"/>',
    chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 9h8M8 13h5"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
    chart: '<path d="M3 3v18h18"/><path d="m7 15 4-6 4 3 5-7"/>',
    radar: '<path d="M19.07 4.93A10 10 0 0 0 6.99 3.34M4 6h.01M2.29 9.62a10 10 0 1 0 19.02-1.27M16.24 7.76A6 6 0 1 0 8.23 16.67M12 18h.01M17.99 11.66a6 6 0 0 1-2.22 5.01"/><circle cx="12" cy="12" r="2"/><path d="m13.41 10.59 5.66-5.66"/>',
    copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    coins: '<circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18M7 6h1v4M16.71 13.88l.7.71-2.82 2.82"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    cap: '<path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>',
    calc: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/>',
    sparkle: '<path d="m12 3 1.9 5.6L19.5 10.5l-5.6 1.9L12 18l-1.9-5.6L4.5 10.5l5.6-1.9z"/>',
    trophy: '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0z"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
    wallet: '<path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/>',
    handshake: '<path d="m11 17 2 2a1 1 0 1 0 3-3"/><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"/><path d="m21 3 1 11h-2M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3M3 4h8"/>',
    file: '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>',
    key: '<path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4"/>',
    card: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
    power: '<path d="M18.36 6.64A9 9 0 1 1 5.64 6.64M12 2v10"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    chev: '<path d="m6 9 6 6 6-6"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    more: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
    shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
    activity: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>'
  };
  function ic(n, s) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"' + (s ? ' style="' + s + '"' : '') + '>' + (I[n] || '') + '</svg>'; }
  var MARK = '<svg viewBox="0 0 100 100" aria-hidden="true"><defs><linearGradient id="skg" gradientUnits="userSpaceOnUse" x1="78" y1="88" x2="22" y2="14"><stop offset="0" stop-color="#FFB020"/><stop offset=".55" stop-color="#FF7A3D"/><stop offset="1" stop-color="#22E0FF"/></linearGradient></defs><path d="M69.00,17.09 L70.84,18.18 L72.62,19.37 L74.33,20.66 L75.97,22.04 L77.53,23.52 L79.00,25.08 L80.39,26.73 L81.68,28.45 L82.87,30.25 L83.97,32.11 L84.95,34.03 L85.83,36.01 L86.60,38.03 L87.25,40.10 L87.79,42.20 L88.20,44.33 L88.50,46.48 L88.68,48.65 L88.73,50.83 L88.66,53.00 L88.47,55.18 L88.16,57.34 L87.72,59.48 L87.17,61.60 L86.49,63.68 L85.70,65.73 L84.79,67.73 L83.78,69.68 L82.65,71.56 L81.42,73.39 L80.08,75.14 L78.65,76.82 L77.12,78.42 L75.51,79.93 L73.81,81.34 L72.03,82.66 L70.18,83.88 L68.26,85.00 L66.28,86.01 L64.25,86.90 L62.16,87.68 L60.03,88.34 L57.87,88.88 L55.68,89.30 L53.46,89.60 L51.23,89.77 L49.00,89.82 L46.76,89.73 L44.52,89.53 L42.30,89.20 L40.10,88.74 L37.93,88.16 L35.79,87.46 L33.69,86.63 L31.64,85.69 L29.64,84.64 L27.71,83.47 L25.84,82.20 L24.04,80.82 L22.32,79.34 L20.69,77.76 L19.14,76.10 L17.70,74.34 L16.35,72.51 L15.10,70.60 L13.96,68.63 L12.94,66.59 L12.03,64.49 L11.24,62.35 L10.57,60.16 L10.02,57.93 L9.60,55.68 L9.30,53.40 L9.14,51.11 L9.10,48.81 L9.19,46.51 L9.42,44.22 L9.77,41.94 L10.25,39.68 L10.85,37.45 L11.58,35.25 L12.44,33.10 L13.41,31.00 L14.50,28.95 L15.71,26.97 L17.03,25.05 L18.45,23.22 L19.98,21.46 L21.61,19.79 L23.32,18.21 L18.50,12.46 L38.35,12.78 L35.22,32.38 L30.39,26.64 L29.09,27.75 L27.84,28.93 L26.66,30.18 L25.55,31.50 L24.52,32.89 L23.56,34.32 L22.69,35.82 L21.90,37.36 L21.20,38.94 L20.59,40.57 L20.06,42.23 L19.64,43.91 L19.30,45.63 L19.07,47.35 L18.93,49.10 L18.89,50.84 L18.95,52.60 L19.10,54.34 L19.36,56.08 L19.71,57.80 L20.16,59.50 L20.71,61.18 L21.34,62.82 L22.08,64.43 L22.90,66.00 L23.81,67.52 L24.80,68.99 L25.88,70.40 L27.04,71.75 L28.27,73.03 L29.57,74.25 L30.94,75.39 L32.38,76.45 L33.88,77.43 L35.43,78.33 L37.03,79.14 L38.67,79.86 L40.35,80.49 L42.07,81.02 L43.82,81.45 L45.59,81.79 L47.39,82.03 L49.19,82.16 L51.00,82.20 L52.81,82.13 L54.62,81.96 L56.41,81.69 L58.20,81.31 L59.95,80.84 L61.69,80.27 L63.38,79.60 L65.05,78.83 L66.66,77.98 L68.23,77.03 L69.74,75.99 L71.20,74.87 L72.59,73.67 L73.91,72.39 L75.16,71.03 L76.34,69.61 L77.43,68.12 L78.44,66.57 L79.36,64.96 L80.19,63.30 L80.92,61.60 L81.57,59.85 L82.11,58.07 L82.55,56.26 L82.89,54.43 L83.12,52.57 L83.25,50.71 L83.28,48.84 L83.20,46.97 L83.02,45.10 L82.73,43.24 L82.33,41.40 L81.83,39.59 L81.24,37.80 L80.54,36.05 L79.74,34.34 L78.84,32.67 L77.86,31.05 L76.78,29.49 L75.61,28.00 L74.36,26.56 L73.03,25.20 L71.63,23.92 L70.15,22.71 L68.61,21.59 L67.00,20.56 Z" fill="url(#skg)"/><path d="M39.75,67.75 L40.72,68.31 L41.72,68.82 L42.75,69.27 L43.80,69.67 L44.87,70.01 L45.96,70.29 L47.07,70.51 L48.19,70.67 L49.32,70.77 L50.45,70.81 L51.59,70.78 L52.72,70.70 L53.85,70.55 L54.98,70.34 L56.09,70.07 L57.18,69.73 L58.26,69.34 L59.32,68.89 L60.35,68.38 L61.35,67.82 L62.32,67.20 L63.26,66.52 L64.16,65.80 L65.03,65.03 L65.85,64.21 L66.62,63.34 L67.35,62.43 L68.03,61.48 L68.65,60.50 L69.23,59.48 L69.74,58.43 L70.20,57.35 L70.60,56.25 L70.94,55.13 L71.22,53.98 L71.44,52.82 L71.59,51.65 L71.68,50.47 L71.71,49.29 L71.67,48.10 L71.56,46.92 L71.39,45.74 L71.16,44.58 L70.86,43.42 L70.50,42.28 L70.08,41.16 L69.60,40.07 L69.05,39.00 L68.45,37.96 L67.79,36.95 L67.08,35.98 L66.31,35.05 L65.50,34.16 L64.63,33.32 L63.72,32.52 L62.76,31.77 L61.77,31.08 L60.73,30.44 L59.66,29.85 L58.56,29.33 L57.43,28.86 L56.28,28.46 L55.10,28.12 L53.91,27.84 L52.70,27.63 L51.48,27.49 L50.25,27.41 L49.01,27.40 L47.78,27.45 L46.55,27.58 L45.32,27.77 L44.11,28.03 L42.91,28.35 L41.73,28.74 L40.57,29.19 L39.44,29.71 L38.33,30.29 L37.26,30.93 L36.22,31.63 L35.22,32.38 L32.32,28.93 L30.13,41.87 L43.25,41.96 L40.36,38.51 L40.98,37.98 L41.63,37.48 L42.31,37.01 L43.02,36.58 L43.74,36.19 L44.50,35.85 L45.27,35.54 L46.05,35.27 L46.86,35.05 L47.67,34.87 L48.50,34.73 L49.33,34.64 L50.17,34.59 L51.01,34.60 L51.85,34.64 L52.69,34.74 L53.53,34.87 L54.35,35.06 L55.17,35.29 L55.98,35.56 L56.77,35.88 L57.55,36.25 L58.30,36.65 L59.03,37.10 L59.74,37.59 L60.43,38.11 L61.08,38.68 L61.70,39.28 L62.30,39.91 L62.85,40.58 L63.37,41.27 L63.86,42.00 L64.30,42.75 L64.70,43.53 L65.06,44.33 L65.38,45.15 L65.65,45.99 L65.88,46.84 L66.06,47.71 L66.19,48.58 L66.27,49.47 L66.31,50.36 L66.30,51.25 L66.23,52.14 L66.12,53.02 L65.97,53.91 L65.76,54.78 L65.50,55.64 L65.20,56.49 L64.85,57.33 L64.46,58.14 L64.02,58.93 L63.54,59.70 L63.01,60.45 L62.45,61.16 L61.84,61.84 L61.20,62.50 L60.52,63.11 L59.81,63.69 L59.07,64.23 L58.29,64.73 L57.49,65.19 L56.66,65.61 L55.81,65.97 L54.94,66.30 L54.06,66.57 L53.15,66.80 L52.24,66.98 L51.31,67.11 L50.37,67.18 L49.44,67.21 L48.50,67.18 L47.56,67.11 L46.62,66.98 L45.69,66.80 L44.78,66.57 L43.87,66.29 L42.98,65.96 L42.10,65.58 L41.25,65.16 Z" fill="#FFB020"/></svg>';

  // FOUR DIRECTIONS, then branches — the GO AI lesson applied honestly.
  var TRADE = [
    { href: '/dashboard.html', icon: 'home', label: 'Home' },
    { group: 'trade', icon: 'engine', label: 'Trade', blurb: 'Engine, copy, signals', children: [
      { href: '/bot.html', icon: 'engine', label: 'Engine live', dot: true },
      { href: '/copy.html', icon: 'copy', label: 'MT5 Copy' },
      { href: '/signals.html', icon: 'signal', label: 'Signals' },
      { href: '/copytrade.html', icon: 'coins', label: 'CopyTrader' },
      { href: '/copydash.html', icon: 'activity', label: 'Copy dashboard' },
      { href: '/marketplace.html', icon: 'trophy', label: 'Marketplace' }]},
    { group: 'tools', icon: 'chat', label: 'Tools', blurb: 'Analyse, log, size', children: [
      { href: '/tradegpt.html', icon: 'chat', label: 'TradeGPT' },
      { href: '/journal.html', icon: 'book', label: 'Journal' },
      { href: '/indicators.html', icon: 'chart', label: 'Indicators' },
      { href: '/scanner.html', icon: 'radar', label: 'Crypto Scanner' },
      { href: '/newtokens.html', icon: 'sparkle', label: 'New Tokens' },
      { href: '/lotcalc.html', icon: 'calc', label: 'Lot Calculator' }]},
    { group: 'learn', icon: 'cap', label: 'Learn', blurb: 'Academy and proof', children: [
      { href: '/academy.html', icon: 'cap', label: 'Academy' },
      { href: '/academy.html#review', icon: 'activity', label: 'Weekly engine review' },
      { href: '/perf.html?c=live', icon: 'shield', label: 'Track record' }]}
  ];
  var PARTNER = [
    { href: '/partner.html', icon: 'handshake', label: 'Dashboard' },
    { href: '/partner.html#links', icon: 'link', label: 'Links & assets' },
    { href: '/partner.html#customers', icon: 'users', label: 'Customers' },
    { href: '/partner.html#payouts', icon: 'wallet', label: 'Payouts' }
  ];
  var ACCOUNT = [
    { href: '/account.html', icon: 'key', label: 'Account & security' },
    { href: '/pricing.html', icon: 'card', label: 'Billing & plan' }
  ];
  var TABS = {
    trade: [
      { href: '/dashboard.html', icon: 'home', label: 'Home' },
      { href: '/bot.html', icon: 'engine', label: 'Trade', group: 'trade' },
      { href: '/tradegpt.html', icon: 'chat', label: 'Tools', group: 'tools' },
      { href: '/academy.html', icon: 'cap', label: 'Learn', group: 'learn' },
      { drawer: true, icon: 'menu', label: 'More' }],
    partner: [
      { href: '/partner.html', icon: 'handshake', label: 'Partner' },
      { href: '/partner.html#links', icon: 'link', label: 'Links' },
      { href: '/partner.html#customers', icon: 'users', label: 'Customers' },
      { href: '/partner.html#payouts', icon: 'wallet', label: 'Payouts' },
      { drawer: true, icon: 'menu', label: 'More' }]
  };
  var PARTNER_PAGES = ['/partner.html', '/affiliate.html'];

  function path() { return location.pathname.replace(/\/index\.html$/, '/'); }
  function ws() {
    var p = path();
    if (PARTNER_PAGES.indexOf(p) >= 0) return 'partner';
    try { return localStorage.getItem('sklz_ws') === 'partner' && p === '/dashboard.html' ? 'partner' : (localStorage.getItem('sklz_ws') || 'trade'); } catch (e) { return 'trade'; }
  }
  function setWs(w) {
    try { localStorage.setItem('sklz_ws', w); } catch (e) {}
    location.href = w === 'partner' ? '/partner.html' : '/dashboard.html';
  }
  window.sklzSetWorkspace = setWs;

  function isActive(href) {
    var p = path(), h = href.split('#')[0].split('?')[0];
    if (h !== p) return false;
    if (href.indexOf('#') < 0) return !location.hash || href === '/partner.html' && !location.hash;
    return location.hash === href.slice(href.indexOf('#'));
  }

  function openGroups() { try { return JSON.parse(localStorage.getItem('sklz_nav_open') || '{}'); } catch (e) { return {}; } }
  window.sklzToggleGroup = function (g, btn) {
    var o = openGroups(); o[g] = !o[g];
    try { localStorage.setItem('sklz_nav_open', JSON.stringify(o)); } catch (e) {}
    document.querySelectorAll('.sk-group[data-g="' + g + '"]').forEach(function (el) { el.classList.toggle('open', o[g]); });
    return false;
  };
  function groupActive(gr) { return gr.children.some(function (c) { return isActive(c.href) || c.href.split('#')[0].split('?')[0] === path(); }); }
  function navHtml(w, compact) {
    var items = (w === 'partner' ? PARTNER : TRADE), o = openGroups();
    var h = '<div class="sk-ws" role="tablist">' +
      '<button type="button" class="' + (w === 'trade' ? 'on' : '') + '" onclick="sklzSetWorkspace(\'trade\')">' + ic('activity') + 'Trade</button>' +
      '<button type="button" class="' + (w === 'partner' ? 'on' : '') + '" onclick="sklzSetWorkspace(\'partner\')">' + ic('handshake') + 'Partner</button></div>';
    function leaf(it, sub) {
      return '<a class="sk-item' + (sub ? ' sub' : '') + (isActive(it.href) ? ' on' : '') + '" href="' + it.href + '">' + ic(it.icon) + '<span>' + it.label + '</span>' +
        (it.dot ? '<span class="sk-dot" id="sk-engine-dot" style="display:none"></span>' : '') + '</a>';
    }
    function item(it) {
      if (it.sec) return '<div class="sk-sec">' + it.sec + '</div>';
      if (it.group) {
        var act = groupActive(it), open = act || o[it.group];
        return '<div class="sk-group' + (open ? ' open' : '') + (act ? ' act' : '') + '" data-g="' + it.group + '">' +
          '<button type="button" class="sk-item sk-gh" onclick="return sklzToggleGroup(\'' + it.group + '\', this)">' + ic(it.icon) + '<span>' + it.label + '<small>' + (it.blurb || '') + '</small></span>' + ic('chev', 'margin-left:auto;width:14px;height:14px') + '</button>' +
          '<div class="sk-kids">' + it.children.map(function (c) { return leaf(c, true); }).join('') + '</div></div>';
      }
      return leaf(it, false);
    }
    h += '<div class="sk-nav">' + items.map(item).join('') + '</div>';
    if (!compact) h += '<div class="sk-spacer"></div>';
    h += '<div class="sk-foot"><div class="sk-group' + (ACCOUNT.some(function (c) { return isActive(c.href); }) || o.account ? ' open' : '') + '" data-g="account">' +
      '<button type="button" class="sk-item sk-gh" onclick="return sklzToggleGroup(\'account\', this)">' + ic('key') + '<span>Account<small id="sk-pl">—</small></span>' + ic('chev', 'margin-left:auto;width:14px;height:14px') + '</button>' +
      '<div class="sk-kids">' + ACCOUNT.map(function (c) { return leaf(c, true); }).join('') +
      '<a class="sk-item sub" href="#" onclick="return sklzShellLogout()">' + ic('power') + '<span>Log out</span></a></div></div>' +
      (w === 'partner' ? '<a class="sk-item sub" href="/affiliate.html">' + ic('file') + '<span>Program terms</span></a>' : '') +
      '<div class="sk-user"><div class="av" id="sk-av">·</div><div><div class="nm" id="sk-nm">Signed in</div></div></div></div>';
    return h;
  }
  function brand() {
    return '<a class="sk-brand logo" href="/dashboard.html">' + MARK + 'SKLZ<small>LABS</small></a>';
  }

  window.sklzShellLogout = function () {
    var done = (window.SKLZAuth && SKLZAuth.logout) ? SKLZAuth.logout() : Promise.resolve();
    Promise.resolve(done).catch(function () {}).then(function () {
      try { ['sklz_access', 'sklz_refresh', 'sklz_token', 'sklz_user', 'sklz_email'].forEach(function (k) { localStorage.removeItem(k); }); } catch (e) {}
      location.href = '/';
    });
    return false;
  };

  function build() {
    var w = ws();
    var side = document.querySelector('aside.side, .side');
    // a page's own side PANEL (TradeGPT profile) is not a nav; an empty aside or one with nav items is
    if (side && side.children.length && !side.querySelector('.nav-item, .nav-sec') && !side.hasAttribute('data-nav')) side = null;
    var lang = document.getElementById('sklz-lang');
    if (side) {
      side.classList.add('sk-side');
      side.innerHTML = brand() + navHtml(w, false);
      if (lang) side.insertBefore(lang, side.children[1]);
    } else {
      document.body.classList.add('sk-has-appbar');
      var bar = document.createElement('div');
      bar.className = 'sk-appbar';
      var t = (document.title || '').split(' — ')[0];
      bar.innerHTML = '<button class="sk-ib" aria-label="Menu" onclick="document.documentElement.classList.add(\'sk-open\')">' + ic('menu') + '</button>' +
        brand() + '<span class="sk-title">' + t + '</span><span class="sp"></span>';
      document.body.insertBefore(bar, document.body.firstChild);
      // pages with their own light "topbar" strip: hide the duplicate brand row
      var tb = document.querySelector('.topbar'); if (tb) tb.style.display = 'none';
    }
    // drawer (always built: mobile uses it on every page)
    var scrim = document.createElement('div'); scrim.className = 'sk-scrim';
    scrim.onclick = function () { document.documentElement.classList.remove('sk-open'); };
    var dr = document.createElement('nav'); dr.className = 'sk-drawer'; dr.setAttribute('aria-label', 'Menu');
    dr.innerHTML = brand() + '<button class="sk-ib sk-close" aria-label="Close" onclick="document.documentElement.classList.remove(\'sk-open\')">' + ic('x') + '</button>' + navHtml(w, true);
    document.body.appendChild(scrim); document.body.appendChild(dr);
    // bottom tabs
    var tabs = document.createElement('nav'); tabs.className = 'sk-tabs'; tabs.setAttribute('aria-label', 'Quick navigation');
    tabs.innerHTML = TABS[w].map(function (t) {
      if (t.drawer) return '<button class="sk-tab" onclick="document.documentElement.classList.add(\'sk-open\')">' + ic(t.icon) + '<span>' + t.label + '</span></button>';
      var on = isActive(t.href) || (t.group && TRADE.some(function (g) { return g.group === t.group && groupActive(g); }));
      return '<a class="sk-tab' + (on ? ' on' : '') + '" href="' + t.href + '">' + ic(t.icon) + '<span>' + t.label + '</span></a>';
    }).join('');
    document.body.appendChild(tabs);
    // retire the old inline hamburger / old mobile nav remnants
    document.querySelectorAll('.lnav-btn, #sklz-mnav, .sklz-mnav').forEach(function (e) { e.style.display = 'none'; });
    whoami(); pulse();
  }

  function whoami() {
    var email = '';
    try { email = localStorage.getItem('sklz_email') || (JSON.parse(localStorage.getItem('sklz_user') || '{}').email) || ''; } catch (e) {}
    var set = function (nm, pl) {
      document.querySelectorAll('#sk-nm').forEach(function (e) { e.textContent = nm; });
      document.querySelectorAll('#sk-pl').forEach(function (e) { e.textContent = pl; });
      document.querySelectorAll('#sk-av').forEach(function (e) { e.textContent = (nm || '·').slice(0, 1).toUpperCase(); });
    };
    if (email) set(email, '…');
    var tok = ''; try { tok = localStorage.getItem('sklz_access') || ''; } catch (e) {}
    if (!tok) return;
    var API = 'https://api.sklzlabs.com';
    var f = (window.SKLZAuth && SKLZAuth.fetch) ? SKLZAuth.fetch(API + '/api/billing/status') : fetch(API + '/api/billing/status', { headers: { Authorization: 'Bearer ' + tok } });
    f.then(function (r) { return r.json(); }).then(function (d) {
      var plan = d && (d.plan_name || d.plan || (d.active ? 'Member' : 'No plan'));
      set(email || (d && d.email) || 'Signed in', (plan || '—') + (d && d.owner ? ' · owner' : ''));
    }).catch(function () {});
  }
  function pulse() {
    fetch('https://api.sklzlabs.com/api/public/engine-pulse', { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (d) {
      document.querySelectorAll('#sk-engine-dot').forEach(function (e) { e.style.display = d && d.alive ? '' : 'none'; e.style.background = d && d.alive ? '' : 'var(--red)'; });
    }).catch(function () {});
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
})();
