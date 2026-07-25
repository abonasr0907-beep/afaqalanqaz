const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const Parser = require('rss-parser');
const cron = require('node-cron');

// ===== إعدادات البوت =====
const BOT_TOKEN = '8968555626:AAFPVptuaQ_o6j-eJSEfsm-A7kQBWG22mtc';
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

const parser = new Parser();
const dataPath = path.join(__dirname, 'public', 'data.json');

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

  // قراءة وتحديث data.json
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

// أمر /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const welcomeMessage = `
مرحباً بك في بوت آفاق الإنجاز العقاري! 🏡

يمكنك استخدام الأزرار التالية:
-  عرض الأراضي الزراعية
- 🏠 عرض الأراضي السكنية
- 🏖️ عرض الاستراحات
- 📰 آخر الأخبار
- ➕ إضافة عقار جديد
- 📞 تواصل معنا

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

// معالجة الأزرار (Callback Queries)
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
      bot.sendMessage(chatId, '📞 للتواصل معنا:\n\nواتساب: 0545888931\nتيليجرام: @afaqalanqaz\n\nأو استخدم زر "تواصل مباشر" في الموقع');
      break;
    default:
      bot.answerCallbackQuery(callbackQuery.id, { text: 'خيار غير معروف' });
  }
});

// ===== دالة عرض العقارات =====
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
      message += `    📍 ${prop.location}\n`;
      message += `   💰 ${prop.price.toLocaleString()} ر.س\n`;
      message += `   📐 ${prop.area}\n\n`;
    });

    bot.sendMessage(chatId, message);
  } catch (error) {
    bot.sendMessage(chatId, 'حدث خطأ في جلب البيانات');
  }
}

// ===== دالة عرض الأخبار =====
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
      message += `    📰 ${article.source}\n\n`;
    });

    bot.sendMessage(chatId, message);
  } catch (error) {
    bot.sendMessage(chatId, 'حدث خطأ في جلب الأخبار');
  }
}

// ===== معالجة إضافة عقار جديد =====
bot.on('message', (msg) => {
  if (msg.text && msg.text.startsWith('/')) return;

  const chatId = msg.chat.id;
  const text = msg.text;

  if (text.includes('نوع العقار') || text.includes('الموقع') || text.includes('السعر')) {
    bot.sendMessage(chatId, 'جاري معالجة بيانات العقار... سيتم التواصل معك قريباً');
  }
});

// ===== تشغيل البوت =====
console.log('البوت يعمل الآن...');
fetchRealEstateNews();

bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});
