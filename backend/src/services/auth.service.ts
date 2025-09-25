import prisma from '../prisma';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { CustomError } from '../api/middlewares/error.middleware';

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
        system: {
            include: {
                hardware: { include: { cpu: true, memory: true } },
                network: { include: { adapters: true } },
                disks: true,
                printers: true,
            }
        }
    }
  });

  if (!user) {
    throw new CustomError('Invalid credentials', 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new CustomError('Invalid credentials', 401);
  }

  const token = jwt.sign(
    { id: user.id, role: user.role, fullname: user.fullname },
    process.env.JWT_SECRET!,
    { expiresIn: '1d' }
  );

  await prisma.user.update({
    where: { id: user.id },
    data: { loginDate: new Date() },
  });

  const { password: _, ...userWithoutPassword } = user;

  return { user: userWithoutPassword, token };
}

