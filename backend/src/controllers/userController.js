const { query } = require('../config/db');
const bcrypt = require('bcryptjs');

// ─── GET All Users (Admin only) ───────────────────────────────
const getAllUsers = async (req, res, next) => {
    try {
        const result = await query(
            `SELECT id, name, email, role, is_active, created_at
       FROM users
       ORDER BY created_at DESC`
        );

        res.status(200).json({
            success: true,
            data: { users: result.rows },
        });
    } catch (err) {
        next(err);
    }
};

// ─── GET Single User ──────────────────────────────────────────
const getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await query(
            'SELECT id, name, email, role, is_active, created_at FROM users WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({
            success: true,
            data: { user: result.rows[0] },
        });
    } catch (err) {
        next(err);
    }
};

// ─── UPDATE User (self or admin) ──────────────────────────────
const updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Only self or admin can update
        if (req.user.id !== id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const { name, password } = req.body;

        const updates = [];
        const params = [];
        let paramIndex = 1;

        if (name) { updates.push(`name = $${paramIndex++}`); params.push(name.trim()); }
        if (password) {
            const hashed = await bcrypt.hash(password, 12);
            updates.push(`password = $${paramIndex++}`);
            params.push(hashed);
        }

        if (updates.length === 0) {
            return res.status(400).json({ success: false, message: 'No fields to update' });
        }

        updates.push(`updated_at = NOW()`);
        params.push(id);

        const result = await query(
            `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex}
       RETURNING id, name, email, role, is_active`,
            params
        );

        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: { user: result.rows[0] },
        });
    } catch (err) {
        next(err);
    }
};

// ─── Toggle User Active Status (Admin only) ───────────────────
const toggleUserStatus = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (req.user.id === id) {
            return res.status(400).json({
                success: false,
                message: 'You cannot deactivate your own account',
            });
        }

        const existing = await query('SELECT id, is_active FROM users WHERE id = $1', [id]);
        if (existing.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const newStatus = !existing.rows[0].is_active;

        const result = await query(
            'UPDATE users SET is_active = $1, updated_at = NOW() WHERE id = $2 RETURNING id, name, email, is_active',
            [newStatus, id]
        );

        res.status(200).json({
            success: true,
            message: `User ${newStatus ? 'activated' : 'deactivated'} successfully`,
            data: { user: result.rows[0] },
        });
    } catch (err) {
        next(err);
    }
};

module.exports = { getAllUsers, getUserById, updateUser, toggleUserStatus };