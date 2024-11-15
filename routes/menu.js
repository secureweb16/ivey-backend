const express = require('express');
const menuController = require('../controllers/menu.controller');

const router = express.Router();

router.post('/add-menu-item', menuController.addMenu);
router.get('/get-menu-items/', menuController.menusList);
router.get('/get-menu-item/:id', menuController.getMenu);
router.delete('/delete-menu-item/:id', menuController.deleteMenu);
router.put('/update-menu-item/:id', menuController.updateMenu);

module.exports = router;
