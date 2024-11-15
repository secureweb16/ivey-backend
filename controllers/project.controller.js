const Project = require('../models/Project');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

exports.addProject = async (req, res) => {
    try {
        const { title, description, tags, location,space, team } = req.body;
        const featuredImage = req.files['featuredImage'] ? `/images/${req.files['featuredImage'][0].filename}` : '';
        const galleryImages = req.files['galleryImages'] ? req.files['galleryImages'].map(file => `/images/${file.filename}`) : [];
        var slug = title.replace(" ", "-").toLowerCase();

        const checkProject = await Project.find({ slug: { $regex: `^${slug}(-[0-9]*)?$` } });
        if (checkProject.length > 0) {
            
            const slugNumbers = checkProject.map(loc => {
                const match = loc.slug.match(/-(\d+)$/);
                return match ? parseInt(match[1], 10) : 1;
            });
    
            const maxNumber = Math.max(...slugNumbers);
            slug = `${slug}-${maxNumber + 1}`;
        }

        const newProject = new Project({
            title,
            tags,
            location,
            space,
            description,
            team,
            featuredImage,
            galleryImages,
            slug: slug,
        });

        await newProject.save();

        res.status(200).json({ message: 'Project added successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to add project' });
    }
};


exports.projectsList = async (req, res) => {
    try {
        const projects = await Project.find().sort({created_at:-1}); // Fetch all projects
        // console.log(projects);
        res.status(200).json(projects);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching projects' });
    }
};

exports.getProject = async (req, res) => {
    const { id } = req.params; // Get the ID from the URL
    try {
        const project = await Project.findById(id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        res.status(200).json(project);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching project' });
    }
};

exports.getProjectBySlug = async (req, res) => {
    const { slug } = req.params; // Get the ID from the URL
    try {
        const project = await Project.findOne({slug: slug});
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        res.status(200).json(project);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching project' });
    }
};

exports.deleteProject = async (req, res) => {
    try {
        
        const { id } = req.params;
        
        const project = await Project.findById(id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const deletedProject = await Project.findByIdAndDelete(id);
        if (!deletedProject) {
            return res.status(404).json({ message: 'project not found' }); // If no project is found
        }
         // Delete associated images from the file system
        
        const fs = require('fs');
        project.galleryImages.forEach(imagePath => {
            fs.unlink(`./public${imagePath}`, err => {
                if (err) console.error('Failed to delete image:', imagePath);
            });
        });

        fs.unlink(`./public${project.featuredImage}`, err => {
            if (err) console.error('Failed to delete image:', imagePath);
        });

        res.status(200).json({ message: 'Project deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete project' });
    }
};

exports.removeImage = async (req, res) => {
    const { projectId, imageName } = req.body;

    try {
        // Find the project first
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Check if the image is a gallery image, banner image, or featured image
        let updatedData = {};
        
        if (project.galleryImages.includes(imageName)) {
            // Remove image from gallery
            updatedData.galleryImages = project.galleryImages.filter(image => image !== imageName);
        } else if (project.featuredImage === imageName) {
            // If it's the banner image, set it to null or keep the existing value based on your requirements
            updatedData.featuredImage = null; // or ''
        } else {
            return res.status(404).json({ message: 'Image not found in Project' });
        }

        // Update the project with the new data
        const updatedProject = await Project.findByIdAndUpdate(projectId, { $set: updatedData }, { new: true });

        // Check if update was successful
        if (!updatedProject) {
            return res.status(404).json({ message: 'Failed to update Project' });
        }

        // Remove the image from the filesystem
        const filePath = path.join(__dirname, '..', 'public', imageName);
        fs.unlink(filePath, (err) => {
            if (err) {
                return res.status(500).json({ message: 'Error deleting image from filesystem' });
            }
            res.status(200).json({ message: 'Image removed successfully', project: updatedProject });
        });
    } catch (error) {
        console.error('Error removing image:', error);
        res.status(500).json({ message: 'Error removing image', error });
    }
};
exports.updateProject = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, tags, location, team ,space} = req.body;

        // Retrieve the current project from the database
        const project = await Project.findById(id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Map the new images from the uploaded files
        const newImages = req.files['galleryImages'] ? req.files['galleryImages'].map(file => `/images/${file.filename}`) : [];
        const featuredImage = req.files['featuredImage'] ? `/images/${req.files['featuredImage'][0].filename}` : location.featuredImage;

        // Create an updated data object
        const updatedData = {
            title: title || project.title,
            tags: tags || project.tags,
            location: location || project.location,
            space : space || project.space,
            description: description || project.description,
            team,
            featuredImage,
            galleryImages: [...project.galleryImages, ...newImages]
        };

        // Update the project in the database
        const updatedProject = await Project.findByIdAndUpdate(id, updatedData, { new: true });
        
        res.status(200).json({ message: 'Project updated successfully', project: updatedProject });

    } catch (error) {
        console.error('Error updating Project:', error);
        res.status(500).json({ message: 'Failed to update Project' });
    }   
};

exports.updateProjectFeatured = async (req, res) => {
    try {
        const { featuredProjects, homePageFeatured, detailPageFeatured } = req.body;
        
        if(featuredProjects && featuredProjects.length > 0){

            const multipleProjectIds = await Promise.all(featuredProjects.map(project => project._id));
            
            await Project.updateMany({}, { $set: { isFeatured: false } });
            
            await Project.updateMany(
                { _id: { $in: multipleProjectIds }},
                { $set: { isFeatured: true } }
            );
        }

        if(homePageFeatured){
            await Project.updateMany({}, { $set: { isHomePageFeatured: false } });

            await Project.updateOne(
                { _id: homePageFeatured._id},
                { $set: { isHomePageFeatured: true } }
            );
        }

        if(detailPageFeatured){
            await Project.updateMany({}, { $set: { isDetailPageFeatured: false } });

            await Project.updateOne(
                { _id: detailPageFeatured._id},
                { $set: { isDetailPageFeatured: true } }
            );
        }
        
        res.status(200).json({ message: 'Feature projects updated successfully' });

    } catch (error) {
        console.error('Error updating Project:', error);
        res.status(500).json({ message: 'Failed to set featured projects' });
    }   
};


exports.getFeaturedProjects = async (req, res) => {
    try {
        const featuredProjects = await Project.find({"isFeatured": true});
        const homePageFeatured = await Project.findOne({"isHomePageFeatured": true});
        const detailPageFeatured = await Project.findOne({"isDetailPageFeatured": true});
        
        
        res.status(200).json({ featuredProjects, homePageFeatured, detailPageFeatured });

    } catch (error) {
        console.error('Error updating Project:', error);
        res.status(500).json({ message: 'Failed to set featured projects' });
    }   
};