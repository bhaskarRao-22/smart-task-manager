import { useNavigate } from 'react-router-dom'
import { Calendar, User, Trash2, Edit2, ChevronRight } from 'lucide-react'
import Badge from '../common/Badge'
import {
    getStatusConfig,
    getPriorityConfig,
    formatDate,
    truncate,
} from '../../utils/helpers'
import useAuthStore from '../../store/authStore'

const TaskCard = ({ task, onEdit, onDelete }) => {
    const navigate = useNavigate()
    const user = useAuthStore((s) => s.user)
    const canModify =
        user?.role === 'admin' || user?.id === task.created_by

    const statusCfg = getStatusConfig(task.status)
    const priorityCfg = getPriorityConfig(task.priority)

    return (
        <div
            className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md
        hover:border-blue-200 transition-all group cursor-pointer"
            onClick={() => navigate(`/tasks/${task.id}`)}
        >
            {/* Top Row */}
            <div className="flex items-start justify-between gap-2 mb-3">
                <h3 className="font-semibold text-gray-900 text-sm leading-snug flex-1">
                    {task.title}
                </h3>
                {canModify && (
                    <div
                        className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => onEdit(task)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                            <Edit2 size={14} />
                        </button>
                        <button
                            onClick={() => onDelete(task)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                )}
            </div>

            {/* Description */}
            {task.description && (
                <p className="text-xs text-gray-500 mb-3 leading-relaxed">
                    {truncate(task.description, 100)}
                </p>
            )}

            {/* AI Summary */}
            {task.ai_summary && (
                <div className="bg-purple-50 border border-purple-100 rounded-lg px-3 py-2 mb-3">
                    <p className="text-xs text-purple-700">
                        <span className="font-semibold">🤖 AI: </span>
                        {truncate(task.ai_summary, 90)}
                    </p>
                </div>
            )}

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-3">
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

            {/* Footer */}
            <div className="flex items-center justify-between text-xs text-gray-400">
                <div className="flex items-center gap-3">
                    {task.assigned_to_name && (
                        <span className="flex items-center gap-1">
                            <User size={12} />
                            {task.assigned_to_name}
                        </span>
                    )}
                    {task.due_date && (
                        <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {formatDate(task.due_date)}
                        </span>
                    )}
                </div>
                <ChevronRight
                    size={14}
                    className="text-gray-300 group-hover:text-blue-400 transition-colors"
                />
            </div>
        </div>
    )
}

export default TaskCard