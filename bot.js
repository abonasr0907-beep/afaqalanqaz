const http = require('http');

// خادم ويب بسيط لإبقاء الخدمة نشطة على Render
const PORT = process.env.PORT || 10000;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Bot is running');
}).listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

const TelegramBot = require('node-telegram-bot-api');

// المفاتيح المعتمدة
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8881283361:AAGQ7...';

// إنشاء كائن البوت مع خيارات تحسين الاتصال
const bot = new TelegramBot(BOT_TOKEN, {
  polling: {
    interval: 300,
    autoStart: true,
    params: {
      timeout: 10
    }
  }
});

// قائمة لوحة التحكم
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

// الاستجابة لأي رسالة (بما فيها /start وأي نص آخر)
bot.on('message', (msg) => {
  if (msg.chat && msg.chat.id) {
    bot.sendMessage(msg.chat.id, 'أهلاً بك في لوحة تحكم إدارة الموقع والعقارات:', adminControlPanel)
      .catch((err) => console.error('Error sending message:', err));
  }
});

// معالجة الأخطاء لتفادي توقف البوت
bot.on('polling_error', (error) => {
  console.log('Polling error:', error.code, error.message);
});
