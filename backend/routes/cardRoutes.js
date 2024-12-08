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

// Создание карточки со статусом "На согласовании"
// Создание карточки со статусом "На согласовании"
router.post('/create-on-approval', authMiddleware, async (req, res, next) => {
  try {
      const cardData = { ...req.body };  // Передаем все данные карточки
      await cardController.createCardWithFixedStatus(req, res, cardData);  // Вызываем контроллер с фиксированным статусом
  } catch (err) {
      next(err);
  }
});

// Получение карточки по ID
router.get('/:id', authMiddleware, async (req, res, next) => {
    try {
        await cardController.getCardById(req, res);
    } catch (err) {
        next(err);
    }
});

// Обновление карточки
// Обновление карточки
router.put(
  '/:id',
  authMiddleware,
  roleMiddleware(['Сотрудник СУ', 'Аналитик СД', 'Модератор']), // Ограничиваем доступ к ролям
  async (req, res, next) => {
    try {
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
            await cardController.approveCard(req, res);
        } catch (err) {
            next(err);
        }
    }
);

// Получение списка карточек с фильтрацией
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    await cardController.getCards(req, res);
  } catch (err) {
    next(err);
  }
});


router.get('/check-history/:iin', authMiddleware, async (req, res, next) => {
  try {
    await cardController.checkCallHistory(req, res);
  } catch (err) {
    next(err);
  }
});

// Назначение статуса "Отправлено на доработку"
// Назначение статуса "Отправлено на доработку"
router.post(
  '/:id/send-for-revision',
  authMiddleware, // Проверка токена и установка req.user
  roleMiddleware(['Модератор', 'Аналитик СД']), // Проверка роли
  async (req, res, next) => {
    try {
      console.log('User from authMiddleware:', req.user); // Логируем req.user для отладки
      await cardController.markCardForRevision(req, res);
    } catch (err) {
      next(err);
    }
  }
);

// Экспорт данных в Excel
router.get('/export/excel', authMiddleware, async (req, res, next) => {
  try {
    await cardController.exportToExcel(req, res);
  } catch (err) {
    next(err);
  }
});

// Экспорт данных в PDF
router.get('/export/pdf', authMiddleware, async (req, res, next) => {
  try {
    await cardController.exportToPdf(req, res);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
