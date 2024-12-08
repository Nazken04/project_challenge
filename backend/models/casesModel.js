const mongoose = require('mongoose');

// Определяем схему для коллекции "cases"
const caseSchema = new mongoose.Schema({
  case_number: { type: String, required: true },  // Номер дела
  registration_date: { type: Date, required: true },  // Дата регистрации
  criminal_code_article: { type: String, required: true },  // Статья УК Казахстана
  case_decision: { type: String, required: true },  // Решение по делу
  case_summary: { type: String, required: true },  // Краткая фабула
});

// Создаем модель, связав её с коллекцией "cases"
const Case = mongoose.model('Case', caseSchema, 'cases');

module.exports = Case;
