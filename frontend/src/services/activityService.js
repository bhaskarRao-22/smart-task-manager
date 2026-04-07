import api from './api'

const activityService = {
    // Get activities for a task
    getTaskActivities: async (taskId, params = {}) => {
        const response = await api.get(`/activities/task/${taskId}`, { params })
        return response.data
    },

    // Get all activities (admin)
    getAllActivities: async (params = {}) => {
        const response = await api.get('/activities', { params })
        return response.data
    },
}

export default activityService