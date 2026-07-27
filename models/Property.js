const mongoose = require("mongoose");

const PropertySchema = new mongoose.Schema(
{
    slug: {
        type: String,
        unique: true,
        sparse: true,
        trim: true
    },

    title: {
        type: String,
        required: true,
        trim: true
    },

    description: {
        type: String,
        required: true
    },

    seoTitle: {
        type: String,
        default: ""
    },

    seoDescription: {
        type: String,
        default: ""
    },

    category: {
        type: String,
        enum: [
            "agricultural",
            "residential",
            "resorts"
        ],
        required: true
    },

    city: {
        type: String,
        default: "الخرج"
    },

    district: {
        type: String,
        default: ""
    },

    location: {
        type: String,
        required: true
    },

    googleMap: {
        type: String,
        default: "https://maps.google.com/?q=24.1500,47.3000"
    },

    coordinates: {
        lat: {
            type: Number,
            default: 24.1500
        },

        lng: {
            type: Number,
            default: 47.3000
        }
    },

    price: {
        type: Number,
        required: true
    },

    area: {
        type: String,
        required: true
    },

    streetWidth: {
        type: String,
        default: ""
    },

    purpose: {
        type: String,
        default: "للبيع"
    },

    status: {
        type: String,
        enum: [
            "active",
            "pending",
            "sold",
            "draft"
        ],
        default: "active"
    },

    features: [{
        type: String
    }],

    images: [{
        type: String
    }],

    image: {
        type: String,
        default: ""
    },

    gallery: [{
        type: String
    }],

    thumbnail: {
        type: String,
        default: ""
    },

    imagePrompt: {
        type: String,
        default: ""
    },

    aiGenerated: {
        type: Boolean,
        default: false
    },

    whatsappLink: {
        type: String,
        default: "https://wa.me/966545888931"
    },

    phoneNumbers: [{
        type: String,
        default: [
            "0545888931",
            "0544699933"
        ]
    }],

    video: {
        type: String,
        default: ""
    },

    views: {
        type: Number,
        default: 0
    },

    favorites: {
        type: Number,
        default: 0
    },

    isFeatured: {
        type: Boolean,
        default: false
    },

    published: {
        type: Boolean,
        default: true
    },

    tags: [{
        type: String
    }],

    metadata: {
        imageCount: {
            type: Number,
            default: 0
        },

        hasVideo: {
            type: Boolean,
            default: false
        },

        processedByAI: {
            type: Boolean,
            default: false
        }
    },

    submittedBy: {
        type: String,
        default: "admin"
    },

    submittedAt: {
        type: Date,
        default: Date.now
    },

    approvedAt: Date,

    publishedAt: {
        type: Date,
        default: Date.now
    }

},
{
    timestamps: true
});

PropertySchema.index({
    slug: 1
});

PropertySchema.index({
    category: 1,
    status: 1
});

PropertySchema.index({
    city: 1
});

PropertySchema.index({
    location: 1
});

PropertySchema.index({
    isFeatured: -1,
    createdAt: -1
});

module.exports = mongoose.model("Property", PropertySchema);
