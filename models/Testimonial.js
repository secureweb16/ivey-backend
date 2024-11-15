const mongoose = require('mongoose');

const TestimonialSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    clientName: {
        type: String,
        required: true
    },
    featuredImage: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    }
}, {timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }});

module.exports = mongoose.model('testimonials', TestimonialSchema);
