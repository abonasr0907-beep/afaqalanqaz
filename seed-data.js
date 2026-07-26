const mongoose = require('mongoose');
const Property = require('./models/Property');

const properties = [
  // أراضي زراعية (10)
  {
    title: "أرض زراعية 5000م مع نخيل مثمر - الهياثم",
    description: "أرض زراعية خصبة مع نخيل مثمر، بئر ارتوازي، موقع ممتاز قريب من الطريق الرئيسي",
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
    description: "مزرعة واسعة كاملة الخدمات، صك جاهز، مناسبة للاستثمار الزراعي",
    category: "agricultural",
    location: "الخرج - مخطط الرحمانية",
    price: 1350000,
    area: "10,000 م²",
    features: ["صك", "ماء", "كهرباء", "طريق معبد", "مستودع"],
    coordinates: { lat: 24.1547, lng: 47.3111 },
    whatsappLink: "https://wa.me/966545888931?text=أهتم%20بمزرعة%20الرحمانية%2010000م",
    status: "active"
  },
  {
    title: "أرض زراعية 3000م على طريق الدلم",
    description: "أرض زراعية بموقع استراتيجي على الطريق الرئيسي، مناسبة للزراعة والاستثمار",
    category: "agricultural",
    location: "الخرج - الدلم",
    price: 620000,
    area: "3,000 م²",
    features: ["صك", "طريق رئيسي", "كهرباء قريبة", "أرض مستوية"],
    coordinates: { lat: 24.0500, lng: 46.9800 },
    whatsappLink: "https://wa.me/966545888931?text=أهتم%20بأرض%20الدلم%203000م",
    status: "active"
  },
  {
    title: "قطعة زراعية 7000م مع بئر - العرجاء",
    description: "قطعة زراعية مميزة مع بئر ماء، تربة خصبة، مناسبة للزراعة الموسمية",
    category: "agricultural",
    location: "الخرج - العرجاء",
    price: 980000,
    area: "7,000 م²",
    features: ["صك إلكتروني", "بئر ماء", "تربة خصبة", "سور"],
    coordinates: { lat: 24.1200, lng: 47.2500 },
    whatsappLink: "https://wa.me/966545888931?text=أهتم%20بأرض%20العرجاء%207000م",
    status: "active"
  },
  {
    title: "مزرعة نخيل 15000م - الهياثم",
    description: "مزرعة نخيل كبيرة مع 200 نخلة مثمرة، بئر ارتوازي، مبنى زراعي",
    category: "agricultural",
    location: "الخرج - الهياثم",
    price: 2100000,
    area: "15,000 م²",
    features: ["200 نخلة مثمرة", "بئر ارتوازي", "مبنى زراعي", "صك", "كهرباء"],
    coordinates: { lat: 24.2150, lng: 47.2850 },
    whatsappLink: "https://wa.me/966545888931?text=أهتم%20بمزرعة%20النخيل%2015000م",
    status: "active",
    isFeatured: true
  },
  {
    title: "أرض زراعية 4000م قريبة من الخدمات",
    description: "أرض زراعية بموقع ممتاز قريب من جميع الخدمات والمرافق",
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
    description: "مزرعة صغيرة مثالية للمبتدئين في الزراعة، كاملة الخدمات",
    category: "agricultural",
    location: "الخرج - �
