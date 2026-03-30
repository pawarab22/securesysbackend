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
const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(o => o.trim()) : [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://[::1]:3000',
    'http://localhost:5000',
    'http://127.0.0.1:5000',
    'http://[::1]:5000'
];

const isLoopbackOrigin = (origin) => {
    if (!origin) return false;
    try {
        const { hostname } = new URL(origin);

        return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
    } catch (err) {
        return false;
    }
};

app.use(cors({
    origin: (origin, callback) => {
        // Allow mobile apps, server-to-server, and no-origin tools (curl/postman)
        if (!origin || allowedOrigins.includes(origin) || isLoopbackOrigin(origin)) {
            callback(null, true);
        } else {
            callback(new Error('CORS policy forbids this origin.'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
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
