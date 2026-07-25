<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>آفاق الإنجاز العقاري | أراضي زراعية وسكنية واستراحات</title>
    <meta name="description" content="مكتب آفاق الإنجاز العقاري - خبرة 20 عاماً في تسويق الأراضي الزراعية والسكنية والاستراحات بالرياض والخرج">
    <meta name="keywords" content="عقارات,أراضي زراعية,استراحات,الخرج,الرياض,آفاق الإنجاز">
    <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <link rel="stylesheet" href="/css/style.css">
</head>
<body>
    <!-- Header -->
    <header class="glass-header sticky top-0 z-40 py-3 shadow-sm">
        <div class="container mx-auto px-4 flex flex-wrap items-center justify-between gap-4">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
                    <i class="fas fa-building"></i>
                </div>
                <div>
                    <h1 class="text-xl font-black text-darkNavy">آفاق الإنجاز العقاري</h1>
                    <span class="text-xs bg-emerald-100 text-primary px-2 py-1 rounded-full">موثق من الهيئة العامة للعقار | رخصة فال</span>
                </div>
            </div>
            <nav class="hidden md:flex items-center gap-6 text-sm font-bold text-slate-600">
                <a href="/" class="hover:text-primary transition">الرئيسية</a>
                <a href="/properties" class="hover:text-primary transition">العقارات</a>
                <a href="/services" class="hover:text-primary transition">خدماتنا</a>
                <a href="/news" class="hover:text-primary transition">أخبار السوق</a>
                <a href="/contact" class="hover:text-primary transition">تواصل معنا</a>
            </nav>
            <div class="flex items-center gap-3">
                <a href="https://t.me/afaqalanqaz" target="_blank" class="bg-sky-500 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-sky-600 transition">
                    <i class="fab fa-telegram-plane"></i> تليجرام
                </a>
                <a href="https://wa.me/966545888931" target="_blank" class="bg-primary text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-primaryDark transition">
                    <i class="fab fa-whatsapp"></i> تواصل
                </a>
            </div>
        </div>
    </header>

    <!-- Hero Section -->
    <section class="hero-bg relative flex items-center justify-center px-4">
        <div class="container mx-auto max-w-5xl pt-10 pb-16 text-center">
            <h2 class="text-3xl md:text-5xl font-black text-white mb-3">وجهتك الموثوقة للاستثمار العقاري</h2>
            <p class="text-slate-200 text-lg mb-8">خبرة 20 عاماً في السوق العقاري السعودي</p>
            <div class="bg-white rounded-2xl shadow-2xl p-4">
                <div class="flex gap-4 mb-4 overflow-x-auto">
                    <button onclick="switchCategory('agricultural')" class="tab-btn active whitespace-nowrap pb-2 text-darkNavy font-bold border-b-2 border-primary" data-cat="agricultural">
                        <i class="fas fa-seedling ml-1"></i> الأراضي الزراعية
                    </button>
                    <button onclick="switchCategory('residential')" class="tab-btn whitespace-nowrap pb-2 text-slate-500 font-bold border-b-2 border-transparent" data-cat="residential">
                        <i class="fas fa-
