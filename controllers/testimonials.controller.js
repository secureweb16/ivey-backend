const Testimonial = require('../models/Testimonial');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

exports.addTestimonial = async (req, res) => {
    try {
        const { title, description, clientName } = req.body;
        const featuredImage = req.files['featuredImage'] ? `/images/${req.files['featuredImage'][0].filename}` : '';
        var slug = title.replace(" ", "-").toLowerCase();

        const checkTestimonial = await Testimonial.find({ slug: { $regex: `^${slug}(-[0-9]*)?$` } });
        if (checkTestimonial.length > 0) {
            
            const slugNumbers = checkTestimonial.map(loc => {
                const match = loc.slug.match(/-(\d+)$/);
                return match ? parseInt(match[1], 10) : 1;
            });
    
            const maxNumber = Math.max(...slugNumbers);
            slug = `${slug}-${maxNumber + 1}`;
        }

        const newTestimonial = new Testimonial({
            title,
            description,
            clientName,
            featuredImage,
            slug: slug
        });

        await newTestimonial.save();

        res.status(200).json({ message: 'Testimonial added successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to add Testimonial' });
    }
};


exports.testimonialsList = async (req, res) => {
    try {
        const testimonials = await Testimonial.find(); // Fetch all projects
        // console.log(projects);
        res.status(200).json(testimonials);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching Testimonials' });
    }
};

exports.getTestimonial = async (req, res) => {
    const { id } = req.params; // Get the ID from the URL
    try {
        const testimonial = await Testimonial.findById(id);
        if (!testimonial) {
            return res.status(404).json({ message: 'Testimonial not found' });
        }
        res.status(200).json(testimonial);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching Testimonial' });
    }
};

exports.getTestimonialBySlug = async (req, res) => {
    const { id } = req.params; // Get the ID from the URL
    try {
        const testimonial = await Testimonial.findOne({slug: id});
        if (!testimonial) {
            return res.status(404).json({ message: 'Testimonial not found' });
        }
        res.status(200).json(testimonial);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching Testimonial' });
    }
};

exports.deleteTestimonial = async (req, res) => {
    try {
        
        const { id } = req.params;
        const testimonial = await Testimonial.findById(id);
        if (!testimonial) {
            return res.status(404).json({ message: 'Testimonial not found' });
        }

        const deletedTestimonial = await Testimonial.findByIdAndDelete(id);
        if (!deletedTestimonial) {
            return res.status(404).json({ message: 'Testimonial not found' }); // If no project is found
        }
         // Delete associated images from the file system
        
        const fs = require('fs');
        fs.unlink(`./public${testimonial.featuredImage}`, err => {
            if (err) console.error('Failed to delete image:', imagePath);
        });

        res.status(200).json({ message: 'Testimonial deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete testimonial' });
    }
};

exports.removeImage = async (req, res) => {
    const { testimonialId, imageName } = req.body;

    try {
        // Find the project first
        const testimonial = await Testimonial.findById(testimonialId);
        if (!testimonial) {
            return res.status(404).json({ message: 'Testimonial not found' });
        }

        // Check if the image is a gallery image, banner image, or featured image
        let updatedData = {};
        
        if (testimonial.featuredImage === imageName) {
            updatedData.featuredImage = null;
        }

        // Update the project with the new data
        const updatedTestimonial = await Testimonial.findByIdAndUpdate(testimonialId, { $set: updatedData }, { new: true });

        // Check if update was successful
        if (!updatedTestimonial) {
            return res.status(404).json({ message: 'Failed to update Testimonial' });
        }

        // Remove the image from the filesystem
        const filePath = path.join(__dirname, '..', 'public', imageName);
        fs.unlink(filePath, (err) => {
            if (err) {
                return res.status(500).json({ message: 'Error deleting image from filesystem' });
            }
            res.status(200).json({ message: 'Image removed successfully', testimonial: updatedTestimonial });
        });
    } catch (error) {
        console.error('Error removing image:', error);
        res.status(500).json({ message: 'Error removing image', error });
    }
};
exports.updateTestimonial = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, clientName } = req.body;

        // Retrieve the current project from the database
        const testimonial = await Testimonial.findById(id);
        if (!testimonial) {
            return res.status(404).json({ message: 'Testimonial not found' });
        }

        const featuredImage = req.files['featuredImage'] ? `/images/${req.files['featuredImage'][0].filename}` : testimonial.featuredImage;

        // Create an updated data object
        const updatedData = {
            title: title || testimonial.title,
            description: description || testimonial.description,
            clientName: clientName || testimonial.clientName,
            featuredImage,
        };

        const updatedTestimonial = await Testimonial.findByIdAndUpdate(id, updatedData, { new: true });
        
        res.status(200).json({ message: 'Testimonial updated successfully', testimonial: updatedTestimonial });

    } catch (error) {
        console.error('Error updating Testimonial:', error);
        res.status(500).json({ message: 'Failed to update Testimonial' });
    }   
};