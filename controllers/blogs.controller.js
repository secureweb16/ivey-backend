const Blog = require('../models/Blog');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const UPLOAD_DIR = path.join(__dirname, '../public/images');  // Define your uploads directory

exports.addBlog = async (req, res) => {
    try {
        const { title, description, category, contentData } = req.body;
        const featuredImage = req.files['featuredImage'] ? `/images/${req.files['featuredImage'][0].filename}` : '';
        let slug = title.replace(" ", "-").toLowerCase();

        // Check for duplicate slugs
        const checkBlog = await Blog.find({ slug: { $regex: `^${slug}(-[0-9]*)?$` } });
        if (checkBlog.length > 0) {
            const slugNumbers = checkBlog.map(loc => {
                const match = loc.slug.match(/-(\d+)$/);
                return match ? parseInt(match[1], 10) : 1;
            });
            const maxNumber = Math.max(...slugNumbers);
            slug = `${slug}-${maxNumber + 1}`;
        }

        const content = JSON.parse(contentData);
        const newBlog = new Blog({
            title,
            description,
            category,
            contentSections: content,
            featuredImage,
            slug
        });

        await newBlog.save();

        res.status(200).json({ message: 'Blog added successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to add Blog' });
    }
};

// Helper function to process the image, decode base64 and save it to the server
const processImage = async (imageContent, type, key) => {
    // Decode the base64 string
    const matches = imageContent.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches) {
        throw new Error('Invalid base64 string');
    }

    const buffer = Buffer.from(matches[2], 'base64');
    
    // Create a unique filename based on type and key
    const filename = `${type}_${key}_${Date.now()}.jpg`;  // Change extension based on image type
    const filePath = path.join(UPLOAD_DIR, filename);

    // Write the file to the filesystem using promises
    await fs.promises.writeFile(filePath, buffer);

    // Return the image URL after it is saved
    return `/images/${filename}`;
};

const uploadSimpleBase64Image = async (imageContent, slug) => {
    // Decode the base64 string
    const matches = imageContent.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches) {
        throw new Error('Invalid base64 string');
    }

    const buffer = Buffer.from(matches[2], 'base64');
    
    // Create a unique filename based on type and key
    const filename = `${slug}_${Date.now()}.jpg`;  // Change extension based on image type
    const filePath = path.join(UPLOAD_DIR, filename);

    // Write the file to the filesystem using promises
    await fs.promises.writeFile(filePath, buffer);

    // Return the image URL after it is saved
    return `/images/${filename}`;
};




exports.blogsList = async (req, res) => {
    try {
        const blogs = await Blog.find().sort({created_at:-1}); // Fetch all projects
        // console.log(projects);
        res.status(200).json(blogs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching blogs' });
    }
};

exports.getBlog = async (req, res) => {
    const { id } = req.params; // Get the ID from the URL
    try {
        const blog = await Blog.findById(id);
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }
        res.status(200).json(blog);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching Blog' });
    }
};

exports.getBlogBySlug = async (req, res) => {
    const { slug } = req.params; // Get the ID from the URL
    try {
        const blog = await Blog.findOne({ slug: slug });
        if (!blog) {
            return res.status(404).json({ message: 'blog not found' });
        }
        res.status(200).json(blog);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching blog' });
    }
};

exports.deleteBlog = async (req, res) => {
    try {

        const { id } = req.params;
        const blog = await Blog.findById(id);
        if (!blog) {
            return res.status(404).json({ message: 'blog not found' });
        }

        const deletedBlog = await Blog.findByIdAndDelete(id);
        if (!deletedBlog) {
            return res.status(404).json({ message: 'Blog not found' }); // If no project is found
        }
        // Delete associated images from the file system

        const fs = require('fs');
        fs.unlink(`./public${blog.featuredImage}`, err => {
            if (err) console.error('Failed to delete image:', imagePath);
        });

        res.status(200).json({ message: 'Blog deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete Blog' });
    }
};

exports.removeImage = async (req, res) => {
    const { blogId, imageName } = req.body;

    try {
        // Find the project first
        const blog = await Blog.findById(blogId);
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        // Check if the image is a gallery image, banner image, or featured image
        let updatedData = {};

        if (blog.featuredImage === imageName) {
            updatedData.featuredImage = null;
        }

        // Update the project with the new data
        const updatedBlog = await Blog.findByIdAndUpdate(blogId, { $set: updatedData }, { new: true });

        // Check if update was successful
        if (!updatedBlog) {
            return res.status(404).json({ message: 'Failed to update blog' });
        }

        // Remove the image from the filesystem
        const filePath = path.join(__dirname, '..', 'public', imageName);
        fs.unlink(filePath, (err) => {
            if (err) {
                return res.status(500).json({ message: 'Error deleting image from filesystem' });
            }
            res.status(200).json({ message: 'Image removed successfully', blog: updatedBlog });
        });
    } catch (error) {
        console.error('Error removing image:', error);
        res.status(500).json({ message: 'Error removing image', error });
    }
};
exports.updateBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, category, contentData } = req.body;

        // Retrieve the current project from the database
        const blog = await Blog.findById(id);
        if (!blog) {
            return res.status(404).json({ message: 'blog not found' });
        }

        const featuredImage = req.files['featuredImage'] ? `/images/${req.files['featuredImage'][0].filename}` : blog.featuredImage;
        const content = JSON.parse(contentData);

        // Create an updated data object
        const updatedData = {
            title: title || blog.title,
            description: description || blog.description,
            category: category || blog.category,
            contentSections: content || blog.contentSections,
            featuredImage,
        };

        const updatedBlog = await Blog.findByIdAndUpdate(id, updatedData, { new: true });

        res.status(200).json({ message: 'blog updated successfully', blog: updatedBlog });

    } catch (error) {
        console.error('Error updating blog:', error);
        res.status(500).json({ message: 'Failed to update blog' });
    }
};