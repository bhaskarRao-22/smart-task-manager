import { Server } from 'socket.io';

let io;

const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: (origin, callback) => {
                if (!origin) return callback(null, true);
                if (
                    origin === (process.env.FRONTEND_URL || 'http://localhost:5173') ||
                    origin === 'http://localhost:5173' ||
                    origin === 'http://localhost:4173' ||
                    origin.endsWith('.vercel.app')
                ) {
                    return callback(null, true);
                }
                return callback(new Error('Socket CORS blocked'));
            },
            methods: ['GET', 'POST'],
            credentials: true,
        },
        pingTimeout: 60000,
        pingInterval: 25000,
    });

    io.on('connection', (socket) => {
        console.log(`🔌 Socket connected: ${socket.id}`);

        // User joins their personal room (for targeted notifications)
        socket.on('join_user_room', (userId) => {
            if (userId) {
                socket.join(`user_${userId}`);
                console.log(`User ${userId} joined their room`);
            }
        });

        // User joins a task room (to get updates on specific task)
        socket.on('join_task_room', (taskId) => {
            if (taskId) {
                socket.join(`task_${taskId}`);
                console.log(`Socket joined task room: ${taskId}`);
            }
        });

        // User leaves a task room
        socket.on('leave_task_room', (taskId) => {
            if (taskId) {
                socket.leave(`task_${taskId}`);
            }
        });

        socket.on('disconnect', (reason) => {
            console.log(`Socket disconnected: ${socket.id} — ${reason}`);
        });

        socket.on('error', (err) => {
            console.error(`Socket error [${socket.id}]:`, err.message);
        });
    });

    console.log('✅ Socket.io initialized');
    return io;
};

// Helper: emit task update to all connected clients
const emitTaskUpdate = (event, data) => {
    if (!io) return;
    io.emit(event, data);
};

// Helper: emit to a specific task room
const emitToTaskRoom = (taskId, event, data) => {
    if (!io) return;
    io.to(`task_${taskId}`).emit(event, data);
};

// Helper: emit to a specific user room
const emitToUser = (userId, event, data) => {
    if (!io) return;
    io.to(`user_${userId}`).emit(event, data);
};

const getIO = () => {
    if (!io) throw new Error('Socket.io not initialized');
    return io;
};

module.exports = { initSocket, emitTaskUpdate, emitToTaskRoom, emitToUser, getIO };