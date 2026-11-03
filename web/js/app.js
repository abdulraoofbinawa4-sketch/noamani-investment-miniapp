const tg = window.Telegram?.WebApp;

if (tg) {
  tg.ready();
  tg.expand();
}

const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
const modalText = document.getElementById('modalText');
const modalContent = document.getElementById('modalContent');

const messages = {
  deposit: ['Deposit', 'د پانګې د سپارلو غوښتنه به په راتلونکي پړاو کې فعاله شي.'],
  invest: ['Investment', 'د پانګونې شرایط او د مضاربت قرارداد به دلته ښکاره شي.'],
  withdraw: ['Withdraw', 'د پیسو ایستلو غوښتنې به د تایید شوي حساب له لارې اداره کېږي.'],
  referral: ['Referral', 'ستاسو شخصي بلنلیک به د حساب له تایید وروسته ښکاره شي.'],
  history: ['History', 'د پانګونې او ایستلو ثبت شوې غوښتنې به دلته ښکاره شي.'],
  settings: ['Settings', 'د ژبې او حساب تنظیمات.'],
  support: ['Support', 'د ملاتړ لپاره له اډمین سره اړیکه ونیسئ.']
};

document.querySelectorAll('[data-action]').forEach(button => {
  button.addEventListener('click', () => {
    const action = button.dataset.action;
    const info = messages[action];

    if (!info) return;

    modalTitle.textContent = info[0];
    modalText.textContent = info[1];
    modalContent.textContent = 'دا برخه اوس د ډیزاین په لومړني پړاو کې ده.';
    modal.classList.add('show');

    if (tg) tg.HapticFeedback?.impactOccurred('light');
  });
});

function closeModal() {
  modal.classList.remove('show');
}

document.getElementById('closeModal').addEventListener('click', closeModal);
document.getElementById('modalOk').addEventListener('click', closeModal);

modal.addEventListener('click', event => {
  if (event.target === modal) closeModal();
});

const languageButton = document.getElementById('language');
let currentLanguage = 'ps';

const translations = {
  ps: {
    button: 'PS',
    title: 'ښه راغلاست!',
    text: 'د NOAMANI INVESTMENT نړۍ ته ښه راغلاست',
    dir: 'rtl'
  },
  fa: {
    button: 'FA',
    title: 'خوش آمدید!',
    text: 'به دنیای NOAMANI INVESTMENT خوش آمدید',
    dir: 'rtl'
  },
  en: {
    button: 'EN',
    title: 'Welcome Back!',
    text: 'Welcome to NOAMANI INVESTMENT',
    dir: 'ltr'
  }
};

languageButton.addEventListener('click', () => {
  const order = ['ps', 'fa', 'en'];
  currentLanguage = order[(order.indexOf(currentLanguage) + 1) % order.length];

  const language = translations[currentLanguage];

  languageButton.textContent = language.button;
  document.getElementById('welcomeTitle').textContent = language.title;
  document.getElementById('welcomeText').textContent = language.text;
  document.documentElement.dir = language.dir;
  document.documentElement.lang = currentLanguage;
});

document.getElementById('modalOk').addEventListener('click', () => {
  if (tg) tg.HapticFeedback?.selectionChanged();
});
