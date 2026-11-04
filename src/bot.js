
require('dotenv').config();

const { Telegraf, Markup } = require('telegraf');

const {
  registerUser,
  getUser,
  setLanguage,
  setState,
  getState,
  createRequest,
  getHistory,
  getPending,
  getRequest,
  getStats,
  getMinimum,
  setMinimum,
  addDecision
} = require('./database/db');

const token = process.env.BOT_TOKEN;
const adminIds = (process.env.ADMIN_IDS || '')
  .split(',')
  .map(x => x.trim())
  .filter(Boolean);

if (!token || token === 'YOUR_TELEGRAM_BOT_TOKEN') {
  throw new Error('BOT_TOKEN په .env کې تنظیم نه دی.');
}

if (adminIds.length < 2) {
  throw new Error('لږ تر لږه دوه اډمین ID ګانې په ADMIN_IDS کې ولیکئ.');
}

const bot = new Telegraf(token);

const languages = {
  ps: 'پښتو',
  fa: 'دری',
  en: 'English'
};

function isAdmin(id) {
  return adminIds.includes(String(id));
}

function mainMenu(lang = 'ps') {
  const buttons = {
    ps: [
      ['💼 پانګونه', '💸 د پیسو ایستل'],
      ['📊 زما غوښتنې', '👤 زما حساب'],
      ['📜 د پانګونې اصول', '🌐 ژبه'],
      ['☎️ ملاتړ']
    ],
    fa: [
      ['💼 سرمایه‌گذاری', '💸 برداشت پول'],
      ['📊 درخواست‌های من', '👤 حساب من'],
      ['📜 شرایط سرمایه‌گذاری', '🌐 زبان'],
      ['☎️ پشتیبانی']
    ],
    en: [
      ['💼 Invest', '💸 Withdraw'],
      ['📊 My Requests', '👤 My Account'],
      ['📜 Investment Terms', '🌐 Language'],
      ['☎️ Support']
    ]
  };

  const appButton = {
    text: t(lang, '🚀 د پانګونې اپلیکیشن', '🚀 اپلیکیشن سرمایه‌گذاری', '🚀 Investment App'),
    web_app: {
      url: 'https://abdulraoofbinawa4-sketch.github.io/noamani-investment-miniapp/'
    }
  };

  return {
    reply_markup: {
      keyboard: [
        [appButton],
        ...(buttons[lang] || buttons.ps).map(row => row.map(text => ({ text })))
      ],
      resize_keyboard: true
    }
  };
}
function languageMenu() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('پښتو', 'lang_ps'),
      Markup.button.callback('دری', 'lang_fa'),
      Markup.button.callback('English', 'lang_en')
    ]
  ]);
}

function t(lang, ps, fa, en) {
  return lang === 'fa' ? fa : lang === 'en' ? en : ps;
}

async function showMenu(ctx) {
  const user = getUser(ctx.from.id);
  const lang = user?.language || 'ps';

  await setState(ctx.from.id, '');
  return ctx.reply(
    t(
      lang,
      '🏦 د NOAMANI INVESTMENT هرکلی!\n\nمهرباني وکړئ یو انتخاب وکړئ:',
      '🏦 به NOAMANI INVESTMENT خوش آمدید!\n\nلطفاً یک گزینه انتخاب کنید:',
      '🏦 Welcome to NOAMANI INVESTMENT!\n\nPlease choose an option:'
    ),
    mainMenu(lang)
  );
}

bot.start(async (ctx) => {
  try {
    const payload = ctx.startPayload || '';
    const referrerId = /^\d+$/.test(payload) &&
      payload !== String(ctx.from.id)
      ? payload
      : null;

    registerUser({
      id: ctx.from.id,
      username: ctx.from.username || '',
      first_name: ctx.from.first_name || ''
    }, referrerId);

    const user = getUser(ctx.from.id);

    if (user?.language) {
      return showMenu(ctx);
    }

    await ctx.reply(
      '🌐 مهرباني وکړئ خپله ژبه وټاکئ:\n\nPlease select your language:',
      languageMenu()
    );
  } catch (error) {
    console.error('START ERROR:', error);
    ctx.reply('❌ د بوټ په پیل کې ستونزه رامنځته شوه.');
  }
});

bot.action(/^lang_(ps|fa|en)$/, async (ctx) => {
  try {
    const lang = ctx.match[1];

    setLanguage(ctx.from.id, lang);
    await ctx.answerCbQuery('Language selected');
    await showMenu(ctx);
  } catch (error) {
    console.error(error);
    ctx.answerCbQuery('Error');
  }
});

bot.hears(
  ['🌐 ژبه', '🌐 زبان', '🌐 Language'],
  async (ctx) => {
    await ctx.reply('🌐 ژبه وټاکئ:', languageMenu());
  }
);

bot.hears(
  ['💼 پانګونه', '💼 سرمایه‌گذاری', '💼 Invest'],
  async (ctx) => {
    const user = getUser(ctx.from.id);
    const lang = user?.language || 'ps';
    const min = Number(getMinimum('AFN')) || 300;

    await setState(ctx.from.id, 'investment_amount');

    return ctx.reply(
      t(
        lang,
        `💼 د پانګونې غوښتنه\n\nلږ تر لږه اندازه: ${min} AFN\n\nد پانګونې اندازه په AFN ولیکئ:`,
        `💼 درخواست سرمایه‌گذاری\n\nحداقل مبلغ: ${min} AFN\n\nمبلغ سرمایه‌گذاری را به AFN بنویسید:`,
        `💼 Investment request\n\nMinimum amount: ${min} AFN\n\nEnter your investment amount in AFN:`
      ),
      Markup.removeKeyboard()
    );
  }
);

bot.hears(
  ['💸 د پیسو ایستل', '💸 برداشت پول', '💸 Withdraw'],
  async (ctx) => {
    const user = getUser(ctx.from.id);
    const lang = user?.language || 'ps';

    await setState(ctx.from.id, 'withdraw_currency');

    return ctx.reply(
      t(
        lang,
        'د ایستلو اسعار وټاکئ:',
        'واحد برداشت را انتخاب کنید:',
        'Choose withdrawal currency:'
      ),
      Markup.inlineKeyboard([
        [
          Markup.button.callback('AFN', 'withdraw_AFN'),
          Markup.button.callback('USDT', 'withdraw_USDT')
        ]
      ])
    );
  }
);

bot.action(/^withdraw_(AFN|USDT)$/, async (ctx) => {
  const currency = ctx.match[1];
  const userId = ctx.from.id;

  const min = Number(getMinimum(currency)) ||
    (currency === 'AFN' ? 300 : 5);

  await setState(userId, `withdraw_amount:${currency}`);

  await ctx.answerCbQuery();

  return ctx.reply(
    `💸 د ${currency} د ایستلو اندازه ولیکئ.\nلږ تر لږه: ${min} ${currency}`
  );
});

bot.hears(
  ['📊 زما غوښتنې', '📊 درخواست‌های من', '📊 My Requests'],
  async (ctx) => {
    const rows = getHistory(ctx.from.id) || [];

    if (!rows.length) {
      return ctx.reply('📭 تر اوسه هېڅ غوښتنه نه لرئ.');
    }

    const message = rows.slice(0, 15).map(r =>
      `#${r.id}\n` +
      `ډول: ${r.kind}\n` +
      `اندازه: ${r.amount} ${r.currency}\n` +
      `حالت: ${r.status}\n`
    ).join('\n──────────\n');

    return ctx.reply(`📊 ستاسو د غوښتنو تاریخچه:\n\n${message}`);
  }
);

bot.hears(
  ['👤 زما حساب', '👤 حساب من', '👤 My Account'],
  async (ctx) => {
    const user = getUser(ctx.from.id);

    return ctx.reply(
      `👤 زما حساب\n\n` +
      `Telegram ID: ${ctx.from.id}\n` +
      `نوم: ${ctx.from.first_name || '-'}\n` +
      `ژبه: ${languages[user?.language] || 'پښتو'}\n\n` +
      `یادونه: په دې نسخه کې حقیقي بیلانس نه شته.`
    );
  }
);

bot.hears(
  ['📜 د پانګونې اصول', '📜 شرایط سرمایه‌گذاری', '📜 Investment Terms'],
  async (ctx) => {
    return ctx.reply(
      '📜 د NOAMANI INVESTMENT اصول\n\n' +
      '1️⃣ وړاندیز شوی حداقل پانګونه: 300 AFN.\n' +
      '2️⃣ وړاندیز شوی قرارداد: یو کال.\n' +
      '3️⃣ د مضاربت وړاندیز شوی تقسیم: د حقیقي خالصې ګټې 50٪ پانګه‌وال ته او 50٪ عامل ته.\n' +
      '4️⃣ ثابته یا تضمین شوې ګټه نشته.\n' +
      '5️⃣ ګټه یوازې د حقیقي ترلاسه شوې خالصې ګټې له مخې محاسبه کېږي.\n' +
      '6️⃣ د پانګې د نوي قرارداد لپاره د پانګه‌وال څرګنده او اختیاري رضایت اړین دی.\n\n' +
      '⚠️ دا یوازې لومړني وړاندیز شوي اصول دي، وروستی شرعي او قانوني قرارداد نه دی. د شرعي عالم او قانوني متخصص له کتنې پرته پیسې مه سپارئ.'
    );
  }
);

bot.hears(
  ['☎️ ملاتړ', '☎️ پشتیبانی', '☎️ Support'],
  async (ctx) => {
    await setState(ctx.from.id, 'support');
    return ctx.reply('☎️ خپل پیغام ولیکئ. د لغوه کولو لپاره /cancel ولیکئ.');
  }
);

bot.command('cancel', async (ctx) => {
  await setState(ctx.from.id, '');
  return showMenu(ctx);
});

bot.command('admin', async (ctx) => {
  if (!isAdmin(ctx.from.id)) {
    return ctx.reply('⛔ دا برخه یوازې د اډمین لپاره ده.');
  }

  const stats = getStats();

  return ctx.reply(
    '🛡️ NOAMANI ADMIN PANEL\n\n' +
    `📊 احصائیه:\n${JSON.stringify(stats, null, 2)}\n\n` +
    'د غوښتنو کتلو لپاره /pending ولیکئ.'
  );
});

bot.command('pending', async (ctx) => {
  if (!isAdmin(ctx.from.id)) {
    return ctx.reply('⛔ یوازې اډمین.');
  }

  const rows = getPending() || [];

  if (!rows.length) {
    return ctx.reply('📭 هېڅ انتظار غوښتنه نشته.');
  }

  for (const r of rows.slice(0, 20)) {
    await ctx.reply(
      `📥 غوښتنه #${r.id}\n\n` +
      `User ID: ${r.user_id}\n` +
      `ډول: ${r.kind}\n` +
      `اندازه: ${r.amount} ${r.currency}\n` +
      `یادښت: ${r.note || '-'}\n` +
      `حالت: ${r.status}`,
      Markup.inlineKeyboard([
        [
          Markup.button.callback('✅ تایید', `decision_${r.id}_approve`),
          Markup.button.callback('❌ رد', `decision_${r.id}_reject`)
        ]
      ])
    );
  }
});

bot.action(/^decision_(\d+)_(approve|reject)$/, async (ctx) => {
  if (!isAdmin(ctx.from.id)) {
    return ctx.answerCbQuery('یوازې اډمین اجازه لري.');
  }

  try {
    const requestId = Number(ctx.match[1]);
    const decision = ctx.match[2];

    const request = getRequest(requestId);

    if (!request || request.status !== 'pending') {
      return ctx.answerCbQuery('دا غوښتنه نوره د ارزونې وړ نه ده.');
    }

    const result = addDecision(
      requestId,
      String(ctx.from.id),
      decision,
      adminIds
    );

    await ctx.answerCbQuery(
      'ستاسو پرېکړه ثبت شوه.'
    );

    await ctx.reply(
      `🛡️ ستاسو پرېکړه د غوښتنې #${requestId} لپاره ثبت شوه.\n` +
      'د وروستۍ پرېکړې لپاره د دوو جلا اډمینونو تایید اړین دی.'
    );

    const updated = getRequest(requestId);

    if (
      updated &&
      updated.status !== 'pending'
    ) {
      await bot.telegram.sendMessage(
        request.user_id,
        `📢 ستاسو د غوښتنې #${requestId} وروستی حالت: ${updated.status}`
      );
    }

    console.log('ADMIN DECISION:', result);
  } catch (error) {
    console.error('DECISION ERROR:', error);
    await ctx.answerCbQuery('د پرېکړې په ثبت کې ستونزه.');
  }
});

bot.on('text', async (ctx) => {
  const userId = ctx.from.id;
  const message = ctx.message.text.trim();
  const state = getState(userId) || '';
  const user = getUser(userId);
  const lang = user?.language || 'ps';

  if (message.startsWith('/')) return;

  try {
    if (state === 'investment_amount') {
      const amount = Number(message);
      const min = Number(getMinimum('AFN')) || 300;

      if (!Number.isFinite(amount) || amount < min) {
        return ctx.reply(`❌ اندازه ناسمه ده. لږ تر لږه ${min} AFN ده.`);
      }

      await setState(userId, `investment_method:${amount}`);

      return ctx.reply(
        '💳 د پانګونې د تادیې طریقه وټاکئ:',
        Markup.inlineKeyboard([
          [Markup.button.callback('HesabPay', 'invest_hesabpay')],
          [Markup.button.callback('USDT TRC20', 'invest_trc20')],
          [Markup.button.callback('USDT BEP20', 'invest_bep20')]
        ])
      );
    }

    if (state.startsWith('investment_method:')) {
      return ctx.reply('مهرباني وکړئ د تادیې طریقه له پورته تڼیو وټاکئ.');
    }

    if (state.startsWith('withdraw_amount:')) {
      const currency = state.split(':')[1];
      const amount = Number(message);
      const min = Number(getMinimum(currency)) ||
        (currency === 'AFN' ? 300 : 5);

      if (!Number.isFinite(amount) || amount < min) {
        return ctx.reply(`❌ لږ تر لږه اندازه ${min} ${currency} ده.`);
      }

      await setState(userId, `withdraw_method:${amount}:${currency}`);

      if (currency === 'AFN') {
        return ctx.reply(
          'د پیسو د ایستلو لپاره خپل HesabPay معلومات ولیکئ:'
        );
      }

      return ctx.reply(
        'خپل USDT والټ ادرس ولیکئ:'
      );
    }

    if (state.startsWith('withdraw_method:')) {
      const parts = state.split(':');
      const amount = Number(parts[1]);
      const currency = parts[2];

      if (message.length < 5 || message.length > 150) {
        return ctx.reply('❌ معلومات سم نه ښکاري. بیا یې ولیکئ.');
      }

      createRequest(
        userId,
        'withdrawal',
        amount,
        currency,
        message
      );

      await setState(userId, '');

      return ctx.reply(
        '✅ ستاسو د ایستلو غوښتنه ثبت شوه.\n' +
        '⚠️ دا د پیسو لېږد نه دی؛ یوازې د ارزونې غوښتنه ده.',
        mainMenu(lang)
      );
    }

    if (state === 'support') {
      await setState(userId, '');
      await ctx.reply('✅ ستاسو پیغام ثبت شو. د ملاتړ ټیم ته به ورسېږي.', mainMenu(lang));

      for (const adminId of adminIds) {
        await bot.telegram.sendMessage(
          adminId,
          `☎️ د ملاتړ پیغام\n\nUser: ${userId}\n${message}`
        ).catch(() => {});
      }

      return;
    }

    return ctx.reply('مهرباني وکړئ د مېنو له تڼیو څخه کار واخلئ.', mainMenu(lang));
  } catch (error) {
    console.error('MESSAGE ERROR:', error);
    return ctx.reply('❌ ستونزه رامنځته شوه. بیا هڅه وکړئ.');
  }
});

bot.action(/^invest_(hesabpay|trc20|bep20)$/, async (ctx) => {
  try {
    const userId = ctx.from.id;
    const state = getState(userId) || '';

    if (!state.startsWith('investment_method:')) {
      return ctx.answerCbQuery('دا غوښتنه پای ته رسېدلې ده.');
    }

    const amount = Number(state.split(':')[1]);
    const method = ctx.match[1];

    const currency = method === 'hesabpay' ? 'AFN' : 'USDT';
    const note = method === 'hesabpay'
      ? 'HesabPay - د تادیې د تایید غوښتنه'
      : `USDT ${method.toUpperCase()} - د تادیې د تایید غوښتنه`;

    createRequest(
      userId,
      'investment',
      amount,
      currency,
      note
    );

    await setState(userId, '');

    await ctx.answerCbQuery('غوښتنه ثبت شوه.');

    return ctx.reply(
      '✅ ستاسو د پانګونې غوښتنه ثبت شوه.\n\n' +
      `اندازه: ${amount} ${currency}\n` +
      `طریقه: ${method.toUpperCase()}\n\n` +
      '⚠️ لا تر اوسه هېڅ پیسې نه دي اخیستل شوې. د تادیې او قرارداد سیستم تر فعالېدو مخکې پیسې مه لېږئ.',
      mainMenu(getUser(userId)?.language || 'ps')
    );
  } catch (error) {
    console.error('INVESTMENT ERROR:', error);
    return ctx.answerCbQuery('ستونزه رامنځته شوه.');
  }
});

bot.catch((error) => {
  console.error('BOT ERROR:', error);
});

bot.launch()
  .then(() => console.log('NOAMANI INVESTMENT BOT STARTED'))
  .catch(error => console.error('BOT START ERROR:', error));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
