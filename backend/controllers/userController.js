const userService = require('../services/userService');
const authService = require('../services/authService');

const User = require('../models/userModel');

const getProfile = async (req, res) => {
  try {
    const user = req.user;  // req.user is set by authMiddleware
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка получения профиля' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = req.user;  // req.user is set by authMiddleware
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    // Update logic here
    user.name = req.body.name || user.name;
    await user.save();
    res.status(200).json({ message: 'Профиль обновлён', user });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка обновления профиля' });
  }
};

const deleteProfile = async (req, res) => {
    try {
      const user = req.user;  // req.user is set by authMiddleware
      if (!user) {
        return res.status(404).json({ message: 'Пользователь не найден' });
      }
  
      // Log the user object to see if it's correct
      console.log('User to delete:', user);
  
      // Use `deleteOne()` or `findByIdAndDelete()`
      await User.findByIdAndDelete(user._id);  // Delete the user by their ID
  
      // If deletion is successful
      res.status(200).json({ message: 'Профиль удалён' });
    } catch (error) {
      console.error('Error deleting user:', error);  // Log the error for debugging
      res.status(500).json({ message: 'Ошибка удаления профиля' });
    }
  };
  
  
module.exports = { getProfile, updateProfile, deleteProfile };
