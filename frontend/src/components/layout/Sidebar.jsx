import { NavLink, useNavigate } from 'react-router-dom'
import {
    LayoutDashboard,
    CheckSquare,
    Users,
    User,
    LogOut,
    X,
} from 'lucide-react'
import toast from 'react-hot-toast'
import useAuthStore from '../../store/authStore'
import authService from '../../services/authService'
import socketService from '../../services/socketService'
import Logo from '../common/Logo'

const Sidebar = ({ isOpen, onClose }) => {
    const navigate = useNavigate()
    const { user, refreshToken, clearAuth } = useAuthStore()

    const handleLogout = async () => {
        try {
            await authService.logout(refreshToken)
        } catch (_) { }
        socketService.disconnect()
        clearAuth()
        toast.success('Logged out successfully')
        navigate('/login')
    }

    const navItems = [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/tasks', icon: CheckSquare, label: 'Tasks' },
        { to: '/profile', icon: User, label: 'Profile' },
        ...(user?.role === 'admin'
            ? [{ to: '/users', icon: Users, label: 'Users' }]
            : []),
    ]

    const linkClass = ({ isActive }) =>
        `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-30 flex flex-col transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <Logo size="md" />
                    <button
                        onClick={onClose}
                        className="lg:hidden text-gray-400 hover:text-gray-600"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navItems.map(({ to, icon: Icon, label }) => (
                        <NavLink key={to} to={to} className={linkClass} onClick={onClose}>
                            <Icon size={18} />
                            {label}
                        </NavLink>
                    ))}
                </nav>

                {/* User + Logout */}
                <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 px-3 py-2 mb-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                                {user?.name}
                            </p>
                            <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </aside>
        </>
    )
}

export default Sidebar