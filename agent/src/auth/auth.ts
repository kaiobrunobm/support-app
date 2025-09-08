import { PrismaClient } from "@prisma/client";
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      system: {
        include: {
          hardware: {
            include: {
              cpu: true,
              memory: true
            }
          },
          network: {
            include: { adapters: true }
          },
          disks: true,
          printers: true,
          users: true
        }
      }
    }
  });

  if (!user) {
    throw new Error("User not found");
  }

  // If you store hashed passwords
  const valid = user.password ? await bcrypt.compare(password, user.password) : false;
  if (!valid) {
    throw new Error("Invalid password");
  }

  return user;
}

