require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

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

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ تم الاتصال بقاعدة البيانات');
  
  // Import Property model after connection
  const Property = require('./models/Property');
  
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

  // Start server AFTER routes are defined
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 الخادم يعمل على المنفذ ${PORT}`);
    console.log(`🌐 الموقع: http://localhost:${PORT}`);
    
    // Start bot in background
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

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
});
