const axios = require('axios');

class AIAssistant {
  constructor() {
    this.apiKey = process.env.AI_API_KEY;
    this.baseUrl = process.env.AI_BASE_URL || 'https://openrouter.ai/api/v1';
  }

  async respondToInquiry(message, context = {}) {
    try {
      const response = await axios.post(`${this.baseUrl}/chat/completions`, {
        model: 'openai/gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `أنت مساعد ذكي لمكتب آفاق الإنجاز العقاري.

**معلومات عن المكتب:**
- اسم المكتب: آفاق الإنجاز العقاري
- الخبرة: 20 عاماً في السوق العقاري السعودي
- الترخيص: مرخص من الهيئة العامة للعقار ورخصة فال
- التخصص: أراضي زراعية، سكنية، استراحات
- المواقع: الرياض، الخرج (الهياثم، الرحمانية، الدلم، العرجاء)
- واتساب: 966545888931
- تيليجرام: @afaqalanqaz

**طريقة الرد:**
- تحدث باللهجة السعودية الودية والمهنية
- كن مفيداً ومعلوماتياً
- إذا لم تجد ما يناسب العميل، اطلب رقم جواله للتواصل
- اقترح عقارات بديلة إذا لم يتوفر المطلوب
- استخدم الإيموجي بشكل معتدل`
          },
          {
            role: 'user',
            content: `رسالة العميل: "${message}"

السياق: ${JSON.stringify(context)}

قدم رداً:
1. ودود ومهني باللهجة السعودية
2. مفيد ومعلوماتي
3. إذا لزم الأمر، اطلب المزيد من التفاصيل
4. إذا لم تجد ما يناسب، اقترح بدائل`
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('❌ خطأ في المساعد الذكي:', error.message);
      return 'شكراً لتواصلك! سنتواصل معك قريباً. للاستفسار العاجل: واتساب 966545888931';
    }
  }

  async generatePropertyDescription(property) {
    try {
      const response = await axios.post(`${this.baseUrl}/chat/completions`, {
        model: 'openai/gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'أنت كاتب عقارات محترف. اكتب وصفاً جذاباً واحترافياً للعقار باللغة العربية السعودية.'
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
      console.error('❌ خطأ في توليد الوصف:', error.message);
      return null;
    }
  }

  async improveTitle(title, category) {
    try {
      const response = await axios.post(`${this.baseUrl}/chat/completions`, {
        model: 'openai/gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'أنت خبير تسويق عقاري. حسّن عنوان العقار ليكون جذاباً ومهنياً.'
          },
          {
            role: 'user',
