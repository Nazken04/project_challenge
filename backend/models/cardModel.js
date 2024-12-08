const mongoose = require('mongoose');
const Counter = require('./counterModel');
const Cases = require('./casesModel');
const IinFio = require('./iinFioModel');
const Work = require('./workModel');
const Position = require('./position');  // Подключаем модель для должности
const Region = require('./region');  // Подключаем модель для региона


// Определение схемы карточки
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
  время_ухода: { type: Date }, 
  место_проведения: { type: String },
  следователь: { type: String, required: true },
  статус_по_делу: { type: String },
  отношение_к_событию: { type: String },
  виды_следствия: { type: String },
  относится_ли_к_бизнесу: { type: String },
  ИИН_защитника: { type: String },
  ФИО_защитника: { type: String },
  БИН_ИИН_пенсионка: { type: String },
  место_работы_пенсионка: { type: String },
  обоснование: { type: String, required: true },
  результат: { type: String, required: true },
  ФИО_согласующего: { type: String },
  approval_path: [
    {
      position: { type: String, required: true },
      name: { type: String, required: true },
      approval_status: { type: String, required: true },
      approval_time: { type: Date, default: Date.now },
    },
  ],
  status: { type: String, enum: ['В работе', 'На согласовании', 'Согласовано', 'Отправлено на доработку'], default: 'В работе' },
});

// Пре-сохранение для генерации регистрационного номера и автозаполнения данных
CardSchema.pre('save', async function (next) {
  if (this.isNew) {
    try {
      // Генерация регистрационного номера
      const counter = await Counter.findOneAndUpdate(
        { _id: 'registrationNumber' },
        { $inc: { sequence_value: 1 } },
        { new: true, upsert: true }
      );
      if (!counter || !counter.sequence_value) {
        throw new Error('Не удалось инкрементировать счетчик');
      }
      const seqNumber = String(counter.sequence_value).padStart(3, '0');
      this.registration_number = `Z-${seqNumber}`;

      // Подтягиваем данные из коллекций по номеру дела и ИИН
      const caseData = await Cases.findOne({ case_number: this.case_number });
      if (caseData) {
        this.статья = caseData.статья;
        this.решение = caseData.решение;
        this.фабула = caseData.фабула;
      }

      const iinData = await IinFio.findOne({ iin: this.ИИН_вызываемого });
      if (iinData) {
        this.ФИО_вызываемого = iinData.full_name;
      }

      // Проверка, если БИН_ИИН существует, ищем в коллекции Work по ИИН или БИН
      const searchQuery = { iin: this.БИН_ИИН }; // Начнем с ИИН, если его нет - ищем по БИН
      let workData = await Work.findOne(searchQuery);

      if (!workData && this.БИН_ИИН.length === 12) {
        // Если ИИН не найден, пробуем найти по БИН
        workData = await Work.findOne({ bin: this.БИН_ИИН });
      }

      if (workData) {
        this.место_работы = workData.workplace;
      }


      next();
    } catch (error) {
      console.error('Ошибка автозаполнения данных:', error);
      next(error); // Передаем ошибку в следующий middleware
    }
  } else {
    next();
  }
});




const Card = mongoose.model('Card', CardSchema);

module.exports = Card
