const { query } = require('../config/db');

// ─── GET Activity Logs for a Task ─────────────────────────────
const getTaskActivities = async (req, res, next) => {
    try {
        const { taskId } = req.params;
        const { page = 1, limit = 20 } = req.query;

        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
        const offset = (pageNum - 1) * limitNum;

        // Check task exists
        const taskCheck = await query('SELECT id, created_by FROM tasks WHERE id = $1', [taskId]);
        if (taskCheck.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        const countResult = await query(
            'SELECT COUNT(*) FROM activity_logs WHERE task_id = $1',
            [taskId]
        );

        const result = await query(
            `SELECT
        al.id, al.action, al.old_value, al.new_value, al.created_at,
        u.id AS user_id, u.name AS user_name, u.email AS user_email, u.role AS user_role
       FROM activity_logs al
       JOIN users u ON al.user_id = u.id
       WHERE al.task_id = $1
       ORDER BY al.created_at DESC
       LIMIT $2 OFFSET $3`,
            [taskId, limitNum, offset]
        );

        const total = parseInt(countResult.rows[0].count);

        res.status(200).json({
            success: true,
            data: {
                activities: result.rows,
                pagination: {
                    total,
                    page: pageNum,
                    limit: limitNum,
                    totalPages: Math.ceil(total / limitNum),
                },
            },
        });
    } catch (err) {
        next(err);
    }
};

// ─── GET All Recent Activities (Admin only) ───────────────────
const getAllActivities = async (req, res, next) => {
    try {
        const { page = 1, limit = 20 } = req.query;

        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
        const offset = (pageNum - 1) * limitNum;

        const countResult = await query('SELECT COUNT(*) FROM activity_logs');

        const result = await query(
            `SELECT
        al.id, al.action, al.old_value, al.new_value, al.created_at,
        al.task_id,
        t.title AS task_title,
        u.id AS user_id, u.name AS user_name, u.email AS user_email
       FROM activity_logs al
       JOIN users u ON al.user_id = u.id
       JOIN tasks t ON al.task_id = t.id
       ORDER BY al.created_at DESC
       LIMIT $1 OFFSET $2`,
            [limitNum, offset]
        );

        const total = parseInt(countResult.rows[0].count);

        res.status(200).json({
            success: true,
            data: {
                activities: result.rows,
                pagination: {
                    total,
                    page: pageNum,
                    limit: limitNum,
                    totalPages: Math.ceil(total / limitNum),
                },
            },
        });
    } catch (err) {
        next(err);
    }
};

module.exports = { getTaskActivities, getAllActivities };