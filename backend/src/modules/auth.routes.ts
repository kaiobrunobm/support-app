import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// POST /auth/login
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

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { loginDate: new Date() },
    });

    return res.json({ success: true, user: { data: user.system }, });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
