import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

let socket = null

const socketService = {
    // Connect to socket server
    connect: (userId) => {
        if (socket?.connected) return socket

        socket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        })

        socket.on('connect', () => {
            console.log('🔌 Socket connected:', socket.id)
            // Join personal room
            if (userId) {
                socket.emit('join_user_room', userId)
            }
        })

        socket.on('disconnect', (reason) => {
            console.log('🔌 Socket disconnected:', reason)
        })

        socket.on('connect_error', (err) => {
            console.error('❌ Socket connection error:', err.message)
        })

        return socket
    },

    // Disconnect
    disconnect: () => {
        if (socket) {
            socket.disconnect()
            socket = null
            console.log('🔌 Socket manually disconnected')
        }
    },

    // Join task room
    joinTaskRoom: (taskId) => {
        socket?.emit('join_task_room', taskId)
    },

    // Leave task room
    leaveTaskRoom: (taskId) => {
        socket?.emit('leave_task_room', taskId)
    },

    // Listen to event
    on: (event, callback) => {
        socket?.on(event, callback)
    },

    // Remove listener
    off: (event, callback) => {
        socket?.off(event, callback)
    },

    // Get socket instance
    getSocket: () => socket,

    // Check connection
    isConnected: () => socket?.connected || false,
}

export default socketService