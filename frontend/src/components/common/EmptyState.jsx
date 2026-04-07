import { ClipboardList } from 'lucide-react'

const EmptyState = ({
    icon: Icon = ClipboardList,
    title = 'Nothing here yet',
    description = '',
    action = null,
}) => {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="bg-gray-100 p-4 rounded-full mb-4">
                <Icon size={32} className="text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-700 mb-1">{title}</h3>
            {description && (
                <p className="text-sm text-gray-500 max-w-xs mb-4">{description}</p>
            )}
            {action && action}
        </div>
    )
}

export default EmptyState