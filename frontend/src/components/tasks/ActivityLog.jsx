import { useQuery } from '@tanstack/react-query'
import { Clock } from 'lucide-react'
import activityService from '../../services/activityService'
import LoadingSpinner from '../common/LoadingSpinner'
import { timeAgo, getActivityLabel } from '../../utils/helpers'

const ActivityLog = ({ taskId }) => {
    const { data, isLoading } = useQuery({
        queryKey: ['activities', taskId],
        queryFn: () => activityService.getTaskActivities(taskId),
        enabled: !!taskId,
    })

    const activities = data?.data?.activities || []

    if (isLoading) {
        return (
            <div className="py-8">
                <LoadingSpinner size="sm" text="Loading activity..." />
            </div>
        )
    }

    if (activities.length === 0) {
        return (
            <p className="text-sm text-gray-400 text-center py-6">
                No activity yet
            </p>
        )
    }

    return (
        <div className="space-y-3">
            {activities.map((activity, index) => (
                <div key={activity.id} className="flex gap-3">
                    {/* Timeline dot */}
                    <div className="flex flex-col items-center">
                        <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                            <Clock size={12} className="text-blue-600" />
                        </div>
                        {index < activities.length - 1 && (
                            <div className="w-px flex-1 bg-gray-200 mt-1" />
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-3">
                        <p className="text-sm font-medium text-gray-800">
                            {getActivityLabel(activity.action)}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                            by{' '}
                            <span className="font-medium text-gray-700">
                                {activity.user_name}
                            </span>{' '}
                            · {timeAgo(activity.created_at)}
                        </p>
                        {activity.new_value &&
                            Object.keys(activity.new_value).length > 0 && (
                                <div className="mt-1.5 bg-gray-50 rounded-lg px-3 py-2 text-xs text-gray-600">
                                    {Object.entries(activity.new_value).map(([key, val]) => (
                                        <span key={key} className="mr-2">
                                            <span className="font-medium capitalize">
                                                {key.replace('_', ' ')}:
                                            </span>{' '}
                                            {String(val)}
                                        </span>
                                    ))}
                                </div>
                            )}
                    </div>
                </div>
            ))}
        </div>
    )
}

export default ActivityLog