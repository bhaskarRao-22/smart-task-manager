import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import taskService from '../services/taskService'
import TaskCard from '../components/tasks/TaskCard'
import TaskModal from '../components/tasks/TaskModal'
import TaskFilters from '../components/tasks/TaskFilters'
import ConfirmModal from '../components/common/ConfirmModal'
import LoadingSpinner from '../components/common/LoadingSpinner'
import EmptyState from '../components/common/EmptyState'
import { getErrorMessage } from '../utils/helpers'
import { CheckSquare } from 'lucide-react'

const INITIAL_FILTERS = {
    search: '',
    status: '',
    priority: '',
    sort_by: 'created_at',
    sort_order: 'DESC',
    page: 1,
    limit: 9,
}

const TasksPage = () => {
    const queryClient = useQueryClient()
    const [filters, setFilters] = useState(INITIAL_FILTERS)
    const [showTaskModal, setShowTaskModal] = useState(false)
    const [editTask, setEditTask] = useState(null)
    const [deleteTarget, setDeleteTarget] = useState(null)

    const { data, isLoading, isFetching } = useQuery({
        queryKey: ['tasks', filters],
        queryFn: () => taskService.getTasks(filters),
        keepPreviousData: true,
    })

    const deleteMutation = useMutation({
        mutationFn: taskService.deleteTask,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] })
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
            toast.success('Task deleted')
            setDeleteTarget(null)
        },
        onError: (err) => toast.error(getErrorMessage(err)),
    })

    const tasks = data?.data?.tasks || []
    const pagination = data?.data?.pagination || {}

    const handleFilterChange = useCallback((newFilters) => {
        setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }))
    }, [])

    const handleResetFilters = () => setFilters(INITIAL_FILTERS)

    const handleEdit = (task) => {
        setEditTask(task)
        setShowTaskModal(true)
    }

    const handleModalClose = () => {
        setShowTaskModal(false)
        setEditTask(null)
    }

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
                    <p className="text-gray-500 text-sm mt-0.5">
                        {pagination.total ?? 0} tasks total
                    </p>
                </div>
                <button
                    onClick={() => setShowTaskModal(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700
            text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
                >
                    <Plus size={18} />
                    <span className="hidden sm:inline">New Task</span>
                </button>
            </div>

            {/* Filters */}
            <TaskFilters
                filters={filters}
                onChange={handleFilterChange}
                onReset={handleResetFilters}
            />

            {/* Task Grid */}
            {isLoading ? (
                <div className="flex justify-center py-16">
                    <LoadingSpinner size="lg" text="Loading tasks..." />
                </div>
            ) : tasks.length === 0 ? (
                <EmptyState
                    icon={CheckSquare}
                    title="No tasks found"
                    description="Create your first task or adjust your filters"
                    action={
                        <button
                            onClick={() => setShowTaskModal(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-sm
                font-semibold px-5 py-2.5 rounded-xl transition-colors"
                        >
                            Create Task
                        </button>
                    }
                />
            ) : (
                <>
                    <div
                        className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4
              transition-opacity ${isFetching ? 'opacity-60' : 'opacity-100'}`}
                    >
                        {tasks.map((task) => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                onEdit={handleEdit}
                                onDelete={setDeleteTarget}
                            />
                        ))}
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="flex items-center justify-center gap-3 pt-2">
                            <button
                                onClick={() =>
                                    setFilters((p) => ({ ...p, page: p.page - 1 }))
                                }
                                disabled={!pagination.hasPrev}
                                className="p-2 rounded-xl border border-gray-200 text-gray-500
                  hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft size={18} />
                            </button>

                            <span className="text-sm text-gray-600 font-medium">
                                Page {pagination.page} of {pagination.totalPages}
                            </span>

                            <button
                                onClick={() =>
                                    setFilters((p) => ({ ...p, page: p.page + 1 }))
                                }
                                disabled={!pagination.hasNext}
                                className="p-2 rounded-xl border border-gray-200 text-gray-500
                  hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Modals */}
            <TaskModal
                isOpen={showTaskModal}
                onClose={handleModalClose}
                task={editTask}
            />

            <ConfirmModal
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={() => deleteMutation.mutate(deleteTarget?.id)}
                loading={deleteMutation.isPending}
                title="Delete Task?"
                message={`Are you sure you want to delete "${deleteTarget?.title}"? This cannot be undone.`}
                confirmText="Delete"
            />
        </div>
    )
}

export default TasksPage