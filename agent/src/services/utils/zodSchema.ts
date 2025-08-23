import { z } from 'zod'

export const systemInfoSchema = z.object({
  hostname: z.string(),
  platform: z.string(),
  distro: z.string(),
  release: z.string(),
  build: z.string().nullable().optional(),
  kernel: z.string(),
  arch: z.string(),
  domain: z.string(),
  uptime: z.string(),
  hardware: z.object({
    cpu: z.object({
      manufacturer: z.string(),
      model: z.string(),
      cores: z.number(),
      speed: z.number(),
      socket: z.string().nullable().optional()
    }),
    memory: z.array(z.object({
      size: z.number(),
      type: z.string().nullable().optional(),
      used: z.number(),
      clockSpeed: z.number()
    }))
  }),
  network: z.object({
    publicIP: z.string(),
    adapters: z.array(z.object({
      name: z.string(),
      ip: z.string().nullable(),
      mask: z.string().nullable(),
      mac: z.string().nullable(),
      type: z.string().nullable(),
      speed: z.number().nullable(),
      networkGetway: z.string().nullable(),
      ssidConected: z.string().nullable()
    }))
  }),
  users: z.array(z.object({
    username: z.string(),
    loginDate: z.string(),
  })),
  disks: z.array(z.object({
    device: z.string(),
    type: z.string(),
    name: z.string(),
    vendor: z.string(),
    serialNumber: z.string(),
    size: z.number(),
    used: z.number()
  })),
  printers: z.array(z.object({
    name: z.string(),
    ip: z.string().nullable(),
    port: z.string().nullable()
  }))
});

