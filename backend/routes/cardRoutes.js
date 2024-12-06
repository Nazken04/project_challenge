const express = require('express');
const cardController = require('../controllers/cardController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

// Создание карточки
router.post('/', authMiddleware, async (req, res, next) => {
    try {
      await cardController.createCard(req, res);
    } catch (err) {
      next(err);
    }
  });

// Получение карточки по ID
router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    // Call the controller to get the card by ID
    await cardController.getCardById(req, res);
  } catch (err) {
    next(err);
  }
});

// Обновление карточки
router.put(
  '/:id',
  authMiddleware,
  roleMiddleware(['Аналитик СД', 'Модератор']), // Restrict access based on roles
  async (req, res, next) => {
    try {
      // Call the controller to update the card
      await cardController.updateCard(req, res);
    } catch (err) {
      next(err);
    }
  }
);

// Согласование карточки
router.post(
  '/:id/approve',
  authMiddleware,
  roleMiddleware(['Аналитик СД', 'Модератор']), // Restrict approval to specific roles
  async (req, res, next) => {
    try {
      // Call the controller to approve the card
      await cardController.approveCard(req, res);
    } catch (err) {
      next(err);
    }
  }
);

// Получение списка карточек с фильтрацией
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    // Call the controller to get all cards with filtering
    await cardController.getCards(req, res);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
