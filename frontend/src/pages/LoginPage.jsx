import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import toast from 'react-hot-toast'
import useAuthStore from '../store/authStore'
import authService from '../services/authService'
import Logo from '../components/common/Logo'
import { getErrorMessage } from '../utils/helpers'

const LoginPage = () => {
    const navigate = useNavigate()
    const setAuth = useAuthStore((s) => s.setAuth)
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm()

    const onSubmit = async (data) => {
        setLoading(true)
        try {
            const res = await authService.login(data.email, data.password)
            setAuth(res.data.user, res.data.accessToken, res.data.refreshToken)
            toast.success(`Welcome back, ${res.data.user.name}! 👋`)
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
                {/* Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {/* Logo */}
                    <div className="flex justify-center mb-8">
                        <Logo size="lg" />
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 mb-1">
                        Welcome back
                    </h1>
                    <p className="text-gray-500 text-sm mb-6">
                        Sign in to your account to continue
                    </p>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                                    placeholder="••••••••"
                                    className={`w-full px-4 py-2.5 border rounded-lg text-sm outline-none transition-colors pr-10
                    focus:border-blue-500 focus:ring-2 focus:ring-blue-100
                    ${errors.password ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                                    {...register('password', {
                                        required: 'Password is required',
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
                                    <LogIn size={18} />
                                    Sign In
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-6">
                        Don't have an account?{' '}
                        <Link
                            to="/register"
                            className="text-blue-600 font-medium hover:underline"
                        >
                            Create one
                        </Link>
                    </p>
                    <p className="text-center text-[11px] text-gray-500 mt-2">
                        Admin Credentials: <code className="bg-gray-100 px-1 rounded">email: admin@example.com</code> | <code className="bg-gray-100 px-1 rounded">password: admin123</code>
                    </p>
                </div>

                {/* Demo credentials */}
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm">
                    <p className="font-semibold text-blue-800 mb-1">💡 First time?</p>
                    <p className="text-blue-700">
                        Register with <code className="bg-blue-100 px-1 rounded">role: admin</code> to
                        get admin access. First registered user with admin role becomes the admin.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default LoginPage