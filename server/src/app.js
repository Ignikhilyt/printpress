const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const config = require('./config');
const routes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();

const rateLimit = require('express-rate-limit');

// Global Rate Limiter
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.',
    },
});

// HTTPS Enforcement in Production
if (config.nodeEnv === 'production') {
    app.set('trust proxy', 1);
    app.use((req, res, next) => {
        if (req.header('x-forwarded-proto') !== 'https') {
            res.redirect(301, `https://${req.header('host')}${req.url}`);
        } else {
            next();
        }
    });
}

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(compression()); // Gzip compression
app.use(globalLimiter);

// CORS configuration for production
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, Postman, etc)
        if (!origin) return callback(null, true);

        // In production, check against allowed origins
        const allowedOrigins = [
            config.frontendUrl,
            'http://localhost:5173',
            'http://localhost:3000',
        ].filter(Boolean);

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: config.nodeEnv
    });
});

app.use(`/api/${config.apiVersion}`, routes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;