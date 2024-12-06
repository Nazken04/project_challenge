const cardService = require('../services/cardService');
const Counter = require('../models/counterModel');
const Card = require('../models/cardModel');

// Create a new card
const createCard = async (req, res) => {
  try {
    const investigatorName = req.user.name; // Extract the investigator name from the JWT token (this should be set in the auth middleware)
    
    // Get the next available number for the registration number
    const counter = await Counter.findOneAndUpdate(
      { _id: 'registrationNumber' }, // Ensure you're updating the counter specific to registration numbers
      { $inc: { sequence_value: 1 } }, // Increment the sequence value by 1
      { new: true, upsert: true } // Create the document if it doesn't exist
    );
    
    // Format the registration number (Z-001, Z-002, etc.)
    const registrationNumber = `Z-${String(counter.sequence_value).padStart(3, '0')}`;
    
    // Create a new card with the generated registration number and investigator name
    const cardData = {
      ...req.body,
      registration_number: registrationNumber,  // Add the generated registration number
      следователь: investigatorName  // Add the investigator name
    };
    
    const newCard = await cardService.createCard(req.body, investigatorName);
    const card = new Card(cardData);
    await card.save();
    
    res.status(201).json({ message: 'Карточка создана', card });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка создания карточки' });
  }
};

// Получение карточки по ID
const getCardById = async (req, res) => {
  try {
    const card = await cardService.getCardById(req.params.id);
    res.status(200).json(card);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Обновление карточки
const updateCard = async (req, res) => {
  try {
    const cardId = req.params.id;
    const updatedData = req.body;

    // Проверка ролей в контроллере
    if (updatedData.status && ['На согласовании', 'Согласовано'].includes(updatedData.status)) {
      if (!['Аналитик СД', 'Модератор'].includes(req.user.role)) {
        return res.status(403).json({ message: 'Доступ запрещен' });
      }
    }

    const updatedCard = await cardService.updateCard(cardId, updatedData);
    res.status(200).json({ message: 'Карточка успешно обновлена', card: updatedCard });
  } catch (error) {
    console.error('Error updating card:', error.message);
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

// Получение всех карточек с фильтрацией
const getCards = async (req, res) => {
  try {
    const cards = await cardService.getCards(req.query);
    res.status(200).json(cards);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { createCard, getCardById, updateCard, approveCard, getCards };
