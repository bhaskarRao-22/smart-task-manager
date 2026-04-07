import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    ArrowLeft, Edit2, Trash2, Sparkles,
    Calendar, User, Clock, Loader2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import taskService from '../services/taskService'
import useAuthStore from '../store/authStore'
import LoadingSpinner from '../components/common/LoadingSpinner'
import Badge from '../components/common/Badge'
import TaskModal from '../components/tasks/TaskModal'
import ConfirmModal from '../components/common/ConfirmModal'
import ActivityLog from '../components/tasks/ActivityLog'
import {
    getStatusConfig, getPriorityConfig,
    formatDateTime, getErrorMessage,
} from '../utils/helpers'

const TaskDetailPage = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const user = useAuthStore((s) => s.user)

    const [showEdit, setShowEdit] = useState(false)
    const [showDelete, setShowDelete] = useState(false)

    const { data, isLoading } = useQuery({
        queryKey: ['task', id],
        queryFn: () => taskService.getTask(id),
    })

    const task = data?.data?.task

    const deleteMutation = useMutation({
        mutationFn: () => taskService.deleteTask(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] })
            toast.success('Task deleted')
            navigate('/tasks')
        },
        onError: (err) => toast.error(getErrorMessage(err)),
    })

    const summarizeMutation = useMutation({
        mutationFn: () => taskService.summarizeTask(id),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['task', id] })
            queryClient.invalidateQueries({ queryKey: ['tasks'] })
            toast.success('AI summary generated! 🤖')
        },
        onError: (err) => toast.error(getErrorMessage(err)),
    })

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <LoadingSpinner size="lg" text="Loading task..." />
            </div>
        )
    }

    if (!task) {
        return (
            <div className="text-center py-16">
                <p className="text-gray-500">Task not found</p>
                <button
                    onClick={() => navigate('/tasks')}
                    className="mt-3 text-blue-600 hover:underline text-sm"
                >
                    Back to Tasks
                </button>
            </div>
        )
    }

    const statusCfg = getStatusConfig(task.status)
    const priorityCfg = getPriorityConfig(task.priority)
    const canModify = user?.role === 'admin' || user?.id === task.created_by

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Back button */}
            <button
                onClick={() => navigate('/tasks')}
                className="flex items-center gap-2 text-sm text-gray-500
          hover:text-gray-800 transition-colors"
            >
                <ArrowLeft size={16} />
                Back to Tasks
            </button>

            {/* Main Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-5">
                    <h1 className="text-xl font-bold text-gray-900 leading-snug flex-1">
                        {task.title}
                    </h1>
                    {canModify && (
                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                onClick={() => setShowEdit(true)}
                                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium
                  text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
                            >
                                <Edit2 size={15} />
                                Edit
                            </button>
                            <button
                                onClick={() => setShowDelete(true)}
                                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium
                  text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                            >
                                <Trash2 size={15} />
                                Delete
                            </button>
                        </div>
                    )}
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-5">
                    <Badge
                        label={statusCfg.label}
                        colorClass={statusCfg.color}
                        dotClass={statusCfg.dot}
                    />
                    <Badge
                        label={priorityCfg.label}
                        colorClass={priorityCfg.color}
                        dotClass={priorityCfg.dot}
                    />
                </div>

                {/* Meta */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                        <User size={15} className="text-gray-400" />
                        <div>
                            <p className="text-xs text-gray-400">Created by</p>
                            <p className="font-medium">{task.created_by_name}</p>
                        </div>
                    </div>
                    {task.assigned_to_name && (
                        <div className="flex items-center gap-2 text-gray-600">
                            <User size={15} className="text-blue-400" />
                            <div>
                                <p className="text-xs text-gray-400">Assigned to</p>
                                <p className="font-medium">{task.assigned_to_name}</p>
                            </div>
                        </div>
                    )}
                    {task.due_date && (
                        <div className="flex items-center gap-2 text-gray-600">
                            <Calendar size={15} className="text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-400">Due Date</p>
                                <p className="font-medium">{formatDateTime(task.due_date)}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Description */}
                {task.description && (
                    <div className="mb-5">
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">
                            Description
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                            {task.description}
                        </p>
                    </div>
                )}

                {/* AI Summary */}
                <div className="border border-purple-200 bg-purple-50 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Sparkles size={16} className="text-purple-600" />
                            <h3 className="text-sm font-semibold text-purple-800">
                                AI Summary
                            </h3>
                        </div>
                        {task.description && task.description.length >= 20 && (
                            <button
                                onClick={() => summarizeMutation.mutate()}
                                disabled={summarizeMutation.isPending}
                                className="flex items-center gap-1.5 text-xs font-medium text-purple-700
                  bg-purple-100 hover:bg-purple-200 px-3 py-1.5 rounded-lg transition-colors
                  disabled:opacity-60"
                            >
                                {summarizeMutation.isPending ? (
                                    <Loader2 size={12} className="animate-spin" />
                                ) : (
                                    <Sparkles size={12} />
                                )}
                                {task.ai_summary ? 'Re-summarize' : 'Generate'}
                            </button>
                        )}
                    </div>
                    {task.ai_summary ? (
                        <p className="text-sm text-purple-700 leading-relaxed">
                            {task.ai_summary}
                        </p>
                    ) : (
                        <p className="text-sm text-purple-400 italic">
                            No summary yet. Click "Generate" to create an AI summary.
                        </p>
                    )}
                </div>

                {/* Timestamps */}
                <div className="flex items-center gap-4 mt-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                        <Clock size={11} />
                        Created: {formatDateTime(task.created_at)}
                    </span>
                    <span className="flex items-center gap-1">
                        <Clock size={11} />
                        Updated: {formatDateTime(task.updated_at)}
                    </span>
                </div>
            </div>

            {/* Activity Log */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Activity Log</h2>
                <ActivityLog taskId={id} />
            </div>

            {/* Modals */}
            <TaskModal
                isOpen={showEdit}
                onClose={() => setShowEdit(false)}
                task={task}
            />
            <ConfirmModal
                isOpen={showDelete}
                onClose={() => setShowDelete(false)}
                onConfirm={() => deleteMutation.mutate()}
                loading={deleteMutation.isPending}
                title="Delete Task?"
                message={`Are you sure you want to delete "${task.title}"?`}
                confirmText="Delete"
            />
        </div>
    )
}

export default TaskDetailPage