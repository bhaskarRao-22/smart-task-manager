import { useQuery } from '@tanstack/react-query'
import {
    CheckSquare,
    Clock,
    AlertCircle,
    CheckCircle2,
    TrendingUp,
    Plus,
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import taskService from '../services/taskService'
import useAuthStore from '../store/authStore'
import LoadingSpinner from '../components/common/LoadingSpinner'
import TaskModal from '../components/tasks/TaskModal'
import Badge from '../components/common/Badge'
import {
    getStatusConfig,
    getPriorityConfig,
    formatDate,
    truncate,
} from '../utils/helpers'

const StatCard = ({ icon: Icon, label, value, color, bg }) => (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4">
        <div className={`${bg} p-3 rounded-xl`}>
            <Icon size={22} className={color} />
        </div>
        <div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
        </div>
    </div>
)

const DashboardPage = () => {
    const user = useAuthStore((s) => s.user)
    const [showTaskModal, setShowTaskModal] = useState(false)

    const { data, isLoading } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: () => taskService.getTasks({ limit: 50 }),
    })

    const tasks = data?.data?.tasks || []

    const stats = {
        total: tasks.length,
        todo: tasks.filter((t) => t.status === 'todo').length,
        inProgress: tasks.filter((t) => t.status === 'in_progress').length,
        done: tasks.filter((t) => t.status === 'done').length,
    }

    const recentTasks = [...tasks]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5)

    const urgentTasks = tasks.filter(
        (t) => t.priority === 'urgent' && t.status !== 'done'
    )

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <LoadingSpinner size="lg" text="Loading dashboard..." />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-500 text-sm mt-0.5">
                        Here's what's happening today
                    </p>
                </div>
                <button
                    onClick={() => setShowTaskModal(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white
            text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
                >
                    <Plus size={18} />
                    <span className="hidden sm:inline">New Task</span>
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={CheckSquare}
                    label="Total Tasks"
                    value={stats.total}
                    color="text-blue-600"
                    bg="bg-blue-50"
                />
                <StatCard
                    icon={Clock}
                    label="To Do"
                    value={stats.todo}
                    color="text-gray-600"
                    bg="bg-gray-100"
                />
                <StatCard
                    icon={TrendingUp}
                    label="In Progress"
                    value={stats.inProgress}
                    color="text-orange-600"
                    bg="bg-orange-50"
                />
                <StatCard
                    icon={CheckCircle2}
                    label="Completed"
                    value={stats.done}
                    color="text-green-600"
                    bg="bg-green-50"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Tasks */}
                <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold text-gray-900">Recent Tasks</h2>
                        <Link
                            to="/tasks"
                            className="text-sm text-blue-600 hover:underline font-medium"
                        >
                            View all
                        </Link>
                    </div>

                    {recentTasks.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-8">
                            No tasks yet. Create your first task!
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {recentTasks.map((task) => {
                                const statusCfg = getStatusConfig(task.status)
                                const priorityCfg = getPriorityConfig(task.priority)
                                return (
                                    <Link
                                        key={task.id}
                                        to={`/tasks/${task.id}`}
                                        className="flex items-center justify-between p-3 rounded-xl
                      hover:bg-gray-50 transition-colors group"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {task.title}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                {formatDate(task.created_at)}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 ml-3 shrink-0">
                                            <Badge
                                                label={statusCfg.label}
                                                colorClass={statusCfg.color}
                                                dotClass={statusCfg.dot}
                                            />
                                            <Badge
                                                label={priorityCfg.label}
                                                colorClass={priorityCfg.color}
                                            />
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* Urgent Tasks */}
                <div className="bg-white border border-gray-200 rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertCircle size={18} className="text-red-500" />
                        <h2 className="font-semibold text-gray-900">Urgent Tasks</h2>
                        {urgentTasks.length > 0 && (
                            <span className="ml-auto bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                                {urgentTasks.length}
                            </span>
                        )}
                    </div>

                    {urgentTasks.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-8">
                            🎉 No urgent tasks!
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {urgentTasks.slice(0, 5).map((task) => (
                                <Link
                                    key={task.id}
                                    to={`/tasks/${task.id}`}
                                    className="block p-3 bg-red-50 border border-red-100 rounded-xl
                    hover:border-red-300 transition-colors"
                                >
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {task.title}
                                    </p>
                                    {task.due_date && (
                                        <p className="text-xs text-red-500 mt-0.5">
                                            Due: {formatDate(task.due_date)}
                                        </p>
                                    )}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <TaskModal
                isOpen={showTaskModal}
                onClose={() => setShowTaskModal(false)}
            />
        </div>
    )
}

export default DashboardPage