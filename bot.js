require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');
const Property = require('./models/Property');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

class SmartBot {
  constructor() {
    this.token = process.env.BOT_TOKEN;
    this.adminId = parseInt(process.env.ADMIN_ID);
    this.bot = new TelegramBot(this.token, { polling: true });
    this.pendingProperties = new Map();
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
      if (msg.chat.id === this.adminId) {
        this.showStatistics(msg.chat.id);
      }
    });

    this.bot.on('callback_query', (query) => this.handleCallback(query));
    this.bot.on('photo', (msg) => this.handlePhoto(msg));
    this.bot.on('video', (msg) => this.handleVideo(msg));
    this.bot.on('document', (msg) => this.handleDocument(msg));
    this.bot.on('text', (msg) => this.handleText(msg));
  }

  sendAdminPanel(chatId) {
    const text = `🏢 **لوحة تحكم آفاق الإنجاز العقاري**\n\nمرحباً أيها المدير!\n\nاختر العملية:`;
    const options = {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '📊 الإحصائيات', callback_data: 'admin_stats' }],
          [{ text: '➕ إضافة عقار جديد', callback_data: 'add_property' }],
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
    const text = `🏢 **آفاق الإنجاز العقاري**\n\n✨ خبرة 20 عاماً\n✅ مرخص من الهيئة العامة للعقار\n🏆 رخصة فال\n\nاختر الخدمة:`;
    const options = {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🌾 أراضي زراعية', callback_data: 'show_agricultural' }],
          [{ text: '🏠 أراضي سكنية', callback_data: 'show_residential' }],
          [{ text: '🏖️ استراحات', callback_data: 'show_resorts' }],
          [{ text: '📞 تواصل معنا', callback_data: 'contact_us' }]
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
    else if (data === 'add_property') await this.addPropertyStep1(chatId);
    else if (data === 'show_agricultural') await this.showProperties(chatId, 'agricultural', 'الأراضي الزراعية');
    else if (data === 'show_residential') await this.showProperties(chatId, 'residential', 'الأراضي السكنية');
    else if (data === 'show_resorts') await this.showProperties(chatId, 'resorts', 'الاستراحات');
    else if (data === 'contact_us') {
      this.bot.sendMessage(chatId, '📞 واتساب: https://wa.me/966545888931\n✈️ تيليجرام: @afaqalanqaz');
    }
  }

  async addPropertyStep1(chatId) {
    this.pendingProperties.set(chatId, { step: 'waiting_for_title', images: [] });
    this.bot.sendMessage(chatId, '📝 **أرسل عنوان العقار:**\n\nمثال: "أرض زراعية 5000م مع نخيل مثمر - الهياثم"', { parse_mode: 'Markdown' });
  }

  async handleText(msg) {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (!
