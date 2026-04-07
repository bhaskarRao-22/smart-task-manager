const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
    getAllTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    summarizeTaskAI,
} = require('../controllers/taskController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { generalLimiter, aiLimiter } = require('../middleware/rateLimiter');

// All task routes require authentication
router.use(authenticate);
router.use(generalLimiter);

// ─── Validation Rules ─────────────────────────────────────────

const createTaskValidation = [
    body('title')
        .trim()
        .notEmpty().withMessage('Title is required')
        .isLength({ min: 3, max: 255 }).withMessage('Title must be 3-255 characters'),

    body('description')
        .optional()
        .trim()
        .isLength({ max: 5000 }).withMessage('Description max 5000 characters'),

    body('status')
        .optional()
        .isIn(['todo', 'in_progress', 'review', 'done'])
        .withMessage('Invalid status value'),

    body('priority')
        .optional()
        .isIn(['low', 'medium', 'high', 'urgent'])
        .withMessage('Invalid priority value'),

    body('assigned_to')
        .optional()
        .isUUID().withMessage('assigned_to must be a valid user ID'),

    body('due_date')
        .optional()
        .isISO8601().withMessage('due_date must be a valid date'),
];

const updateTaskValidation = [
    body('title')
        .optional()
        .trim()
        .isLength({ min: 3, max: 255 }).withMessage('Title must be 3-255 characters'),

    body('description')
        .optional()
        .trim()
        .isLength({ max: 5000 }).withMessage('Description max 5000 characters'),

    body('status')
        .optional()
        .isIn(['todo', 'in_progress', 'review', 'done'])
        .withMessage('Invalid status value'),

    body('priority')
        .optional()
        .isIn(['low', 'medium', 'high', 'urgent'])
        .withMessage('Invalid priority value'),

    body('assigned_to')
        .optional({ nullable: true })
        .isUUID().withMessage('assigned_to must be a valid user ID'),

    body('due_date')
        .optional({ nullable: true })
        .isISO8601().withMessage('due_date must be a valid date'),
];

// ─── Routes ───────────────────────────────────────────────────

// GET  /api/tasks         — Get all tasks (with filters/sort/pagination)
router.get('/', getAllTasks);

// GET  /api/tasks/:id     — Get single task
router.get('/:id', getTaskById);

// POST /api/tasks         — Create task
router.post('/', createTaskValidation, createTask);

// PUT  /api/tasks/:id     — Update task
router.put('/:id', updateTaskValidation, updateTask);

// DELETE /api/tasks/:id   — Delete task (admin or owner)
router.delete('/:id', deleteTask);

// POST /api/tasks/:id/summarize  — AI summarize (rate limited)
router.post('/:id/summarize', aiLimiter, summarizeTaskAI);

module.exports = router;