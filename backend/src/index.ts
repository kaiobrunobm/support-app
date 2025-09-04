import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import systemRoutes from "./modules/system.routes";

dotenv.config();

const app = express();


app.use(cors());
app.use(express.json());

app.use("/system-info", systemRoutes);

export default app
