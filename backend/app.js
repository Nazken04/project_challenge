const express = require("express");
const connectDB = require("./config/db");
require("dotenv").config();
const cors = require("cors"); // Import CORS

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const cardRoutes = require("./routes/cardRoutes");
const Counter = require("./models/counterModel");
const app = express();
const PORT = 3350;

// Подключение к базе данных
connectDB();

// Middleware для обработки JSON
app.use(express.json());

// Enable CORS for frontend on port 5173
app.use(
  cors({
    origin: "http://localhost:5173", // Allow requests from your frontend
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Роуты
app.use("/api/auth", authRoutes); // Авторизация и регистрация
app.use("/api/user", userRoutes); // Пользовательские операции
app.use("/api/cards", cardRoutes); // Операции с карточками

const initializeCounter = async () => {
  try {
    // Try to find and update the counter document for 'registrationNumber'
    const counter = await Counter.findOneAndUpdate(
      { _id: "registrationNumber" },
      { $inc: { sequence_value: 1 } },
      { new: true, upsert: true }
    );

    if (counter) {
      console.log("Counter initialized or updated:", counter);
    } else {
      console.log("Failed to initialize counter.");
    }
  } catch (error) {
    console.error("Error initializing counter:", error);
  }
};

initializeCounter();

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
