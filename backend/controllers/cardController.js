const cardService = require('../services/cardService');
const Counter = require('../models/counterModel');
const Card = require('../models/cardModel');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const path = require('path');

// Утилита для генерации корректного имени файла
function sanitizeFilename(filename) {
  return filename.replace(/[^a-zA-Z0-9-_\.]/g, '_'); // Заменяем недопустимые символы на "_"
}

// Создание карточки
const createCard = async (req, res) => {
  try {
    const investigatorName = req.user?.name;
    if (!investigatorName) {
      return res.status(400).json({ message: 'Имя следователя не найдено' });
    }

    const counter = await Counter.findOneAndUpdate(
      { _id: 'registrationNumber' },
      { $inc: { sequence_value: 1 } },
      { new: true, upsert: true }
    );

    const registrationNumber = `Z-${String(counter.sequence_value).padStart(3, '0')}`;

    const cardData = {
      ...req.body, // Все данные из тела запроса, включая должность
      registration_number: registrationNumber,
      следователь: investigatorName,
      время_ухода: req.body.время_ухода || null, // Поле времени ухода, если передано
    };

    const newCard = await cardService.createCard(cardData);
    res.status(201).json({ message: 'Карточка создана', card: newCard });
  } catch (error) {
    console.error('Ошибка создания карточки:', error);
    res.status(500).json({ message: 'Ошибка создания карточки', error: error.message });
  }
};



// Получение карточки по ID
// Получение карточки по ID с добавлением полей для Аналитика СД
const getCardById = async (req, res) => {
  try {
    // Получаем карточку и проверяем роль пользователя
    const card = await cardService.getCardById(req.params.id, req.user);
    res.status(200).json(card);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};


// Обновление карточки
// Обновление карточки
const updateCard = async (req, res) => {
  try {
    const cardId = req.params.id;
    const updatedData = req.body;

    // Получаем карточку по ID
    const card = await cardService.getCardById(cardId, req.user);

    // Проверяем, что пользователь с ролью "Сотрудник СУ" имеет доступ к редактированию
    if (
      req.user.role === 'Сотрудник СУ' &&
      !['В работе', 'Отправлено на доработку'].includes(card.status)
    ) {
      return res.status(403).json({
        message: 'Редактирование разрешено только для карточек со статусами "В работе" или "Отправлено на доработку".',
      });
    }

    // Выполняем обновление
    const updatedCard = await cardService.updateCard(cardId, updatedData);
    res.status(200).json({ message: 'Карточка успешно обновлена', card: updatedCard });
  } catch (error) {
    console.error('Ошибка обновления карточки:', error.message);
    res.status(400).json({ message: error.message });
  }
};


// Согласование карточки
const approveCard = async (req, res) => {
  try {
    const approvedCard = await cardService.approveCard(req.params.id, req.body);
    res.status(200).json({ message: 'Карточка успешно согласована', card: approvedCard });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};



// Получение всех карточек с фильтрами
// Получение всех карточек с фильтрами
const getCards = async (req, res) => {
  try {
    const { status, region, case_number } = req.query;

    // Если роль пользователя "Сотрудник СУ", добавляем фильтр по следователю
    const filters = {};
    if (req.user.role === 'Сотрудник СУ') {
      filters.следователь = req.user.name; // Используем имя текущего пользователя
    }

    if (status) filters.status = status;
    if (region) filters.region = region;
    if (case_number) filters.case_number = case_number;

    const cards = await cardService.getCards(filters);
    res.status(200).json(cards);
  } catch (error) {
    console.error('Ошибка получения карточек:', error.message);
    res.status(400).json({ message: error.message });
  }
};




// Создание карточки со статусом "На согласовании"
// Создание карточки со статусом "На согласовании"
const createCardWithFixedStatus = async (req, res, cardData) => {
  try {
    const investigatorName = req.user?.name;
    if (!investigatorName) {
      return res.status(400).json({ message: 'Имя следователя не найдено' });
    }

    // Устанавливаем статус "На согласовании"
    cardData = { ...cardData, следователь: investigatorName, status: 'На согласовании' };

    // Создание карточки через сервис
    const newCard = await cardService.createCard(cardData);
    res.status(201).json({ message: 'Карточка создана со статусом "На согласовании"', card: newCard });
  } catch (error) {
    console.error('Ошибка создания карточки:', error);
    res.status(500).json({ message: 'Ошибка создания карточки', error: error.message });
  }
};

const checkCallHistory = async (req, res) => {
  try {
    const { iin } = req.params;
    const callHistory = await cardService.getCallHistoryByIin(iin);
    res.status(200).json({ callHistory });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const markCardForRevision = async (req, res) => {
  try {
    const { id } = req.params;

    // Логируем текущего пользователя для проверки
    console.log('req.user in markCardForRevision:', req.user);

    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: 'Ошибка авторизации: роль пользователя не найдена' });
    }

    const updatedCard = await cardService.updateCard(id, { status: 'Отправлено на доработку' });
    res.status(200).json({
      message: 'Статус карточки успешно обновлен на "Отправлено на доработку"',
      card: updatedCard,
    });
  } catch (error) {
    console.error('Ошибка обновления статуса:', error.message);
    res.status(500).json({ message: 'Ошибка обновления статуса', error: error.message });
  }
};




// Функция для получения данных для экспорта
async function getDataForExport(filters) {
  try {
    const query = {}; // Здесь можно добавить фильтры, если они переданы через req.query

    if (filters.status) query.status = filters.status;
    if (filters.region) query.region = filters.region;
    if (filters.creation_date_from && filters.creation_date_to) {
      query.creation_date = {
        $gte: new Date(filters.creation_date_from),
        $lte: new Date(filters.creation_date_to),
      };
    }

    const cards = await Card.find(query).select(
      'registration_number status регион creation_date ИИН_вызываемого case_number ФИО_согласующего'
    ); // Исправлено: используем "регион" вместо "region" для согласованности с вашей схемой

    return cards.map((card) => ({
      registration_number: card.registration_number,
      status: card.status,
      region: card.регион || 'Не указан', // Если регион отсутствует, отображаем "Не указан"
      creation_date: card.creation_date.toISOString().split('T')[0], // Преобразуем дату в строку
      ИИН_вызываемого: card.ИИН_вызываемого,
      case_number: card.case_number,
      approver_name: card.ФИО_согласующего || 'Не указано', // Обработка случая, если нет согласующего
    }));
  } catch (error) {
    console.error('Ошибка получения данных для экспорта:', error.message);
    throw error; // Бросаем ошибку, чтобы она обрабатывалась в вызывающем коде
  }
}

const exportToExcel = async (req, res) => {
  try {
    const data = await getDataForExport(req.query);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Журнал Заключений');

    worksheet.columns = [
      { header: 'Регистрационный номер', key: 'registration_number', width: 25 },
      { header: 'Статус документа', key: 'status', width: 20 },
      { header: 'Регион', key: 'region', width: 20 },
      { header: 'Дата создания', key: 'creation_date', width: 25 },
      { header: 'ИИН вызываемого', key: 'ИИН_вызываемого', width: 20 },
      { header: 'Номер УД', key: 'case_number', width: 20 },
      { header: 'ФИО согласующего', key: 'approver_name', width: 25 },
    ];

    data.forEach((item) => {
      worksheet.addRow(item);
    });

    const filename = sanitizeFilename('Отчет_Журнал_Заключений.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    await workbook.xlsx.write(res); // Пишем файл в ответ
    res.end(); // Завершаем поток
  } catch (error) {
    console.error('Ошибка экспорта в Excel:', error.message);
    res.status(500).json({ message: 'Ошибка экспорта в Excel', error: error.message });
  }
};







// Export to PDF
const exportToPdf = async (req, res) => {
  try {
    const data = await getDataForExport(req.query); // Получаем данные для экспорта

    const pdfDoc = new PDFDocument();
    const filename = sanitizeFilename('Отчет_Журнал_Заключений.pdf'); // Генерация корректного имени файла


       // Указываем путь к шрифту
       const fontPath = path.resolve(__dirname, 'Roboto-Regular.ttf');
       pdfDoc.font(fontPath); // Устанавливаем шрифт для документа

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    pdfDoc.pipe(res); // Генерируем PDF в поток
    pdfDoc.text('Журнал Заключений', { align: 'center' });

    // Добавляем данные в PDF
    data.forEach((item) => {
      pdfDoc.text(`Регистрационный номер: ${item.registration_number}`);
      pdfDoc.text(`Статус документа: ${item.status}`);
      pdfDoc.text(`Регион: ${item.region}`);
      pdfDoc.text(`Дата создания: ${item.creation_date}`);
      pdfDoc.text(`ИИН вызываемого: ${item.ИИН_вызываемого}`);
      pdfDoc.text(`Номер УД: ${item.case_number}`);
      pdfDoc.text(`ФИО согласующего: ${item.approver_name}`);
      pdfDoc.moveDown();
    });

    pdfDoc.end(); // Завершаем генерацию PDF
  } catch (error) {
    console.error('Ошибка экспорта в PDF:', error.message);
    res.status(500).json({ message: 'Ошибка экспорта в PDF', error: error.message });
  }
};



module.exports = { 
  createCard, 
  createCardWithFixedStatus, 
  getCardById, 
  updateCard, 
  approveCard, 
  getCards,
  checkCallHistory,
  markCardForRevision,
  exportToExcel,
  exportToPdf
};


