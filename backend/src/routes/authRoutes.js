const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { register, login, refreshToken, logout, getMe } = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');

// ─── Validation Rules ─────────────────────────────────────────

const registerValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),

    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),

    body('role')
        .optional()
        .isIn(['admin', 'user']).withMessage('Role must be admin or user'),
];

const loginValidation = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('Password is required'),
];

// ─── Routes ───────────────────────────────────────────────────

// POST /api/auth/register
router.post('/register', authLimiter, registerValidation, register);

// POST /api/auth/login
router.post('/login', authLimiter, loginValidation, login);

// POST /api/auth/refresh
router.post('/refresh', refreshToken);

// POST /api/auth/logout
router.post('/logout', logout);

// GET /api/auth/me
router.get('/me', authenticate, getMe);

module.exports = router;