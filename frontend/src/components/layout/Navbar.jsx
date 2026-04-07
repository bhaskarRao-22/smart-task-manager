import { Menu, Bell } from 'lucide-react'
import useAuthStore from '../../store/authStore'

const Navbar = ({ onMenuClick }) => {
    const user = useAuthStore((s) => s.user)

    return (
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-10">
            {/* Left */}
            <div className="flex items-center gap-3">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
                >
                    <Menu size={20} />
                </button>
                <div className="hidden lg:block">
                    <p className="text-sm text-gray-500">
                        Welcome back,{' '}
                        <span className="font-semibold text-gray-900">{user?.name}</span> 👋
                    </p>
                </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs text-gray-500 font-medium">Live</span>
                </div>

                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                </div>
            </div>
        </header>
    )
}

export default Navbar