const express = require('express');
const morgan = require('morgan');
const methodOverride = require('method-override');
const dotenv = require('dotenv');
const cors = require('cors');
const app = express();
const route = require('./routes');
const db = require('./config/db');

// Load biến môi trường
dotenv.config();

// Kết nối DB
db.connect();

// Cấu hình CORS đặt TRƯỚC routes
const allowedOrigins = [
  'http://localhost:5173',        // Web dev
  'http://localhost:8081',        // Metro bundler
  'http://192.168.1.*:*',         // IP local network (thay * bằng số cụ thể)
  'http://10.0.2.2:3000',         // Android emulator to localhost
  'http://localhost:3000',        // Localhost
];

app.use(cors({
  origin: function (origin, callback) {
    // Cho phép requests không có origin (như mobile apps, Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.some(allowedOrigin => {
      return origin.startsWith(allowedOrigin.replace('*', ''));
    })) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(morgan('combined'));

// Mailer
const mailer = require('./config/mailer/mailer');
app.set('transporter', mailer);

// Khởi tạo routes
route(app);

// Port
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Ứng dụng đang chạy trên cổng ${PORT}`);
});
