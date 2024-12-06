const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// Регистрация
router.post('/register', authController.register);
// Авторизация
router.post('/login', authController.login);

module.exports = router;
