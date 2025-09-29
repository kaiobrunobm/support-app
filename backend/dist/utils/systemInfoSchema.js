"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSystemInfoSchema = exports.changePasswordSchema = exports.updateUserProfileSchema = exports.createAssignmentHistorySchema = exports.updateTicketStatusSchema = exports.createMessageSchema = exports.createTicketSchema = exports.createUserSchema = exports.systemInfoPayloadSchema = exports.ActionTypeSchema = exports.TicketStatusSchema = exports.RoleSchema = void 0;
const zod_1 = require("zod");
exports.RoleSchema = zod_1.z.enum(["USER", "ADMIN", "IT_SUPPORT"]);
exports.TicketStatusSchema = zod_1.z.enum(["OPEN", "PENDING", "RESOLVED", "CANCELLED"]);
exports.ActionTypeSchema = zod_1.z.enum(["ASSIGNED", "DETACHED"]);
const cpuSchema = zod_1.z.object({
    manufacturer: zod_1.z.string(),
    model: zod_1.z.string(),
    cores: zod_1.z.number().int(),
    speed: zod_1.z.number(),
    socket: zod_1.z.string().nullish(),
});
const memorySchema = zod_1.z.object({
    size: zod_1.z.number(),
    type: zod_1.z.string().nullish(),
    clockSpeed: zod_1.z.number().int(),
    used: zod_1.z.number().nullish(),
});
const hardwareSchema = zod_1.z.object({
    cpu: cpuSchema,
    memory: zod_1.z.array(memorySchema),
});
const adapterSchema = zod_1.z.object({
    name: zod_1.z.string(),
    ip: zod_1.z.string(),
    mask: zod_1.z.string(),
    mac: zod_1.z.string(),
    type: zod_1.z.string(),
    networkGetway: zod_1.z.string(),
    ssidConected: zod_1.z.string(),
});
const networkSchema = zod_1.z.object({
    publicIP: zod_1.z.string(),
    adapters: zod_1.z.array(adapterSchema),
});
const diskSchema = zod_1.z.object({
    device: zod_1.z.string(),
    type: zod_1.z.string(),
    name: zod_1.z.string(),
    vendor: zod_1.z.string(),
    serialNumber: zod_1.z.string(),
    size: zod_1.z.number(),
    used: zod_1.z.number().nullish(),
});
const printerSchema = zod_1.z.object({
    name: zod_1.z.string(),
    port: zod_1.z.string().nullish(),
    ip: zod_1.z.string().nullish(),
});
const computerUserSchema = zod_1.z.object({
    username: zod_1.z.string(),
    loginDate: zod_1.z.string().datetime(),
});
exports.systemInfoPayloadSchema = zod_1.z.object({
    hostname: zod_1.z.string(),
    platform: zod_1.z.string(),
    distro: zod_1.z.string(),
    release: zod_1.z.string(),
    build: zod_1.z.string().nullish(),
    kernel: zod_1.z.string(),
    arch: zod_1.z.string(),
    domain: zod_1.z.string(),
    uptime: zod_1.z.string(),
    anydesk: zod_1.z.string().nullish(),
    hardware: hardwareSchema,
    network: networkSchema,
    disks: zod_1.z.array(diskSchema),
    printers: zod_1.z.array(printerSchema),
    computerUsers: zod_1.z.array(computerUserSchema),
});
exports.createUserSchema = zod_1.z.object({
    firstname: zod_1.z.string().min(1, "First name is required"),
    lastname: zod_1.z.string().min(1, "Last name is required"),
    email: zod_1.z.string().email("Invalid email address"),
    password: zod_1.z.string().min(8, "Password must be at least 8 characters"),
    sector: zod_1.z.string().min(1, "Sector is required"),
    phone: zod_1.z.string().min(1, "Phone number is required"),
    role: zod_1.z.enum(["USER", "IT_SUPPORT"]),
    systemId: zod_1.z.string().uuid("A valid system ID must be provided"),
    avatarUrl: zod_1.z.string().url("Must be a valid URL").nullish(),
}).transform((data) => ({
    ...data,
    fullname: `${data.firstname} ${data.lastname}`,
}));
exports.createTicketSchema = zod_1.z.object({
    subject: zod_1.z.string().min(5, "Subject must be at least 5 characters"),
    initialMessage: zod_1.z.string().min(1, "An initial message is required"),
});
exports.createMessageSchema = zod_1.z.object({
    content: zod_1.z.string(),
    imageUrl: zod_1.z.string().url("Invalid URL format for image").optional()
}).refine(data => data.content || data.imageUrl, {
    message: "Message must have either content or an image URL.",
    path: ["content"],
});
exports.updateTicketStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(["PENDING", "RESOLVED"]),
});
exports.createAssignmentHistorySchema = zod_1.z.object({
    reason: zod_1.z.string(),
    action: exports.ActionTypeSchema,
    systemId: zod_1.z.string().uuid(),
    userId: zod_1.z.string().uuid(),
});
exports.updateUserProfileSchema = zod_1.z.object({
    fullname: zod_1.z.string().min(1, "Full name is required").optional(),
    phone: zod_1.z.string().min(1, "Phone number is required").optional(),
    sector: zod_1.z.string().min(1, "Sector is required").optional(),
    avatarUrl: zod_1.z.string().url("Must be a valid URL").nullish().optional(),
}).refine(data => Object.keys(data).length > 0, {
    message: "At least one field must be provided to update.",
});
exports.changePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string(),
    newPassword: zod_1.z.string().min(8, "New password must be at least 8 characters"),
});
exports.updateSystemInfoSchema = zod_1.z.object({
    hostname: zod_1.z.string().min(1, "Hostname cannot be empty").optional(),
    domain: zod_1.z.string().min(1, "Domain cannot be empty").optional(),
    anydesk: zod_1.z.string().nullish().optional(),
}).refine(data => Object.keys(data).length > 0, {
    message: "Request body must not be empty. Provide at least one field to update.",
});
