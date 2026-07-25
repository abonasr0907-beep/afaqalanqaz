let currentCategory = 'agricultural';
let allProperties = [];
let unifiedMapInstance = null;

// جلب البيانات من API
async function fetchData() {
    try {
        const response = await fetch(`/api/properties?category=${currentCategory}`);
        const data = await response.json();
        
        if (data.success) {
            allProperties = data.data;
            renderProperties();
        }
    } catch (error) {
        console.error('خطأ في جلب البيانات:', error);
    }
}

// عرض العقارات
function renderProperties(filteredData) {
    const grid = document.getElementById('propertiesGrid');
    const dataToRender = filteredData || allProperties;
    
    grid.innerHTML = '';
    document.getElementById('resultsCount').textContent = dataToRender.length + ' عقار';

    if (dataToRender.length === 0) {
        grid.innerHTML = '<div class="col-span-full text-center py-16 text-slate-500 bg-white rounded-2xl">لا توجد عقارات متاحة حالياً</div>';
        return;
    }

    dataToRender.forEach(prop => {
        const categoryLabel = {
            'agricultural': 'أرض زراعية',
            'residential': 'أرض سكنية',
            'resorts': 'استراحة'
        }[prop.category];

        const card = `
            <div class="bg-white rounded-2xl shadow overflow-hidden border property-card">
                <div class="relative h-56 bg-slate-200">
                    ${prop.images && prop.images.length > 0 ? 
                        `<img src="${prop.images[0]}" alt="${prop.title}" class="w-full h-full object-cover">` :
                        `<div class="w-full h-full flex items-center justify-center text-slate-400"><i class="fas fa-image text-4xl"></i></div>`
                    }
                    <span class="absolute top-4 right-4 bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-full">
                        ${categoryLabel}
                    </span>
                    ${prop.isFeatured ? '<span class="absolute top-4 left-4 bg-yellow-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">مميز</span>' : ''}
                </div>
                <div class="p-6">
                    <h4 class="text-xl font-black mb-2">${prop.title}</h4>
                    <p class="text-slate-500 text-sm mb-3"><i class="fas fa-map-marker-alt text-primary ml-1"></i> ${prop.location}</p>
                    <div class="flex items-center gap-2 mb-4">
                        <span class="bg-emerald-50 text-primary px-3 py-1 rounded-lg text-sm font-bold">
                            <i class="fas fa-ruler-combined ml-1"></i> ${prop.area}
                        </span>
                    </div>
                    <div class="flex flex-wrap gap-2 mb-4">
                        ${prop.features.map(f => `<span class="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md">${f}</span>`).join('')}
                    </div>
                    <div class="flex items-center justify-between border-t pt-4">
                        <span class="text-primary font-black text-lg">${prop.price.toLocaleString()} ر.س</span>
                        <div class="flex gap-2">
                            <button onclick="openMap(${prop.coordinates.lat}, ${prop.coordinates.lng}, '${prop.title}')" class="bg-slate-100 px-3 py-2 rounded-xl font-bold text-sm hover:bg-slate-200">
                                <i class="fas fa-map"></i>
                            </button>
                            <a href="${prop.whatsappLink}" target="_blank" class="bg-primary text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-primaryDark">
                                <i class="fab fa-whatsapp ml-1"></i> استفسر
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;
        grid.innerHTML += card;
    });
}

// تبديل الفئات
function switchCategory(category) {
    currentCategory = category;
    document.querySelectorAll('.tab-btn').forEach(btn
