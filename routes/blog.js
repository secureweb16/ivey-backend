const express = require('express');
const multer = require('multer');
const path = require('path');
const blogsController = require('../controllers/blogs.controller');
const checkAuth = require('../middleware/auth');
const fs = require('fs');

const router = express.Router();

// Set up storage for uploaded images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/images");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({
    storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // Limit file size to 10 MB
    },
});



router.post('/add-blog', upload.fields([
    { name: 'featuredImage', maxCount: 1 }
]), blogsController.addBlog);

// router.post('/add-blog', blogsController.addBlog);


const UPLOAD_DIR = path.join(__dirname, '../public/images'); // Adjust the path as needed
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

router.post('/upload-image', (req, res) => {
    const { imageBase64, name } = req.body; // Now this should be defined
    console.log("req.body", req.body); // Check if this logs correctly


    if (!imageBase64) {
        return res.status(400).json({ message: 'No image data provided' });
    }

    // Decode the base64 string
    const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches) {
        return res.status(400).json({ message: 'Invalid base64 string' });
    }

    const buffer = Buffer.from(matches[2], 'base64');

    // Create a unique filename
    const filename = `${name}_${Date.now()}.jpg`; // Change extension based on the image type
    const filePath = path.join(UPLOAD_DIR, filename);

    // Write the file to the filesystem
    fs.writeFile(filePath, buffer, (err) => {
        if (err) {
            console.error('Error saving the file:', err);
            return res.status(500).json({ message: 'Error saving the image' });
        }

        // Respond with the image URL
        const imageUrl = `/images/${filename}`; // Adjust based on your server structure
        return res.status(200).json({ imageUrl });
    });
});


router.post('/upload-image-test', (req, res) => {
    const { editorField } = req.body;
    return res.status(200).json({ data: "test" });
});


// router.post('/add-project', upload.array('images', 10), projectController.addProject);
router.get('/get-blogs', blogsController.blogsList);
router.get('/get-blog/:id', blogsController.getBlog);
router.get('/single-blog/:slug', blogsController.getBlogBySlug);
router.delete('/delete-blog/:id', blogsController.deleteBlog);
router.post('/remove-image-blog', blogsController.removeImage);
// Route to update a project

router.put('/update-blog/:id', upload.fields([
    { name: 'featuredImage', maxCount: 1 },
]), blogsController.updateBlog);
module.exports = router;
