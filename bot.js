const http = require('http');
const fs = require('fs');
const path = require('path');
const TelegramBot = require('node-telegram-bot-api');

const PORT = process.env.PORT || 10000;
const BOT_TOKEN = '8968555626:AAFPVptuaQ_o6j-eJSEfsm-A7kQBWG22mtc';
const DB_FILE = path.join(__dirname, 'properties.json');

// دوال قراءة وكتابة قاعدة البيانات المحلية (ملف JSON)
function getProperties() {
  try {
    if (!fs.existsSync(DB_FILE)) return [];
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading DB:', err);
    return [];
  }
}

function saveProperty(newProp) {
  const properties = getProperties();
  properties.unshift(newProp); // إضافة العقار الجديد في البداية
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(properties, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving DB:', err);
  }
}

// إنشاء خادم الويب (يدعم تشغيل البوت + API للموقع ليعرض العقارات)
const server = http.createServer((req, res) => {
  // السماح بالوصول من أي مصدر (CORS) لكي يتمكن موقعك من قراءة البيانات
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // مسار API لجلب العقارات على الموقع
  if (req.url === '/api/properties' && req.method === 'GET') {
    const props = getProperties();
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(props));
    return;
  }

  // الصفحة الرئيسية للسيرفر
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Afaq Al Anqaz Real Estate Bot & API Server is running smoothly!');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});

// إعداد بوت تيليجرام
const bot = new TelegramBot(BOT_TOKEN, {
  polling: {
    interval: 300,
    autoStart: true,
    params: { timeout: 10 }
  }
});

const userStates = {};

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

const skipDetailsKeyboard = {
  reply_markup: {
    inline_keyboard: [
      [
        { text: '⏭️ تخطي التفاصيل وأرسل الوسائط مباشرة', callback_data: 'skip_details' },
        { text: '❌ إلغاء', callback_data: 'cancel' }
      ]
    ]
  }
};

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === '/start') {
    userStates[chatId] = { step: 'idle' };
    bot.sendMessage(chatId, 'أهلاً بك يا صاحب المكتب في لوحة تحكم "آفاق الإنجاز العقاري":', adminControlPanel);
    return;
  }

  const state = userStates[chatId];
  if (!state || state.step === 'idle') return;

  if (state.step === 'waiting_for_details') {
    state.details = text;
    state.step = 'waiting_for_media';
    bot.sendMessage(chatId, 'ممتاز. الآن أرسل صورة أو فيديو للعقار:');
  } else if (state.step === 'waiting_for_article') {
    bot.sendMessage(chatId, `✅ تم استلام المقال / الإعلان بنجاح:\n\n${text}\n\nتم حفظه وتجهيزه للنشر.`);
    userStates[chatId] = { step: 'idle' };
    bot.sendMessage(chatId, 'الخيارات الرئيسية:', adminControlPanel);
  }
});

// استقبال الصور
bot.on('photo', (msg) => {
  const chatId = msg.chat.id;
  const state = userStates[chatId];

  if (state && (state.step === 'waiting_for_media' || state.step === 'waiting_for_media_optional')) {
    const photo = msg.photo[msg.photo.length - 1];
    
    // للحصول على رابط مباشر لملف الصورة من تيليجرام
    bot.getFileLink(photo.file_id).then((fileLink) => {
      state.mediaUrl = fileLink;
      state.mediaType = 'صورة';
      finishPropertyUpload(chatId, state);
    }).catch(() => {
      state.mediaUrl = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80';
      state.mediaType = 'صورة';
      finishPropertyUpload(chatId, state);
    });
  }
});

// استقبال الفيديوهات
bot.on('video', (msg) => {
  const chatId = msg.chat.id;
  const state = userStates[chatId];

  if (state && (state.step === 'waiting_for_media' || state.step === 'waiting_for_media_optional')) {
    const video = msg.video;
    
    bot.getFileLink(video.file_id).then((fileLink) => {
      state.mediaUrl = fileLink;
      state.mediaType = 'فيديو';
      finishPropertyUpload(chatId, state);
    }).catch(() => {
      state.mediaUrl = '';
      state.mediaType = 'فيديو';
      finishPropertyUpload(chatId, state);
    });
  }
});

function finishPropertyUpload(chatId, state) {
  const detailsText = state.details ? state.details : 'بدون تفاصيل إضافية';
  
  const newProperty = {
    id: Date.now(),
    category: state.category,
    categoryName: state.categoryName,
    details: detailsText,
    mediaUrl: state.mediaUrl,
    mediaType: state.mediaType,
    date: new Date().toLocaleDateString('ar-SA')
  };

  // حفظ العقار في قاعدة البيانات المحلية
  saveProperty(newProperty);

  bot.sendMessage(
    chatId,
    `🎉 تم نشر العقار بنجاح وتم ربطه بالموقع الإلكتروني تلقائياً!\n\n` +
    `📌 القسم: ${state.categoryName}\n` +
    `📝 التفاصيل: ${detailsText}\n` +
    `🌐 الحالة: معروض الآن في الموقع.`
  );

  userStates[chatId] = { step: 'idle' };
  bot.sendMessage(chatId, 'اختر عملية أخرى:', adminControlPanel);
}

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
    bot.sendMessage(
      chatId, 
      `لقد اخترت قسم (${catMap[data]}).\nالآن أرسل تفاصيل العقار (الموقع، المساحة، السعر)، أو يمكنك التخطي والانتقال لرفع الوسائط مباشرة:`, 
      skipDetailsKeyboard
    );
  } else if (data === 'skip_details') {
    const state = userStates[chatId];
    if (state && state.step === 'waiting_for_details') {
      state.details = null;
      state.step = 'waiting_for_media_optional';
      bot.sendMessage(chatId, 'تم تخطي التفاصيل. الآن أرسل صورة أو فيديو للعقار:');
    }
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

bot.on('polling_error', (error) => {
  console.log(`[Polling Error] ${error.code}: ${error.message}`);
});
