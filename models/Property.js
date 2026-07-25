const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['agricultural', 'residential', 'resorts'],
    required: true
  },
  location: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  area: {
    type: String,
    required: true
  },
  features: [{
    type: String
  }],
  images: [{
    type: String,
    default: []
  }],
  video: {
    type: String,
    default: null
  },
  thumbnail: {
    type: String,
    default: null
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
  whatsappLink: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'pending', 'sold', 'draft'],
    default: 'active'
  },
  submittedBy: {
    type: String,
    default: 'admin'
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  approvedAt: {
    type: Date
  },
  views: {
    type: Number,
    default: 0
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  metadata: {
    imageCount: Number,
    hasVideo: Boolean,
    processedByAI: Boolean
  }
}, {
  timestamps: true
});

// Indexes for better performance
propertySchema.index({ category: 1, status: 1 });
propertySchema.index({ location: 1 });
propertySchema.index({ price: 1 });
propertySchema.index({ createdAt: -1 });

module.exports = mongoose.model('Property', propertySchema);
