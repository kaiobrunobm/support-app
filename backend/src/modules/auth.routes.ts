import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from 'jsonwebtoken'
import dotenv from "dotenv";

dotenv.config();

const router = Router();
const prisma = new PrismaClient();

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        system: {
          include: {
            hardware: { include: { cpu: true, memory: true } },
            network: { include: { adapters: true } },
            users: true,
            disks: true,
            printers: true,
          },
        },
      },
    });

    if (!user || !user.password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isValid = password === user.password

    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "1d" }
    );

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { loginDate: new Date() },
    });

    return res.json({ success: true, user: { data: user }, token });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});


router.get("/me", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    const user = await prisma.user.findUnique({
      where: { id: (decoded as any).id },
      include: { system: true },
    });
    return res.json({ success: true, user });
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
});

export default router;
