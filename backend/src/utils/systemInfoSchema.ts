import z from "zod";

const memorySchema = z.object({
  size: z.number(),      // GB
  type: z.string().nullable().optional(),
  clockSpeed: z.number(),
});

const cpuSchema = z.object({
  manufacturer: z.string(),
  model: z.string(),
  cores: z.number(),
  speed: z.number(),
  socket: z.string().nullable().optional(),
});

const hardwareSchema = z.object({
  cpu: cpuSchema,
  memory: z.array(memorySchema),
});

const adapterSchema = z.object({
  name: z.string(),
  ip: z.string(),
  mask: z.string(),
  mac: z.string(),
  type: z.string(),
  speed: z.string(),
});

const networkSchema = z.object({
  publicIP: z.string(),
  adapters: z.array(adapterSchema),
});

const userSchema = z.object({
  username: z.string(),
  loginDate: z.string().transform((d) => new Date(d)),
  loginTime: z.string(),
});

const diskSchema = z.object({
  device: z.string(),
  type: z.string(),
  name: z.string(),
  vendor: z.string(),
  serialNumber: z.string(),
  size: z.number(), // GB
});

const printerSchema = z.object({
  name: z.string(),
  port: z.string().nullable().optional(),
  ip: z.string().nullable().optional(),
});

export const systemInfoSchema = z.object({
  hostname: z.string(),
  platform: z.string(),
  distro: z.string(),
  release: z.string(),
  build: z.string().optional(),
  kernel: z.string(),
  arch: z.string(),
  domain: z.string(),
  uptime: z.string(),

  hardware: hardwareSchema,
  network: networkSchema,
  users: z.array(userSchema),
  disks: z.array(diskSchema),
  printers: z.array(printerSchema),
});

