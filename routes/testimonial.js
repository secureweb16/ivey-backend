const express = require('express');
const multer = require('multer');
const path = require('path');
const testimonialsController = require('../controllers/testimonials.controller');
const checkAuth = require('../middleware/auth');

const router = express.Router();

// Set up storage for uploaded images
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images'); // Save to public/images folder
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname)); // Unique filename
    },
});

const upload = multer({ storage });

router.post('/add-testimonial', upload.fields([
    { name: 'featuredImage', maxCount: 1 },
]), testimonialsController.addTestimonial);

// router.post('/add-project', upload.array('images', 10), projectController.addProject);
router.get('/get-testimonials', testimonialsController.testimonialsList);
router.get('/get-testimonial/:id', testimonialsController.getTestimonial);
router.get('/single-testimonial/:id', testimonialsController.getTestimonialBySlug);
router.delete('/delete-testimonial/:id', testimonialsController.deleteTestimonial);
router.post('/remove-image-testimonial', testimonialsController.removeImage);
// Route to update a project

router.put('/update-testimonial/:id', upload.fields([
    { name: 'featuredImage', maxCount: 1 },
]), testimonialsController.updateTestimonial);
module.exports = router;
