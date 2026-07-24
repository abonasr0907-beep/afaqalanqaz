const http = require('http');

// خادم ويب بسيط لإرضاء نظام Render وإبقاء الخدمة نشطة
const PORT = process.env.PORT || 10000;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Bot is running');
}).listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// المفاتيح المعتمدة (التوكن الجديد ومعرف الأدمن)
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8881283361:AAGQ7...';
const ADMIN_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '8298395488';

// إنشاء كائن البوت مع تفعيل الـ Polling للاستماع للرسائل
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// قائمة لوحة التحكم الخاصة بالأدمن (المحتوى والعقارات والخدمات)
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

// 1. استقبال أمر start/ أو admin/
bot.onText(/\/(start|admin)/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'أهلاً بك في لوحة تحكم إدارة الموقع والعقارات:', adminControlPanel);
});
