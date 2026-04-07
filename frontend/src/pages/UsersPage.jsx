import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Users, UserCheck, UserX, Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import userService from '../services/userService'
import LoadingSpinner from '../components/common/LoadingSpinner'
import EmptyState from '../components/common/EmptyState'
import { formatDate, getErrorMessage, getInitials } from '../utils/helpers'
import useAuthStore from '../store/authStore'

const UsersPage = () => {
    const queryClient = useQueryClient()
    const currentUser = useAuthStore((s) => s.user)

    const { data, isLoading } = useQuery({
        queryKey: ['users'],
        queryFn: userService.getAllUsers,
    })

    const toggleMutation = useMutation({
        mutationFn: userService.toggleUserStatus,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] })
            toast.success('User status updated')
        },
        onError: (err) => toast.error(getErrorMessage(err)),
    })

    const users = data?.data?.users || []

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <LoadingSpinner size="lg" text="Loading users..." />
            </div>
        )
    }

    return (
        <div className="space-y-5">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Users</h1>
                <p className="text-gray-500 text-sm mt-0.5">
                    {users.length} registered users
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-3">
                    <div className="bg-blue-50 p-2.5 rounded-xl">
                        <Users size={18} className="text-blue-600" />
                    </div>
                    <div>
                        <p className="text-xl font-bold text-gray-900">{users.length}</p>
                        <p className="text-xs text-gray-500">Total Users</p>
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-3">
                    <div className="bg-green-50 p-2.5 rounded-xl">
                        <UserCheck size={18} className="text-green-600" />
                    </div>
                    <div>
                        <p className="text-xl font-bold text-gray-900">
                            {users.filter((u) => u.is_active).length}
                        </p>
                        <p className="text-xs text-gray-500">Active</p>
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-3">
                    <div className="bg-purple-50 p-2.5 rounded-xl">
                        <Shield size={18} className="text-purple-600" />
                    </div>
                    <div>
                        <p className="text-xl font-bold text-gray-900">
                            {users.filter((u) => u.role === 'admin').length}
                        </p>
                        <p className="text-xs text-gray-500">Admins</p>
                    </div>
                </div>
            </div>

            {/* Users Table / Cards */}
            {users.length === 0 ? (
                <EmptyState icon={Users} title="No users found" />
            ) : (
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        User
                                    </th>
                                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Joined
                                    </th>
                                    <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {users.map((u) => (
                                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
                                                    {getInitials(u.name)}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {u.name}
                                                        {u.id === currentUser?.id && (
                                                            <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">
                                                                You
                                                            </span>
                                                        )}
                                                    </p>
                                                    <p className="text-xs text-gray-400">{u.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span
                                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                          ${u.role === 'admin'
                                                        ? 'bg-purple-100 text-purple-700'
                                                        : 'bg-gray-100 text-gray-600'
                                                    }`}
                                            >
                                                {u.role === 'admin' && <Shield size={11} />}
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span
                                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                          ${u.is_active
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-red-100 text-red-700'
                                                    }`}
                                            >
                                                <span
                                                    className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-green-500' : 'bg-red-500'
                                                        }`}
                                                />
                                                {u.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-gray-500 text-xs">
                                            {formatDate(u.created_at)}
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            {u.id !== currentUser?.id && (
                                                <button
                                                    onClick={() => toggleMutation.mutate(u.id)}
                                                    disabled={toggleMutation.isPending}
                                                    className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors
                            ${u.is_active
                                                            ? 'text-red-600 bg-red-50 hover:bg-red-100'
                                                            : 'text-green-600 bg-green-50 hover:bg-green-100'
                                                        }`}
                                                >
                                                    {u.is_active ? 'Deactivate' : 'Activate'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden divide-y divide-gray-100">
                        {users.map((u) => (
                            <div key={u.id} className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                        {getInitials(u.name)}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 text-sm">
                                            {u.name}
                                        </p>
                                        <p className="text-xs text-gray-400">{u.email}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span
                                                className={`text-xs px-2 py-0.5 rounded-full font-medium
                          ${u.role === 'admin'
                                                        ? 'bg-purple-100 text-purple-700'
                                                        : 'bg-gray-100 text-gray-600'
                                                    }`}
                                            >
                                                {u.role}
                                            </span>
                                            <span
                                                className={`text-xs px-2 py-0.5 rounded-full font-medium
                          ${u.is_active
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-red-100 text-red-700'
                                                    }`}
                                            >
                                                {u.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {u.id !== currentUser?.id && (
                                    <button
                                        onClick={() => toggleMutation.mutate(u.id)}
                                        className={`text-xs font-medium px-3 py-1.5 rounded-lg
                      ${u.is_active
                                                ? 'text-red-600 bg-red-50'
                                                : 'text-green-600 bg-green-50'
                                            }`}
                                    >
                                        {u.is_active ? 'Deactivate' : 'Activate'}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default UsersPage