import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns'

// ─── Date Helpers ─────────────────────────────────────────────

export const formatDate = (date) => {
    if (!date) return '—'
    const d = typeof date === 'string' ? parseISO(date) : date
    if (!isValid(d)) return '—'
    return format(d, 'MMM dd, yyyy')
}

export const formatDateTime = (date) => {
    if (!date) return '—'
    const d = typeof date === 'string' ? parseISO(date) : date
    if (!isValid(d)) return '—'
    return format(d, 'MMM dd, yyyy · hh:mm a')
}

export const timeAgo = (date) => {
    if (!date) return '—'
    const d = typeof date === 'string' ? parseISO(date) : date
    if (!isValid(d)) return '—'
    return formatDistanceToNow(d, { addSuffix: true })
}

// ─── Status Helpers ───────────────────────────────────────────

export const STATUS_CONFIG = {
    todo: {
        label: 'To Do',
        color: 'bg-gray-100 text-gray-700',
        dot: 'bg-gray-400',
    },
    in_progress: {
        label: 'In Progress',
        color: 'bg-blue-100 text-blue-700',
        dot: 'bg-blue-500',
    },
    review: {
        label: 'In Review',
        color: 'bg-yellow-100 text-yellow-700',
        dot: 'bg-yellow-500',
    },
    done: {
        label: 'Done',
        color: 'bg-green-100 text-green-700',
        dot: 'bg-green-500',
    },
}

export const PRIORITY_CONFIG = {
    low: {
        label: 'Low',
        color: 'bg-gray-100 text-gray-600',
        dot: 'bg-gray-400',
    },
    medium: {
        label: 'Medium',
        color: 'bg-blue-100 text-blue-600',
        dot: 'bg-blue-400',
    },
    high: {
        label: 'High',
        color: 'bg-orange-100 text-orange-600',
        dot: 'bg-orange-400',
    },
    urgent: {
        label: 'Urgent',
        color: 'bg-red-100 text-red-600',
        dot: 'bg-red-500',
    },
}

export const getStatusConfig = (status) =>
    STATUS_CONFIG[status] || STATUS_CONFIG.todo

export const getStatusLabel = (status) =>
    STATUS_CONFIG[status]?.label || status

export const getPriorityConfig = (priority) =>
    PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.medium

export const getPriorityLabel = (priority) =>
    PRIORITY_CONFIG[priority]?.label || priority

// ─── Activity Action Labels ───────────────────────────────────

export const getActivityLabel = (action) => {
    const labels = {
        TASK_CREATED: 'Task created',
        TASK_UPDATED: 'Task updated',
        STATUS_CHANGED_TO_TODO: 'Status → To Do',
        STATUS_CHANGED_TO_IN_PROGRESS: 'Status → In Progress',
        STATUS_CHANGED_TO_REVIEW: 'Status → In Review',
        STATUS_CHANGED_TO_DONE: 'Status → Done',
        AI_SUMMARY_GENERATED: 'AI summary generated',
    }
    return labels[action] || action
}

// ─── String Helpers ───────────────────────────────────────────

export const truncate = (str, length = 80) => {
    if (!str) return ''
    return str.length > length ? `${str.substring(0, length)}...` : str
}

export const getInitials = (name) => {
    if (!name) return '?'
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
}

// ─── Error Helpers ────────────────────────────────────────────

export const getErrorMessage = (error) => {
    return (
        error?.response?.data?.message ||
        error?.message ||
        'Something went wrong'
    )
}