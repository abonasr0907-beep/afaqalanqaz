const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const fs = require('fs');
const path = require('path');
const Parser = require('rss-parser');
const cron = require('node-cron');

// ===== إعدادات البوت =====
const BOT_TOKEN = '8968555626:AAFPVptuaQ_o6j-eJSEfsm-A7kQBWG22mtc';
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

const app = express();
const PORT = process.env.PORT || 3000;

const parser = new Parser();
const dataPath = path.join(__dirname, 'public', 'data.json');

// ===== إنشاء مجلد public وملف data.json إذا لم يكونا موجودين =====
if (!fs.existsSync(path.join(__dirname, 'public'))) {
  fs.mkdirSync(path.join(__dirname, 'public'));
}

if (!fs.existsSync(dataPath)) {
  const initialData = {
    properties: [
      {
        id: 1,
        title: "أرض زراعية بمخطط الرحمانية",
        location: "الخرج - مخطط الرحمانية",
        price: 750000,
        area: "2,500 م²",
        features: ["صك كامل", "كهرباء", "ماء", "سفلتة"],
        category: "agricultural",
        lat: 24.1547,
        lng: 47.3111,
        image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80",
        whatsappLink: "https://wa.me/966545888931?text=أهتم%20بأرض%20مخطط%20الرحمانية"
      },
      {
        id: 2,
        title: "مزرعة نخيل مثمرة في الهياثم",
        location: "الخرج - الهياثم",
        price: 1350000,
        area: "10,000 م²",
        features: ["نخيل مثمر", "بئر ارتوازي", "صك", "سور"],
        category: "agricultural",
        lat: 24.2100,
        lng: 47.2800,
        image: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&q=80",
        whatsappLink: "https://wa.me/966545888931?text=أهتم%20بمزرعة%20الهياثم"
      },
      {
        id: 3,
        title: "أرض زراعية على طريق الدلم الرئيسي",
        location: "الخرج - الدلم",
        price: 480000,
        area: "5,000 م²",
        features: ["صك", "طريق معبد", "كهرباء قريبة"],
        category: "agricultural",
        lat: 24.0500,
        lng: 46.9800,
        image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&q=80",
        whatsappLink: "https://wa.me/966545888931?text=أهتم%20بأرض%20الدلم%20الزراعية"
      },
      {
        id: 4,
        title: "قطعة زراعية مميزة بالعرجاء",
        location: "الخرج - العرجاء",
        price: 620000,
        area: "3,200 م²",
        features: ["صك إلكتروني", "ماء", "أرض مستوية"],
        category: "agricultural",
        lat: 24.1200,
        lng: 47.2500,
        image: "https://images.unsplash.com/photo-1595841055756-5f54e1f6e284?w=800&q=80",
        whatsappLink: "https://wa.me/966545888931?text=أهتم%20بأرض%20العرجاء%20الزراعية"
      },
      {
        id: 5,
        title: "أرض سكنية جاهزة للبناء - الرحمانية",
        location: "الخرج - مخطط الرحمانية",
        price: 320000,
        area: "625 م²",
        features: ["مخططة", "خدمات كاملة", "صك", "شارع 20م"],
        category: "residential",
        lat: 24.1560,
        lng: 47.3120,
        image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80",
        whatsappLink: "https://wa.me/966545888931?text=أهتم%20بأرض%20سكنية%20الرحمانية"
      },
      {
        id: 6,
        title: "أرض سكنية زاوية في الدلم",
        location: "الخرج - الدلم",
        price: 280000,
        area: "500 م²",
        features: ["زاوية", "مخططة", "صك"],
        category: "residential",
        lat: 24.0520,
        lng: 46.9850,
        image: "https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=800&q=80",
        whatsappLink: "https://wa.me/966545888931?text=أهتم%20بأرض%20سكنية%20الدلم"
      },
      {
        id: 7,
        title: "أرض سكنية تجارية على شارع رئيسي",
        location: "الرياض - جنوب الرياض",
        price: 1800000,
        area: "900 م²",
        features: ["تجارية", "شارع رئيسي", "صك", "كهرباء"],
        category: "residential",
        lat: 24.6300,
        lng: 46.7200,
        image: "https://images.unsplash.com/photo-1582407947092-50b8a1bfbe5a?w=800&q=80",
        whatsappLink: "https://wa.me/966545888931?text=أهتم%20بأرض%20تجارية%20الرياض"
      },
      {
        id: 8,
        title: "قطعة سكنية في حي النسيم - الخرج",
        location: "الخرج - حي النسيم",
        price: 195000,
        area: "400 م²",
        features: ["مخططة", "صك", "قريبة من الخدمات"],
        category: "residential",
        lat: 24.1400,
        lng: 47.3050,
        image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80",
        whatsappLink: "https://wa.me/966545888931?text=أهتم%20بأرض%20حي%20النسيم"
      },
      {
        id: 9,
        title: "استراحة فاخرة مع مسبح - الهياثم",
        location: "الخرج - الهياثم",
        price: 1200000,
        area: "4,000 م²",
        features: ["مسبح", "جلسات خارجية", "مجلس نساء", "صك"],
        category: "resorts",
        lat: 24.2080,
        lng: 47.2810,
        image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80",
        whatsappLink: "https://wa.me/966545888931?text=أهتم%20باستراحة%20الهياثم"
      },
      {
        id: 10,
        title: "شاليه عائلي في مخطط الرحمانية",
        location: "الخرج - مخطط الرحمانية",
        price: 850000,
        area: "3,000 م²",
        features: ["مسبح", "ملعب", "مطبخ خارجي", "صك"],
        category: "resorts",
        lat: 24.1555,
        lng: 47.3130,
        image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
        whatsappLink: "https://wa.me/966545888931?text=أهتم%20بشاليه%20الرحمانية"
      },
      {
        id: 11,
        title: "استراحة استثمارية في الدلم",
        location: "الخرج - الدلم",
        price: 680000,
        area: "2,800 م²",
        features: ["غرفتين", "مسطحات خضراء", "صك", "بئر"],
        category: "resorts",
        lat: 24.0480,
        lng: 46.9750,
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
        whatsappLink: "https://wa.me/966545888931?text=أهتم%20باستراحة%20الدلم"
      },
      {
        id: 12,
        title: "استراحة فاخرة بإطلالة مفتوحة",
        location: "الخرج - العرجاء",
        price: 950000,
        area: "3,500 م²",
        features: ["مسبح", "إطلالة", "جلسات", "صك كامل"],
        category: "resorts",
        lat: 24.1210,
        lng: 47.2510,
        image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80",
        whatsappLink: "https://wa.me/966545888931?text=أهتم%20باستراحة%20العرجاء"
      }
    ],
    articles: [
      {
        id: 1,
        title: "قطاع العقار يتصدر مكاسب تداولات اليوم",
        summary: "أغلق المؤشر العام للسوق السعودي على ارتفاع، بقيادة أسهم القطاع العقاري والبنوك.",
        date: "2026-07-24",
        source: "أرقام",
        link: "https://www.argaam.com",
        category: "سوق الأسهم"
      },
      {
        id: 2,
        title: "نمو الطلب على الأراضي الزراعية في الخرج بنسبة 15%",
        summary: "كشفت تقارير الهيئة العامة للعقار عن زيادة ملحوظة في طلبات الإفراغ.",
        date: "2026-07-22",
        source: "العقارية",
        link: "https://realestate.gov.sa",
        category: "سوق عقاري"
      }
    ]
  };
  fs.writeFileSync(dataPath, JSON.stringify(initialData, null, 2), 'utf8');
  console.log('تم إنشاء data.json بالبيانات الافتراضية');
}

// ===== خدمة الملفات الثابتة (HTML, CSS, JS) =====
app.use(express.static('public'));

// ===== API لجلب البيانات =====
app.get('/api/data', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في قراءة البيانات' });
  }
});

// ===== API لإضافة عقار جديد =====
app.post('/api/add-property', express.json(), (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const newProperty = req.body;
    newProperty.id = Date.now();
    data.properties.push(newProperty);
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
    res.json({ success: true, message: 'تم إضافة العقار بنجاح' });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في إضافة العقار' });
  }
});

// ===== مصادر الأخبار =====
const sources = [
  { name: 'أرقام - العقار', url: 'https://www.argaam.com/ar/article/rssfeed/categoryid/289', category: 'سوق عقاري' },
  { name: 'أرقام - الأسهم', url: 'https://www.argaam.com/ar/article/rssfeed/categoryid/1', category: 'سوق الأسهم' },
  { name: 'الرياض - الاقتصاد', url: 'https://www.alriyadh.com/rss/economics.xml', category: 'سوق عقاري' }
];

// ===== دالة جلب الأخبار =====
async function fetchRealEstateNews() {
  console.log('بدء جلب الأخبار...');
  let newArticles = [];

  for (const source of sources) {
    try {
      const feed = await parser.parseURL(source.url);
      const articles = feed.items.slice(0, 2).map(item => ({
        id: Date.now() + Math.random() * 1000,
        title: item.title,
        summary: item.contentSnippet?.substring(0, 140) + '...',
        date: new Date(item.pubDate).toISOString().split('T')[0],
        source: source.name,
        link: item.link || '#',
        category: source.category
      }));
      newArticles = [...newArticles, ...articles];
    } catch (error) {
      console.error(`خطأ في ${source.name}:`, error.message);
    }
  }

  if (newArticles.length === 0) {
    console.log('لم يتم جلب أي مقالات جديدة');
    return;
  }

  try {
    let currentData = { properties: [], articles: [] };
    if (fs.existsSync(dataPath)) {
      currentData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    }

    const allArticles = [...newArticles, ...(currentData.articles || [])];
    const uniqueArticles = allArticles.filter((article, index, self) => 
      index === self.findIndex(a => a.title === article.title)
    );

    currentData.articles = uniqueArticles.slice(0, 15);
    fs.writeFileSync(dataPath, JSON.stringify(currentData, null, 2), 'utf8');
    console.log('تم تحديث data.json بنجاح!');
  } catch (error) {
    console.error('خطأ في كتابة data.json:', error.message);
  }
}

// ===== جدول التحديث كل 3 أيام =====
cron.schedule('0 0 */3 * *', () => {
  fetchRealEstateNews();
});

// ===== أوامر البوت =====
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const welcomeMessage = `
مرحباً بك في بوت آفاق الإنجاز العقاري! 

اختر الخدمة المطلوبة:
  `;

  const options = {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '🌾 أراضي زراعية', callback_data: 'show_agricultural' },
          { text: '🏠 أراضي سكنية', callback_data: 'show_residential' }
        ],
        [
          { text: '🏖️ استراحات', callback_data: 'show_resorts' },
          { text: '📰 آخر الأخبار', callback_data: 'show_news' }
        ],
        [
          { text: '➕ إضافة عقار', callback_data: 'add_property' },
          { text: '📞 تواصل معنا', callback_data: 'contact_us' }
        ]
      ]
    }
  };

  bot.sendMessage(chatId, welcomeMessage, options);
});

bot.on('callback_query', (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;

  switch (data) {
    case 'show_agricultural':
      showProperties(chatId, 'agricultural', 'الأراضي الزراعية');
      break;
    case 'show_residential':
      showProperties(chatId, 'residential', 'الأراضي السكنية');
      break;
    case 'show_resorts':
      showProperties(chatId, 'resorts', 'الاستراحات والشاليهات');
      break;
    case 'show_news':
      showNews(chatId);
      break;
    case 'add_property':
      bot.sendMessage(chatId, 'لإضافة عقار جديد، يرجى إرسال:\n1️⃣ نوع العقار\n2️⃣ الموقع\n3️ المساحة\n4️⃣ السعر\n5️⃣ الصور');
      break;
    case 'contact_us':
      bot.sendMessage(chatId, '📞 للتواصل معنا:\n\nواتساب: 0545888931\nتيليجرام: @afaqalanqaz');
      break;
    default:
      bot.answerCallbackQuery(callbackQuery.id, { text: 'خيار غير معروف' });
  }
});

function showProperties(chatId, category, title) {
  try {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const properties = data.properties.filter(p => p.category === category);

    if (properties.length === 0) {
      bot.sendMessage(chatId, `لا توجد ${title} متاحة حالياً`);
      return;
    }

    let message = `📊 ${title} المتاحة:\n\n`;
    properties.slice(0, 5).forEach((prop, index) => {
      message += `${index + 1}. ${prop.title}\n`;
      message += `   📍 ${prop.location}\n`;
      message += `   💰 ${prop.price.toLocaleString()} ر.س\n`;
      message += `   📐 ${prop.area}\n\n`;
    });

    bot.sendMessage(chatId, message);
  } catch (error) {
    bot.sendMessage(chatId, 'حدث خطأ في جلب البيانات');
  }
}

function showNews(chatId) {
  try {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const articles = data.articles || [];

    if (articles.length === 0) {
      bot.sendMessage(chatId, 'لا توجد أخبار حالياً');
      return;
    }

    let message = '📰 آخر الأخبار:\n\n';
    articles.slice(0, 5).forEach((article, index) => {
      message += `${index + 1}. ${article.title}\n`;
      message += `   📅 ${article.date}\n`;
      message += `   📰 ${article.source}\n\n`;
    });

    bot.sendMessage(chatId, message);
  } catch (error) {
    bot.sendMessage(chatId, 'حدث خطأ في جلب الأخبار');
  }
}

bot.on('message', (msg) => {
  if (msg.text && msg.text.startsWith('/')) return;
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text.includes('نوع العقار') || text.includes('الموقع') || text.includes('السعر')) {
    bot.sendMessage(chatId, 'جاري معالجة بيانات العقار... سيتم التواصل معك قريباً');
  }
});

// ===== تشغيل الخادم =====
app.listen(PORT, () => {
  console.log(`الخادم يعمل على المنفذ ${PORT}`);
  console.log(`الموقع: http://localhost:${PORT}`);
});

fetchRealEstateNews();

bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});
