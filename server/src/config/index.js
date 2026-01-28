require('dotenv').config();

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  apiVersion: process.env.API_VERSION || 'v1',
  databaseUrl: process.env.DATABASE_URL,
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 52428800,
    uploadDir: process.env.UPLOAD_DIR || 'uploads',
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  pricing: {
    paperTypes: {
      GSM_70: { name: '70 GSM', multiplier: 1.0 },
      GSM_80: { name: '80 GSM', multiplier: 1.15 },
      GSM_100: { name: '100 GSM', multiplier: 1.3 },
    },
    printTypes: {
      BLACK_WHITE: { name: 'Black & White', multiplier: 1.0 },
      COLOR: { name: 'Full Color', multiplier: 3.5 },
    },
    bindingTypes: {
      NONE: { name: 'No Binding', price: 0 },
      STAPLE: { name: 'Staple', price: 10 },
      SPIRAL: { name: 'Spiral', price: 40 },
      HARDCOVER: { name: 'Hardcover', price: 150 },
    },
    delivery: {
      STANDARD: { name: 'Standard (5-7 days)', price: 50 },
      EXPRESS: { name: 'Express (2-3 days)', price: 100 },
    },
  },
};