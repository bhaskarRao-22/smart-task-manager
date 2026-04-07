import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { User, Lock, Shield, Save, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import useAuthStore from '../store/authStore'
import userService from '../services/userService'
import { getErrorMessage, formatDate, getInitials } from '../utils/helpers'

const ProfilePage = () => {
    const { user, setUser } = useAuthStore()
    const [activeTab, setActiveTab] = useState('profile')

    const {
        register: regProfile,
        handleSubmit: handleProfile,
        formState: { errors: profileErrors },
    } = useForm({ defaultValues: { name: user?.name || '' } })

    const {
        register: regPassword,
        handleSubmit: handlePassword,
        reset: resetPassword,
        watch,
        formState: { errors: passwordErrors },
    } = useForm()

    const updateMutation = useMutation({
        mutationFn: (data) => userService.updateUser(user.id, data),
        onSuccess: (res) => {
            setUser(res.data.user)
            toast.success('Profile updated!')
        },
        onError: (err) => toast.error(getErrorMessage(err)),
    })

    const passwordMutation = useMutation({
        mutationFn: (data) => userService.updateUser(user.id, { password: data.password }),
        onSuccess: () => {
            toast.success('Password updated!')
            resetPassword()
        },
        onError: (err) => toast.error(getErrorMessage(err)),
    })

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 flex items-center gap-5">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shrink-0">
                    {getInitials(user?.name)}
                </div>
                <div>
                    <h1 className="text-xl font-bold text-gray-900">{user?.name}</h1>
                    <p className="text-gray-500 text-sm">{user?.email}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                        <span
                            className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium
                ${user?.role === 'admin'
                                    ? 'bg-purple-100 text-purple-700'
                                    : 'bg-blue-100 text-blue-700'
                                }`}
                        >
                            {user?.role === 'admin' && <Shield size={11} />}
                            {user?.role}
                        </span>
                        <span className="text-xs text-gray-400">
                            Joined {formatDate(user?.createdAt)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
                {[
                    { id: 'profile', icon: User, label: 'Profile' },
                    { id: 'password', icon: Lock, label: 'Password' },
                ].map(({ id, icon: Icon, label }) => (
                    <button
                        key={id}
                        onClick={() => setActiveTab(id)}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all
              ${activeTab === id
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <Icon size={15} />
                        {label}
                    </button>
                ))}
            </div>

            {/* Profile Tab */}
            {activeTab === 'profile' && (
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                    <h2 className="font-semibold text-gray-900 mb-4">
                        Update Profile
                    </h2>
                    <form
                        onSubmit={handleProfile((data) => updateMutation.mutate(data))}
                        className="space-y-4"
                    >
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Full Name
                            </label>
                            <input
                                type="text"
                                className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none
                  focus:border-blue-500 focus:ring-2 focus:ring-blue-100
                  ${profileErrors.name ? 'border-red-400' : 'border-gray-300'}`}
                                {...regProfile('name', {
                                    required: 'Name is required',
                                    minLength: { value: 2, message: 'Min 2 characters' },
                                })}
                            />
                            {profileErrors.name && (
                                <p className="text-red-500 text-xs mt-1">
                                    {profileErrors.name.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                value={user?.email}
                                disabled
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm
                  bg-gray-50 text-gray-400 cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                        </div>

                        <button
                            type="submit"
                            disabled={updateMutation.isPending}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700
                disabled:opacity-60 text-white text-sm font-semibold
                px-5 py-2.5 rounded-xl transition-colors"
                        >
                            {updateMutation.isPending ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <Save size={16} />
                            )}
                            Save Changes
                        </button>
                    </form>
                </div>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                    <h2 className="font-semibold text-gray-900 mb-4">Change Password</h2>
                    <form
                        onSubmit={handlePassword((data) => passwordMutation.mutate(data))}
                        className="space-y-4"
                    >
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                New Password
                            </label>
                            <input
                                type="password"
                                placeholder="Min 6 characters"
                                className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none
                  focus:border-blue-500 focus:ring-2 focus:ring-blue-100
                  ${passwordErrors.password ? 'border-red-400' : 'border-gray-300'}`}
                                {...regPassword('password', {
                                    required: 'Password is required',
                                    minLength: { value: 6, message: 'Min 6 characters' },
                                })}
                            />
                            {passwordErrors.password && (
                                <p className="text-red-500 text-xs mt-1">
                                    {passwordErrors.password.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                placeholder="Repeat new password"
                                className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none
                  focus:border-blue-500 focus:ring-2 focus:ring-blue-100
                  ${passwordErrors.confirmPassword ? 'border-red-400' : 'border-gray-300'}`}
                                {...regPassword('confirmPassword', {
                                    required: 'Please confirm password',
                                    validate: (val) =>
                                        val === watch('password') || 'Passwords do not match',
                                })}
                            />
                            {passwordErrors.confirmPassword && (
                                <p className="text-red-500 text-xs mt-1">
                                    {passwordErrors.confirmPassword.message}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={passwordMutation.isPending}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700
                disabled:opacity-60 text-white text-sm font-semibold
                px-5 py-2.5 rounded-xl transition-colors"
                        >
                            {passwordMutation.isPending ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <Lock size={16} />
                            )}
                            Update Password
                        </button>
                    </form>
                </div>
            )}
        </div>
    )
}

export default ProfilePage