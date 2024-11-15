const express = require('express');
const checkAuth = require('../middleware/auth');
const userController = require('../controllers/userController');
const router = express.Router();

router.post('/login', userController.login);
router.post('/signup', userController.signup);
router.get('/dashboard',checkAuth, userController.dashboard);

module.exports = router;
