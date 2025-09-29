import prisma from '../prisma';
import bcrypt from 'bcryptjs';
import { systemInfoPayloadSchema, updateSystemInfoSchema } from '../utils/systemInfoSchema';
import { CustomError } from '../api/middlewares/error.middleware'
import { z } from 'zod';
import { User } from '@prisma/client';

type SystemInfoPayload = z.infer<typeof systemInfoPayloadSchema>;

export async function upsertSystemInfo(data: SystemInfoPayload) {
  return prisma.$transaction(async (tx) => {
    const systemCount = await tx.systemInfo.count();
    
    let createdAdmin: User | null = null;

    const system = await tx.systemInfo.upsert({
      where: {
        hostname_domain: { hostname: data.hostname, domain: data.domain },
      },
      create: {
        ...data,
        hardware: {
          create: {
            cpu: { create: data.hardware.cpu },
            memory: { create: data.hardware.memory },
          },
        },
        network: {
          create: {
            publicIP: data.network.publicIP,
            adapters: { create: data.network.adapters },
          },
        },
        disks: { create: data.disks },
        printers: { create: data.printers },
        computerUsers: {
          create: data.computerUsers.map((u) => ({
            username: u.username,
            loginDate: u.loginDate,
          })),
        },
      },
      update: {
        ...data,
        hardware: {
          update: {
            cpu: { update: data.hardware.cpu },
            memory: { deleteMany: {}, create: data.hardware.memory },
          },
        },
        network: {
          update: {
            publicIP: data.network.publicIP,
            adapters: { deleteMany: {}, create: data.network.adapters },
          },
        },
        disks: { deleteMany: {}, create: data.disks },
        printers: { deleteMany: {}, create: data.printers },
        computerUsers: {
          deleteMany: {}, 
          create: data.computerUsers.map((u) => ({ 
            username: u.username,
            loginDate: u.loginDate,
          })),
        },
      },
    });

    if (systemCount === 0) {
      const hashedPassword = await bcrypt.hash('admin', 10);

      createdAdmin = await tx.user.create({
        data: {
          fullname: 'Default Admin',
          email: 'admin@admin.com',
          password: hashedPassword,
          sector: 'IT',
          phone: '0000000000',
          role: 'ADMIN',
          loginDate: new Date(),
          systemId: system.id,
        },
      });
    }

    return { system, createdAdmin };
  });
}

export async function searchSystems(query: string) {
  return prisma.systemInfo.findMany({
    where: {
      OR: [
        { hostname: { contains: query, mode: 'insensitive' } },
        { domain: { contains: query, mode: 'insensitive' } },
        { network: { adapters: { some: { ip: { contains: query } } } } },
      ],
    },
    take: 5,
   select: {
      id: true,
      hostname: true,
      domain: true,
      network: {
        select: {
          publicIP: true,
          adapters: { select: { ip: true } },
        },
      },
      user: {
        select: {
          fullname: true,
        },
      },
    },
  });
}

export async function findSystemById(id: string) {
  return prisma.systemInfo.findUnique({
    where: { id },
    include: {
      hardware: { include: { cpu: true, memory: true } },
      network: { include: { adapters: true } },
      disks: true,
      printers: true,
      computerUsers: true,
      user: true,
    },
  });
}

export async function getAllSystems() {
  return prisma.systemInfo.findMany({
    orderBy: {
      updatedAt: 'desc',
    },
    select: {
      id: true,
      hostname: true,
      updatedAt: true,
      createdAt: true,
      user: {
        select: {
          fullname: true,
          avatarUrl: true,
        },
      },
      network: {
        select: {
          adapters: {
            select: { ip: true },
            where: { ip: { not: undefined } },
            take: 1
          }
        }
      }
    },
  });
}

type UpdateSystemData = z.infer<typeof updateSystemInfoSchema>;

//TODO change the logic to not update the info of the system like hostname, distro ip, this data the app get from the system of the user
export async function updateSystemDetails(systemId: string, data: UpdateSystemData) {

  const system = await prisma.systemInfo.findUnique({
    where: { id: systemId },
  });

  if (!system) {
    throw new CustomError('System not found', 404);
  }

  const updatedSystem = await prisma.systemInfo.update({
    where: { id: systemId },
    data: data,
    include: {
      user: true,
      computerUsers: true,
      hardware: { include: { cpu: true, memory: true } },
      network: { include: { adapters: true } },
      disks: true,
      printers: true,
    },
  });

  return updatedSystem;
}

