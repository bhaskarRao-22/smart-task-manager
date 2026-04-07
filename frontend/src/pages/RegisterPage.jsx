import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, UserPlus } from 'lucide-react'
import toast from 'react-hot-toast'
import useAuthStore from '../store/authStore'
import authService from '../services/authService'
import Logo from '../components/common/Logo'
import { getErrorMessage } from '../utils/helpers'

const RegisterPage = () => {
    const navigate = useNavigate()
    const setAuth = useAuthStore((s) => s.setAuth)
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm()

    const onSubmit = async (data) => {
        setLoading(true)
        try {
            const res = await authService.register({
                name: data.name,
                email: data.email,
                password: data.password,
                role: data.role,
            })
            setAuth(res.data.user, res.data.accessToken, res.data.refreshToken)
            toast.success(`Account created! Welcome, ${res.data.user.name}! 🎉`)
            navigate('/dashboard')
        } catch (err) {
            toast.error(getErrorMessage(err))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {/* Logo */}
                    <div className="flex justify-center mb-8">
                        <Logo size="lg" />
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 mb-1">
                        Create account
                    </h1>
                    <p className="text-gray-500 text-sm mb-6">
                        Join TaskFlow and start managing tasks
                    </p>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Full Name
                            </label>
                            <input
                                type="text"
                                placeholder="Your name"
                                className={`w-full px-4 py-2.5 border rounded-lg text-sm outline-none transition-colors
                  focus:border-blue-500 focus:ring-2 focus:ring-blue-100
                  ${errors.name ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                                {...register('name', {
                                    required: 'Name is required',
                                    minLength: { value: 2, message: 'Min 2 characters' },
                                })}
                            />
                            {errors.name && (
                                <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                placeholder="you@example.com"
                                className={`w-full px-4 py-2.5 border rounded-lg text-sm outline-none transition-colors
                  focus:border-blue-500 focus:ring-2 focus:ring-blue-100
                  ${errors.email ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                                {...register('email', {
                                    required: 'Email is required',
                                    pattern: {
                                        value: /^\S+@\S+\.\S+$/,
                                        message: 'Invalid email format',
                                    },
                                })}
                            />
                            {errors.email && (
                                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Min 6 characters"
                                    className={`w-full px-4 py-2.5 border rounded-lg text-sm outline-none transition-colors pr-10
                    focus:border-blue-500 focus:ring-2 focus:ring-blue-100
                    ${errors.password ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                                    {...register('password', {
                                        required: 'Password is required',
                                        minLength: { value: 6, message: 'Min 6 characters' },
                                    })}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                            )}
                        </div>

                        {/* Role */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Role
                            </label>
                            <select
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none
                  focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
                                {...register('role')}
                            >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>
                            <p className="text-xs text-gray-400 mt-1">
                                Admin role only works if no admin exists yet
                            </p>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 mt-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <UserPlus size={18} />
                                    Create Account
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-6">
                        Already have an account?{' '}
                        <Link
                            to="/login"
                            className="text-blue-600 font-medium hover:underline"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default RegisterPage