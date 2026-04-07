import { Zap } from 'lucide-react'

const Logo = ({ size = 'md' }) => {
    const sizes = {
        sm: { icon: 18, text: 'text-lg' },
        md: { icon: 24, text: 'text-xl' },
        lg: { icon: 32, text: 'text-2xl' },
    }
    const s = sizes[size]

    return (
        <div className="flex items-center gap-2">
            <div className="bg-blue-600 text-white p-1.5 rounded-lg">
                <Zap size={s.icon} strokeWidth={2.5} />
            </div>
            <span className={`font-bold ${s.text} text-gray-900`}>
                Task<span className="text-blue-600">Flow</span>
            </span>
        </div>
    )
}

export default Logo