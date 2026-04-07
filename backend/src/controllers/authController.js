const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/db');
const { validationResult } = require('express-validator');

// ─── Helpers ──────────────────────────────────────────────────

const generateAccessToken = (userId, role) => {
    return jwt.sign({ userId, role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    });
};

const generateRefreshToken = () => uuidv4();

const saveRefreshToken = async (userId, token) => {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await query(
        `INSERT INTO refresh_tokens (user_id, token, expires_at)
     VALUES ($1, $2, $3)`,
        [userId, token, expiresAt]
    );
};

// ─── Register ─────────────────────────────────────────────────

const register = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array(),
            });
        }

        const { name, email, password, role } = req.body;

        // Check existing user
        const existing = await query('SELECT id FROM users WHERE email = $1', [
            email.toLowerCase(),
        ]);

        if (existing.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Email already registered',
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Only allow admin role if explicitly set AND no admin exists yet
        let assignedRole = 'user';
        if (role === 'admin') {
            const adminCheck = await query(
                "SELECT id FROM users WHERE role = 'admin' LIMIT 1"
            );
            if (adminCheck.rows.length === 0) {
                assignedRole = 'admin'; // First user becomes admin
            }
        }

        // Create user
        const result = await query(
            `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, created_at`,
            [name.trim(), email.toLowerCase(), hashedPassword, assignedRole]
        );

        const user = result.rows[0];

        // Generate tokens
        const accessToken = generateAccessToken(user.id, user.role);
        const refreshToken = generateRefreshToken();
        await saveRefreshToken(user.id, refreshToken);

        res.status(201).json({
            success: true,
            message: 'Account created successfully',
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    createdAt: user.created_at,
                },
                accessToken,
                refreshToken,
            },
        });
    } catch (err) {
        next(err);
    }
};

// ─── Login ────────────────────────────────────────────────────

const login = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array(),
            });
        }

        const { email, password } = req.body;

        // Find user
        const result = await query(
            'SELECT id, name, email, password, role, is_active FROM users WHERE email = $1',
            [email.toLowerCase()]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
        }

        const user = result.rows[0];

        if (!user.is_active) {
            return res.status(403).json({
                success: false,
                message: 'Account deactivated. Contact administrator.',
            });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
        }

        // Generate tokens
        const accessToken = generateAccessToken(user.id, user.role);
        const refreshToken = generateRefreshToken();
        await saveRefreshToken(user.id, refreshToken);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
                accessToken,
                refreshToken,
            },
        });
    } catch (err) {
        next(err);
    }
};

// ─── Refresh Token ────────────────────────────────────────────

const refreshToken = async (req, res, next) => {
    try {
        const { refreshToken: token } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Refresh token is required',
            });
        }

        // Find token in DB
        const result = await query(
            `SELECT rt.*, u.id as user_id, u.role, u.is_active
       FROM refresh_tokens rt
       JOIN users u ON rt.user_id = u.id
       WHERE rt.token = $1`,
            [token]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid refresh token',
            });
        }

        const tokenData = result.rows[0];

        // Check expiry
        if (new Date() > new Date(tokenData.expires_at)) {
            await query('DELETE FROM refresh_tokens WHERE token = $1', [token]);
            return res.status(401).json({
                success: false,
                message: 'Refresh token expired. Please login again.',
            });
        }

        if (!tokenData.is_active) {
            return res.status(403).json({
                success: false,
                message: 'Account deactivated',
            });
        }

        // Rotate refresh token
        await query('DELETE FROM refresh_tokens WHERE token = $1', [token]);
        const newRefreshToken = generateRefreshToken();
        await saveRefreshToken(tokenData.user_id, newRefreshToken);

        const newAccessToken = generateAccessToken(tokenData.user_id, tokenData.role);

        res.status(200).json({
            success: true,
            message: 'Token refreshed',
            data: {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
            },
        });
    } catch (err) {
        next(err);
    }
};

// ─── Logout ───────────────────────────────────────────────────

const logout = async (req, res, next) => {
    try {
        const { refreshToken: token } = req.body;

        if (token) {
            await query('DELETE FROM refresh_tokens WHERE token = $1', [token]);
        }

        res.status(200).json({
            success: true,
            message: 'Logged out successfully',
        });
    } catch (err) {
        next(err);
    }
};

// ─── Get Me ───────────────────────────────────────────────────

const getMe = async (req, res, next) => {
    try {
        const result = await query(
            'SELECT id, name, email, role, is_active, created_at FROM users WHERE id = $1',
            [req.user.id]
        );

        res.status(200).json({
            success: true,
            data: { user: result.rows[0] },
        });
    } catch (err) {
        next(err);
    }
};

module.exports = { register, login, refreshToken, logout, getMe };