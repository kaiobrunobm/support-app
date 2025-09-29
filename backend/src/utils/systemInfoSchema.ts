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

const computerUserSchema = z.object({
  username: z.string(),
  loginDate: z.string().datetime(), 
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
  
  computerUsers: z.array(computerUserSchema),
});


export const createUserSchema = z.object({
  firstname: z.string().min(1, "First name is required"),
  lastname: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  sector: z.string().min(1, "Sector is required"),
  phone: z.string().min(1, "Phone number is required"),
  role: z.enum(["USER", "IT_SUPPORT"]),
  systemId: z.string().uuid("A valid system ID must be provided"),
  avatarUrl: z.string().url("Must be a valid URL").nullish(),
}).transform((data) => ({
  ...data,
  fullname: `${data.firstname} ${data.lastname}`,
}));

export const createTicketSchema = z.object({
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  initialMessage: z.string().min(1, "An initial message is required"),
});

export const createMessageSchema = z.object({
  content: z.string().min(1, "Message content cannot be empty"),
  imageUrl: z.string().url("Invalid URL format for image").nullish(),
});

export const updateTicketStatusSchema = z.object({
  status: z.enum(["PENDING", "RESOLVED"]),
});


export const createAssignmentHistorySchema = z.object({
  reason: z.string(),
  action: ActionTypeSchema,
  systemId: z.string().uuid(),
  userId: z.string().uuid(),
});

export const updateUserProfileSchema = z.object({
  fullname: z.string().min(1, "Full name is required").optional(),
  phone: z.string().min(1, "Phone number is required").optional(),
  sector: z.string().min(1, "Sector is required").optional(),
  avatarUrl: z.string().url("Must be a valid URL").nullish().optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: "At least one field must be provided to update.",
});

export const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

export const updateSystemInfoSchema = z.object({
  hostname: z.string().min(1, "Hostname cannot be empty").optional(),
  domain: z.string().min(1, "Domain cannot be empty").optional(),
  anydesk: z.string().nullish().optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: "Request body must not be empty. Provide at least one field to update.",
});


