const authService = require('../services/authService');

// Регистрация пользователя
const register = async (req, res) => {
    try {
      console.log('Received body:', req.body); // Debugging log
      const { email, password, name, role } = req.body;
      const user = await authService.registerUser(email, password, name, role);
      res.status(201).json({ message: 'Пользователь успешно зарегистрирован', user });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };
  

// Авторизация пользователя
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await authService.loginUser(email, password);
    res.status(200).json({ message: 'Авторизация успешна', user, token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { register, login };
