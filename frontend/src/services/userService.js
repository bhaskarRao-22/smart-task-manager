import api from './api'

const userService = {
    // Get all users (admin)
    getAllUsers: async () => {
        const response = await api.get('/users')
        return response.data
    },

    // Get single user
    getUser: async (id) => {
        const response = await api.get(`/users/${id}`)
        return response.data
    },

    // Update user
    updateUser: async (id, data) => {
        const response = await api.put(`/users/${id}`, data)
        return response.data
    },

    // Toggle user status (admin)
    toggleUserStatus: async (id) => {
        const response = await api.patch(`/users/${id}/toggle-status`)
        return response.data
    },
}

export default userService