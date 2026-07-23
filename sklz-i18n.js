/* SKLZ Labs — language support (English / العربية / Русский)
 *
 * The pages are written in English; this walks the DOM and swaps known
 * strings for their translation. A missing entry degrades to English rather
 * than to a broken key, which is the right failure mode for a live site.
 *
 * Arabic flips the layout to RTL. Numbers, prices, symbols, tables and charts
 * stay left-to-right — that is how traders read them in every market.
 *
 * TERMINOLOGY: trading vocabulary has established conventions per market.
 * Entries marked //? are the ones a native-speaking trader should check
 * before this is promoted.
 */
(function () {
  'use strict';

  var AR = {
    'Dashboard': 'لوحة التحكم',
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
    'Copy strategy': 'نسخ الاستراتيجية',
    'Get the bot': 'احصل على البوت',
    '← Dashboard': '← لوحة التحكم',
    '← dashboard': '← لوحة التحكم',
    '↻ refresh': '↻ تحديث',

    'Trading systems, engineered': 'أنظمة تداول مهندَسة',
    'show their work.': 'تُظهر عملها.',
    'Create free account →': 'أنشئ حسابًا مجانيًا ←',
    'Explore the tools': 'استكشف الأدوات',
    "Today's P/L": 'ربح/خسارة اليوم',
    'Trades today': 'صفقات اليوم',
    'Mode': 'الوضع',

    '01 — Products': '٠١ — المنتجات',
    'Built as tools, not promises.': 'أدوات حقيقية، لا وعود.',
    'SKLZ Indicator Suite': 'حزمة مؤشرات SKLZ',
    'Entry zones, SL/TP projections': 'مناطق الدخول وأهداف الوقف والربح',
    'Regime-adaptive signals': 'إشارات تتكيف مع حالة السوق',
    'Honest on-chart win rates': 'نسب ربح صادقة على الشارت',
    '● Live': '● مباشر',
    'Vision chart analysis': 'تحليل الشارت بالصور',
    'Exact position sizing': 'تحديد حجم المركز بدقة',
    'Honest confidence, not hype': 'ثقة صادقة، لا مبالغة',
    'Forex · Crypto · Stocks · Metals': 'فوركس · كريبتو · أسهم · معادن',
    'Entry zone + SL + TP on every call': 'منطقة دخول ووقف وهدف في كل إشارة',
    'Filter by your subscription': 'تصفية حسب اشتراكك',
    'Honest Journal': 'السجل الصادق',
    'Log trades with your reasoning': 'سجّل صفقاتك مع أسبابها',
    'Edge vs coin-flip detection': 'تمييز الأفضلية عن الحظ',
    'Honest AI coaching reviews': 'مراجعات تدريبية صادقة بالذكاء الاصطناعي',
    'Crypto Scanner': 'ماسح الكريبتو',
    'Multi-timeframe momentum grid': 'شبكة زخم متعددة الأطر الزمنية',
    'Daily setups-vs-traps read': 'قراءة يومية: فرص مقابل فخاخ',
    'Per-coin bias with honest confidence': 'اتجاه لكل عملة مع مستوى ثقة صادق',
    'Trading Tools': 'أدوات التداول',
    'Live bot monitor': 'مراقبة البوت مباشرة',
    'SKLZ Academy sessions': 'جلسات أكاديمية SKLZ',
    'Crypto CopyTrader': 'نسخ تداول الكريبتو',
    'Trader Marketplace': 'سوق المتداولين',

    '02 — How it works': '٠٢ — كيف يعمل',
    'Your account. Your keys. Your call.': 'حسابك. مفاتيحك. قرارك.',
    'You hold the credentials': 'أنت من يملك بيانات الدخول',
    'Every action is logged': 'كل إجراء مسجَّل',
    'Paper-first, guards always on': 'تجريبي أولًا، والحماية دائمًا مفعّلة',
    'No guarantees, ever': 'لا ضمانات، أبدًا',

    '03 — Copy trading': '٠٣ — نسخ التداول',
    'Copy a trader, on your own account.': 'انسخ متداولًا، على حسابك أنت.',
    'Your funds stay yours.': 'أموالك تبقى ملكك.',
    'What we will not do': 'ما لن نفعله',
    'Open CopyTrader →': 'افتح نسخ التداول ←',
    'Copy trading involves risk of loss': 'نسخ التداول ينطوي على مخاطر خسارة',

    'Partner Program': 'برنامج الشراكة',
    'Earn 50% recurring — live now.': 'اربح ٥٠٪ متكررة — متاح الآن.',
    'Open your Partner dashboard →': 'افتح لوحة الشراكة ←',

    'Simple pricing. Honest tools.': 'أسعار واضحة. أدوات صادقة.',
    'Indicator Suite': 'حزمة المؤشرات',
    'The Bundle': 'الباقة الكاملة',
    'Get the Bundle →': 'احصل على الباقة ←',
    'See plans →': 'اطّلع على الخطط ←',
    'View plans →': 'اطّلع على الخطط ←',
    'Upgrade →': 'ترقية ←',
    'cancel anytime': 'إلغاء في أي وقت',
    'Free plan': 'الخطة المجانية',
    'no active subscription': 'لا يوجد اشتراك فعّال',
    'Your Subscription': 'اشتراكك',

    'Invited in total': 'إجمالي المدعوين',
    'last 1 day': 'آخر يوم',
    'last 7 days': 'آخر ٧ أيام',
    'last month': 'آخر شهر',
    'last year': 'آخر سنة',
    'There is no data to show': 'لا توجد بيانات لعرضها',
    'Promotion status': 'حالة الترقية',
    'Your rank is:': 'رتبتك:',
    'Recent orders': 'الطلبات الأخيرة',
    'Your team': 'فريقك',
    'No team members yet.': 'لا يوجد أعضاء بعد.',
    'Share your link to build your team.': 'شارك رابطك لبناء فريقك.',
    'Announcement': 'إعلان',

    'Your exchange accounts': 'حسابات المنصات لديك',
    '+ Connect exchange': '+ ربط منصة',
    'Who you are copying': 'من تنسخ منه',
    'Place a trade': 'تنفيذ صفقة',
    'Become a master trader': 'كن متداولًا رئيسيًا',
    'Traders accepting followers': 'متداولون يقبلون المتابعين',
    'How your keys are handled.': 'كيف نتعامل مع مفاتيحك.',
    'USDT amount': 'المبلغ بالـ USDT',

    'Lot Size Calculator': 'حاسبة حجم اللوت',
    'Balance': 'الرصيد',
    'Currency': 'العملة',
    'Risk %': 'نسبة المخاطرة ٪',
    'Stop (pips/points)': 'الوقف (نقاط)',
    'Instrument': 'الأداة',
    'Custom': 'مخصص',
    'SKLZ Academy': 'أكاديمية SKLZ',

    'Copy': 'نسخ',
    'Share': 'مشاركة',
    'Save': 'حفظ',
    'Cancel': 'إلغاء',
    'Loading…': 'جارٍ التحميل…',
    'Settings': 'الإعدادات',
    'Balances': 'الأرصدة',
    'Re-check': 'إعادة الفحص',
    'Revoke': 'إلغاء الصلاحية',
    'Entry zone': 'منطقة الدخول',
    'Stop loss': 'وقف الخسارة',
    'Take profit': 'جني الأرباح',
    'Win rate': 'نسبة الربح',
    'Trades': 'الصفقات',
    'Net P/L': 'صافي الربح/الخسارة',
    'Max drawdown': 'أقصى تراجع',
    'Profit factor': 'معامل الربح',
    'Risk level': 'مستوى المخاطرة',
    'Allocation': 'رأس المال المخصص',
    'Emergency stop': 'إيقاف طارئ',

    'Not financial advice': 'ليست نصيحة مالية',
    'Trading involves risk of loss': 'التداول ينطوي على مخاطر خسارة',
    'Past performance does not guarantee future results':
      'الأداء السابق لا يضمن النتائج المستقبلية',

    'AI-assisted trading software that tells you the truth — indicators, chart analysis, signals with real levels, an honest journal that flags your coin-flip setups, a scanner that calls out traps, and copy trading on your own exchange account. We never hold your funds.':
      'برمجيات تداول بمساعدة الذكاء الاصطناعي تقول لك الحقيقة — مؤشرات، وتحليل شارت، وإشارات بمستويات حقيقية، وسجل صادق يكشف صفقاتك العشوائية، وماسح يحذّر من الفخاخ، ونسخ تداول على حسابك أنت. نحن لا نحتفظ بأموالك أبدًا.',
    'Everything runs on your own broker account. Buy once or subscribe, keep full control, see exactly what the software does.':
      'كل شيء يعمل على حساب وسيطك أنت. اشترِ مرة أو اشترك، واحتفظ بالسيطرة الكاملة، وشاهد بالضبط ما يفعله البرنامج.',
    'Four professional TradingView tools — Pro, Trend, Flow, Radar. Structure, regime, divergence and multi-timeframe scanning with honest performance panels.':
      'أربع أدوات احترافية على TradingView — Pro وTrend وFlow وRadar. هيكل السوق وحالته والتباعد ومسح متعدد الأطر الزمنية، مع لوحات أداء صادقة.',
    'Live momentum across the top 100 coins, with an AI honest read — real setups vs traps. The scanner that flags late chases instead of pumping them.':
      'زخم مباشر لأفضل ١٠٠ عملة، مع قراءة صادقة بالذكاء الاصطناعي — فرص حقيقية مقابل فخاخ. ماسح يحذّر من الدخول المتأخر بدل الترويج له.',
    'An instrument-aware lot calculator across 24 markets, bot monitoring, and an academy of live sessions and recordings.':
      'حاسبة لوت تعرف مواصفات ٢٤ سوقًا، ومراقبة للبوت، وأكاديمية بجلسات مباشرة وتسجيلات.',
    'Connect your own exchange account and copy a trader automatically. You choose two things: how much to allocate and how much risk. Everything else is worked out for you.':
      'اربط حساب منصتك وانسخ متداولًا تلقائيًا. تختار أمرين فقط: كم تخصص وكم تخاطر. وكل ما عدا ذلك محسوب لك.',
    'Real track records, honestly rated. Scores are discounted for small samples, and setups that behave like coin-flips are flagged as exactly that.':
      'سجلات أداء حقيقية بتقييم صادق. تُخفَّض الدرجات عند قلة العينة، وما يشبه الحظ يُوصف بأنه حظ.',
    'Connect your own exchange with a read and spot-trade API key. Choose who to follow, how much to allocate, and how much risk to take. Trades are placed on your account — we never hold your funds and never accept a key that can withdraw.':
      'اربط منصتك بمفتاح للقراءة والتداول الفوري فقط. اختر من تتابع وكم تخصص وكم تخاطر. تُنفَّذ الصفقات على حسابك — لا نحتفظ بأموالك ولا نقبل مفتاحًا يسمح بالسحب.',
    'Most of this industry asks for trust it has not earned. Here is exactly where our limits are:':
      'معظم هذا القطاع يطلب ثقة لم يكسبها. وهذه حدودنا بوضوح:',
    'The line that defines everything we build: SKLZ makes software. We are not a broker, we don\'t manage money, and we don\'t give financial advice.':
      'الخط الذي يحكم كل ما نبنيه: SKLZ تصنع برمجيات. لسنا وسيطًا، ولا ندير أموالًا، ولا نقدّم نصائح مالية.',
    'Markets are uncertain and past results don\'t predict the future. We show you the tools and the data — the decisions, and the risk, stay yours.':
      'الأسواق غير مؤكدة والنتائج السابقة لا تتنبأ بالمستقبل. نعرض لك الأدوات والبيانات — أما القرار والمخاطرة فيبقيان لك.',
    'The bot runs on your machine or VPS against your own broker account. Your login never leaves your device. We literally cannot see it.':
      'يعمل البوت على جهازك أو خادمك مقابل حساب وسيطك. بيانات دخولك لا تغادر جهازك إطلاقًا. لا يمكننا رؤيتها حرفيًا.',
    'Live trading is off by default and takes a deliberate confirmation. A daily-loss kill-switch and spread, hours and position limits sit above every strategy.':
      'التداول الحقيقي معطّل افتراضيًا ويتطلب تأكيدًا صريحًا. ومفتاح إيقاف عند الخسارة اليومية، وحدود للسبريد والساعات والمراكز، تعلو كل استراتيجية.',
    'Each signal, risk decision, and order is written to a session log — then read back by AI to tell you what worked and what to fix.':
      'كل إشارة وقرار مخاطرة وأمر يُسجَّل في سجل الجلسة — ثم يقرأه الذكاء الاصطناعي ليخبرك بما نجح وما يحتاج إصلاحًا.',
    'Every plan renews at the price on the button, cancels in one click, and carries a 7-day money-back guarantee on your first purchase.':
      'كل خطة تتجدد بالسعر المكتوب على الزر، وتُلغى بنقرة واحدة، وتشمل ضمان استرداد خلال ٧ أيام على أول عملية شراء.',
    'All four TradingView tools — Pro, Trend, Flow, Radar — on your TV account.':
      'أدوات TradingView الأربع — Pro وTrend وFlow وRadar — على حسابك.',
    'Everything: all four indicators + TradeGPT Pro, one subscription.':
      'كل شيء: المؤشرات الأربعة مع TradeGPT برو، في اشتراك واحد.',
    'Your AI analyst — chart screenshots in, structured trade plans out.':
      'محللك بالذكاء الاصطناعي — ترسل صورة الشارت، وتستلم خطة تداول منظمة.',
    'Earn half of the subscription revenue from every customer you bring to SKLZ software — for as long as they stay subscribed. Built in from day one.':
      'اربح نصف إيرادات الاشتراك من كل عميل تجلبه إلى SKLZ — طوال بقائه مشتركًا. مبني في النظام منذ اليوم الأول.'
  };

  var RU = {
    'Dashboard': 'Панель',
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
    'Copy strategy': 'Копирование стратегии',
    'Get the bot': 'Получить бота',
    '← Dashboard': '← Панель',
    '← dashboard': '← панель',
    '↻ refresh': '↻ обновить',

    'Trading systems, engineered': 'Торговые системы, спроектированные',
    'show their work.': 'показывают свою работу.',
    'Create free account →': 'Создать бесплатный аккаунт →',
    'Explore the tools': 'Посмотреть инструменты',
    "Today's P/L": 'Прибыль за сегодня',
    'Trades today': 'Сделок сегодня',
    'Mode': 'Режим',

    '01 — Products': '01 — Продукты',
    'Built as tools, not promises.': 'Инструменты, а не обещания.',
    'SKLZ Indicator Suite': 'Набор индикаторов SKLZ',
    'Entry zones, SL/TP projections': 'Зоны входа, расчёт стопа и цели',
    'Regime-adaptive signals': 'Сигналы с учётом режима рынка',
    'Honest on-chart win rates': 'Честная статистика прямо на графике',
    '● Live': '● Работает',
    'Vision chart analysis': 'Анализ графика по скриншоту',
    'Exact position sizing': 'Точный расчёт объёма позиции',
    'Honest confidence, not hype': 'Честная оценка, без хайпа',
    'Forex · Crypto · Stocks · Metals': 'Форекс · Крипто · Акции · Металлы',
    'Entry zone + SL + TP on every call': 'Зона входа, стоп и цель в каждом сигнале',
    'Filter by your subscription': 'Фильтр по вашей подписке',
    'Honest Journal': 'Честный журнал',
    'Log trades with your reasoning': 'Записывайте сделки с обоснованием',
    'Edge vs coin-flip detection': 'Отличаем преимущество от случайности',
    'Honest AI coaching reviews': 'Честный разбор от ИИ',
    'Crypto Scanner': 'Крипто-сканер',
    'Multi-timeframe momentum grid': 'Импульс по нескольким таймфреймам',
    'Daily setups-vs-traps read': 'Ежедневно: сетапы против ловушек',
    'Per-coin bias with honest confidence': 'Направление по монете с честной оценкой',
    'Trading Tools': 'Торговые инструменты',
    'Live bot monitor': 'Монитор бота в реальном времени',
    'SKLZ Academy sessions': 'Занятия Академии SKLZ',
    'Crypto CopyTrader': 'Копи-трейдинг крипто',
    'Trader Marketplace': 'Маркетплейс трейдеров',

    '02 — How it works': '02 — Как это работает',
    'Your account. Your keys. Your call.': 'Ваш счёт. Ваши ключи. Ваше решение.',
    'You hold the credentials': 'Доступы остаются у вас',
    'Every action is logged': 'Каждое действие записывается',
    'Paper-first, guards always on': 'Сначала демо, защита всегда включена',
    'No guarantees, ever': 'Никаких гарантий, никогда',

    '03 — Copy trading': '03 — Копи-трейдинг',
    'Copy a trader, on your own account.': 'Копируйте трейдера на своём счёте.',
    'Your funds stay yours.': 'Ваши средства остаются вашими.',
    'What we will not do': 'Чего мы не делаем',
    'Open CopyTrader →': 'Открыть копи-трейдинг →',
    'Copy trading involves risk of loss': 'Копи-трейдинг сопряжён с риском убытков',

    'Partner Program': 'Партнёрская программа',
    'Earn 50% recurring — live now.': 'Получайте 50% регулярно — уже работает.',
    'Open your Partner dashboard →': 'Открыть партнёрскую панель →',

    'Simple pricing. Honest tools.': 'Простые тарифы. Честные инструменты.',
    'Indicator Suite': 'Набор индикаторов',
    'The Bundle': 'Полный пакет',
    'Get the Bundle →': 'Получить пакет →',
    'See plans →': 'Смотреть тарифы →',
    'View plans →': 'Смотреть тарифы →',
    'Upgrade →': 'Улучшить →',
    'cancel anytime': 'отмена в любой момент',
    'Free plan': 'Бесплатный тариф',
    'no active subscription': 'нет активной подписки',
    'Your Subscription': 'Ваша подписка',

    'Invited in total': 'Всего приглашено',
    'last 1 day': 'за сутки',
    'last 7 days': 'за 7 дней',
    'last month': 'за месяц',
    'last year': 'за год',
    'There is no data to show': 'Данных пока нет',
    'Promotion status': 'Статус продвижения',
    'Your rank is:': 'Ваш ранг:',
    'Recent orders': 'Последние заказы',
    'Your team': 'Ваша команда',
    'No team members yet.': 'Пока нет участников.',
    'Share your link to build your team.': 'Поделитесь ссылкой, чтобы собрать команду.',
    'Announcement': 'Объявление',

    'Your exchange accounts': 'Ваши биржевые аккаунты',
    '+ Connect exchange': '+ Подключить биржу',
    'Who you are copying': 'Кого вы копируете',
    'Place a trade': 'Разместить сделку',
    'Become a master trader': 'Стать мастер-трейдером',
    'Traders accepting followers': 'Трейдеры, принимающие подписчиков',
    'How your keys are handled.': 'Как мы обращаемся с вашими ключами.',
    'USDT amount': 'Сумма в USDT',

    'Lot Size Calculator': 'Калькулятор объёма лота',
    'Balance': 'Баланс',
    'Currency': 'Валюта',
    'Risk %': 'Риск, %',
    'Stop (pips/points)': 'Стоп (пункты)',
    'Instrument': 'Инструмент',
    'Custom': 'Другое',
    'SKLZ Academy': 'Академия SKLZ',

    'Copy': 'Копировать',
    'Share': 'Поделиться',
    'Save': 'Сохранить',
    'Cancel': 'Отмена',
    'Loading…': 'Загрузка…',
    'Settings': 'Настройки',
    'Balances': 'Балансы',
    'Re-check': 'Проверить снова',
    'Revoke': 'Отозвать',
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

    'Not financial advice': 'Не является финансовой рекомендацией',
    'Trading involves risk of loss': 'Торговля сопряжена с риском убытков',
    'Past performance does not guarantee future results':
      'Прошлые результаты не гарантируют будущих',

    'AI-assisted trading software that tells you the truth — indicators, chart analysis, signals with real levels, an honest journal that flags your coin-flip setups, a scanner that calls out traps, and copy trading on your own exchange account. We never hold your funds.':
      'Торговое ПО с ИИ, которое говорит правду — индикаторы, анализ графиков, сигналы с реальными уровнями, честный журнал, отмечающий случайные сетапы, сканер, указывающий на ловушки, и копи-трейдинг на вашем счёте. Мы никогда не храним ваши средства.',
    'Everything runs on your own broker account. Buy once or subscribe, keep full control, see exactly what the software does.':
      'Всё работает на вашем счёте у брокера. Купите или подпишитесь, сохраняя полный контроль и видя, что именно делает программа.',
    'Four professional TradingView tools — Pro, Trend, Flow, Radar. Structure, regime, divergence and multi-timeframe scanning with honest performance panels.':
      'Четыре профессиональных инструмента TradingView — Pro, Trend, Flow, Radar. Структура, режим рынка, дивергенции и мультитаймфрейм-сканирование с честной статистикой.',
    'Live momentum across the top 100 coins, with an AI honest read — real setups vs traps. The scanner that flags late chases instead of pumping them.':
      'Импульс по 100 ведущим монетам с честной оценкой ИИ — реальные сетапы против ловушек. Сканер, который предупреждает о позднем входе, а не разгоняет его.',
    'An instrument-aware lot calculator across 24 markets, bot monitoring, and an academy of live sessions and recordings.':
      'Калькулятор лота, знающий спецификации 24 рынков, монитор бота и академия с live-занятиями и записями.',
    'Connect your own exchange account and copy a trader automatically. You choose two things: how much to allocate and how much risk. Everything else is worked out for you.':
      'Подключите свой биржевой аккаунт и копируйте трейдера автоматически. Вы выбираете две вещи: сколько выделить и какой риск. Остальное рассчитывается за вас.',
    'Real track records, honestly rated. Scores are discounted for small samples, and setups that behave like coin-flips are flagged as exactly that.':
      'Реальные результаты с честной оценкой. При малой выборке балл снижается, а то, что похоже на случайность, так и называется.',
    'Connect your own exchange with a read and spot-trade API key. Choose who to follow, how much to allocate, and how much risk to take. Trades are placed on your account — we never hold your funds and never accept a key that can withdraw.':
      'Подключите биржу ключом только на чтение и спот-торговлю. Выберите, за кем следовать, сколько выделить и какой риск принять. Сделки идут на ваш счёт — мы не храним средства и не принимаем ключи с правом вывода.',
    'Most of this industry asks for trust it has not earned. Here is exactly where our limits are:':
      'Большая часть индустрии просит доверия, которого не заслужила. Вот где проходят наши границы:',
    'The line that defines everything we build: SKLZ makes software. We are not a broker, we don\'t manage money, and we don\'t give financial advice.':
      'Принцип, определяющий всё, что мы делаем: SKLZ создаёт программное обеспечение. Мы не брокер, не управляем деньгами и не даём финансовых рекомендаций.',
    'Markets are uncertain and past results don\'t predict the future. We show you the tools and the data — the decisions, and the risk, stay yours.':
      'Рынки непредсказуемы, а прошлые результаты не предсказывают будущее. Мы даём инструменты и данные — решения и риск остаются вашими.',
    'The bot runs on your machine or VPS against your own broker account. Your login never leaves your device. We literally cannot see it.':
      'Бот работает на вашем компьютере или VPS с вашим счётом у брокера. Логин никогда не покидает ваше устройство. Мы физически его не видим.',
    'Live trading is off by default and takes a deliberate confirmation. A daily-loss kill-switch and spread, hours and position limits sit above every strategy.':
      'Реальная торговля выключена по умолчанию и требует явного подтверждения. Над каждой стратегией — стоп по дневному убытку и лимиты по спреду, времени и позициям.',
    'Each signal, risk decision, and order is written to a session log — then read back by AI to tell you what worked and what to fix.':
      'Каждый сигнал, решение по риску и ордер пишутся в журнал сессии — затем ИИ разбирает их и говорит, что сработало, а что стоит исправить.',
    'Every plan renews at the price on the button, cancels in one click, and carries a 7-day money-back guarantee on your first purchase.':
      'Каждый тариф продлевается по цене на кнопке, отменяется в один клик и включает возврат средств в течение 7 дней при первой покупке.',
    'All four TradingView tools — Pro, Trend, Flow, Radar — on your TV account.':
      'Все четыре инструмента TradingView — Pro, Trend, Flow, Radar — на вашем аккаунте.',
    'Everything: all four indicators + TradeGPT Pro, one subscription.':
      'Всё сразу: четыре индикатора и TradeGPT Pro в одной подписке.',
    'Your AI analyst — chart screenshots in, structured trade plans out.':
      'Ваш ИИ-аналитик: отправляете скриншот графика — получаете структурированный торговый план.',
    'Earn half of the subscription revenue from every customer you bring to SKLZ software — for as long as they stay subscribed. Built in from day one.':
      'Получайте половину дохода от подписки каждого приведённого клиента — пока он остаётся подписчиком. Встроено с первого дня.'
  };

  /* Long-form paragraphs, kept apart so the main dict stays readable. */
  var AR_LONG = {
    'We reject any API key that can withdraw — verified with the exchange, not assumed.':
      'نرفض أي مفتاح يسمح بالسحب — بالتحقق من المنصة نفسها، لا بالافتراض.',
    'We never take custody of your funds. Ever.': 'لا نحتفظ بأموالك إطلاقًا.',
    'No leverage, no futures, no margin. Spot only.':
      'بلا رافعة ولا عقود آجلة ولا هامش. تداول فوري فقط.',
    'Your credentials are encrypted before storage and never shown again. Revoke anytime.':
      'بياناتك مشفّرة قبل التخزين ولا تُعرض مجددًا. يمكنك الإلغاء في أي وقت.',
    'Daily loss limits, per-asset caps and an emergency stop are on by default.':
      'حدود خسارة يومية وسقوف لكل أصل وإيقاف طارئ — مفعّلة افتراضيًا.',
    'Their trades are mirrored into your account, sized to your allocation — never beyond it.':
      'تُنسخ صفقاتهم إلى حسابك بحجم يناسب مبلغك المخصص — ولا يتجاوزه أبدًا.',
    '12 exchanges — spot only, no leverage': '١٢ منصة — تداول فوري فقط، بلا رافعة',
    'Keys with withdrawal access are rejected': 'مفاتيح السحب مرفوضة تمامًا',
    'Allocation is a hard ceiling — the rest is untouched':
      'المبلغ المخصص سقف نهائي — والباقي لا يُمس',
    'Sharpe, drawdown, consistency, recovery factor':
      'شارب، التراجع، الثبات، معامل التعافي',
    'A lucky 15-trade run cannot outrank a steady 200':
      'حظ في ١٥ صفقة لا يتفوق على ثبات في ٢٠٠',
    'Lot calculator — FX, metals, indices, crypto':
      'حاسبة اللوت — فوركس ومعادن ومؤشرات وكريبتو',
    'Software only · Not financial advice · Trading involves risk of loss':
      'برمجيات فقط · ليست نصيحة مالية · التداول ينطوي على مخاطر خسارة',
    'Educational tool — verify contract specs with your broker. Not financial advice.':
      'أداة تعليمية — تحقق من مواصفات العقد مع وسيطك. ليست نصيحة مالية.'
  };

  var RU_LONG = {
    'We reject any API key that can withdraw — verified with the exchange, not assumed.':
      'Мы отклоняем любой ключ с правом вывода — проверяем у биржи, а не на слово.',
    'We never take custody of your funds. Ever.': 'Мы никогда не храним ваши средства.',
    'No leverage, no futures, no margin. Spot only.':
      'Без плеча, фьючерсов и маржи. Только спот.',
    'Your credentials are encrypted before storage and never shown again. Revoke anytime.':
      'Ключи шифруются до записи и больше не показываются. Отозвать можно в любой момент.',
    'Daily loss limits, per-asset caps and an emergency stop are on by default.':
      'Дневной лимит убытка, лимит на актив и аварийная остановка включены по умолчанию.',
    'Their trades are mirrored into your account, sized to your allocation — never beyond it.':
      'Их сделки копируются на ваш счёт в размере вашей выделенной суммы — не больше.',
    '12 exchanges — spot only, no leverage': '12 бирж — только спот, без плеча',
    'Keys with withdrawal access are rejected': 'Ключи с правом вывода отклоняются',
    'Allocation is a hard ceiling — the rest is untouched':
      'Выделенная сумма — жёсткий предел, остальное не трогаем',
    'Sharpe, drawdown, consistency, recovery factor':
      'Шарп, просадка, стабильность, фактор восстановления',
    'A lucky 15-trade run cannot outrank a steady 200':
      'Удача на 15 сделках не обгонит стабильность на 200',
    'Lot calculator — FX, metals, indices, crypto':
      'Калькулятор лота — форекс, металлы, индексы, крипто',
    'Software only · Not financial advice · Trading involves risk of loss':
      'Только ПО · Не финансовая рекомендация · Торговля сопряжена с риском убытков',
    'Educational tool — verify contract specs with your broker. Not financial advice.':
      'Учебный инструмент — уточните спецификации у брокера. Не финансовая рекомендация.'
  };

  Object.keys(AR_LONG).forEach(function (k) { AR[k] = AR_LONG[k]; });
  Object.keys(RU_LONG).forEach(function (k) { RU[k] = RU_LONG[k]; });

  var DICT = { ar: AR, ru: RU };
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
    if (!root || root.nodeType !== 1) return;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        var p = n.parentNode;
        if (!p) return NodeFilter.FILTER_REJECT;
        var tag = p.nodeName;
        if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'CODE') return NodeFilter.FILTER_REJECT;
        if (p.closest && p.closest('#sklz-lang')) return NodeFilter.FILTER_REJECT;
        return n.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    var nodes = [], n;
    while ((n = walker.nextNode())) nodes.push(n);
    nodes.forEach(function (node) {
      var raw = node.nodeValue, key = raw.trim();
      if (dict[key]) node.nodeValue = raw.replace(key, dict[key]);
    });
    ['placeholder', 'title', 'aria-label'].forEach(function (attr) {
      if (!root.querySelectorAll) return;
      root.querySelectorAll('[' + attr + ']').forEach(function (el) {
        var v = el.getAttribute(attr);
        if (dict[v]) el.setAttribute(attr, dict[v]);
      });
    });
  }

  function applyRTL(on) {
    var html = document.documentElement;
    if (!on) { html.setAttribute('dir', 'ltr'); return; }
    html.setAttribute('dir', 'rtl');
    html.setAttribute('lang', 'ar');
    if (document.getElementById('sklz-rtl')) return;
    var st = document.createElement('style');
    st.id = 'sklz-rtl';
    st.textContent =
      '[dir="rtl"] .shell{direction:rtl}' +
      '[dir="rtl"] .side{border-right:none;border-left:1px solid var(--line)}' +
      '[dir="rtl"] .tnum,[dir="rtl"] .v,[dir="rtl"] .px,[dir="rtl"] table,' +
      '[dir="rtl"] svg,[dir="rtl"] .levels,[dir="rtl"] .term-body,' +
      '[dir="rtl"] .mini-stats,[dir="rtl"] input,[dir="rtl"] .lv,' +
      '[dir="rtl"] .tstats,[dir="rtl"] .wgrid{direction:ltr}' +
      '[dir="rtl"] .lv .k,[dir="rtl"] .st .k{text-align:right}';
    document.head.appendChild(st);
  }

  function setLang(code) {
    try { localStorage.setItem('sklz_lang', code); } catch (e) {}
    location.reload();
  }
  window.sklzSetLang = setLang;

  /* The toggle goes INSIDE an existing nav so it never covers a button.
     Only pages with no nav at all get a floating fallback. */
  function buildToggle() {
    if (document.getElementById('sklz-lang')) return;
    var cur = current();
    var wrap = document.createElement('div');
    wrap.id = 'sklz-lang';
    wrap.style.cssText = 'display:inline-flex;gap:3px;background:rgba(20,26,38,.9);' +
      'border:1px solid #1E2735;border-radius:8px;padding:3px;align-items:center;' +
      'vertical-align:middle';

    Object.keys(LANGS).forEach(function (code) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = LANGS[code].label;
      b.title = LANGS[code].name;
      b.style.cssText =
        'border:none;border-radius:5px;padding:5px 9px;cursor:pointer;' +
        'font-family:ui-monospace,Menlo,monospace;font-size:11px;line-height:1;' +
        (code === cur ? 'background:#F5A623;color:#08101A;font-weight:700'
                      : 'background:transparent;color:#8B94A8');
      b.onclick = function () { if (code !== cur) setLang(code); };
      wrap.appendChild(b);
    });

    var host = document.querySelector('.nav-right') ||
               document.querySelector('nav .sp') ||
               document.querySelector('.top .right') ||
               document.querySelector('.nav-links');
    if (host) { wrap.style.marginLeft = '10px'; host.appendChild(wrap); return; }

    var side = document.querySelector('.side');
    if (side) {
      wrap.style.cssText += ';margin:0 8px 16px;display:flex';
      var logo = side.querySelector('.logo');
      if (logo && logo.parentNode === side) side.insertBefore(wrap, logo.nextSibling);
      else side.insertBefore(wrap, side.firstChild);
      return;
    }

    wrap.style.cssText += ';position:fixed;top:74px;' +
      (LANGS[cur].rtl ? 'left:14px;' : 'right:14px;') + 'z-index:60;display:flex';
    document.body.appendChild(wrap);
  }

  function init() {
    var lang = current();
    if (lang !== 'en' && DICT[lang]) {
      translateNode(document.body, DICT[lang]);
      applyRTL(!!LANGS[lang].rtl);
      var mo = new MutationObserver(function (muts) {
        muts.forEach(function (m) {
          Array.prototype.forEach.call(m.addedNodes, function (node) {
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
