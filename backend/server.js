require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { initDB } = require('./src/config/db');
const { initSocket } = require('./src/socket');

// Routes
const authRoutes = require('./src/routes/authRoutes');
const taskRoutes = require('./src/routes/taskRoutes');
const activityRoutes = require('./src/routes/activityRoutes');
const userRoutes = require('./src/routes/userRoutes');

const app = express();
const httpServer = http.createServer(app);

// ─── Socket.io Init ───────────────────────────────────────────
initSocket(httpServer);

// ─── Security Middleware ──────────────────────────────────────
app.use(helmet());

// ─── CORS ─────────────────────────────────────────────────────
const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5173',
    'http://localhost:4173',
];

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (mobile apps, Postman, etc.)
            if (!origin) return callback(null, true);
            if (allowedOrigins.includes(origin)) return callback(null, true);
            // Allow any Vercel deployment
            if (origin.endsWith('.vercel.app')) return callback(null, true);
            return callback(new Error(`CORS blocked: ${origin}`));
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    })
);

// ─── Body Parsing ─────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Logging ──────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
}

// ─── Health Check ─────────────────────────────────────────────
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        message: 'Smart Task Manager API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
    });
});

// ─── API Routes ───────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/users', userRoutes);

// ─── 404 Handler ──────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.originalUrl} not found`,
    });
});

// ─── Global Error Handler ─────────────────────────────────────
app.use((err, req, res, next) => {
    console.error('Global Error:', err);

    // CORS error
    if (err.message && err.message.startsWith('CORS blocked')) {
        return res.status(403).json({ success: false, message: err.message });
    }

    // JWT error
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Token expired' });
    }

    // Validation error
    if (err.name === 'ValidationError') {
        return res.status(400).json({ success: false, message: err.message });
    }

    // PostgreSQL unique violation
    if (err.code === '23505') {
        return res.status(409).json({
            success: false,
            message: 'Record already exists',
            detail: err.detail,
        });
    }

    // Default server error
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
});

// ─── Start Server ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // Initialize DB tables first
        await initDB();

        httpServer.listen(PORT, () => {
            console.log(`\n Server running on port ${PORT}`);
            console.log(` Environment: ${process.env.NODE_ENV}`);
            console.log(`Health check: http://localhost:${PORT}/health\n`);
        });
    } catch (err) {
        console.error('Failed to start server:', err.message);
        process.exit(1);
    }
};

startServer();