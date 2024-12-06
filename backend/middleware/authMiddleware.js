const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const authMiddleware = async (req, res, next) => {
  try {
    // Get the token from the Authorization header
    const token = req.headers.authorization?.split(' ')[1];

    // Check if token exists
    if (!token) {
      return res.status(401).json({ message: 'Нет токена, авторизация отклонена' });
    }

    // Verify the token using the secret key
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    console.log('Decoded JWT:', decoded);  // Debugging log to check the decoded token

    // Check if token has expired
    const currentTime = Math.floor(Date.now() / 1000); // Current timestamp in seconds
    if (decoded.exp < currentTime) {
      return res.status(401).json({ message: 'Токен истек' });
    }

    // Log the userId to confirm it
    console.log('Looking for user with ID:', decoded.userId);

    // Find the user by the decoded userId
    req.user = await User.findById(decoded.userId);

    // If no user found, return unauthorized response
    if (!req.user) {
      console.log('User not found');
      return res.status(401).json({ message: 'Пользователь не найден' });
    }

    // Log the user details to ensure it's correct
    console.log('User found:', req.user);

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error(error); // Log any errors
    res.status(401).json({ message: 'Неверный токен' });
  }
};

module.exports = authMiddleware;
