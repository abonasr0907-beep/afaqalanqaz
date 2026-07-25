require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');
const Property = require('./models/Property');
const ImageProcessor = require('./utils/imageProcessor');
const VideoProcessor = require('./utils/videoProcessor');
const AIService = require('./utils/aiService');
const NewsFetcher = require('./utils/newsFetcher');

class SmartBot {
  constructor() {
    this.token = process.env.BOT_TOKEN;
    this.adminId = parseInt(process.env.ADMIN_ID);
    this.bot = new TelegramBot(this.token, { polling: true });
    this.pendingProperties = new Map();
    this.userConversations = new Map();
    this.pendingMedia = new Map();
    
    this.initializeBot();
    this.startNewsScheduler();
    
    console.log('🤖 البوت الذكي يعمل الآن...');
  }

  initializeBot() {
    // أمر البداية
    this.bot.onText(/\/start/, (msg) => {
      if (msg.chat.id === this.adminId) {
        this.sendAdminPanel(msg.chat.id);
      } else {
        this.sendWelcomeMessage(msg.chat.id);
      }
    });

    // أمر المساعدة
    this.bot.onText(/\/help/, (msg) => {
      this.sendHelpMessage(msg.chat.id);
    });

    // أمر الإحصائيات للأدمن
    this.bot.onText(/\/stats/, (msg) => {
      if (msg.chat.id === this.adminId) {
        this.showStatistics(msg.chat.id);
      }
    });

    // أمر تحديث الأخبار
    this.bot.onText(/\/updatenews/, (msg) => {
      if (msg.chat.id === this.adminId) {
        this.forceUpdateNews(msg.chat.id);
      }
    });

    // معالجة الرسائل النصية
    this.bot.on('message', (msg) => this.handleMessage(msg));
    
    // معالجة الاستفسارات
    this.bot.on('callback_query', (query) => this.handleCallback(query));

    // معالجة الصور
    this.bot.on('photo', (msg) => this.handlePhoto(msg));
    
    // معالجة الفيديو
    this.bot.on('video', (msg) => this.handleVideo(msg));
    
    // معالجة المستندات
    this.bot.on('document', (msg) => this.handleDocument(msg));

    console.log('✅ تم تهيئة جميع معالجات البوت');
  }

  // ===== لوحة تحكم الأدمن =====
  sendAdminPanel(chatId) {
    const panelText = `
 **لوحة تحكم آفاق الإنجاز العقاري**

👋 مرحباً أيها المدير!

📊 **إحصائيات سريعة:**
• العقارات النشطة: 30
• العروض المعلقة: ${this.pendingProperties.size}
• الزوار اليوم: 127

🔗 **رابط الموقع:**
${process.env.WEBSITE_URL}

✨ **التحكم الكامل:**
    `;

    const options = {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '📊 الإحصائيات', callback_data: 'admin_stats' },
            { text: '🔄 تحديث الموقع', callback_data: 'admin_refresh' }
          ],
          [
            { text: '🌾 إدارة الزراعي', callback_data: 'manage_agricultural' },
            { text: '🏠 إدارة السكني', callback_data: 'manage_residential' }
          ],
          [
            { text: '🏖️ إدارة الاستراحات', callback_data: 'manage_resorts' },
            { text: '⏳ العروض المعلقة', callback_data: 'pending_offers' }
          ],
          [
            { text: ' تحديث الأخبار', callback_data: 'update_news' },
            { text: '🗺️ تحديث الخريطة', callback_data: 'update_map' }
          ],
          [
            { text: '️ تعديل النصوص', callback_data: 'edit_texts' },
            { text: '🎨 توليد صور AI', callback_data: 'generate_images' }
          ],
          [
            { text: '📞 رسائل العملاء', callback_data: 'customer_messages' },
            { text: '⭐ التعليقات', callback_data: 'view_comments' }
          ],
          [
            { text: ' إعدادات الأمان', callback_data: 'security_settings' },
            { text: ' SEO',
