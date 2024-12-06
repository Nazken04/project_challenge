const mongoose = require('mongoose');
const Counter = require('./counterModel'); // Ensure the Counter model is required correctly

// Define the card schema
const CardSchema = new mongoose.Schema({
  registration_number: { type: String, required: true },
  creation_date: { type: Date, default: Date.now },
  case_number: { type: String, required: true },
  статья: { type: String },
  решение: { type: String },
  фабула: { type: String },
  ИИН_вызываемого: { type: String, required: true },
  ФИО_вызываемого: { type: String },
  должность_вызываемого: { type: String },
  БИН_ИИН: { type: String, required: true },
  место_работы: { type: String },
  регион: { type: String },
  планируемые_следственные_действия: { type: String, required: true },
  дата_и_время_проведения: { type: Date },
  место_проведения: { type: String },
  следователь: { type: String, required: true },
  статус_по_делу: { type: String },
  отношение_к_событию: { type: String },
  виды_следствия: { type: String },
  относится_ли_к_бизнесу: { type: String },
  ИИН_защитника: { type: String },
  ФИО_защитника: { type: String },
  обоснование: { type: String, required: true },
  результат: { type: String, required: true },
  approval_path: [
    {
      position: { type: String, required: true },
      name: { type: String, required: true },
      approval_status: { type: String, required: true },
      approval_time: { type: Date, default: Date.now },
    },
  ],
  status: { type: String, enum: ['В работе', 'На согласовании', 'Согласовано'], default: 'В работе' },
});

// Pre-save middleware to generate registration number
CardSchema.pre('save', async function (next) {
  if (this.isNew) {
    try {
      // Fetch and increment the counter for registration number
      const counter = await Counter.findOneAndUpdate(
        { _id: 'registrationNumber' },
        { $inc: { sequence_value: 1 } },
        { new: true, upsert: true }
      );

      // Ensure the counter value is valid and incremented
      if (!counter || !counter.sequence_value) {
        throw new Error('Failed to increment sequence value');
      }

      // Generate the registration number from the counter's sequence_value
      const seqNumber = String(counter.sequence_value).padStart(3, '0');
      this.registration_number = `Z-${seqNumber}`;

      console.log('Generated registration number:', this.registration_number);

      next();
    } catch (error) {
      console.error('Error generating registration number:', error);
      next(error); // Pass the error to the next middleware or callback
    }
  } else {
    next();
  }
});

// Remove or modify the unique index for registration_number
// If you don't need uniqueness anymore, remove the line below
// No 'unique: true'

// Create the Card model from the schema
const Card = mongoose.model('Card', CardSchema);

module.exports = Card;
