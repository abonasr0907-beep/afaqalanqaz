const http = require('http');

// 1. إنشاء خادم HTTP لتخطي فحص المنافذ في Render
const PORT = process.env.PORT || 10000;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Bot is running smoothly!');
}).listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});

const TelegramBot = require('node-telegram-bot-api');

// 2. التوكن المباشر للبوت
const BOT_TOKEN = '8968555626:AAFPVptuaQ_o6j-eJSEfsm-A7kQBWG22mtc';

const bot = new TelegramBot(BOT_TOKEN, {
  polling: {
    interval: 300,
    autoStart: true,
    params: {
      timeout: 10
    }
  }
});

// تخزين مؤقت لحالة المحادثة الخاصة بكل مستخدم
const userStates = {};

// أزرار لوحة التحكم الإدارية الرئيسية
const adminControlPanel = {
  reply_markup: {
    inline_keyboard: [
      [
        { text: '➕ إضافة عقار / أرض', callback_data: 'add_property' },
        { text: '🛠️ خدمات ما بعد البيع', callback_data: 'after_sales' }
      ],
      [
        { text: '📝 نشر مقال أو إعلان', callback_data: 'add_article' },
        { text: '📊 إحصائيات الطلبات', callback_data: 'stats' }
      ]
    ]
  }
};

// أزرار اختيار أقسام العقارات
const categoriesKeyboard = {
  reply_markup: {
    inline_keyboard: [
      [
        { text: '🌾 أراضي زراعية', callback_data: 'cat_agricultural' },
        { text: '🏡 أراضي سكنية', callback_data: 'cat_residential' }
      ],
      [
        { text: '🏖️ استراحات وشاليهات', callback_data: 'cat_resorts' },
        { text: '❌ إلغاء', callback_data: 'cancel' }
      ]
    ]
  }
};

// 3. الاستماع للرسائل والأوامر
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === '/start') {
    userStates[chatId] = { step: 'idle' };
    bot.sendMessage(chatId, 'أهلاً بك يا صاحب المكتب في لوحة تحكم "آفاق الإنجاز العقاري":', adminControlPanel);
    return;
  }

  // معالجة الخطوات التفاعلية حسب حالة المستخدم
  const state = userStates[chatId];
  if (!state || state.step === 'idle') return;

  if (state.step === 'waiting_for_details') {
    state.details = text;
    state.step = 'waiting_for_image';
    bot.sendMessage(chatId, 'ممتاز. الآن أرسل **صورة العقار** (أو صور متعددة):');
  } else if (state.step === 'waiting_for_article') {
    bot.sendMessage(chatId, `✅ تم استلام المقال / الإعلان بنجاح:\n\n${text}\n\nتم حفظه وتجهيزه للنشر.`);
    userStates[chatId] = { step: 'idle' };
    bot.sendMessage(chatId, 'الخيارات الرئيسية:', adminControlPanel);
  }
});

// 4. الاستماع للصور المرسلة من المستخدم
bot.on('photo', (msg) => {
  const chatId = msg.chat.id;
  const state = userStates[chatId];

  if (state && state.step === 'waiting_for_image') {
    const photo = msg.photo[msg.photo.length - 1]; // أخذ أعلى جودة للصورة
    state.photoId = photo.file_id;

    bot.sendMessage(
      chatId,
      `🎉 تم استلام العقار بنجاح!\n\n` +
      `📌 القسم: ${state.categoryName}\n` +
      `📝 التفاصيل: ${state.details}\n` +
      `🖼️ الحالة: جاهز للربط والعرض بالموقع.`
    );

    userStates[chatId] = { step: 'idle' };
    bot.sendMessage(chatId, 'اختر عملية أخرى:', adminControlPanel);
  }
});

// 5. التعامل مع الضغط على الأزرار التفاعلية (Callback Queries)
bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

  if (data === 'add_property') {
    userStates[chatId] = { step: 'waiting_for_category' };
    bot.sendMessage(chatId, 'الرجاء اختيار قسم العقار:', categoriesKeyboard);
  } else if (data.startsWith('cat_')) {
    const catMap = {
      'cat_agricultural': 'أراضي زراعية',
      'cat_residential': 'أراضي سكنية',
      'cat_resorts': 'استراحات وشاليهات'
    };
    userStates[chatId] = { 
      step: 'waiting_for_details', 
      category: data, 
      categoryName: catMap[data] 
    };
    bot.sendMessage(chatId, `لقد اخترت قسم (${catMap[data]}).\nالآن أرسل تفاصيل العقار (الموقع، المساحة، السعر):`);
  } else if (data === 'add_article') {
    userStates[chatId] = { step: 'waiting_for_article' };
    bot.sendMessage(chatId, 'أرسل نص المقال أو الإعلان الجديد الذي تريد نشره:');
  } else if (data === 'cancel') {
    userStates[chatId] = { step: 'idle' };
    bot.sendMessage(chatId, 'تم الإلغاء.', adminControlPanel);
  } else if (data === 'after_sales' || data === 'stats') {
    bot.sendMessage(chatId, 'هذه الخدمة قيد التفعيل، سيتم ربطها قريباً.');
  }

  bot.answerCallbackQuery(query.id);
});

// 6. التعامل مع أخطاء الاتصال
bot.on('polling_error', (error) => {
  console.log(`[Polling Error] ${error.code}: ${error.message}`);
});
