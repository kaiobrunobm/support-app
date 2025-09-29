"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upsertSystemInfo = upsertSystemInfo;
exports.searchSystems = searchSystems;
exports.findSystemById = findSystemById;
exports.getAllSystems = getAllSystems;
exports.updateSystemDetails = updateSystemDetails;
const prisma_1 = __importDefault(require("../prisma"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const error_middleware_1 = require("../api/middlewares/error.middleware");
async function upsertSystemInfo(data) {
    return prisma_1.default.$transaction(async (tx) => {
        const systemCount = await tx.systemInfo.count();
        let createdAdmin = null;
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
            const hashedPassword = await bcryptjs_1.default.hash('admin', 10);
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
async function searchSystems(query) {
    return prisma_1.default.systemInfo.findMany({
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
async function findSystemById(id) {
    return prisma_1.default.systemInfo.findUnique({
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
async function getAllSystems() {
    return prisma_1.default.systemInfo.findMany({
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
            },
            _count: {
                select: {
                    tickets: true,
                },
            },
        },
    });
}
//TODO change the logic to not update the info of the system like hostname, distro ip, this data the app get from the system of the user
async function updateSystemDetails(systemId, data) {
    const system = await prisma_1.default.systemInfo.findUnique({
        where: { id: systemId },
    });
    if (!system) {
        throw new error_middleware_1.CustomError('System not found', 404);
    }
    const updatedSystem = await prisma_1.default.systemInfo.update({
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
