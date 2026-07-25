require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');
const Property = require('./models/Property');

class SmartBot {
  constructor() {
    this.token = process.env.BOT_TOKEN;
    this.adminId = parseInt(process.env.ADMIN_ID);
    this.bot = new TelegramBot(this.token, { polling: true });
    this.initializeBot();
    console.log('🤖 البوت يعمل الآن...');
  }

  initializeBot() {
    this.bot.onText(/\/start/, (msg) => {
      if (msg.chat.id === this.adminId) {
        this.sendAdminPanel(msg.chat.id);
      } else {
        this.sendWelcomeMessage(msg.chat.id);
      }
    });

    this.bot.onText(/\/stats/, (msg) => {
      if (msg.chat.id === this.adminId) this.showStatistics(msg.chat.id);
    });

    this.bot.on('callback_query', (query) => this.handleCallback(query));
  }

  sendAdminPanel(chatId) {
    const text = `🏢 لوحة تحكم آفاق الإنجاز العقاري\n\nمرحباً أيها المدير!`;
    const options = {
      reply_markup: {
        inline_keyboard: [
          [{ text: '📊 الإحصائيات', callback_data: 'admin_stats' }],
          [{ text: '🌾 أراضي زراعية', callback_data: 'show_agricultural' }],
          [{ text: '🏠 أراضي سكنية', callback_data: 'show_residential' }],
          [{ text: '🏖️ استراحات', callback_data: 'show_resorts' }],
          [{ text: '📞 تواصل', callback_data: 'contact_us' }]
        ]
      }
    };
    this.bot.sendMessage(chatId, text, options);
  }

  sendWelcomeMessage(chatId) {
    const text = `🏢 آفاق الإنجاز العقاري\n\n✨ خبرة 20 عاماً\n✅ مرخص من الهيئة العامة للعقار`;
    const options = {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🌾 أراضي زراعية', callback_data: 'show_agricultural' }],
          [{ text: ' أراضي سكنية', callback_data: 'show_residential' }],
          [{ text: '🏖️ استراحات', callback_data: 'show_resorts' }],
          [{ text: '📞 تواصل', callback_data: 'contact_us' }]
        ]
      }
    };
    this.bot.sendMessage(chatId, text, options);
  }

  async handleCallback(query) {
    const chatId = query.message.chat.id;
    const data = query.data;
    this.bot.answerCallbackQuery(query.id);

    if (data === 'admin_stats') await this.showStatistics(chatId);
    else if (data === 'show_agricultural') await this.showProperties(chatId, 'agricultural', 'الأراضي الزراعية');
    else if (data === 'show_residential') await this.showProperties(chatId, 'residential', 'الأراضي السكنية');
    else if (data === 'show_resorts') await this.showProperties(chatId, 'resorts', 'الاستراحات');
    else if (data === 'contact_us') {
      this.bot.sendMessage(chatId, '📞 واتساب: https://wa.me/966545888931\n✈️ تيليجرام: @afaqalanqaz');
    }
  }

  async showStatistics(chatId) {
    try {
      const total = await Property.countDocuments({ status: 'active' });
      const agri = await Property.countDocuments({ category: 'agricultural', status: 'active' });
      const res = await Property.countDocuments({ category: 'residential', status: 'active' });
      const resort = await Property.countDocuments({ category: 'resorts', status: 'active' });

      const text = `📊 الإحصائيات:\n\n🏡 إجمالي العقارات: ${total}\n🌾 زراعية: ${agri}\n🏠 سكنية: ${res}\n🏖️ استراحات: ${resort}`;
      this.bot.sendMessage(chatId, text);
    } catch (error) {
      this.bot.sendMessage(chatId, 'خطأ: ' + error.message);
    }
  }

  async showProperties(chatId, category, title) {
    try {
      const properties = await Property.find({ category, status: 'active' }).limit(5);
      if (properties.length === 0) {
        this.bot.sendMessage(chatId, `لا توجد ${title} متاحة حالياً`);
        return;
      }
      let text = ` ${title}:\n\n`;
      properties.forEach((p, i) => {
        text += `${i+1}. ${p.title}\n   📍 ${p.location}\n   💰 ${p.price.toLocaleString()} ر.س\n\n`;
      });
      this.bot.sendMessage(chatId, text);
    } catch (error) {
      this.bot.sendMessage(chatId, 'خطأ: ' + error.message);
    }
  }
}

module.exports = SmartBot;
