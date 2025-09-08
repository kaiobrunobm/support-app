import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import systemRoutes from "./modules/system.routes";
import authRouter from "./modules/auth.routes"

dotenv.config();

const app = express();


app.use(cors());
app.use(express.json());

app.use("/system-info", systemRoutes);
app.use("/auth", authRouter)



export default app
