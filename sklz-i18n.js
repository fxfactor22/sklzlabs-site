/* SKLZ Labs — language support (English / العربية / Русский)
 *
 * How it works: the pages are already written in English, so rather than
 * rewriting every file with data-i18n attributes, this walks the DOM and
 * swaps known English strings for their translation. That keeps the English
 * source readable and means a missing translation degrades to English rather
 * than to a broken key like "nav.dashboard".
 *
 * Arabic also flips the layout to RTL. Numbers, prices, symbols and charts
 * stay left-to-right, because that is how traders read them in every market.
 *
 * TERMINOLOGY NOTE: trading vocabulary has established conventions in each
 * language. The strings below should be reviewed by a native-speaking trader
 * before this is promoted. Terms most worth checking are marked //? in source.
 */
(function () {
  'use strict';

  var DICT = {
    ar: {
      // ── navigation ──
      'Dashboard': 'لوحة التحكم',
      'TradeGPT': 'TradeGPT',
      'Bot Monitor': 'مراقبة البوت',
      'Signals': 'الإشارات',
      'Lot Calculator': 'حاسبة اللوت',
      'Indicators': 'المؤشرات',
      'Journal': 'سجل التداول',
      'Scanner': 'الماسح',
      'New Tokens': 'العملات الجديدة',
      'Marketplace': 'سوق المتداولين',
      'CopyTrader': 'نسخ التداول',
      'Academy': 'الأكاديمية',
      'Partner': 'الشراكة',
      'Affiliate': 'التسويق بالعمولة',
      'Billing': 'الفوترة',
      'Log out': 'تسجيل الخروج',
      'Log in': 'تسجيل الدخول',
      'Workspace': 'مساحة العمل',
      'Tools': 'الأدوات',
      'Account': 'الحساب',
      'Learn & Earn': 'تعلّم واربح',
      'Products': 'المنتجات',
      'Pricing': 'الأسعار',
      'How it works': 'كيف يعمل',
      'Traders': 'المتداولون',

      // ── landing ──
      'Create free account →': 'أنشئ حسابًا مجانيًا ←',
      'Explore the tools': 'استكشف الأدوات',
      'Built as tools, not promises.': 'أدوات حقيقية، لا وعود.',
      'Your account. Your keys. Your call.': 'حسابك. مفاتيحك. قرارك.',
      'Simple pricing. Honest tools.': 'أسعار واضحة. أدوات صادقة.',
      'Copy a trader, on your own account.': 'انسخ متداولًا، على حسابك أنت.',
      'Your funds stay yours.': 'أموالك تبقى ملكك.',
      'Get the Bundle →': 'احصل على الباقة ←',
      'See plans →': 'اطّلع على الخطط ←',
      'View plans →': 'اطّلع على الخطط ←',

      // ── common UI ──
      'Copy': 'نسخ',
      'Share': 'مشاركة',
      'Save': 'حفظ',
      'Cancel': 'إلغاء',
      'Loading…': 'جارٍ التحميل…',
      'Settings': 'الإعدادات',
      'Live': 'مباشر',
      'Entry zone': 'منطقة الدخول',
      'Stop loss': 'وقف الخسارة',      //? standard MT5 Arabic UI term
      'Take profit': 'جني الأرباح',
      'Win rate': 'نسبة الربح',
      'Trades': 'الصفقات',
      'Net P/L': 'صافي الربح/الخسارة',
      'Max drawdown': 'أقصى تراجع',    //? "الانخفاض الأقصى" also used
      'Profit factor': 'معامل الربح',
      'Risk level': 'مستوى المخاطرة',
      'Allocation': 'رأس المال المخصص',
      'Emergency stop': 'إيقاف طارئ',
      'Balances': 'الأرصدة',
      'Re-check': 'إعادة الفحص',
      'Revoke': 'إلغاء الصلاحية',

      // ── honest framing (brand-critical: keep the meaning, not the words) ──
      'A plan, not a promise.': 'خطة، وليست وعدًا.',
      'Not financial advice': 'ليست نصيحة مالية',
      'Trading involves risk of loss': 'التداول ينطوي على مخاطر خسارة',
      'Past performance does not guarantee future results':
        'الأداء السابق لا يضمن النتائج المستقبلية'
    },

    ru: {
      // ── navigation ──
      'Dashboard': 'Панель',
      'TradeGPT': 'TradeGPT',
      'Bot Monitor': 'Монитор бота',
      'Signals': 'Сигналы',
      'Lot Calculator': 'Калькулятор лота',
      'Indicators': 'Индикаторы',
      'Journal': 'Журнал сделок',
      'Scanner': 'Сканер',
      'New Tokens': 'Новые токены',
      'Marketplace': 'Маркетплейс',
      'CopyTrader': 'Копи-трейдинг',
      'Academy': 'Академия',
      'Partner': 'Партнёрам',
      'Affiliate': 'Партнёрская программа',
      'Billing': 'Оплата',
      'Log out': 'Выйти',
      'Log in': 'Войти',
      'Workspace': 'Рабочая область',
      'Tools': 'Инструменты',
      'Account': 'Аккаунт',
      'Learn & Earn': 'Обучение и доход',
      'Products': 'Продукты',
      'Pricing': 'Цены',
      'How it works': 'Как это работает',
      'Traders': 'Трейдеры',

      // ── landing ──
      'Create free account →': 'Создать бесплатный аккаунт →',
      'Explore the tools': 'Посмотреть инструменты',
      'Built as tools, not promises.': 'Инструменты, а не обещания.',
      'Your account. Your keys. Your call.': 'Ваш счёт. Ваши ключи. Ваше решение.',
      'Simple pricing. Honest tools.': 'Простые тарифы. Честные инструменты.',
      'Copy a trader, on your own account.': 'Копируйте трейдера на своём счёте.',
      'Your funds stay yours.': 'Ваши средства остаются вашими.',
      'Get the Bundle →': 'Получить пакет →',
      'See plans →': 'Смотреть тарифы →',
      'View plans →': 'Смотреть тарифы →',

      // ── common UI ──
      'Copy': 'Копировать',
      'Share': 'Поделиться',
      'Save': 'Сохранить',
      'Cancel': 'Отмена',
      'Loading…': 'Загрузка…',
      'Settings': 'Настройки',
      'Live': 'В эфире',
      'Entry zone': 'Зона входа',
      'Stop loss': 'Стоп-лосс',
      'Take profit': 'Тейк-профит',
      'Win rate': 'Процент прибыльных',
      'Trades': 'Сделки',
      'Net P/L': 'Чистая прибыль/убыток',
      'Max drawdown': 'Макс. просадка',
      'Profit factor': 'Профит-фактор',
      'Risk level': 'Уровень риска',
      'Allocation': 'Выделенный капитал',
      'Emergency stop': 'Аварийная остановка',
      'Balances': 'Балансы',
      'Re-check': 'Проверить снова',
      'Revoke': 'Отозвать',

      // ── honest framing ──
      'A plan, not a promise.': 'План, а не обещание.',
      'Not financial advice': 'Не является финансовой рекомендацией',
      'Trading involves risk of loss': 'Торговля сопряжена с риском убытков',
      'Past performance does not guarantee future results':
        'Прошлые результаты не гарантируют будущих'
    }
  };

  var LANGS = {
    en: { label: 'EN', name: 'English', rtl: false },
    ar: { label: 'ع',  name: 'العربية', rtl: true },
    ru: { label: 'RU', name: 'Русский', rtl: false }
  };

  function current() {
    try { return localStorage.getItem('sklz_lang') || 'en'; }
    catch (e) { return 'en'; }
  }

  function translateNode(root, dict) {
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        var p = n.parentNode;
        if (!p) return NodeFilter.FILTER_REJECT;
        var tag = p.nodeName;
        if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'CODE')
          return NodeFilter.FILTER_REJECT;
        return n.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT
                                  : NodeFilter.FILTER_REJECT;
      }
    });
    var nodes = [], n;
    while ((n = walker.nextNode())) nodes.push(n);
    nodes.forEach(function (node) {
      var raw = node.nodeValue;
      var key = raw.trim();
      if (dict[key]) {
        node.nodeValue = raw.replace(key, dict[key]);
      }
    });
    // placeholders and titles too
    ['placeholder', 'title', 'aria-label'].forEach(function (attr) {
      root.querySelectorAll('[' + attr + ']').forEach(function (el) {
        var v = el.getAttribute(attr);
        if (dict[v]) el.setAttribute(attr, dict[v]);
      });
    });
  }

  function applyRTL(on) {
    var html = document.documentElement;
    if (on) {
      html.setAttribute('dir', 'rtl');
      html.setAttribute('lang', 'ar');
      if (!document.getElementById('sklz-rtl')) {
        var st = document.createElement('style');
        st.id = 'sklz-rtl';
        st.textContent =
          '[dir="rtl"] .shell{direction:rtl}' +
          '[dir="rtl"] .side{border-right:none;border-left:1px solid var(--line)}' +
          '[dir="rtl"] .nav-item{flex-direction:row}' +
          /* keep anything numeric or chart-like reading LTR */
          '[dir="rtl"] .tnum,[dir="rtl"] .v,[dir="rtl"] .px,[dir="rtl"] table,' +
          '[dir="rtl"] svg,[dir="rtl"] .levels,[dir="rtl"] .term-body,' +
          '[dir="rtl"] .mini-stats,[dir="rtl"] input,[dir="rtl"] .lv' +
          '{direction:ltr}' +
          '[dir="rtl"] .lv .k,[dir="rtl"] .st .k{text-align:right}';
        document.head.appendChild(st);
      }
    } else {
      html.setAttribute('dir', 'ltr');
      html.setAttribute('lang', 'en');
      var old = document.getElementById('sklz-rtl');
      if (old) old.remove();
    }
  }

  function setLang(code) {
    try { localStorage.setItem('sklz_lang', code); } catch (e) {}
    location.reload();
  }
  window.sklzSetLang = setLang;

  function buildToggle() {
    if (document.getElementById('sklz-lang')) return;
    var cur = current();
    var wrap = document.createElement('div');
    wrap.id = 'sklz-lang';
    wrap.style.cssText =
      'position:fixed;top:12px;' + (LANGS[cur].rtl ? 'left:12px;' : 'right:12px;') +
      'z-index:150;display:flex;gap:4px;background:rgba(15,19,28,.92);' +
      'border:1px solid #1E2735;border-radius:9px;padding:4px;' +
      'backdrop-filter:blur(6px)';
    Object.keys(LANGS).forEach(function (code) {
      var b = document.createElement('button');
      b.textContent = LANGS[code].label;
      b.title = LANGS[code].name;
      b.style.cssText =
        'border:none;border-radius:6px;padding:6px 11px;cursor:pointer;' +
        'font-family:ui-monospace,Menlo,monospace;font-size:11.5px;' +
        (code === cur
          ? 'background:#F5A623;color:#08101A;font-weight:700'
          : 'background:transparent;color:#8B94A8');
      b.onclick = function () { if (code !== cur) setLang(code); };
      wrap.appendChild(b);
    });
    document.body.appendChild(wrap);
  }

  function init() {
    var lang = current();
    if (lang !== 'en' && DICT[lang]) {
      translateNode(document.body, DICT[lang]);
      applyRTL(!!LANGS[lang].rtl);
      // re-translate content rendered later by the page's own JS
      var mo = new MutationObserver(function (muts) {
        muts.forEach(function (m) {
          m.addedNodes.forEach(function (node) {
            if (node.nodeType === 1) translateNode(node, DICT[lang]);
          });
        });
      });
      mo.observe(document.body, { childList: true, subtree: true });
    }
    buildToggle();
  }

  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', init);
  else init();
})();
