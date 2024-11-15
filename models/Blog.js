const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    contentSections:
    {
        type: Array,
        required: true
    },
    editor_1: {
        type: String,
    },
    editor_2: {
        type: String,
    },
    editor_3: {
        type: String,
    },
    editor_4: {
        type: String,
    },
    category: {
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
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

module.exports = mongoose.model('blogs', BlogSchema);
