require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const { errorHandler } = require('./middlewares/errorMiddleware');
const { initCronJobs } = require('./cron/cronJobs');
const seedSuperAdmin = require('./scripts/seedSuperAdmin');
const authRoutes = require('./routes/authRoutes');
const superAdminRoutes = require('./routes/superAdminRoutes');
const hrAdminRoutes = require('./routes/hrAdminRoutes');
const employeeRoutes = require('./routes/employeeRoutes');

const app = express();
const PORT = Number(process.env.PORT) || 3001;
app.set("trust proxy", 1);

// Build the allowlist from env. Supports comma-separated origins if you
// ever need more than one (e.g. prod + a preview URL).
const allowedOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((url) => url.trim().replace(/\/$/, '')) // strip trailing slash
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // allow requests with no origin (curl, server-to-server, mobile apps)
    if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ''))) {
      callback(null, true);
    } else {
      console.warn('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

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

app.get('/', (req, res) => res.json({ message: 'WORKMATE Backend API' }));

// Explicit OPTIONS handler for all routes
app.options('*', cors(corsOptions));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/super-admin', superAdminRoutes);
app.use('/api/v1/hr-admin', hrAdminRoutes);
app.use('/api/v1/employee', employeeRoutes);

const { notFound } = require('./middlewares/errorMiddleware');
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, async () => {
  console.log(`WORKMATE backend started on ${PORT}`);
  
  // Seed super admin if not exists
  try {
    await seedSuperAdmin();
  } catch (error) {
    console.error('Failed to seed super admin:', error);
  }
  
  initCronJobs();
});