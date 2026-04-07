import axios from 'axios'
import toast from 'react-hot-toast'
import useAuthStore from '../store/authStore'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// ─── Axios Instance ───────────────────────────────────────────
const api = axios.create({
    baseURL: `${BASE_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 150000,
})

// ─── Request Interceptor ──────────────────────────────────────
api.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().getAccessToken()
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

// ─── Response Interceptor (Auto Refresh Token) ────────────────
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error)
        } else {
            prom.resolve(token)
        }
    })
    failedQueue = []
}

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        // If 401 and not already retrying
        if (
            error.response?.status === 401 &&
            error.response?.data?.code === 'TOKEN_EXPIRED' &&
            !originalRequest._retry
        ) {
            if (isRefreshing) {
                // Queue the request until token is refreshed
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject })
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`
                        return api(originalRequest)
                    })
                    .catch((err) => Promise.reject(err))
            }

            originalRequest._retry = true
            isRefreshing = true

            const refreshToken = useAuthStore.getState().getRefreshToken()

            if (!refreshToken) {
                useAuthStore.getState().clearAuth()
                window.location.href = '/login'
                return Promise.reject(error)
            }

            try {
                const response = await axios.post(`${BASE_URL}/api/auth/refresh`, {
                    refreshToken,
                })

                const { accessToken, refreshToken: newRefreshToken } = response.data.data

                useAuthStore.getState().setAuth(
                    useAuthStore.getState().user,
                    accessToken,
                    newRefreshToken
                )

                processQueue(null, accessToken)
                originalRequest.headers.Authorization = `Bearer ${accessToken}`
                return api(originalRequest)
            } catch (refreshError) {
                processQueue(refreshError, null)
                useAuthStore.getState().clearAuth()
                toast.error('Session expired. Please login again.')
                window.location.href = '/login'
                return Promise.reject(refreshError)
            } finally {
                isRefreshing = false
            }
        }

        // Handle other errors
        const message = error.response?.data?.message || 'Something went wrong'

        // Don't show toast for 401 on login page
        if (
            error.response?.status === 401 &&
            window.location.pathname === '/login'
        ) {
            return Promise.reject(error)
        }

        // Rate limit error
        if (error.response?.status === 429) {
            toast.error('Too many requests. Please slow down.')
            return Promise.reject(error)
        }

        return Promise.reject(error)
    }
)

export default api