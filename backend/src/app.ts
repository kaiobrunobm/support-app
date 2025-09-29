import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http'; 
import { initializeSocket } from './websocket';
import path from 'path';

import systemRoutes from './api/routes/system.routes';
import authRoutes from './api/routes/auth.routes';
import userRoutes from './api/routes/user.routes';
import ticketRoutes from './api/routes/ticket.routes';
import uploadRoutes from './api/routes/upload.routes';
import dashboardRoutes from './api/routes/dashboard.routes';
import historyRoutes from './api/routes/history.routes';

import { errorHandler } from './api/middlewares/error.middleware';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = initializeSocket(server);

app.set('io', io);

app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

app.use(cors());
app.use(express.json());

app.use('/system-info', systemRoutes);
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/tickets', ticketRoutes);
app.use('/uploads', uploadRoutes); 
app.use('/dashboard', dashboardRoutes);
app.use('/history', historyRoutes); 
  


app.use(errorHandler);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server and WebSocket are running on port ${PORT}`);
});

export default server; 

