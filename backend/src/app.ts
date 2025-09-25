import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import systemRoutes from './api/routes/system.routes';
import authRouter from './api/routes/auth.routes'; 
import { errorHandler } from './api/middlewares/error.middleware';

dotenv.config(); 

const app = express();

app.use(cors());
app.use(express.json());

app.use('/system-info', systemRoutes);
app.use('/auth', authRouter);

app.use(errorHandler);

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.PORT || 3000}`);
});

export default app;
