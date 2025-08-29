const express = require('express');
const morgan = require('morgan');
const methodOverride = require('method-override');
const dotenv = require('dotenv');
const cors = require('cors');
const route = require('./routes');
const db = require('./config/db');

// Load biến môi trường
dotenv.config();

// Kết nối DB
db.connect();

const app = express();

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

// Xuất app để dùng cho test
module.exports = app;
