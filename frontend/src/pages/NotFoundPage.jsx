import { Link } from 'react-router-dom'
import { Home, SearchX } from 'lucide-react'

const NotFoundPage = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="text-center">
                <div className="flex justify-center mb-6">
                    <div className="bg-blue-100 p-5 rounded-full">
                        <SearchX size={48} className="text-blue-600" />
                    </div>
                </div>
                <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
                <h2 className="text-xl font-semibold text-gray-700 mb-2">
                    Page Not Found
                </h2>
                <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                    The page you're looking for doesn't exist or has been moved.
                </p>
                <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
                >
                    <Home size={18} />
                    Back to Dashboard
                </Link>
            </div>
        </div>
    )
}

export default NotFoundPage