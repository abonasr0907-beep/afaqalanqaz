require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const Property = require('./models/Property');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(compression());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'الخادم يعمل بنجاح',
    timestamp: new Date().toISOString()
  });
});

// بيانات العقارات الأولية (30 عقار)
const seedProperties = [
  // أراضي زراعية (10)
  {
    title: "أرض زراعية 5000م مع نخيل مثمر - الهياثم",
    description: "أرض زراعية خصبة مع نخيل مثمر، بئر ارتوازي، موقع ممتاز",
    category: "agricultural",
    location: "الخرج - الهياثم",
    price: 850000,
    area: "5,000 م²",
    features: ["صك إلكتروني", "نخيل مثمر", "بئر ارتوازي", "كهرباء", "طريق معبد"],
    coordinates: { lat: 24.2100, lng: 47.2800 },
    whatsappLink: "https://wa.me/966545888931?text=أهتم%20بأرض%20الهياثم%205000م",
    status: "active",
    isFeatured: true
  },
  {
    title: "مزرعة 10000م كاملة الخدمات - الرحمانية",
    description: "مزرعة واسعة كاملة الخدمات، صك جاهز",
    category: "agricultural",
    location: "الخرج - مخطط الرحمانية",
    price: 1350000,
    area: "10,000 م²",
    features: ["صك", "ماء", "كهرباء", "طريق معبد", "مستودع"],
    coordinates: { lat: 24.1547, lng: 47.3111 },
    whatsappLink: "https://wa.me/966545888931?text=أهتم%20بمزرعة%20الرحمانية",
    status: "active"
  },
  {
    title: "أرض زراعية 3000م على طريق الدلم",
    description: "أرض زراعية بموقع استراتيجي على الطريق الرئيسي",
    category: "agricultural",
    location: "الخرج - الدلم",
    price: 620000,
    area: "3,000 م²",
    features: ["صك", "طريق رئيسي", "كهرباء قريبة"],
    coordinates: { lat: 24.0500, lng: 46.9800 },
    whatsappLink: "https://wa.me/966545888931?text=أهتم%20بأرض%20الدلم",
    status: "active"
  },
  {
    title: "قطعة زراعية 7000م مع بئر - العرجاء",
    description: "قطعة زراعية مميزة مع بئر ماء، تربة خصبة",
    category: "agricultural",
    location: "الخرج - العرجاء",
    price: 980000,
    area: "7,000 م²",
    features: ["صك إلكتروني", "بئر ماء", "تربة خصبة", "سور"],
    coordinates: { lat: 24.1200, lng: 47.2500 },
    whatsappLink: "https://wa.me/966545888931?text=أهتم%20بأرض%20العرجاء",
    status: "active"
  },
  {
    title: "مزرعة نخيل 15000م - الهياثم",
    description: "مزرعة نخيل كبيرة مع 200 نخلة مثمرة",
    category: "agricultural",
    location: "الخرج - الهياثم",
    price: 2100000,
    area: "15,000 م²",
    features: ["200 نخلة مثمرة", "بئر ارتوازي", "مبنى زراعي", "صك"],
    coordinates: { lat: 24.2150, lng: 47.2850 },
    whatsappLink: "https://wa.me/966545888931?text=أهتم%20بمزرعة%20النخيل",
    status: "active",
    isFeatured: true
  },
  {
    title: "أرض زراعية 4000م قريبة من الخدمات",
    description: "أرض زراعية بموقع ممتاز قريب من الخدمات",
    category: "agricultural",
    location: "الخرج - الرحمانية",
    price: 720000,
    area: "4,000 م²",
    features: ["صك", "قريبة من الخدمات", "ماء", "كهرباء"],
    coordinates: { lat: 24.1560, lng: 47.3120 },
    whatsappLink: "https://wa.me/966545888931?text=أهتم%20بأرض%20الرحمانية%204000م",
    status: "active"
  },
  {
    title: "مزرعة صغيرة 2000م للمبتدئين",
    description: "مزرعة صغيرة مثالية للمبتدئين في الزراعة",
    category: "agricultural",
    location: "الخرج - الدلم",
    price: 450000,
    area: "2,000 م²",
    features: ["صك", "ماء", "كهرباء", "سور خفيف"],
    coordinates: { lat: 24.0520, lng: 46.9850 },
    whatsappLink: "https://wa.me/966545888931?text=أهتم%20بالمزرعة%20الصغيرة",
    status: "active"
  },
  {
    title: "أرض زراعية 8000م بإطلالة مميزة",
    description: "أرض زراعية واسعة بإطلالة مفتوحة",
    category: "agricultural",
    location: "الخرج - العرجاء",
    price: 1150000,
    area: "8,000 م²",
    features: ["صك", "إطلالة مفتوحة", "بئر", "طريق معبد"],
    coordinates: { lat: 24.1220, lng: 47.2520 },
    whatsappLink: "https://wa.me/966545888931?text=أهتم%20بأرض%20العرجاء%208000م",
    status: "active"
  },
  {
    title: "مزرعة متكاملة 12000م مع معدات",
    description: "مزرعة متكاملة مع جميع المعدات الزراعية",
    category: "agricultural",
    location: "الخرج - الهياثم",
    price: 1850000,
    area: "12,000 م²",
    features: ["معدات زراعية", "بئر", "مستودع", "صك"],
    coordinates: { lat: 24.2120, lng: 47.2820 },
    whatsappLink: "https://wa.me/966545888931?text=أهتم%20بالمزرعة%20المتكاملة",
    status: "active"
  },
  {
    title: "أرض زراعية 6000م بسعر مميز",
    description: "أرض زراعية بسعر تنافسي، موقع ممتاز",
    category: "agricultural",
    location: "الخرج - الرحمانية",
    price: 890000,
    area: "6,000 م²",
    features: ["صك", "موقع ممتاز", "ماء", "كهرباء"],
    coordinates: { lat: 24.1570, lng: 47.3130 },
    whatsappLink: "https://wa.me/966545888931?text=أهتم%20بأرض%20الرحمانية%206000م",
    status: "active"
  },

  // أراضي سكنية (10)
  {
    title: "أرض سكنية 625م جاهزة للبناء - الرحمانية",
    description: "أرض سكنية مخططة جاهزة للبناء الفوري",
    category: "residential",
    location: "الخرج - مخطط الرحمانية",
    price: 320000,
    area: "625 م²",
    features: ["مخططة", "خدمات كاملة", "صك", "شارع 20م"],
    coordinates: { lat: 24.1560, lng: 47.3120 },
    whatsappLink: "https://wa.me/966545888931?text=أهتم%20بأرض%20سكنية%20الرحمانية",
    status: "active"
  },
  {
    title: "أرض سكنية زاوية 500م - الدلم",
    description: "أرض سكنية زاوية مميزة، موقع استراتيجي",
    category: "residential",
    location: "الخرج - الدلم",
    price: 280000,
    area: "500 م²",
    features: ["زاوية", "مخططة", "صك", "موقع مميز"],
    coordinates: { lat: 24.0520, lng: 46.9850 },
    whatsappLink: "https://wa.me/966545888931?text=أهتم%20بأرض%20سكنية%20الدلم",
    status: "active"
  },
  {
    title: "أرض تجارية 900م على شارع رئيسي - الرياض",
    description: "أرض تجارية بموقع ممتاز على شارع رئيسي",
    category: "residential",
    location: "الرياض - جنوب الرياض",
    price: 1800000,
    area: "900 م²",
    features: ["تجارية", "شارع رئيسي", "صك", "كهرباء"],
    coordinates: { lat: 24.6300, lng: 46.7200 },
    whatsappLink: "https://wa.me/966545888931?text=أهتم%20بأرض%20تجارية%20الرياض",
    status: "active",
    isFeatured: true
  },
  {
    title: "قطعة سكنية 400م في حي النسيم",
    description: "قطعة سكنية في حي راقي، قريبة من الخدمات",
    category: "residential",
    location: "الخرج - حي النسيم",
    price: 195000,
    area: "400 م²",
    features: ["مخططة", "صك", "قريبة من الخدمات"],
    coordinates: { lat: 24.1400, lng: 47.3050 },
    whatsappLink: "https://wa.me/966545888931?text=أهتم%20بأرض%20حي%20النسيم",
    status: "active"
  },
  {
    title: "أرض سكنية 750م بمخطط جديد",
    description: "أرض سكنية في مخطط جديد، أسعار تنافسية",
    category: "residential",
    location: "الخرج - الرحمانية",
    price: 380000,
    area: "750 م²",
    features: ["مخطط جديد", "خدمات", "صك", "شوارع واسعة"],
    coordinates: { lat: 24.1580, lng: 47.3140 },
    whatsappLink: "https://wa.me/966545888931?text=أهتم%20بأرض%20المخطط%20الجديد",
    status: "active"
  },
  {
    title: "أرض سكنية 550م قريبة من المدارس",
    description: "أرض سكنية في موقع عائلي",
    category: "residential",
    location: "الخرج - الدلم",
    price: 265000,
    area: "550 م²",
    features: ["موقع عائلي", "قريبة من المدارس", "صك"],
    coordinates: { lat: 24.0530, lng: 46.9860 },
    whatsappLink: "https://wa.me/966545888931?text=أهتم%20بأرض%20الدلم%20550م",
    status: "active"
  },
  {
    title: "أرض سكنية 650م بإطلالة على حديقة",
    description: "أرض سكنية مميزة بإطلالة على حديقة عامة",
    category: "residential",
    location: "الخرج - العرجاء",
    price: 340000,
    area: "650 م²",
    features: ["إطلالة على حديقة", "مخططة", "صك", "هدوء"],
    coordinates: { lat: 24.1230, lng: 47.2530 },
    whatsappLink: "https://wa.me/966545888931?text=أهتم%20بأرض%20العرجاء%20650م",
    status: "active"
  },
  {
    title: "أرض سكنية 800م للبناء الفوري",
    description: "أرض سكنية جاهزة للبناء الفوري",
    category: "residential",
    location: "الخرج - الهياثم",
    price: 420000,
    area: "800 م²",
    features: ["جاهزة للبناء", "تصاريح", "صك", "خدمات"],
    coordinates: { lat: 24.2130, lng: 47.2830 },
    whatsappLink: "https://wa.me/966545888931?text=أهتم%20بأرض%20الهياثم%20800م",
    status: "active"
  },
  {
    title: "أرض سكنية 500م بسعر مغري",
    description: "أرض سكنية بسعر تنافسي",
    category: "residential",
    location: "الخرج - الرحمانية",
    price: 245000,
    area: "500 م²",
    features: ["سعر مغري", "مخططة", "صك"],
    coordinates: { lat: 24.1590, lng: 47.3150 },
    whatsappLink: "https://wa.me/966545888931?text=أهتم%20بأرض%20الرحمانية%20500م",
    status: "active"
  },
  {
    title: "أرض سكنية 700م في موقع راقي",
    description: "أرض سكنية في موقع راقي ومميز",
    category: "residential",
    location: "الخرج - الدلم",
    price: 395000,
    area: "700 م²",
    features: ["موقع راقي", "مخططة", "صك", "خدمات كاملة"],
    coordinates: { lat: 24.0540, lng: 46.9870 },
    whatsappLink: "https://wa.me/966545888931?text=أهتم%20بأرض%20الدلم%20700م",
    status: "active"
  },

  // استراحات (10)
  {
    title: "استراحة فاخرة 4000م مع مسبح - الهياثم",
    description: "استراحة فاخرة مع مسبح كبير، جلسات خارجية",
    category: "resorts",
    location: "الخرج - الهياثم",
    price: 1200000,
    area: "4,000 م²",
    features: ["مسبح", "جلسات خارجية", "مجلس نساء", "صك", "مطبخ"],
    coordinates: { lat: 24.2080, lng: 47.2810 },
    whatsappLink: "https://wa.me/966545888931?text=أهتم%20باستراحة%20الهياثم",
    status: "active",
    isFeatured: true
  },
  {
    title: "شاليه عائلي 3000م في الرحمانية",
    description: "شاليه عائلي مميز مع جميع المرافق",
    category: "resorts",
    location: "الخرج - مخطط الرحمانية",
    price: 850000,
    area: "3,000 م²",
    features: ["مسبح", "ملعب", "مطبخ خارجي", "صك"],
    coordinates: { lat: 24.1555, lng: 47.3130 },
    whatsappLink: "https://wa.me/966545888931?text=أهتم%20بشاليه%20الرحمانية",
    status: "active"
  },
  {
    title: "استراحة استثمارية 2800م - الدلم",
    description: "استراحة استثمارية بموقع ممتاز",
    category: "resorts",
    location: "الخرج - الدلم",
    price: 680000,
    area: "2,800 م²",
    features: ["غرفتين", "مسطحات خضراء", "صك", "بئر"],
    coordinates: { lat: 24.0480, lng: 46.9750 },
    whatsappLink: "https://wa.me/966545888931?text=أهتم%20باستراحة%20الدلم",
    status: "active"
  },
  {
    title: "استراحة فاخرة 3500م بإطلالة مفتوحة",
    description: "استراحة فاخرة بإطلالة مفتوحة، تصميم عصري",
    category: "resorts",
    location: "الخرج - العرجاء",
    price: 950000,
    area: "3,500 م²",
    features: ["مسبح", "إطلالة", "جلسات", "صك كامل"],
    coordinates: { lat: 24.1210, lng: 47.2510 },
    whatsappLink: "https://wa.me/966545888931?text=أهتم%20باستراحة%20العرجاء",
    status: "active"
  },
  {
    title: "شاليه 2500م مع ألعاب أطفال",
    description: "شاليه عائلي مع منطقة ألعاب أطفال",
    category: "resorts",
    location: "الخرج - الهياثم",
    price: 720000,
    area: "2,500 م²",
    features: ["ألعاب أطفال", "مسبح صغير", "مطبخ", "صك"],
    coordinates: { lat: 24.2090, lng: 47.2820 },
    whatsappLink: "https://wa.me/966545888931?text=أهتم%20بشاليه%20الهياثم",
    status: "active"
  },
  {
    title: "استراحة 5000م للمناسبات الكبيرة",
    description: "استراحة واسعة مناسبة للمناسبات والأفراح",
    category: "resorts",
    location: "الخرج - الرحمانية",
    price: 1450000,
    area: "5,000 م²",
    features: ["قاعة كبيرة", "مسبح", "مواقف", "صك"],
    coordinates: { lat: 24.1565, lng: 47.3135 },
    whatsappLink: "https://wa.me/966545888931?text=أهتم%20باستراحة%20المناسبات",
    status: "active",
    isFeatured: true
  },
  {
    title: "شاليه صغير 2000م للعائلات الصغيرة",
    description: "شاليه صغير ومريح",
    category: "resorts",
    location: "الخرج - الدلم",
    price: 520000,
    area: "2,000 م²",
    features: ["غرفة واحدة", "مسبح", "مطبخ", "صك"],
    coordinates: { lat: 24.0490, lng: 46.9760 },
    whatsappLink: "https://wa.me/966545888931?text=أهتم%20بشاليه%20الدلم",
    status: "active"
  },
  {
    title: "استراحة 3200م مع ملعب كرة",
    description: "استراحة مع ملعب كرة قدم",
    category: "resorts",
    location: "الخرج - العرجاء",
    price: 880000,
    area: "3,200 م²",
    features: ["ملعب كرة", "مسبح", "جلسات", "صك"],
    coordinates: { lat: 24.1220, lng: 47.2520 },
    whatsappLink: "https://wa.me/966545888931?text=أهتم%20باستراحة%20الملعب",
    status: "active"
  },
  {
    title: "شاليه 2700م بإطلالة على النخيل",
    description: "شاليه مميز بإطلالة على مزرعة نخيل",
    category: "resorts",
    location: "الخرج - الهياثم",
    price: 790000,
    area: "2,700 م²",
    features: ["إطلالة نخيل", "مسبح", "مطبخ", "صك"],
    coordinates: { lat: 24.2100, lng: 47.2830 },
    whatsappLink: "https://wa.me/966545888931?text=أهتم%20بشاليه%20النخيل",
    status: "active"
  },
  {
    title: "استراحة 3800م بسعر تنافسي",
    description: "استراحة واسعة بسعر تنافسي",
    category: "resorts",
    location: "الخرج - الرحمانية",
    price: 1050000,
    area: "3,800 م²",
    features: ["مسبح", "جلسات", "مطبخ", "صك", "موقع مميز"],
    coordinates: { lat: 24.1575, lng: 47.3145 },
    whatsappLink: "https://wa.me/966545888931?text=أهتم%20باستراحة%20الرحمانية%203800م",
    status: "active"
  }
];

// Auto-seed function
async function autoSeed() {
  try {
    const count = await Property.countDocuments();
    if (count === 0) {
      console.log('📦 قاعدة البيانات فارغة - جاري إضافة 30 عقار...');
      await Property.insertMany(seedProperties);
      console.log('✅ تم إضافة 30 عقار بنجاح');
    } else {
      console.log(`💾 قاعدة البيانات تحتوي على ${count} عقار`);
    }
  } catch (error) {
    console.error('❌ خطأ في البذر التلقائي:', error.message);
  }
}

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('✅ تم الاتصال بقاعدة البيانات');
  
  // Auto-seed
  await autoSeed();
  
  // API Routes
  app.get('/api/properties', async (req, res) => {
    try {
      const { category, status = 'active' } = req.query;
      const filter = { status };
      if (category) filter.category = category;
      
      const properties = await Property.find(filter).sort({ createdAt: -1 });
      res.json({ success: true, data: properties, count: properties.length });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.get('/api/properties/:id', async (req, res) => {
    try {
      const property = await Property.findById(req.params.id);
      if (!property) {
        return res.status(404).json({ success: false, error: 'العقار غير موجود' });
      }
      property.views += 1;
      await property.save();
      res.json({ success: true, data: property });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post('/api/properties', async (req, res) => {
    try {
      const property = new Property(req.body);
      await property.save();
      res.status(201).json({ success: true, data: property });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  });

  app.put('/api/properties/:id', async (req, res) => {
    try {
      const property = await Property.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      if (!property) {
        return res.status(404).json({ success: false, error: 'العقار غير موجود' });
      }
      res.json({ success: true, data: property });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  });

  app.delete('/api/properties/:id', async (req, res) => {
    try {
      const property = await Property.findByIdAndDelete(req.params.id);
      if (!property) {
        return res.status(404).json({ success: false, error: 'العقار غير موجود' });
      }
      res.json({ success: true, message: 'تم الحذف بنجاح' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Serve HTML pages
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });

  app.get('/properties', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'properties.html'));
  });

  app.get('/services', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'services.html'));
  });

  app.get('/news', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'news.html'));
  });

  app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'contact.html'));
  });

  // Start server
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 الخادم يعمل على المنفذ ${PORT}`);
    console.log(`🌐 الموقع: http://localhost:${PORT}`);
    
    // Start bot
    try {
      const SmartBot = require('./bot');
      const bot = new SmartBot();
      console.log('🤖 البوت يعمل الآن...');
    } catch (error) {
      console.error('⚠️ خطأ في تشغيل البوت:', error.message);
    }
  });

})
.catch(err => {
  console.error('❌ خطأ في الاتصال بقاعدة البيانات:', err.message);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
});
