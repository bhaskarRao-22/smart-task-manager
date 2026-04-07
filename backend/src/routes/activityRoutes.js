const express = require('express');
const router = express.Router();
const { getTaskActivities, getAllActivities } = require('../controllers/activityController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { generalLimiter } = require('../middleware/rateLimiter');

router.use(authenticate);
router.use(generalLimiter);

// GET /api/activities                  — All activities (Admin only)
router.get('/', authorize('admin'), getAllActivities);

// GET /api/activities/task/:taskId     — Activities for a specific task
router.get('/task/:taskId', getTaskActivities);

module.exports = router;