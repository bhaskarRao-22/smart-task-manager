import api from './api'

const authService = {
    // Register
    register: async (data) => {
        const response = await api.post('/auth/register', data)
        return response.data
    },

    // Login
    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password })
        return response.data
    },

    // Logout
    logout: async (refreshToken) => {
        const response = await api.post('/auth/logout', { refreshToken })
        return response.data
    },

    // Get current user
    getMe: async () => {
        const response = await api.get('/auth/me')
        return response.data
    },
}

export default authService