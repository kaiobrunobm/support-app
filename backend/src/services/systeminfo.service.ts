import prisma from '../prisma';
import bcrypt from 'bcryptjs';
import { systemInfoPayloadSchema } from '../utils/systemInfoSchema';
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
      user: true,
    },
  });
}



