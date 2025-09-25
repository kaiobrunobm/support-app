import { z } from "zod";

export const RoleSchema = z.enum(["USER", "ADMIN", "IT_SUPPORT"]);
export const TicketStatusSchema = z.enum(["OPEN", "PENDING", "RESOLVED", "CANCELLED"]);
export const ActionTypeSchema = z.enum(["ASSIGNED", "DETACHED"]);


const cpuSchema = z.object({
  manufacturer: z.string(),
  model: z.string(),
  cores: z.number().int(),
  speed: z.number(),
  socket: z.string().nullish(),
});

const memorySchema = z.object({
  size: z.number(),
  type: z.string().nullish(),
  clockSpeed: z.number().int(),
  used: z.number().nullish(),
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
  networkGetway: z.string(),
  ssidConected: z.string(),
});

const networkSchema = z.object({
  publicIP: z.string(),
  adapters: z.array(adapterSchema),
});

const diskSchema = z.object({
  device: z.string(),
  type: z.string(),
  name: z.string(),
  vendor: z.string(),
  serialNumber: z.string(),
  size: z.number(),
  used: z.number().nullish(),
});

const printerSchema = z.object({
  name: z.string(),
  port: z.string().nullish(),
  ip: z.string().nullish(),
});


export const systemInfoPayloadSchema = z.object({
  hostname: z.string(),
  platform: z.string(),
  distro: z.string(),
  release: z.string(),
  build: z.string().nullish(),
  kernel: z.string(),
  arch: z.string(),
  domain: z.string(),
  uptime: z.string(),
  anydesk: z.string().nullish(),

  hardware: hardwareSchema,
  network: networkSchema,
  disks: z.array(diskSchema),
  printers: z.array(printerSchema),
});


export const createUserSchema = z.object({
    fullname: z.string().min(1, "Full name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    sector: z.string(),
    phone: z.string(),
    role: RoleSchema.optional(),
    systemId: z.string().uuid("A valid system ID must be provided"),
});

export const createTicketSchema = z.object({
    systemId: z.string().uuid(),
    requesterId: z.string().uuid(),
    initialMessage: z.string().min(10, "Message must be at least 10 characters"),
});

export const createMessageSchema = z.object({
    content: z.string().min(1),
    ticketId: z.string().uuid(),
    senderId: z.string().uuid(),
});

export const createAssignmentHistorySchema = z.object({
    reason: z.string(),
    action: ActionTypeSchema,
    systemId: z.string().uuid(),
    userId: z.string().uuid(),
});
