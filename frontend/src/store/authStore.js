import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,

            // Set tokens + user after login/register
            setAuth: (user, accessToken, refreshToken) => {
                set({
                    user,
                    accessToken,
                    refreshToken,
                    isAuthenticated: true,
                })
            },

            // Update access token after refresh
            setAccessToken: (accessToken) => {
                set({ accessToken })
            },

            // Update user info
            setUser: (user) => {
                set({ user })
            },

            // Clear everything on logout
            clearAuth: () => {
                set({
                    user: null,
                    accessToken: null,
                    refreshToken: null,
                    isAuthenticated: false,
                })
            },

            // Getters
            getAccessToken: () => get().accessToken,
            getRefreshToken: () => get().refreshToken,
            isAdmin: () => get().user?.role === 'admin',
        }),
        {
            name: 'taskflow-auth', // localStorage key
            partialize: (state) => ({
                user: state.user,
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
)

export default useAuthStore