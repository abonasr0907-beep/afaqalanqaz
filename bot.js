const fs = require('fs');
const Parser = require('rss-parser');
const parser = new Parser();
const cron = require('node-cron');
const path = require('path');

// قائمة بمصادر الأخبار العقارية والسوق المالية السعودية (روابط RSS)
const SOURCES = [
    {
        name: "أرقام - عقار",
        url: "https://www.argaam.com/ar/article/rssfeed/categoryid/289", // تغطية سوق العقار
        category: "أخبار العقار"
    },
    {
        name: "أرقام - السوق المالية",
        url: "https://www.argaam.com/ar/article/rssfeed/categoryid/1", // سوق الأسهم والشركات العقارية
        category: "الأسهم العقارية"
    },
    {
        name: "جريدة الرياض - الاقتصاد والعقار",
        url: "https://www.alriyadh.com/rss/economics.xml",
        category: "اقتصاد وعقار"
    }
];

// مسار ملف البيانات (تأكد من تعديل المسار إن كان مختلفاً في مشروعك)
const DATA_FILE_PATH = path.join(__dirname, 'data.json');

async function fetchRealEstateNews() {
    console.log("بدء جلب الأخبار العقارية والسوقية...");
    let fetchedArticles = [];

    for (const source of SOURCES) {
        try {
            const feed = await parser.parseURL(source.url);
            
            // جلب أحدث مقالين من كل مصدر
            const articles = feed.items.slice(0, 2).map((item, index) => ({
                id: Date.now() + index + Math.floor(Math.random() * 1000),
                title: item.title ? item.title.trim() : "بدون عنوان",
                summary: item.contentSnippet ? item.contentSnippet.substring(0, 140) + '...' : "اضغط على الرابط لقراءة التفاصيل...",
                date: item.pubDate ? new Date(item.pubDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                source: source.name,
                link: item.link || "#",
                category: source.category
            }));

            fetchedArticles = [...fetchedArticles, ...articles];
        } catch (error) {
            console.error(`خطأ أثناء سحب الأخبار من ${source.name}:`, error.message);
        }
    }

    if (fetchedArticles.length === 0) {
        console.log("لم يتم جلب أي مقالات جديدة.");
        return;
    }

    // قراءة وتحديث ملف data.json
    try {
        let currentData = { properties: [], articles: [] };

        if (fs.existsSync(DATA_FILE_PATH)) {
            const rawData = fs.readFileSync(DATA_FILE_PATH, 'utf8');
            currentData = JSON.parse(rawData);
        }

        // دمج المقالات الجديدة وإزالة التكرار بناءً على العنوان أو الرابط
        const combined = [...fetchedArticles, ...(currentData.articles || [])];
        const uniqueArticles = Array.from(new Map(combined.map(item => [item.title, item])).values());

        // الاحتفاظ بأحدث 15 مقالاً فقط
        currentData.articles = uniqueArticles.slice(0, 15);

        // إعادة حفظ الملف
        fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(currentData, null, 2), 'utf8');
        console.log("تم تحديث ملف data.json بنجاح وبأحدث الأخبار العقارية!");

    } catch (err) {
        console.error("خطأ أثناء قراءة/كتابة ملف data.json:", err.message);
    }
}

// 1. جدولة المهمة لتعمل تلقائياً كل 3 أيام (الساعة 00:00)
cron.schedule('0 0 */3 * *', () => {
    fetchRealEstateNews();
});

// 2. تشغيل الميزة مرة واحدة مباشرة عند بدء تشغيل البوت/السيرفر للتأكد من وجود بيانات
fetchRealEstateNews();
