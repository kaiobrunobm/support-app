import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { systemInfoSchema } from "../utils/systemInfoSchema";

const router = Router();
const prisma = new PrismaClient();

router.post("/", async (req, res) => {
  try {
    const data = systemInfoSchema.parse(req.body);

    const system = await prisma.systemInfo.upsert({
      where: {
        hostname_domain: { hostname: data.hostname, domain: data.domain },
      },
      create: {
        hostname: data.hostname,
        platform: data.platform,
        distro: data.distro,
        release: data.release,
        build: data.build,
        kernel: data.kernel,
        arch: data.arch,
        domain: data.domain,
        uptime: data.uptime,
        hardware: {
          create: {
            cpu: {
              create: {
                manufacturer: data.hardware.cpu.manufacturer,
                model: data.hardware.cpu.model,
                cores: data.hardware.cpu.cores,
                speed: data.hardware.cpu.speed,
                socket: data.hardware.cpu.socket ?? null
              }
            },
            memory: {
              create: data.hardware.memory.map((m) => ({
                size: m.size,
                type: m.type ?? null,
                clockSpeed: m.clockSpeed,
              }))
            }
          }
        },
        network: {
          create: {
            publicIP: data.network.publicIP,
            adapters: {
              create: data.network.adapters.map((a) => ({
                name: a.name,
                ip: a.ip,
                mask: a.mask,
                mac: a.mac,
                type: a.type,
                speed: a.speed,
              }))
            }
          }
        },
        users: {
          create: data.users.map((u) => ({
            username: u.username,
            loginDate: u.loginDate,
            loginTime: u.loginTime,
          }))
        },
        disks: {
          create: data.disks.map((d) => ({
            device: d.device,
            type: d.type,
            name: d.name,
            vendor: d.vendor,
            serialNumber: d.serialNumber,
            size: d.size,
          }))
        },
        printers: {
          create: data.printers.map((p) => ({
            name: p.name,
            port: p.port ?? null,
            ip: p.ip ?? null,
          }))
        }
      },

      update: {
        platform: data.platform,
        distro: data.distro,
        release: data.release,
        build: data.build,
        kernel: data.kernel,
        arch: data.arch,
        uptime: data.uptime,
        hardware: {
          update: {
            cpu: { update: data.hardware.cpu },
            memory: {
              deleteMany: {},
              create: data.hardware.memory.map((m) => ({
                type: m.type ?? null,
                size: m.size ?? 0,
                clockSpeed: m.clockSpeed ?? null
              }))
            }
          }
        },
        network: {
          update: {
            publicIP: data.network.publicIP,
            adapters: {
              deleteMany: {},
              create: data.network.adapters.map((a) => ({
                name: a.name!,
                ip: a.ip ?? null,
                mask: a.mask ?? null,
                mac: a.mac ?? null,
                type: a.type ?? null,
                speed: a.speed ?? null,
              }))
            }
          }
        },
        users: {
          deleteMany: {},
          create: data.users.map((u) => ({
            username: u.username!,
            loginDate: u.loginDate!,
            loginTime: u.loginTime!,
          }))
        },
        disks: {
          deleteMany: {},
          create: data.disks.map((d) => ({
            device: d.device!,
            type: d.type!,
            name: d.name!,
            vendor: d.vendor!,
            serialNumber: d.serialNumber!,
            size: d.size!,
          }))
        },
        printers: {
          deleteMany: {},
          create: data.printers.map((p) => ({
            name: p.name!,
            ip: p.ip ?? null,
            port: p.port ?? null,
          }))
        }
      }

    });


    res.json(system);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/", async (_, res) => {
  try {
    const systems = await prisma.systemInfo.findMany({
      include: { hardware: true, network: true, users: true, disks: true, printers: true },
    });
    res.json(systems);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

