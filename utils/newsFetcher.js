const Parser = require('rss-parser');
const fs = require('fs').promises;
const path = require('path');

class NewsFetcher {
  constructor() {
    this.parser = new Parser();
    this.newsPath = path.join(__dirname, '../data/news.json');
    this.sources = [
      { 
        name: 'أرقام - العقار', 
        url: 'https://www.argaam.com/ar/article/rssfeed/categoryid/289', 
        category: 'سوق عقاري' 
      },
      { 
        name: 'أرقام - الأسهم', 
        url: 'https://www.argaam.com/ar/article/rssfeed/categoryid/1', 
        category: 'سوق الأسهم' 
      },
      { 
        name: 'الرياض - الاقتصاد', 
        url: 'https://www.alriyadh.com/rss/economics.xml', 
        category: 'اقتصاد' 
      },
      { 
        name: 'مباشر - عقارات', 
        url: 'https://www.mubasher.info/rss/real-estate', 
        category: 'سوق عقاري' 
      }
    ];
  }

  async fetchLatestNews() {
    const allArticles = [];

    for (const source of this.sources) {
      try {
        const feed = await this.parser.parseURL(source.url);
        
        const articles = feed.items.slice(0, 3).map(item => ({
          id: Date.now() + Math.random() * 1000,
          title: item.title || 'بدون عنوان',
          summary: (item.contentSnippet || item.description || '').substring(0, 150) + '...',
          date: new Date(item.pubDate || Date.now()).toISOString().split('T')[0],
          source: source.name,
          link: item.link || '#',
          category: source.category,
          fetchedAt: new Date().toISOString()
        }));

        allArticles.push(...articles);
        console.log(`✅ تم جلب ${articles.length} خبر من ${source.name}`);
      } catch (error) {
        console.error(` خطأ في جلب الأخبار من ${source.name}:`, error.message);
      }
    }

    return allArticles;
  }

  async fetchAndSaveNews() {
    try {
      const newArticles = await this.fetchLatestNews();
      
      let existingNews = [];
      try {
        const data = await fs.readFile(this.newsPath, 'utf8');
        existingNews = JSON.parse(data);
      } catch (error) {
        existingNews = [];
      }

      // دمج الأخبار الجديدة مع القديمة
      const allNews = [...newArticles, ...existingNews];
      
      // إزالة التكرار بناءً على العنوان
      const uniqueNews = allNews.filter((article, index, self) => 
        index === self.findIndex(a => a.title === article.title)
      );

      // الاحتفاظ بآخر 30 خبر فقط
      const limitedNews = uniqueNews.slice(0, 30);

      await fs.writeFile(this.newsPath, JSON.stringify(limitedNews, null, 2), 'utf8');
      console.log(`✅ تم حفظ ${limitedNews.length} خبر في news.json`);

      return limitedNews;
    } catch (error) {
      console.error(' خطأ في حفظ الأخبار:', error);
      throw error;
    }
  }

  async getLatestArticles(limit = 10) {
    try {
      const data = await fs.readFile(this.newsPath, 'utf8');
      const news = JSON.parse(data);
      return news.slice(0, limit);
    } catch (error) {
      console.error('❌ خطأ في قراءة الأخبار:', error);
      return [];
    }
  }
}

module.exports = NewsFetcher;
