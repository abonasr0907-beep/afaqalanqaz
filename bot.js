const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// المفاتيح المعتمدة (تُقرأ من ملف البيئة أو المباشرة)
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8881283361:AAEfeeg4E7540R8Gz3QFFYGEvnmgFN7Sb0w';
const ADMIN_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '8298395488';

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// قائمة الأزرار الرئيسية لـ لوحة التحكم
const adminControlPanel = {
    reply_markup: {
        inline_keyboard: [
            [
                { text: "➕ إضافة عرض جديد", callback_data: "add_property" },
                { text: "🗑️ حذف عرض", callback_data: "delete_property" }
            ],
            [
                { text: "📸 رفع وصيانة الصور", callback_data: "manage_images" },
                { text: "📝 إضافة مقال / نص", callback_data: "add_article" }
            ]
        ]
    }
};

// أمر البداية
bot.onText(/\/start/, (msg) => {
    if (msg.chat.id.toString() !== ADMIN_CHAT_ID) {
        return bot.sendMessage(msg.chat.id, "عذراً، هذا البوت مخصص لإدارة موقع آفاق الإنجاز العقاري فقط.");
    }
    bot.sendMessage(msg.chat.id, "مرحباً بك في لوحة تحكم موقع آفاق الإنجاز العقاري 🏢\nاختر الإجراء المطلوب من الأزرار التالية:", adminControlPanel);
});

// استقبال الأوامر من الأزرار
bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const action = query.data;

    if (action === 'add_property') {
        bot.sendMessage(chatId, "أرسل تفاصيل العقار الجديد بالتنسيق التالي:\n\nالعنوان | السعر | الموقع | رابط الصورة");
    } else if (action === 'delete_property') {
        bot.sendMessage(chatId, "أدخل اسم أو رقم العقار المراد حذفه من القائمة.");
    } else if (action === 'manage_images') {
        bot.sendMessage(chatId, "قم بإرسال الصورة مباشرة هنا لتزويدك برابط مباشر لاستخدامها بالموقع.");
    } else if (action === 'add_article') {
        bot.sendMessage(chatId, "أرسل عنوان المقال ثم نص المقال المراد نشره بالموقع.");
    }
});

// استقبال الصور وتجهيز روابطها
bot.on('photo', async (msg) => {
    if (msg.chat.id.toString() !== ADMIN_CHAT_ID) return;
    const fileId = msg.photo[msg.photo.length - 1].file_id;
    const fileLink = await bot.getFileLink(fileId);
    bot.sendMessage(msg.chat.id, `✅ تم استلام الصورة بنجاح!\nرابط الصورة لاستخدامه بالموقع:\n${fileLink}`);
});
