const mongoose = require('mongoose');
const Card = require('../models/cardModel');
const User = require('../models/userModel');
const Counter = require('../models/counterModel');
const Cases = require('../models/casesModel');
const IinFio = require('../models/iinfioModel');
const Work = require('../models/workModel');
const Position = require('../models/position'); // Подключаем модель для должности
const Region = require('../models/region');

// Функция для генерации регистрационного номера
async function generateRegistrationNumber() {
    const counter = await Counter.findOneAndUpdate(
        { _id: 'registrationNumber' },
        { $inc: { sequence_value: 1 } },
        { new: true, upsert: true }
    );

    if (!counter || counter.sequence_value === undefined) {
        throw new Error('Failed to generate registration number');
    }

    const registrationNumber = `Z-${String(counter.sequence_value).padStart(3, '0')}`;
    return registrationNumber;
}

// Функция для автозаполнения данных
async function fetchAutoPopulatedData(номер_дела, ИИН_вызываемого, ИИН_защитника) {
  const caseData = await Cases.findOne({ номер_дела }); // Используем номер_дела вместо case_number
  if (!caseData) {
      throw new Error(`Не удалось найти данные по делу для номера ${номер_дела}`);
  }

  const вызываемыйData = await IinFio.findOne({ iin: ИИН_вызываемого });
  if (!вызываемыйData) {
      throw new Error(`Не удалось найти данные о вызываемом с ИИН ${ИИН_вызываемого}`);
  }

  const защитникData = await IinFio.findOne({ iin: ИИН_защитника });
  if (!защитникData) {
      throw new Error(`Не удалось найти данные о защитнике с ИИН ${ИИН_защитника}`);
  }

  const workData = await Work.findOne({ iin: ИИН_вызываемого });
  if (!workData) {
      throw new Error(`Не удалось найти данные о месте работы для ИИН ${ИИН_вызываемого}`);
  }

  return {
      статья: caseData.статья_ук_казахстана,
      решение: caseData.решение_по_делу,
      фабула: caseData.краткая_фабула,
      ФИО_вызываемого: вызываемыйData.full_name,
      место_работы: workData.workplace,
      ФИО_защитника: защитникData.full_name,
  };
}


// Функция для получения имени следователя
async function getInvestigatorName(userId) {
    if (!userId) {
        throw new Error('Не передан userId');
    }

    console.log('Ищем следователя с ID:', userId);  // Отладочная информация

    const user = await User.findById(userId);
    if (!user) {
        console.log('Следователь не найден с ID:', userId);  // Отладочная информация
        throw new Error('Следователь не найден');
    }
    return user.name;
}

// Функция для создания карточки
// Функция для создания карточки
async function createCard(cardData) {
  const {
      case_number,
      ИИН_вызываемого,
      БИН_ИИН,
      должность_вызываемого,
      регион,
      планируемые_следственные_действия,
      дата_и_время_проведения,
      время_ухода,
      место_проведения,
      статус_по_делу,
      отношение_к_событию,
      виды_следствия,
      относится_ли_к_бизнесу,
      ИИН_защитника,
      обоснование,
      результат,
      userId, // ID следователя добавлено сюда
      status, // Используем status из cardData
  } = cardData;

  // Проверка обязательных полей
  if (!case_number || case_number.length !== 15) {
      throw new Error('Номер УД обязателен и должен содержать 15 цифр');
  }
  if (!ИИН_вызываемого || ИИН_вызываемого.length !== 12) {
      throw new Error('ИИН вызываемого обязателен и должен содержать 12 цифр');
  }
  if (!БИН_ИИН || БИН_ИИН.length !== 12) {
      throw new Error('БИН/ИИН обязателен и должен содержать 12 цифр');
  }

  // Получаем имя следователя
  const investigatorName = await getInvestigatorName(userId);

  // Автозаполнение данных
  const populatedData = await fetchAutoPopulatedData(case_number, ИИН_вызываемого, ИИН_защитника);

  const registrationNumber = await generateRegistrationNumber();
  const newCard = new Card({
      registration_number: registrationNumber,
      creation_date: new Date(),
      case_number,
      ИИН_вызываемого,
      ФИО_вызываемого: populatedData.ФИО_вызываемого,
      должность_вызываемого,
      регион,
      БИН_ИИН,
      место_работы: populatedData.место_работы,
      планируемые_следственные_действия,
      дата_и_время_проведения,
      время_ухода,
      место_проведения,
      следователь: investigatorName,  // Передаем имя следователя сюда
      статус_по_делу,
      отношение_к_событию,
      виды_следствия,
      относится_ли_к_бизнесу,
      ИИН_защитника,
      ФИО_защитника: populatedData.ФИО_защитника,
      обоснование,
      результат,
      status: status || 'В работе',  // Используем статус из данных, если он передан
  });

  await newCard.save();
  return newCard;
}
// Функция для получения карточки по ID
async function getCardById(cardId, user) {
  const card = await Card.findById(cardId).populate('следователь', 'name email role');
  if (!card) {
      throw new Error('Карточка не найдена');
  }

  // Проверка роли пользователя
  if (user.role === 'Аналитик СД') {
      // Подтягиваем данные из пенсионных отчислений для БИН/ИИН
      let workData = await Work.findOne({ iin: card.БИН_ИИН });

      // Если данные по ИИН не найдены, ищем по БИН
      if (!workData) {
          workData = await Work.findOne({ bin: card.БИН_ИИН });
      }

      // Если данные все еще не найдены, бросаем ошибку
      if (!workData) {
          throw new Error(`Не удалось найти данные о месте работы для БИН/ИИН ${card.БИН_ИИН}`);
      }

      // Добавляем данные о БИН/ИИН и месте работы в карточку
      card.БИН_ИИН_пенсионка = card.БИН_ИИН;
      card.место_работы_пенсионка = workData.workplace;
  }

  // Если не аналитик, скрываем пенсионные данные
  if (user.role !== 'Аналитик СД') {
      card.БИН_ИИН_пенсионка = undefined;
      card.место_работы_пенсионка = undefined;
  }

  return card;
}



// Функция для обновления карточки
async function updateCard(cardId, updatedData) {
  const card = await Card.findById(cardId);
  if (!card) {
    throw new Error('Карточка не найдена');
  }

  // Обновляем только разрешенные поля
  Object.keys(updatedData).forEach((key) => {
    card[key] = updatedData[key];
  });

  await card.save();
  return card;
}


// Функция для утверждения карточки
async function approveCard(cardId, approvalData) {
    const card = await Card.findById(cardId);
    if (!card) {
        throw new Error('Карточка не найдена');
    }

    if (!Array.isArray(card.approval_path)) {
        card.approval_path = [];
    }

    card.approval_path.push({
        position: approvalData.position,
        name: approvalData.name,
        approval_status: approvalData.approval_status,
    });

    card.status = approvalData.approval_status;

    await card.save();
    return card;
}

// Функция для получения всех карточек с фильтрами
// Функция для получения всех карточек с фильтрами
async function getCards(filters) {
  const query = { ...filters }; // Получаем переданные фильтры

  const cards = await Card.find(query).populate('следователь', 'name email role');
  return cards;
}


async function getCallHistoryByIin(iin) {
  const cards = await Card.find({ ИИН_вызываемого: iin }, 'case_number следователь status creation_date время_ухода');
  if (!cards || cards.length === 0) {
    throw new Error(`История вызовов для ИИН ${iin} не найдена`);
  }

  return cards.map(card => ({
    case_number: card.case_number,
    called_by: card.следователь,
    call_status: card.status,
    arrival_time: card.creation_date, // Пример: используем дату создания как "время прихода"
    departure_time: card.время_ухода || null, // Если есть поле, подтягивайте его
  }));
}

module.exports = { 
    createCard, 
    getCardById, 
    updateCard, 
    approveCard, 
    getCards,
    getCallHistoryByIin 
};
