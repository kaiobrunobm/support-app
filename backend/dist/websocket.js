"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeSocket = initializeSocket;
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ticket_service_1 = require("./services/ticket.service");
function initializeSocket(httpServer) {
    const io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });
    io.use((socket, next) => {
        try {
            let token = socket.handshake.auth.token || socket.handshake.query.token;
            if (!token) {
                return next(new Error('Authentication error: No token provided'));
            }
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            socket.user = decoded;
            next();
        }
        catch (error) {
            console.error("Socket authentication error:", error.message);
            return next(new Error('Authentication error: Invalid token'));
        }
    });
    io.on('connection', (socket) => {
        console.log(`User connected via WebSocket: ${socket.id}`);
        const user = socket.user;
        socket.on('joinTicketRoom', async (ticketId) => {
            socket.join(ticketId);
            console.log(`User ${socket.id} joined room: ${ticketId}`);
            if (user && (user.role === 'IT_SUPPORT' || user.role === 'ADMIN')) {
                try {
                    const updatedTicket = await (0, ticket_service_1.assignAndPendTicket)(ticketId, user.id);
                    if (updatedTicket) {
                        console.log(`Ticket ${ticketId} status changed to PENDING by ${user.id}`);
                        io.to(ticketId).emit('ticketStatusUpdated', updatedTicket);
                    }
                }
                catch (error) {
                    console.error(`Failed to update ticket ${ticketId} status:`, error);
                }
            }
        });
        socket.on('sendMessage', (messageData) => {
            socket.to(messageData.ticketId).emit('receiveMessage', messageData);
        });
        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });
    return io;
}
