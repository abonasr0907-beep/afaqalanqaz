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

// 2. التوكن المباشر والصحيح للبوت الجديد
const BOT_TOKEN = '8881283361:AAGQ7Qw1tIkvHyUtkHbGs1x5E5Yh7LzIuU';

// 3. تهيئة البوت
const bot = new TelegramBot(BOT_TOKEN, {
  polling: {
    interval: 300,
    autoStart: true,
    params: {
      timeout: 10
    }
  }
});

// 4. أزرار لوحة التحكم الإدارية
const adminControlPanel = {
  reply_markup: {
    inline_keyboard: [
      [
        { text: '➕ إضافة عقار / أرض', callback_data: 'add_property' },
        { text: '🗑️ حذف / تعديل عقار', callback_data: 'manage_property' }
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
        { text: '🔔 إشعارات الطلبات والتعليقات', callback_data: 'notifications' }
      ]
    ]
  }
};

// 5. الاستجابة لأي رسالة يتم إرسالها للبوت
bot.on('message', (msg) => {
  if (msg.chat && msg.chat.id) {
    bot.sendMessage(msg.chat.id, 'أهلاً بك في لوحة تحكم إدارة الموقع والعقارات:', adminControlPanel)
      .catch((err) => console.error('Error sending message:', err.message));
  }
});

// 6. التعامل مع أخطاء الاتصال بطريقة نظيفة
bot.on('polling_error', (error) => {
  console.log(`[Polling Error] ${error.code}: ${error.message}`);
});
