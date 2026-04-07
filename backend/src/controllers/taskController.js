const { query } = require('../config/db');
const { validationResult } = require('express-validator');
const { emitTaskUpdate } = require('../socket');
const { summarizeTask } = require('../services/aiService');
const { getCache, setCache, deleteCache, deleteCacheByPrefix } = require('../utils/cache');
const { isOwnerOrAdmin } = require('../middleware/roleMiddleware');

// ─── Helper: Log Activity ─────────────────────────────────────
const logActivity = async (taskId, userId, action, oldValue = null, newValue = null) => {
    try {
        await query(
            `INSERT INTO activity_logs (task_id, user_id, action, old_value, new_value)
       VALUES ($1, $2, $3, $4, $5)`,
            [
                taskId,
                userId,
                action,
                oldValue ? JSON.stringify(oldValue) : null,
                newValue ? JSON.stringify(newValue) : null,
            ]
        );
    } catch (err) {
        console.error('Activity log error:', err.message);
    }
};

// ─── Helper: Build filters ────────────────────────────────────
const buildFilterQuery = (filters, userId, role) => {
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    // Non-admin users only see their own or assigned tasks
    if (role !== 'admin') {
        conditions.push(`(t.created_by = $${paramIndex} OR t.assigned_to = $${paramIndex})`);
        params.push(userId);
        paramIndex++;
    }

    if (filters.status) {
        conditions.push(`t.status = $${paramIndex}`);
        params.push(filters.status);
        paramIndex++;
    }

    if (filters.priority) {
        conditions.push(`t.priority = $${paramIndex}`);
        params.push(filters.priority);
        paramIndex++;
    }

    if (filters.assigned_to) {
        conditions.push(`t.assigned_to = $${paramIndex}`);
        params.push(filters.assigned_to);
        paramIndex++;
    }

    if (filters.search) {
        conditions.push(
            `(t.title ILIKE $${paramIndex} OR t.description ILIKE $${paramIndex})`
        );
        params.push(`%${filters.search}%`);
        paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    return { whereClause, params, paramIndex };
};

// ─── GET All Tasks (with filters, sort, pagination) ───────────
const getAllTasks = async (req, res, next) => {
    try {
        const {
            status,
            priority,
            assigned_to,
            search,
            sort_by = 'created_at',
            sort_order = 'DESC',
            page = 1,
            limit = 10,
        } = req.query;

        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
        const offset = (pageNum - 1) * limitNum;

        // Whitelist sort fields
        const allowedSortFields = ['created_at', 'updated_at', 'title', 'priority', 'status', 'due_date'];
        const sortField = allowedSortFields.includes(sort_by) ? sort_by : 'created_at';
        const sortDir = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        // Cache key
        const cacheKey = `tasks_${req.user.id}_${JSON.stringify(req.query)}`;
        const cached = getCache(cacheKey);
        if (cached) {
            return res.status(200).json(cached);
        }

        const { whereClause, params, paramIndex } = buildFilterQuery(
            { status, priority, assigned_to, search },
            req.user.id,
            req.user.role
        );

        // Count query
        const countResult = await query(
            `SELECT COUNT(*) FROM tasks t ${whereClause}`,
            params
        );
        const total = parseInt(countResult.rows[0].count);

        // Data query
        const dataParams = [...params, limitNum, offset];
        const tasksResult = await query(
            `SELECT
        t.id, t.title, t.description, t.status, t.priority,
        t.due_date, t.ai_summary, t.created_at, t.updated_at,
        t.created_by, t.assigned_to,
        cb.name AS created_by_name, cb.email AS created_by_email,
        ab.name AS assigned_to_name, ab.email AS assigned_to_email
       FROM tasks t
       LEFT JOIN users cb ON t.created_by = cb.id
       LEFT JOIN users ab ON t.assigned_to = ab.id
       ${whereClause}
       ORDER BY t.${sortField} ${sortDir}
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
            dataParams
        );

        const response = {
            success: true,
            data: {
                tasks: tasksResult.rows,
                pagination: {
                    total,
                    page: pageNum,
                    limit: limitNum,
                    totalPages: Math.ceil(total / limitNum),
                    hasNext: pageNum < Math.ceil(total / limitNum),
                    hasPrev: pageNum > 1,
                },
            },
        };

        // Cache for 2 minutes
        setCache(cacheKey, response, 120);

        res.status(200).json(response);
    } catch (err) {
        next(err);
    }
};

// ─── GET Single Task ──────────────────────────────────────────
const getTaskById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const cacheKey = `task_${id}`;
        const cached = getCache(cacheKey);
        if (cached) {
            return res.status(200).json(cached);
        }

        const result = await query(
            `SELECT
        t.id, t.title, t.description, t.status, t.priority,
        t.due_date, t.ai_summary, t.created_at, t.updated_at,
        t.created_by, t.assigned_to,
        cb.name AS created_by_name, cb.email AS created_by_email,
        ab.name AS assigned_to_name, ab.email AS assigned_to_email
       FROM tasks t
       LEFT JOIN users cb ON t.created_by = cb.id
       LEFT JOIN users ab ON t.assigned_to = ab.id
       WHERE t.id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Task not found',
            });
        }

        const task = result.rows[0];

        // Check access
        if (!isOwnerOrAdmin(req.user, task.created_by) && req.user.id !== task.assigned_to) {
            return res.status(403).json({
                success: false,
                message: 'Access denied to this task',
            });
        }

        const response = { success: true, data: { task } };
        setCache(cacheKey, response, 120);

        res.status(200).json(response);
    } catch (err) {
        next(err);
    }
};

// ─── CREATE Task ──────────────────────────────────────────────
const createTask = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array(),
            });
        }

        const { title, description, status, priority, assigned_to, due_date } = req.body;

        const result = await query(
            `INSERT INTO tasks (title, description, status, priority, assigned_to, created_by, due_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
            [
                title.trim(),
                description?.trim() || null,
                status || 'todo',
                priority || 'medium',
                assigned_to || null,
                req.user.id,
                due_date || null,
            ]
        );

        const task = result.rows[0];

        // Log activity
        await logActivity(task.id, req.user.id, 'TASK_CREATED', null, {
            title: task.title,
            status: task.status,
            priority: task.priority,
        });

        // Invalidate cache
        deleteCacheByPrefix(`tasks_`);

        // Real-time emit
        emitTaskUpdate('task:created', {
            task,
            createdBy: { id: req.user.id, name: req.user.name },
        });

        res.status(201).json({
            success: true,
            message: 'Task created successfully',
            data: { task },
        });
    } catch (err) {
        next(err);
    }
};

// ─── UPDATE Task ──────────────────────────────────────────────
const updateTask = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array(),
            });
        }

        const { id } = req.params;

        // Get existing task
        const existing = await query('SELECT * FROM tasks WHERE id = $1', [id]);
        if (existing.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        const oldTask = existing.rows[0];

        // Check permission
        if (!isOwnerOrAdmin(req.user, oldTask.created_by)) {
            return res.status(403).json({
                success: false,
                message: 'You can only edit tasks you created',
            });
        }

        const { title, description, status, priority, assigned_to, due_date } = req.body;

        // Build dynamic update query
        const updates = [];
        const params = [];
        let paramIndex = 1;

        if (title !== undefined) { updates.push(`title = $${paramIndex++}`); params.push(title.trim()); }
        if (description !== undefined) { updates.push(`description = $${paramIndex++}`); params.push(description.trim()); }
        if (status !== undefined) { updates.push(`status = $${paramIndex++}`); params.push(status); }
        if (priority !== undefined) { updates.push(`priority = $${paramIndex++}`); params.push(priority); }
        if (assigned_to !== undefined) { updates.push(`assigned_to = $${paramIndex++}`); params.push(assigned_to || null); }
        if (due_date !== undefined) { updates.push(`due_date = $${paramIndex++}`); params.push(due_date || null); }

        if (updates.length === 0) {
            return res.status(400).json({ success: false, message: 'No fields to update' });
        }

        updates.push(`updated_at = NOW()`);
        params.push(id);

        const result = await query(
            `UPDATE tasks SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
            params
        );

        const updatedTask = result.rows[0];

        // Determine what changed
        const changes = {};
        const oldValues = {};
        ['title', 'description', 'status', 'priority', 'assigned_to', 'due_date'].forEach((field) => {
            if (req.body[field] !== undefined && req.body[field] !== oldTask[field]) {
                changes[field] = updatedTask[field];
                oldValues[field] = oldTask[field];
            }
        });

        // Log activity
        if (Object.keys(changes).length > 0) {
            const action = status && status !== oldTask.status ? `STATUS_CHANGED_TO_${status.toUpperCase()}` : 'TASK_UPDATED';
            await logActivity(id, req.user.id, action, oldValues, changes);
        }

        // Invalidate caches
        deleteCache(`task_${id}`);
        deleteCacheByPrefix(`tasks_`);

        // Real-time emit
        emitTaskUpdate('task:updated', {
            task: updatedTask,
            updatedBy: { id: req.user.id, name: req.user.name },
            changes,
        });

        res.status(200).json({
            success: true,
            message: 'Task updated successfully',
            data: { task: updatedTask },
        });
    } catch (err) {
        next(err);
    }
};

// ─── DELETE Task ──────────────────────────────────────────────
const deleteTask = async (req, res, next) => {
    try {
        const { id } = req.params;

        const existing = await query('SELECT * FROM tasks WHERE id = $1', [id]);
        if (existing.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        const task = existing.rows[0];

        if (!isOwnerOrAdmin(req.user, task.created_by)) {
            return res.status(403).json({
                success: false,
                message: 'You can only delete tasks you created',
            });
        }

        await query('DELETE FROM tasks WHERE id = $1', [id]);

        // Invalidate caches
        deleteCache(`task_${id}`);
        deleteCacheByPrefix(`tasks_`);

        // Real-time emit
        emitTaskUpdate('task:deleted', {
            taskId: id,
            deletedBy: { id: req.user.id, name: req.user.name },
        });

        res.status(200).json({
            success: true,
            message: 'Task deleted successfully',
        });
    } catch (err) {
        next(err);
    }
};

// ─── AI Summarize Task ────────────────────────────────────────
const summarizeTaskAI = async (req, res, next) => {
    try {
        const { id } = req.params;

        const existing = await query('SELECT * FROM tasks WHERE id = $1', [id]);
        if (existing.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        const task = existing.rows[0];

        if (!task.description || task.description.trim().length < 20) {
            return res.status(400).json({
                success: false,
                message: 'Task description is too short to summarize (min 20 characters)',
            });
        }

        const summary = await summarizeTask(task.title, task.description);

        // Save summary to DB
        await query('UPDATE tasks SET ai_summary = $1, updated_at = NOW() WHERE id = $2', [
            summary,
            id,
        ]);

        // Log activity
        await logActivity(id, req.user.id, 'AI_SUMMARY_GENERATED', null, { summary });

        // Invalidate cache
        deleteCache(`task_${id}`);
        deleteCacheByPrefix(`tasks_`);

        res.status(200).json({
            success: true,
            message: 'AI summary generated successfully',
            data: { summary },
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getAllTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    summarizeTaskAI,
};