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

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
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
