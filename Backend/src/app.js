const express = require('express');
const morgan = require('morgan');
const methodOverride = require('method-override');
const app = express();
const cors = require('cors');
const route = require('./routes');
const db = require('./config/db');

// Load biến môi trường

// Kết nối DB
db.connect();


app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));

// Middleware
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use(express.json({ limit: '20mb' }));
app.use(methodOverride('_method'));
app.use(morgan('combined'));

// Mailer
const mailer = require('./config/mailer/mailer');
app.set('transporter', mailer);

// Khởi tạo routes
route(app);

// Xuất app để dùng cho test
module.exports = app;
