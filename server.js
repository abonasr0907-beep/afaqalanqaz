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

// ===== Middleware =====
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);

// ===== Health Check =====
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'الخادم يعمل بنجاح',
    timestamp: new Date().toISOString()
  });
});

// ===== Auto-seed function =====
async function autoSeed() {
  try {
    const count = await Property.countDocuments();
    if (count === 0) {
      console.log('📦 قاعدة البيانات فارغة - جاري إضافة 30 عقار...');
      const { properties } = require('./seed-data');
      await Property.insertMany(properties);
      console.log(`✅ تم إضافة ${properties.length} عقار بنجاح`);
    } else {
      console.log(`💾 قاعدة البيانات تحتوي على ${count} عقار`);
    }
  } catch (error) {
    console.error('❌ خطأ في البذر التلقائي:', error.message);
  }
}

// ===== Connect to MongoDB =====
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('✅ تم الاتصال بقاعدة البيانات');
  
  // Auto-seed
  await autoSeed();
  
  // ===== API Routes =====
  
  // Get all properties
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

  // Get single property
  app.get('/api/properties/:id', async (req, res) => {
    try {
      const property = await Property.findById(req.params.id);
      if (!property) {
        return res.status(404).json({ success: false, error: 'العقار غير موجود' });
      }
      property.views = (property.views || 0) + 1;
      await property.save();
      res.json({ success: true, data: property });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Create property
  app.post('/api/properties', async (req, res) => {
    try {
      const property = new Property(req.body);
      await property.save();
      res.status(201).json({ success: true, data: property });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  });

  // Update property
  app.put('/api/properties/:id', async (req, res) => {
    try {
      const property = await Property.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      if (!property) {
        return res.status(404).json({ success: false, error: 'العقار غير موجود' });
      }
      res.json({ success: true, data: property });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  });

  // Delete property
  app.delete('/api/properties/:id', async (req, res) => {
    try {
      const property = await Property.findByIdAndDelete(req.params.id);
      if (!property) {
        return res.status(404).json({ success: fal
