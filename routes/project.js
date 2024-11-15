const express = require('express');
const multer = require('multer');
const path = require('path');
const projectController = require('../controllers/project.controller');
const checkAuth = require('../middleware/auth');
const nodemailer = require('nodemailer');

const router = express.Router();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'secureweb16@gmail.com', // Replace with your email
      pass: 'nvbp xohd djtc hzob'    // Replace with your email password
    }
});

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

router.post('/add-project', upload.fields([
    { name: 'galleryImages', maxCount: 100 },
    { name: 'featuredImage', maxCount: 1 },
]), projectController.addProject);

// router.post('/add-project', upload.array('images', 10), projectController.addProject);
router.get('/get-projects', projectController.projectsList);
router.get('/get-project/:id', projectController.getProject);
router.get('/single-project/:slug', projectController.getProjectBySlug);
router.delete('/delete-project/:id', projectController.deleteProject);
router.post('/remove-image', projectController.removeImage);
// Route to update a project

router.put('/update-project/:id', upload.fields([
    { name: 'galleryImages', maxCount: 100 },
    { name: 'featuredImage', maxCount: 1 },
]), projectController.updateProject);

router.post('/send-email', async (req, res) => {
    const { to, name, email, phone, message } = req.body;
  
    // Email options
    const mailOptions = {
      from: "secureweb16@gmail.com",
      to: "sophia@themilkbar.co",
      subject: "New Contact form submission",
      html: `
        <h2>Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Message:</strong> ${message}</p>
        `
    };
  
    // Send the email
    try {
      const info = await transporter.sendMail(mailOptions);
      res.status(200).json({ message: 'Email sent successfully!', info: info.response });
    } catch (error) {
      res.status(500).json({ message: 'Error sending email', error: error.message });
    }
});

module.exports = router;
