import { useEffect } from 'react'
import socketService from '../services/socketService'
import useAuthStore from '../store/authStore'
import { useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

const useSocket = () => {
    const queryClient = useQueryClient()
    const user = useAuthStore((s) => s.user)

    useEffect(() => {
        if (!user?.id) return

        socketService.connect(user.id)

        // Task created
        socketService.on('task:created', (data) => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] })
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
            if (data.createdBy?.id !== user.id) {
                toast(`📋 New task: "${data.task.title}"`, { icon: '✨' })
            }
        })

        // Task updated
        socketService.on('task:updated', (data) => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] })
            queryClient.invalidateQueries({ queryKey: ['task', data.task.id] })
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
            if (data.updatedBy?.id !== user.id) {
                toast(`✏️ Task updated: "${data.task.title}"`)
            }
        })

        // Task deleted
        socketService.on('task:deleted', (data) => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] })
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
            if (data.deletedBy?.id !== user.id) {
                toast(`🗑️ A task was deleted`, { icon: '⚠️' })
            }
        })

        return () => {
            socketService.off('task:created')
            socketService.off('task:updated')
            socketService.off('task:deleted')
        }
    }, [user?.id, queryClient])
}

export default useSocket