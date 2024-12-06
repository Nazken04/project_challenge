const mongoose = require('mongoose');

const BusinessStatusSchema = new mongoose.Schema({
  status: { type: String, enum: ['Да', 'Нет'], required: true },
});

const BusinessStatus = mongoose.model('BusinessStatus', BusinessStatusSchema);

module.exports = BusinessStatus;
