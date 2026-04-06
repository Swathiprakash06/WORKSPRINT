require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const { errorHandler } = require('./middlewares/errorMiddleware');
const { initCronJobs } = require('./cron/cronJobs');
const authRoutes = require('./routes/authRoutes');
const superAdminRoutes = require('./routes/superAdminRoutes');
const hrAdminRoutes = require('./routes/hrAdminRoutes');
const employeeRoutes = require('./routes/employeeRoutes');

const app = express();
const PORT = process.env.PORT || 3000;
app.set("trust proxy", 1);
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(helmet({
  crossOriginResourcePolicy: false,
  crossOriginOpenerPolicy: false
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1200, // 80 requests/minute -> 1200/15min for UI polling and small load
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

app.get('/', (req, res) => res.json({ message: 'WORKSPRINT Backend API' }));

// Explicit OPTIONS handler for all routes
app.options('*', cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/super-admin', superAdminRoutes);
app.use('/api/v1/hr-admin', hrAdminRoutes);
app.use('/api/v1/employee', employeeRoutes);

const { notFound } = require('./middlewares/errorMiddleware');
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`WORKSPRINT backend started on ${PORT}`);
  initCronJobs();
});
