"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.systemInfoSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const memorySchema = zod_1.default.object({
    size: zod_1.default.number(), // GB
    type: zod_1.default.string().nullable().optional(),
    clockSpeed: zod_1.default.number(),
});
const cpuSchema = zod_1.default.object({
    manufacturer: zod_1.default.string(),
    model: zod_1.default.string(),
    cores: zod_1.default.number(),
    speed: zod_1.default.number(),
    socket: zod_1.default.string().nullable().optional(),
});
const hardwareSchema = zod_1.default.object({
    cpu: cpuSchema,
    memory: zod_1.default.array(memorySchema),
});
const adapterSchema = zod_1.default.object({
    name: zod_1.default.string(),
    ip: zod_1.default.string(),
    mask: zod_1.default.string(),
    mac: zod_1.default.string(),
    type: zod_1.default.string(),
    speed: zod_1.default.number().nullable(),
});
const networkSchema = zod_1.default.object({
    publicIP: zod_1.default.string(),
    adapters: zod_1.default.array(adapterSchema),
});
const userSchema = zod_1.default.object({
    username: zod_1.default.string(),
    loginDate: zod_1.default.string().transform((d) => new Date(d)),
});
const diskSchema = zod_1.default.object({
    device: zod_1.default.string(),
    type: zod_1.default.string(),
    name: zod_1.default.string(),
    vendor: zod_1.default.string(),
    serialNumber: zod_1.default.string(),
    size: zod_1.default.number(), // GB
});
const printerSchema = zod_1.default.object({
    name: zod_1.default.string(),
    port: zod_1.default.string().nullable().optional(),
    ip: zod_1.default.string().nullable().optional(),
});
exports.systemInfoSchema = zod_1.default.object({
    hostname: zod_1.default.string(),
    platform: zod_1.default.string(),
    distro: zod_1.default.string(),
    release: zod_1.default.string(),
    build: zod_1.default.string().optional(),
    kernel: zod_1.default.string(),
    arch: zod_1.default.string(),
    domain: zod_1.default.string(),
    uptime: zod_1.default.string(),
    hardware: hardwareSchema,
    network: networkSchema,
    users: zod_1.default.array(userSchema),
    disks: zod_1.default.array(diskSchema),
    printers: zod_1.default.array(printerSchema),
});
