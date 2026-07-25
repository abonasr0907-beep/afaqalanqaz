const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class ImageProcessor {
  constructor() {
    this.uploadDir = path.join(__dirname, '../public/uploads');
    this.optimizedDir = path.join(__dirname, '../public/uploads/optimized');
    this.aiEnhancedDir = path.join(__dirname, '../public/uploads/ai-enhanced');
    this.thumbnailsDir = path.join(__dirname, '../public/uploads/thumbnails');
    
    this.ensureDirectories();
  }

  async ensureDirectories() {
    await fs.mkdir(this.uploadDir, { recursive: true });
    await fs.mkdir(this.optimizedDir, { recursive: true });
    await fs.mkdir(this.aiEnhancedDir, { recursive: true });
    await fs.mkdir(this.thumbnailsDir, { recursive: true });
  }

  async processImage(fileBuffer, originalName, options = {}) {
    const fileName = `${uuidv4()}_${Date.now()}`;
    const ext = path.extname(originalName) || '.jpg';
    
    const paths = {
      original: path.join(this.uploadDir, `${fileName}_original${ext}`),
      optimized: path.join(this.optimizedDir, `${fileName}_optimized.jpg`),
      thumbnail: path.join(this.thumbnailsDir, `${fileName}_thumb.jpg`),
      large: path.join(this.optimizedDir, `${fileName}_large.jpg`)
    };

    try {
      // حفظ الصورة الأصلية
      await fs.writeFile(paths.original, fileBuffer);

      // تحسين الصورة
      const image = sharp(fileBuffer);
      const metadata = await image.metadata();

      // إنشاء نسخة محسنة
      await image
        .rotate()
        .resize(1920, 1080, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .flatten({ background: { r: 255, g: 255, b: 255 } })
        .jpeg({
          quality: options.quality || 85,
          progressive: true,
          mozjpeg: true
        })
        .toFile(paths.optimized);

      // إنشاء صورة مصغرة
      await sharp(fileBuffer)
        .resize(400, 300, { fit: 'cover' })
        .jpeg({ quality: 75 })
        .toFile(paths.thumbnail);

      // إنشاء نسخة كبيرة
      await sharp(fileBuffer)
        .resize(1200, 800, { fit: 'inside' })
        .jpeg({ quality: 90 })
        .toFile(paths.large);

      // الحصول على المعلومات
      const stats = await fs.stat(paths.optimized);

      return {
        success: true,
        paths: paths,
        metadata: {
          width: metadata.width,
          height: metadata.height,
          size: stats.size,
          sizeKB: (stats.size / 1024).toFixed(2),
          format: metadata.format
        }
      };

    } catch (error) {
      console.error('خطأ في معالجة الصورة:', error);
      return { success: false, error: error.message };
    }
  }

  async enhanceWithAI(imagePath, propertyType) {
    try {
      const fileName = path.basename(imagePath, path.extname(imagePath));
      const outputPath = path.join(this.aiEnhancedDir, `${fileName}_ai.jpg`);

      const enhancements = {
        agricultural: { saturation: 1.2, brightness: 1.05 },
        residential: { saturation: 1.0, brightness: 1.1 },
        resorts: { saturation: 1.15, brightness: 1.08 }
      };

      const settings = enhancements[propertyType] || enhancements.residential;

      await sharp(imagePath)
        .modulate({
          brightness: settings.brightness,
          saturation: settings.saturation
        })
        .sharpen()
        .jpeg({ quality: 90, progressive: true })
        .toFile(outputPath);

      return outputPath;
    } catch (error) {
      console.error('خطأ في التحسين بالAI:', error);
      return imagePath;
    }
  }
}

module.exports = new ImageProcessor();
