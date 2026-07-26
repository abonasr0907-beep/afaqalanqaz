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
    // أمر البداية
    this.bot.onText(/\/start/, (msg) => {
      if (msg.chat.id === this.adminId) {
        this.sendAdminPanel(msg.chat.id);
      } else {
        this.sendWelcomeMessage(msg.chat.id);
      }
    });

    // أمر الإحصائيات
    this.bot.onText(/\/stats/, (msg) => {
      if (msg.chat.id === this.adminId) {
        this.showStatistics(msg.chat.id);
      }
    });

    // معالجة الاستفسارات
    this.bot.on('callback_query', (query) => this.handleCallback(query));

    // معالجة الصور
    this.bot.on('photo', (msg) => this.handlePhoto(msg));

    // معالجة الفيديو
    this.bot.on('video', (msg) => this.handleVideo(msg));

    // معالجة المستندات
    this.bot.on('document', (msg) => this.handleDocument(msg));

    // معالجة النصوص (لإضافة عقار)
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
    const text = `🏢 **آفاق الإنجاز العقاري**\n\n✨ خبرة 20 عاماً\n✅ مرخص من الهيئة العامة للعقار\n رخصة فال\n\nاختر الخدمة:`;
    const options = {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: ' أراضي زراعية', callback_data: 'show_agricultural' }],
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
    this.pendingProperties.set(chatId, { step: 'waiting_for_title' });
    this.bot.sendMessage(chatId, '📝 **أرسل عنوان العقار:**\n\nمثال: "أرض زراعية 5000م مع نخيل مثمر - الهياثم"', { parse_mode: 'Markdown' });
  }

  async handleText(msg) {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (!this.pendingProperties.has(chatId)) return;

    const state = this.pendingProperties.get(chatId);

    if (state.step === 'waiting_for_title') {
      state.title = text;
      state.step = 'waiting_for_category';
      this.pendingProperties.set(chatId, state);
      this.bot.sendMessage(chatId, '📋 **اختر نوع العقار:**\n\n1. أرض زراعية\n2. أرض سكنية\n3. استراحة\n\nأرسل الرقم (1، 2، أو 3)', { parse_mode: 'Markdown' });
    }
    else if (state.step === 'waiting_for_category') {
      const categories = { '1': 'agricultural', '2': 'residential', '3': 'resorts' };
      const categoryNames = { '1': 'زراعية', '2': 'سكنية', '3': 'استراحة' };
      
      if (categories[text]) {
        state.category = categories[text];
        state.step = 'waiting_for_location';
        this.pendingProperties.set(chatId, state);
        this.bot.sendMessage(chatId, `✅ تم اختيار: ${categoryNames[text]}\n\n📍 **أرسل الموقع:**\n\nمثال: "الخرج - الهياثم"`, { parse_mode: 'Markdown' });
      } else {
        this.bot.sendMessage(chatId, '❌ اختر 1 أو 2 أو 3 فقط');
      }
    }
    else if (state.step === 'waiting_for_location') {
      state.location = text;
      state.step = 'waiting_for_price';
      this.pendingProperties.set(chatId, state);
      this.bot.sendMessage(chatId, '💰 **أرسل السعر بالريال:**\n\nمثال: 850000', { parse_mode: 'Markdown' });
    }
    else if (state.step === 'waiting_for_price') {
      const price = parseInt(text.replace(/\D/g, ''));
      if (price > 0) {
        state.price = price;
        state.step = 'waiting_for_area';
        this.pendingProperties.set(chatId, state);
        this.bot.sendMessage(chatId, '📐 **أرسل المساحة:**\n\nمثال: "5,000 م²" أو "5000 متر"', { parse_mode: 'Markdown' });
      } else {
        this.bot.sendMessage(chatId, '❌ أرسل رقماً صحيحاً');
      }
    }
    else if (state.step === 'waiting_for_area') {
      state.area = text;
      state.step = 'waiting_for_features';
      this.pendingProperties.set(chatId, state);
      this.bot.sendMessage(chatId, '✨ **أرسل المميزات (مفصولة بفاصلة):**\n\nمثال: "صك، كهرباء، ماء، طريق معبد"', { parse_mode: 'Markdown' });
    }
    else if (state.step === 'waiting_for_features') {
      state.features = text.split('،').map(f => f.trim());
      state.step = 'waiting_for_images';
      this.pendingProperties.set(chatId, state);
      this.bot.sendMessage(chatId, '📸 **الآن أرسل صور العقار** (يمكنك إرسال صور متعددة)\n\nعند الانتهاء، أرسل كلمة "تم"', { parse_mode: 'Markdown' });
    }
    else if (state.step === 'waiting_for_images') {
      if (text === 'تم' || text === 'finish') {
        state.step = 'ready_to_save';
        this.pendingProperties.set(chatId, state);
        await this.saveProperty(chatId, state);
      }
    }
  }

  async handlePhoto(msg) {
    const chatId = msg.chat.id;
    
    if (!this.pendingProperties.has(chatId)) {
      this.bot.sendMessage(chatId, '⚠️ استخدم /start للبدء');
      return;
    }

    const state = this.pendingProperties.get(chatId);
    
    if (state.step === 'waiting_for_images') {
      try {
        const photo = msg.photo[msg.photo.length - 1];
        const fileLink = await this.bot.getFileLink(photo.file_id);
        
        if (!state.images) state.images = [];
        state.images.push(fileLink);
        this.pendingProperties.set(chatId, state);
        
        this.bot.sendMessage(chatId, `✅ تم استلام الصورة ${state.images.length}\n\nأرسل المزيد أو أرسل "تم" للإنهاء`, { parse_mode: 'Markdown' });
      } catch (error) {
        this.bot.sendMessage(chatId, '❌ خطأ في معالجة الصورة');
      }
    }
  }

  async handleVideo(msg) {
    const chatId = msg.chat.id;
    
    if (!this.pendingProperties.has(chatId)) return;

    const state = this.pendingProperties.get(chatId);
    
    if (state.step === 'waiting_for_images') {
      try {
        const video = msg.video;
        const fileLink = await this.bot.getFileLink(video.file_id);
        
        state.video = fileLink;
        this.pendingProperties.set(chatId, state);
        
        this.bot.sendMessage(chatId, '✅ تم استلام الفيديو\n\nأرسل "تم" للإنهاء', { parse_mode: 'Markdown' });
      } catch (error) {
        this.bot.sendMessage(chatId, '❌ خطأ في معالجة الفيديو');
      }
    }
  }

  async handleDocument(msg) {
    const chatId = msg.chat.id;
    this.bot.sendMessage(chatId, '📄 تم استلام المستند');
  }

  async saveProperty(chatId, state) {
    try {
      const property = new Property({
        title: state.title,
        description: `${state.title} - ${state.location}`,
        category: state.category,
        location: state.location,
        price: state.price,
        area: state.area,
        features: state.features || [],
        images: state.images || [],
        video: state.video || null,
        coordinates: {
          lat: 24.1500 + (Math.random() * 0.1),
          lng: 47.3000 + (Math.random() * 0.1)
        },
        whatsappLink: `https://wa.me/966545888931?text=أهتم%20بـ%20${encodeURIComponent(state.title)}`,
        status: 'active',
        submittedBy: 'admin',
        isFeatured: true
      });

      await property.save();

      const confirmText = `✅ **تم إضافة العقار بنجاح!**\n\n📋 **التفاصيل:**\nالعنوان: ${state.title}\nالنوع: ${state.category}\nالموقع: ${state.location}\nالسعر: ${state.price.toLocaleString()} ريال\nالمساحة: ${state.area}\n\n تم حفظه في قاعدة البيانات`;
      
      this.bot.sendMessage(chatId, confirmText, { parse_mode: 'Markdown' });
      this.pendingProperties.delete(chatId);

      // إرسال تنبيه للأدمن
      this.bot.sendMessage(this.adminId, `🆕 **عقار جديد أضيف!**\n\n${state.title}\n${state.location}\n${state.price.toLocaleString()} ريال`, { parse_mode: 'Markdown' });

    } catch (error) {
      this.bot.sendMessage(chatId, `❌ خطأ في الحفظ: ${error.message}`);
    }
  }

  async showStatistics(chatId) {
    try {
      const total = await Property.countDocuments({ status: 'active' });
      const agri = await Property.countDocuments({ category: 'agricultural', status: 'active' });
      const res = await Property.countDocuments({ category: 'residential', status: 'active' });
      const resort = await Property.countDocuments({ category: 'resorts', status: 'active' });

      const text = `📊 **الإحصائيات:**\n\n🏡 إجمالي العقارات: ${total}\n🌾 زراعية: ${agri}\n🏠 سكنية: ${res}\n🏖️ استراحات: ${resort}`;
      this.bot.sendMessage(chatId, text, { parse_mode: 'Markdown' });
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

      let text = `📋 **${title}**\n\n`;
      properties.forEach((p, i) => {
        text += `${i+1}. **${p.title}**\n`;
        text += `   📍 ${p.location}\n`;
        text += `   💰 ${p.price.toLocaleString()} ر.س\n`;
        text += `   📐 ${p.area}\n\n`;
      });

      this.bot.sendMessage(chatId, text, { parse_mode: 'Markdown' });
    } catch (error) {
      this.bot.sendMessage(chatId, 'خطأ: ' + error.message);
    }
  }
}

module.exports = SmartBot;
