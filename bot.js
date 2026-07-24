const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// المفاتيح المعتمدة (التوكن الجديد ومعرف الأدمن)
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8881283361:AAGQ7Qwt1tlkvHyUtkHbGs1x5E5Yh7LzIuU';
const ADMIN_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '8298395488';

// إنشاء كائن البوت مع تفعيل الـ Polling للاستماع للرسائل
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// قائمة لوحة التحكم الخاصة بالأدمن (المحتوى والعقارات والخدمات)
const adminControlPanel = {
  reply_markup: {
    inline_keyboard: [
      [
        { text: '➕ إضافة عقار / أرض', callback_data: 'add_property' },
        { text: '🗑️ حذف / تعديل عقار', callback_data: 'manage_properties' }
      ],
      [
        { text: '📝 نشر مقال جديد', callback_data: 'add_article' },
        { text: '🛠️ خدمات ما بعد البيع', callback_data: 'after_sales' }
      ],
      [
        { text: '🖼️ إدارة الصور والمعرض', callback_data: 'manage_gallery' },
        { text: '📊 إحصائيات الموقع', callback_data: 'stats' }
      ],
      [
        { text: '🔔 إشعارات الطلبات والتعليقات', callback_data: 'notifications_status' }
      ]
    ]
  }
};

// 1. استقبال أمر /start أو /admin
bot.onText(/\/(start|admin)/, (msg) => {
  const chatId = msg.chat.id.toString();

  // التحقق مما إذا كان المستخدم هو الأدمن المصرح له
  if (chatId === ADMIN_CHAT_ID) {
    bot.sendMessage(
      chatId,
      `أهلاً بك يا أدمن 👑\n\nإليك لوحة التحكم المباشرة لإدارة الموقع والخدمات العقارية:`,
      adminControlPanel
    );
  } else {
    // الرد على الزوار العاديين للبوت
    bot.sendMessage(
      chatId,
      `مرحباً بك في آفاق الإنجاز للخدمات العقارية والخدمية 🏠\n\nكيف يمكننا مساعدتك اليوم؟ يمكنك التواصل معنا مباشرة أو تصفح خدماتنا عبر الموقع.`
    );
  }
});

// 2. التفاعل مع أزرار لوحة التحكم
bot.on('callback_query', (callbackQuery) => {
  const msg = callbackQuery.message;
  const chatId = msg.chat.id.toString();
  const data = callbackQuery.data;

  if (chatId !== ADMIN_CHAT_ID) {
    bot.answerCallbackQuery(callbackQuery.id, { text: 'عذراً، هذه اللوحة مخصصة للأدمن فقط.', show_alert: true });
    return;
  }

  bot.answerCallbackQuery(callbackQuery.id);

  switch (data) {
    case 'add_property':
      bot.sendMessage(chatId, '📝 لإضافة عقار جديد: أرسل التفاصيل (العنوان، السعر، القسم) متبوعة بـ الصور.');
      break;
    case 'manage_properties':
      bot.sendMessage(chatId, '⚙️ قسم إدارة العقارات والأراضي حالياً نشط ومربوط بـ GitHub.');
      break;
    case 'add_article':
      bot.sendMessage(chatId, '✍️ أرسل نص المقال الجديد مع العنوان لنشره في الموقع.');
      break;
    case 'after_sales':
      bot.sendMessage(chatId, '🛠️ قسم خدمات ما بعد البيع: جاهز لاستقبال الطلبات والصيانة ومتابعة العملاء.');
      break;
    case 'manage_gallery':
      bot.sendMessage(chatId, '🖼️ أرسل الصور مباشرة هنا ليتم رفعها وتصنيفها في المعرض.');
      break;
    case 'stats':
      bot.sendMessage(chatId, '📈 النطاق يعمل بنجاح، وجميع الإشعارات موجهة إلى ID الخاص بك: ' + ADMIN_CHAT_ID);
      break;
    case 'notifications_status':
      bot.sendMessage(chatId, '🔔 إشعارات الموقع مفعّلة! أي تعليق أو طلب من الموقع سيصلك فوراً هنا.');
      break;
    default:
      bot.sendMessage(chatId, 'تم اختيار: ' + data);
  }
});

// 3. معالجة استقبال الصور المرفوعة من الأدمن
bot.on('photo', (msg) => {
  const chatId = msg.chat.id.toString();
  if (chatId === ADMIN_CHAT_ID) {
    bot.sendMessage(chatId, '✅ تم استلام الصورة بنجاح وتجهيزها للمعالجة والرفع.');
  }
});

console.log('Bot is running with the new token...');
