import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { X, Loader2 } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import taskService from '../../services/taskService'
import userService from '../../services/userService'
import { getErrorMessage } from '../../utils/helpers'

const TaskModal = ({ isOpen, onClose, task = null }) => {
    const queryClient = useQueryClient()
    const isEditing = !!task

    const { data: usersData } = useQuery({
        queryKey: ['users-list'],
        queryFn: () => userService.getAllUsers(),
        enabled: isOpen,
    })

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm()

    useEffect(() => {
        if (isOpen) {
            reset({
                title: task?.title || '',
                description: task?.description || '',
                status: task?.status || 'todo',
                priority: task?.priority || 'medium',
                assigned_to: task?.assigned_to || '',
                due_date: task?.due_date
                    ? new Date(task.due_date).toISOString().split('T')[0]
                    : '',
            })
        }
    }, [isOpen, task, reset])

    const createMutation = useMutation({
        mutationFn: taskService.createTask,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] })
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
            toast.success('Task created successfully! 🎉')
            onClose()
        },
        onError: (err) => toast.error(getErrorMessage(err)),
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => taskService.updateTask(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] })
            queryClient.invalidateQueries({ queryKey: ['task', task?.id] })
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
            toast.success('Task updated successfully!')
            onClose()
        },
        onError: (err) => toast.error(getErrorMessage(err)),
    })

    const onSubmit = (data) => {
        const payload = {
            ...data,
            assigned_to: data.assigned_to || null,
            due_date: data.due_date || null,
        }
        if (isEditing) {
            updateMutation.mutate({ id: task.id, data: payload })
        } else {
            createMutation.mutate(payload)
        }
    }

    const isLoading = createMutation.isPending || updateMutation.isPending

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg z-10 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900">
                        {isEditing ? 'Edit Task' : 'Create New Task'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="Task title..."
                            className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none transition-colors
                focus:border-blue-500 focus:ring-2 focus:ring-blue-100
                ${errors.title ? 'border-red-400' : 'border-gray-300'}`}
                            {...register('title', {
                                required: 'Title is required',
                                minLength: { value: 3, message: 'Min 3 characters' },
                            })}
                        />
                        {errors.title && (
                            <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            rows={3}
                            placeholder="Describe the task in detail..."
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm outline-none
                focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none"
                            {...register('description')}
                        />
                    </div>

                    {/* Status + Priority */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                            </label>
                            <select
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm
                  focus:outline-none focus:border-blue-500 bg-white"
                                {...register('status')}
                            >
                                <option value="todo">To Do</option>
                                <option value="in_progress">In Progress</option>
                                <option value="review">In Review</option>
                                <option value="done">Done</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Priority
                            </label>
                            <select
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm
                  focus:outline-none focus:border-blue-500 bg-white"
                                {...register('priority')}
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                            </select>
                        </div>
                    </div>

                    {/* Assign To */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Assign To
                        </label>
                        <select
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm
                focus:outline-none focus:border-blue-500 bg-white"
                            {...register('assigned_to')}
                        >
                            <option value="">Select</option>
                            {usersData?.data?.users?.map((u) => (
                                <option key={u.id} value={u.id}>
                                    {u.name} ({u.email})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Due Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Due Date
                        </label>
                        <input
                            type="date"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm
                focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            {...register('due_date')}
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700
                bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 px-4 py-2.5 text-sm font-medium text-white
                bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-xl
                transition-colors flex items-center justify-center gap-2"
                        >
                            {isLoading && <Loader2 size={16} className="animate-spin" />}
                            {isEditing ? 'Save Changes' : 'Create Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default TaskModal