const bcrypt = require('bcryptjs');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const { SECRET_KEY } = process.env;
console.log('SECRET_KEY:', process.env.SECRET_KEY);

// Регистрация нового пользователя
const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    name: Joi.string().required(),
    role: Joi.string().valid('Сотрудник СУ', 'Аналитик СД', 'Модератор').required(),
});

async function registerUser(email, password, name, role) {
    const { error } = schema.validate({ email, password, name, role });
    if (error) {
        throw new Error(error.details[0].message);
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new Error('Пользователь с таким email уже существует');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword, name, role });

    await newUser.save();
    return newUser;
}


// Логин пользователя и создание JWT токена
async function loginUser(email, password) {
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error('Неверный email или пароль');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Неверный email или пароль');
    }
    if (!process.env.SECRET_KEY) {
        throw new Error('SECRET_KEY не задан в файле .env');
      }
    const token = jwt.sign({ userId: user._id, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
    return { user, token };
}

// Получение информации о пользователе
async function getUserById(userId) {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('Пользователь не найден');
    }
    return user;
}

module.exports = { registerUser, loginUser, getUserById };
