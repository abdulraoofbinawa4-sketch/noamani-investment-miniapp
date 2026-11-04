const tg = window.Telegram?.WebApp;

if (tg) {
  tg.ready();
  tg.expand();
}

const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
const modalText = document.getElementById('modalText');
const modalContent = document.getElementById('modalContent');
const languageButton = document.getElementById('language');

const translations = {
  ps: {
    button: 'PS',
    dir: 'rtl',
    welcomeTitle: 'ښه راغلاست!',
    welcomeText: 'د NOAMANI INVESTMENT نړۍ ته ښه راغلاست',
    walletAfn: 'AFN والټ',
    walletUsdt: 'USDT والټ',
    welcomeTag: 'پانګونه • ګټه • پرمختګ',
    account: '💼 زما حساب',
    demo: 'DEMO PREVIEW',
    walletInfo: 'د تایید شوي حساب معلومات',
    total: 'ټوله پانګه',
    profit: 'حقیقي ګټه',
    friends: 'ملګري',
    services: '⚡ خدمات',
    depositTitle: 'Deposit',
    depositDesc: 'د پانګې سپارلو غوښتنه',
    investTitle: 'Investment',
    investDesc: 'د پانګونې معلومات',
    withdrawTitle: 'Withdraw',
    withdrawDesc: 'د پیسو ایستلو غوښتنه',
    referralTitle: 'Referral',
    referralDesc: 'د بلنې سیستم',
    historyTitle: 'History',
    historyDesc: 'د غوښتنو تاریخچه',
    settingsTitle: 'Settings',
    settingsDesc: 'د حساب تنظیمات',
    grow: 'Grow Together',
    bannerSub: 'With Noamani Investment',
    support: '☎️ ملاتړ / Support',
    footerTagline: 'Secure • Transparent • Responsible',
    modalDefault: 'د خدمت معلومات',
    modalContent: 'دا برخه اوس د ډیزاین په لومړني پړاو کې ده.',
    modalOk: 'سمه ده',
    messages: {
      deposit: ['د پانګې سپارل', 'د پانګې د سپارلو غوښتنه به په راتلونکي پړاو کې فعاله شي.'],
      invest: ['پانګونه', 'د پانګونې شرایط او د مضاربت قرارداد به دلته ښکاره شي.'],
      withdraw: ['د پیسو ایستل', 'د پیسو ایستلو غوښتنې به د تایید شوي حساب له لارې اداره کېږي.'],
      referral: ['د بلنې سیستم', 'ستاسو شخصي بلنلیک به د حساب له تایید وروسته ښکاره شي.'],
      history: ['تاریخچه', 'د پانګونې او ایستلو ثبت شوې غوښتنې به دلته ښکاره شي.'],
      settings: ['تنظیمات', 'د ژبې او حساب تنظیمات.'],
      support: ['ملاتړ', 'د ملاتړ لپاره له اډمین سره اړیکه ونیسئ.']
    }
  },

  fa: {
    button: 'FA',
    dir: 'rtl',
    welcomeTitle: 'خوش آمدید!',
    welcomeText: 'به دنیای NOAMANI INVESTMENT خوش آمدید',
    walletAfn: 'کیف پول AFN',
    walletUsdt: 'کیف پول USDT',
    welcomeTag: 'سرمایه‌گذاری • سود • پیشرفت',
    account: '💼 حساب من',
    demo: 'پیش‌نمایش آزمایشی',
    walletInfo: 'اطلاعات حساب تأییدشده',
    total: 'مجموع سرمایه',
    profit: 'سود واقعی',
    friends: 'دوستان',
    services: '⚡ خدمات',
    depositTitle: 'واریز سرمایه',
    depositDesc: 'درخواست سپردن سرمایه',
    investTitle: 'سرمایه‌گذاری',
    investDesc: 'اطلاعات سرمایه‌گذاری',
    withdrawTitle: 'برداشت',
    withdrawDesc: 'درخواست برداشت پول',
    referralTitle: 'دعوت دوستان',
    referralDesc: 'سیستم دعوت',
    historyTitle: 'تاریخچه',
    historyDesc: 'تاریخچه درخواست‌ها',
    settingsTitle: 'تنظیمات',
    settingsDesc: 'تنظیمات حساب',
    grow: 'با هم رشد کنیم',
    bannerSub: 'با نوامانی انویستمنت',
    support: '☎️ پشتیبانی',
    footerTagline: 'امن • شفاف • مسئولانه',
    modalDefault: 'اطلاعات خدمات',
    modalContent: 'این بخش در مرحله ابتدایی طراحی قرار دارد.',
    modalOk: 'تأیید',
    messages: {
      deposit: ['واریز سرمایه', 'درخواست سپردن سرمایه در مرحله بعد فعال خواهد شد.'],
      invest: ['سرمایه‌گذاری', 'شرایط سرمایه‌گذاری و قرارداد مضاربت در این بخش نمایش داده می‌شود.'],
      withdraw: ['برداشت پول', 'درخواست‌های برداشت از طریق حساب تأییدشده مدیریت خواهند شد.'],
      referral: ['دعوت دوستان', 'لینک دعوت شخصی شما پس از تأیید حساب نمایش داده می‌شود.'],
      history: ['تاریخچه', 'درخواست‌های ثبت‌شده سرمایه‌گذاری و برداشت در این بخش نمایش داده می‌شوند.'],
      settings: ['تنظیمات', 'تنظیمات زبان و حساب.'],
      support: ['پشتیبانی', 'برای دریافت پشتیبانی با مدیر تماس بگیرید.']
    }
  },

  en: {
    button: 'EN',
    dir: 'ltr',
    welcomeTitle: 'Welcome!',
    welcomeText: 'Welcome to NOAMANI INVESTMENT',
    walletAfn: 'AFN Wallet',
    walletUsdt: 'USDT Wallet',
    welcomeTag: 'INVEST • EARN • GROW',
    account: '💼 My Account',
    demo: 'DEMO PREVIEW',
    walletInfo: 'Verified account information',
    total: 'Total Investment',
    profit: 'Actual Profit',
    friends: 'Referrals',
    services: '⚡ Services',
    depositTitle: 'Deposit',
    depositDesc: 'Submit a deposit request',
    investTitle: 'Investment',
    investDesc: 'Investment information',
    withdrawTitle: 'Withdraw',
    withdrawDesc: 'Submit a withdrawal request',
    referralTitle: 'Referral',
    referralDesc: 'Referral system',
    historyTitle: 'History',
    historyDesc: 'Request history',
    settingsTitle: 'Settings',
    settingsDesc: 'Account settings',
    grow: 'Grow Together',
    bannerSub: 'With Noamani Investment',
    support: '☎️ Support',
    footerTagline: 'Secure • Transparent • Responsible',
    modalDefault: 'Service information',
    modalContent: 'This section is currently in the initial design stage.',
    modalOk: 'OK',
    messages: {
      deposit: ['Deposit', 'Deposit requests will be enabled in a future stage.'],
      invest: ['Investment', 'Investment terms and the Mudarabah agreement will be displayed here.'],
      withdraw: ['Withdrawal', 'Withdrawal requests will be managed through verified accounts.'],
      referral: ['Referral', 'Your personal invitation link will appear after account verification.'],
      history: ['History', 'Recorded investment and withdrawal requests will appear here.'],
      settings: ['Settings', 'Language and account settings.'],
      support: ['Support', 'Contact the administrator for assistance.']
    }
  }
};

let currentLanguage = 'ps';

try {
  const savedLanguage = localStorage.getItem('noamani-language');
  if (['ps', 'fa', 'en'].includes(savedLanguage)) {
    currentLanguage = savedLanguage;
  }
} catch (error) {
  console.warn('Language preference storage is unavailable.');
}

function applyLanguage(languageCode) {
  const language = translations[languageCode];
  if (!language) return;

  currentLanguage = languageCode;

  try {
    localStorage.setItem('noamani-language', languageCode);
  } catch (error) {
    console.warn('Could not save language preference.');
  }

  document.documentElement.lang = languageCode;
  document.documentElement.dir = language.dir;
  languageButton.textContent = language.button;

  document.getElementById('welcomeTitle').textContent = language.welcomeTitle;
  document.getElementById('welcomeText').textContent = language.welcomeText;

  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.dataset.i18n;
    if (Object.prototype.hasOwnProperty.call(language, key)) {
      element.textContent = language[key];
    }
  });
}

document.querySelectorAll('[data-action]').forEach(button => {
  button.addEventListener('click', () => {
    const action = button.dataset.action;
    const info = translations[currentLanguage].messages[action];
    if (!info) return;

    modalTitle.textContent = info[0];
    modalText.textContent = info[1];
    modalContent.textContent = translations[currentLanguage].modalContent;
    modal.classList.add('show');

    tg?.HapticFeedback?.impactOccurred('light');
  });
});

function closeModal() {
  modal.classList.remove('show');
}

document.getElementById('closeModal').addEventListener('click', closeModal);

document.getElementById('modalOk').addEventListener('click', () => {
  closeModal();
  tg?.HapticFeedback?.selectionChanged();
});

modal.addEventListener('click', event => {
  if (event.target === modal) closeModal();
});

languageButton.addEventListener('click', () => {
  const order = ['ps', 'fa', 'en'];
  const next = (order.indexOf(currentLanguage) + 1) % order.length;
  applyLanguage(order[next]);
  tg?.HapticFeedback?.selectionChanged();
});

applyLanguage(currentLanguage);
