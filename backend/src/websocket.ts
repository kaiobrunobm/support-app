import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { assignAndPendTicket } from './services/ticket.service';


export function initializeSocket(httpServer: HttpServer) {
  const io = new Server(httpServer, {
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

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; role: string };
      
      (socket as any).user = decoded;
      next();
      
    } catch (error) {
      console.error("Socket authentication error:", error.message);
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log(`User connected via WebSocket: ${socket.id}`);
    const user = (socket as any).user;

    socket.on('joinTicketRoom', async (ticketId: string) => {
      socket.join(ticketId);
      console.log(`User ${socket.id} joined room: ${ticketId}`);

      if (user && (user.role === 'IT_SUPPORT' || user.role === 'ADMIN')) {
        try {
          const updatedTicket = await assignAndPendTicket(ticketId, user.id);

         
          if (updatedTicket) {
            console.log(`Ticket ${ticketId} status changed to PENDING by ${user.id}`);
            io.to(ticketId).emit('ticketStatusUpdated', updatedTicket);
          }
        } catch (error) {
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

