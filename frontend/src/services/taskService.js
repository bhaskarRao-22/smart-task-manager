import api from './api'

const taskService = {
    // Get all tasks with filters
    getTasks: async (params = {}) => {
        const response = await api.get('/tasks', { params })
        return response.data
    },

    // Get single task
    getTask: async (id) => {
        const response = await api.get(`/tasks/${id}`)
        return response.data
    },

    // Create task
    createTask: async (data) => {
        const response = await api.post('/tasks', data)
        return response.data
    },

    // Update task
    updateTask: async (id, data) => {
        const response = await api.put(`/tasks/${id}`, data)
        return response.data
    },

    // Delete task
    deleteTask: async (id) => {
        const response = await api.delete(`/tasks/${id}`)
        return response.data
    },

    // AI Summarize
    summarizeTask: async (id) => {
        const response = await api.post(`/tasks/${id}/summarize`)
        return response.data
    },
}

export default taskService