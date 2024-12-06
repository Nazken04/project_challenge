require('dotenv').config();

module.exports = {
  MONGO_URI: process.env.MONGO_URI || 'mongodb+srv://koblanovanazken:89T7XqrAhXuPrWlf@cluster0.tktge.mongodb.net/',
  JWT_SECRET: process.env.JWT_SECRET || 'BUTTER',
  SECRET_KEY: process.env.SECRET_KEY || 'LALALA',
  JWT_EXPIRATION: process.env.JWT_EXPIRATION || '1h', // срок действия токена
  BCRYPT_SALT_ROUNDS: process.env.BCRYPT_SALT_ROUNDS || 10, // для bcrypt
};
