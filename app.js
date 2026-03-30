const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes');
const noteRoutes = require('./routes/noteRoutes');
const { errorHandler } = require('./middlewares/errorMiddleware');
const logger = require('./utils/logger');

const app = express();


// Security Middlewares
app.use((req, res, next) => { console.log('1. Reached Helmet'); next(); });
app.use(helmet());
app.use((req, res, next) => { console.log('2. Reached CORS'); next(); });
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key']
}));

app.use((req, res, next) => { console.log('3. Reached express.json'); next(); });
// Request payload parsing
app.use(express.json({ limit: '1mb' }));
app.use((req, res, next) => { console.log('4. Reached express.urlencoded'); next(); });
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.use((req, res, next) => { console.log('5. Reached Morgan'); next(); });
// Logging
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

app.use((req, res, next) => { console.log('6. Reached RateLimit'); next(); });

// Rate Limiting
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100, // Limit each IP to 100 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests from this IP, please try again later.' }
});
app.use('/api/', apiLimiter);

app.use((req, res, next) => { console.log('7. Reached Routes'); next(); });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);

// Generic 404
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Global Error Handler
app.use(errorHandler);

module.exports = { app };
