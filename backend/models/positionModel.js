const mongoose = require('mongoose');

const PositionSchema = new mongoose.Schema({
  name: { type: String, required: true },
});

const Position = mongoose.model('Position', PositionSchema);

module.exports = Position;
