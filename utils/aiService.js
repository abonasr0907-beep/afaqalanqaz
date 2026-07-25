const axios = require('axios');

class AIService {
  constructor() {
    this.apiKey = process.env.AI_API_KEY;
    this.baseUrl = process.env.AI_BASE_URL || 'https://openrouter.ai/api/v1';
  }

  // تحليل الصورة
  async analyzeImage(imagePath, description = '') {
    try {
      const response = await axios.post(`${this.baseUrl}/chat/completions`, {
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'system',
            content: 'أنت خبير عقارات سعودي. حلل صورة العقار وقدم وصفاً احترافياً.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `حلل هذه الصورة العقارية وقدم: 1) وصف احترافي 2) المميزات الظاهرة 3) الحالة العامة 4) اقتراحات للتحسين. الوصف الحالي: ${description}`
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imagePath}`
                }
              }
            ]
          }
        ],
        max_tokens: 500
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('خطأ في تحليل الصورة:', error.message);
      return null;
    }
  }

  // توليد وصف عقار
  async generatePropertyDescription(property) {
    try {
      const response = await axios.post(`${this.baseUrl}/chat/completions`, {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'أنت كاتب عقارات محترف. اكتب وصفاً جذاباً واحترافياً للعقار باللغة العربية.'
          },
          {
            role: 'user',
            content: `اكتب وصفاً احترافياً وجذاباً لهذا العقار:
- العنوان: ${property.title}
- الموقع: ${property.location}
- المساحة: ${property.area}
- السعر: ${property.price.toLocaleString()} ريال
- المميزات: ${property.features.join('، ')}
- النوع: ${property.category}

الوصف يجب أن يكون:
1. جذاب ومشوق
2. يبرز المميزات
3. مناسب للسوق السعودي
4. طول 100-150 كلمة`
          }
        ],
        max_tokens: 300
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('خطأ في توليد الوصف:', error.message);
      return null;
    }
  }

  // تحسين عنوان العقار
  async improveTitle(title, category) {
    try {
      const response = await axios.post(`${this.baseUrl}/chat/completions`, {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'أنت خبير تسويق عقاري. حسّن عنوان العقار ليكون جذاباً ومهنياً.'
          },
          {
            role: 'user',
            content: `حسّن هذا العنوان العقاري: "${title}"
النوع: ${category}
اجعله:
1. واضح ومباشر
2. يبرز الميزة الرئيسية
3. مناسب للسوق السعودي
4. طول 60-80 حرف`
          }
        ],
        max_tokens: 100
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('خطأ في تحسين العنوان:', error.message);
      return title;
    }
  }

  // الرد على استفسارات العملاء
  async respondToInquiry(message, context = {}) {
    try {
      const response = awai
