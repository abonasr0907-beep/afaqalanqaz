const fs = require('fs').promises;
const path = require('path');

class SEOGenerator {
  constructor() {
    this.publicDir = path.join(__dirname, 'public');
  }

  async generateSitemap(properties) {
    const baseUrl = process.env.WEBSITE_URL || 'https://afaqalanqaz.onrender.com';
    
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/properties</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/services</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/news</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/contact</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
`;

    properties.forEach(prop => {
      sitemap += `  <url>
    <loc>${baseUrl}/properties/${prop._id}</loc>
    <lastmod>${prop.updatedAt ? new Date(prop.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
    });

    sitemap += `</urlset>`;

    await fs.writeFile(path.join(this.publicDir, 'sitemap.xml'), sitemap, 'utf8');
    console.log('✅ تم إنشاء sitemap.xml');
  }

  async generateRobotsTxt() {
    const robots = `# robots.txt for آفاق الإنجاز العقاري
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/

Sitemap: ${process.env.WEBSITE_URL}/sitemap.xml

# Crawl-delay for better performance
Crawl-delay: 1
`;

    await fs.writeFile(path.join(this.publicDir, 'robots.txt'), robots, 'utf8');
    console.log('✅ تم إنشاء robots.txt');
  }

  async generateSchemaMarkup(properties) {
    const schema = {
      "@context": "https://schema.org",
      "@type": "RealEstateAgent",
      "name": "مكتب آفاق الإنجاز العقاري",
      "description": "مكتب عقاري موثق خبرة 20 عاماً - أراضي زراعية وسكنية واستراحات بالرياض والخرج",
      "url": process.env.WEBSITE_URL,
      "telephone": "+966545888931",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "الرياض",
        "addressRegion": "الرياض",
        "addressCountry": "SA"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 24.1500,
        "longitude": 47.3000
      },
      "openingHoursSpecification": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
        "opens": "09:00",
        "closes": "21:00"
      },
      "priceRange": "$$",
      "areaServed": {
        "@type": "Place",
        "name": "الرياض والخرج"
      }
    };

    await fs.writeFile(
      path.join(this.publicDir, 'schema.json'),
      JSON.stringify(schema, null, 2),
      'utf8'
    );
    console.log('✅ تم إنشاء schema.json');
  }

  async generateAll(properties) {
    await this.generateSitemap(properties);
    await this.generateRobotsTxt();
    await this.generateSchemaMarkup(properties);
    console.log('✅ تم إنشاء جميع ملفات SEO');
  }
}

module.exports = new SEOGenerator();
