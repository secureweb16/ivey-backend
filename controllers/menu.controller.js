const Menu = require('../models/Menu');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

exports.addMenu = async (req, res) => {
    try {
        const menusData = req.body;

        const newMenu = new Menu({menuData: menusData});
        await newMenu.save();

        res.status(200).json({ message: 'Menu added successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to add Menu' });
    }
};


exports.menusList = async (req, res) => {
    try {
        const menus = await Menu.find(); 
        
        res.status(200).json(menus);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching menus' });
    }
};

exports.getMenu = async (req, res) => {
    const { id } = req.params;
    try {
        const menu = await Menu.findById(id);
        if (!menu) {
            return res.status(404).json({ message: 'Menu not found' });
        }
        res.status(200).json(menu);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching menu' });
    }
};

exports.deleteMenu = async (req, res) => {
    try {
        const { id } = req.params;
        const menu = await Menu.findById(id);
        if (!menu) {
            return res.status(404).json({ message: 'Menu not found' });
        }

        res.status(200).json({ message: 'Menu deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete menu' });
    }
};


exports.updateMenu = async (req, res) => {
    try {
        const { id } = req.params;
        const menusData = req.body;

        // Retrieve the current project from the database
        const menu = await Menu.findById(id);
        if (!menu) {
            return res.status(404).json({ message: 'Menu not found' });
        }
        
        // Update the project in the database
        const updatedMenu = await Menu.findByIdAndUpdate(id, {menuData: menusData}, { new: true });
        
        res.status(200).json({ message: 'Menu updated successfully', menu: updatedMenu });

    } catch (error) {
        console.error('Error updating Menu:', error);
        res.status(500).json({ message: 'Failed to update Menu' });
    }   
};