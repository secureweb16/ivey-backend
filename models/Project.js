const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    tags: {
        type: Array,
        default: []
    },
    location: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    space:{
        type: String,
    },
    team: {
        type: Array,
        default: []
    },
    featuredImage: {
        type: String,
        required: true
    },
    galleryImages: {
        type: [String],
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    isHomePageFeatured: {
        type: Boolean,
        default: false
    },
    isDetailPageFeatured: {
        type: Boolean,
        default: false
    }
}, {timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }});

module.exports = mongoose.model('projects', ProjectSchema);
