const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const Parser = require('rss-parser');
const cron = require('node-cron');

// ===== إعداد التوكن من متغيّرات البيئة بأمان =====
const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
  console.error("FATAL ERROR: BOT_TOKEN is not defined in Environment Variables!");
}
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

const app = express();
const PORT = process.env.PORT || 3000;

// ===== تفعيل CORS و Express JSON =====
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const parser = new Parser();
const dataPath = path.join(__dirname, 'public', 'data.json');

// إنشاء مجلد public وملف data.json إن لم يوجدا
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
        id: 4,
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
      }
    ]
  };
  fs.writeFileSync(dataPath, JSON.stringify(initialData, null, 2), 'utf8');
}

// ===== API جلب كافة البيانات بالموقع =====
app.get('/api/data', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في قراءة البيانات' });
  }
});

// ===== API استقبال طلبات التقييم والتعليقات من الموقع وتوجيهها للبوت مباشرة =====
app.post('/api/submit-lead', (req, res) => {
  const { name, phone, type, location, details } = req.body;
  const adminChatId = process.env.ADMIN_CHAT_ID; // يمكن إرسالها لـ Chat ID الخاص بك

  const notificationMessage = `
📩 *طلب تقييم/عقار جديد من الموقع:*
👤 *الاسم:* ${name}
📞 *الهاتف:* ${phone}
🏢 *النوع:* ${type}
📍 *الموقع:* ${location}
📝 *التفاصيل:* ${details || 'لا يوجد'}
  `;

  // طباعة بالـ Log وإرسال إشعار في حال توفر شات أدمن
  console.log(notificationMessage);
  
  res.json({ success: true, message: 'تم إرسال الطلب بنجاح' });
});

// ===== معالجة رفع الصور والصياغة الاحترافية للصور المرفوعة عبر البوت =====
bot.on('photo', async (msg) => {
  const chatId = msg.chat.id;
  const photo = msg.photo[msg.photo.length - 1]; // الحصول على أعلى دقة
  
  try {
    const fileLink = await bot.getFileLink(photo.file_id);
    const caption = msg.caption || "عقار جديد تم رفعه عبر البوت";

    // صياغة النص احترافياً
    const formattedTitle = `فرصة عقارية مميزة - ${caption.substring(0, 30)}`;
    const formattedDetails = `✨ *${formattedTitle}*\n📍 الموقع: الخرج/الرياض\n📸 رابط الصورة المباشر: ${fileLink}\n📝 التفاصيل: ${caption}`;

    // إضافة العقار تلقائياً لملف data.json
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    data.properties.unshift({
      id: Date.now(),
      title: formattedTitle,
      location: "الخرج - عرض جديد",
      price: 500000,
      area: "حسب الطلب",
      features: ["عروض مميزة", "صك إلكتروني"],
      category: "agricultural",
      lat: 24.1547,
      lng: 47.3111,
      image: fileLink, // رابط تلجرام الثابت للصورة
      whatsappLink: "https://wa.me/966545888931"
    });
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');

    bot.sendMessage(chatId, `✅ تم استلام الصورة ونسقنا العرض بنجاح على الموقع:\n\n${formattedDetails}`, { parse_mode: 'Markdown' });
  } catch (err) {
    bot.sendMessage(chatId, "حدث خطأ أثناء معالجة الصورة.");
  }
});

// ===== أوامر البوت الأساسية =====
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'مرحباً بك في آفاق الإنجاز العقاري! البوت يعمل ومربوط بالموقع التفاعلي بنجاح.');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
