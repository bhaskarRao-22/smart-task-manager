const express = require('express');
const router = express.Router();
const {
    getAllUsers,
    getUserById,
    updateUser,
    toggleUserStatus,
} = require('../controllers/userController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { generalLimiter } = require('../middleware/rateLimiter');

router.use(authenticate);
router.use(generalLimiter);

// GET    /api/users           — Get all users (Admin only)
router.get('/', authorize('admin'), getAllUsers);

// GET    /api/users/:id       — Get single user
router.get('/:id', getUserById);

// PUT    /api/users/:id       — Update user (self or admin)
router.put('/:id', updateUser);

// PATCH  /api/users/:id/toggle-status  — Toggle active status (Admin only)
router.patch('/:id/toggle-status', authorize('admin'), toggleUserStatus);

module.exports = router;