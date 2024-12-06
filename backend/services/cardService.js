const mongoose = require('mongoose');
const Card = require('../models/cardModel');
const User = require('../models/userModel');
const Counter = require('../models/counterModel');  // Assuming there's a counter model to track sequences

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


// Helper function to fetch auto-populated data
async function fetchAutoPopulatedData(caseNumber, ИИН_вызываемого, ИИН_защитника) {
  // Simulated logic for fetching additional data (should be replaced by actual DB queries or external API calls)
  const caseData = {
    статья: 'Статья УК 123',
    решение: 'Решение по делу 456',
    фабула: 'Краткая фабула дела',
  };

  const вызываемыйData = {
    ФИО_вызываемого: 'Иванов Иван Иванович',
    должность_вызываемого: 'Директор',
    место_работы: 'Компания ABC',
    регион: 'Москва',
  };

  const защитникData = {
    ФИО_защитника: 'Петров Петр Петрович',
  };

  return {
    ...caseData,
    ...вызываемыйData,
    ...защитникData,
  };
}

// Function to get investigator name from the User model
async function getInvestigatorName(userId) {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('Следователь не найден');
  }
  return user.name;
}

// Function to create a new card
async function createCard(cardData, investigatorName) {
    const {
      case_number,
      ИИН_вызываемого,
      БИН_ИИН,
      планируемые_следственные_действия,
      дата_и_время_проведения,
      место_проведения,
      статус_по_делу,
      отношение_к_событию,
      виды_следствия,
      относится_ли_к_бизнесу,
      ИИН_защитника,
      обоснование,
      результат,
    } = cardData;
  
    // Validate required fields
    if (!case_number || case_number.length !== 15) {
      throw new Error('Номер УД обязателен и должен содержать 15 цифр');
    }
    if (!ИИН_вызываемого || ИИН_вызываемого.length !== 12) {
      throw new Error('ИИН вызываемого обязателен и должен содержать 12 цифр');
    }
    if (!БИН_ИИН || БИН_ИИН.length !== 12) {
      throw new Error('БИН/ИИН обязателен и должен содержать 12 цифр');
    }
  
    // Auto-generate registration number and fetch additional data
    const registrationNumber = await generateRegistrationNumber();
    console.log("Generated Registration Number:", registrationNumber);
    
    if (!registrationNumber) {
        throw new Error('Generated registration number is invalid');
    }
    
    const autoFetchedData = await fetchAutoPopulatedData(case_number, ИИН_вызываемого, ИИН_защитника);

    const newCard = new Card({
      registration_number: registrationNumber,
      creation_date: new Date(),
      case_number,
      ИИН_вызываемого,
      ФИО_вызываемого: autoFetchedData.ФИО_вызываемого,
      должность_вызываемого: autoFetchedData.должность_вызываемого,
      БИН_ИИН,
      место_работы: autoFetchedData.место_работы,
      регион: autoFetchedData.регион,
      планируемые_следственные_действия,
      дата_и_время_проведения,
      место_проведения,
      следователь: investigatorName, // Use the investigator's name here
      статус_по_делу,
      отношение_к_событию,
      виды_следствия,
      относится_ли_к_бизнесу,
      ИИН_защитника,
      ФИО_защитника: autoFetchedData.ФИО_защитника,
      обоснование,
      результат,
      status: 'В работе', // Default status for new cards
    });
  
    await newCard.save();
    return newCard;
}

// Fetch card by ID
async function getCardById(cardId) {
    const card = await Card.findById(cardId).populate('следователь', 'name email role'); // Populate fields of the investigator
    if (!card) {
      throw new Error('Карточка не найдена');
    }
    return card;
}

// Update card information
async function updateCard(cardId, updatedData) {
    const card = await Card.findById(cardId);
    if (!card) {
      throw new Error('Карточка не найдена');
    }
  
    Object.assign(card, updatedData);
    await card.save();
    return card;
}

// Approve card functionality
async function approveCard(cardId, approvalData) {
    const card = await Card.findById(cardId);
    if (!card) {
      throw new Error('Карточка не найдена');
    }
  
    // Ensure approval_path is an array
    if (!Array.isArray(card.approval_path)) {
      card.approval_path = [];  // Initialize an empty array if not present
    }
  
    // Add approval data
    card.approval_path.push({
      position: approvalData.position,
      name: approvalData.name,
      approval_status: approvalData.approval_status,
    });
  
    // Update the status based on approval
    card.status = approvalData.approval_status;
  
    await card.save();
    return card;
}

// Retrieve all cards with filtering options
async function getCards(filters) {
    const { status, region, case_number } = filters;
    const query = {};
  
    if (status) query.status = status;
    if (region) query.region = region;
    if (case_number) query.case_number = case_number;
  
    const cards = await Card.find(query).populate('следователь', 'name email role');  // Populate investigator details
    return cards;
}

module.exports = { 
    createCard, 
    getCardById, 
    updateCard, 
    approveCard, 
    getCards 
};
