"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAndAssignUser = createAndAssignUser;
exports.detachUserFromSystem = detachUserFromSystem;
exports.forceReassignUser = forceReassignUser;
exports.getUserProfile = getUserProfile;
exports.updateUserProfile = updateUserProfile;
exports.changeUserPassword = changeUserPassword;
const prisma_1 = __importDefault(require("../prisma"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const error_middleware_1 = require("../api/middlewares/error.middleware");
async function createAndAssignUser(data) {
    const { email, systemId } = data;
    const targetSystem = await prisma_1.default.systemInfo.findUnique({
        where: { id: systemId },
        include: { user: true }
    });
    if (!targetSystem) {
        throw new error_middleware_1.CustomError('Target system not found', 404);
    }
    if (targetSystem.user) {
        throw new error_middleware_1.CustomError(`System ${targetSystem.hostname} is already assigned to ${targetSystem.user.fullname}`, 409);
    }
    const existingUser = await prisma_1.default.user.findUnique({
        where: { email },
        include: { system: true }
    });
    if (existingUser) {
        if (existingUser.systemId && existingUser.systemId !== systemId) {
            return {
                reassignmentRequired: true,
                user: existingUser,
                oldSystem: existingUser.system,
                newSystem: targetSystem,
            };
        }
        throw new error_middleware_1.CustomError('This user already exists but has no system assigned. Please detach them first.', 409);
    }
    const hashedPassword = await bcryptjs_1.default.hash(data.password, 10);
    const newUser = await prisma_1.default.user.create({
        data: {
            fullname: data.fullname,
            email: data.email,
            password: hashedPassword,
            sector: data.sector,
            phone: data.phone,
            role: data.role,
            avatarUrl: data.avatarUrl,
            loginDate: new Date(),
            system: {
                connect: { id: systemId },
            },
        },
    });
    await prisma_1.default.systemInfo.update({
        where: { id: systemId },
        data: { userDetachedAt: null }
    });
    const { password, ...userWithoutPassword } = newUser;
    return { user: userWithoutPassword, reassignmentRequired: false };
}
async function detachUserFromSystem(systemId) {
    const system = await prisma_1.default.systemInfo.findUnique({
        where: { id: systemId },
        include: { user: true }
    });
    if (!system) {
        throw new error_middleware_1.CustomError('System not found', 404);
    }
    if (!system.user) {
        return system;
    }
    return prisma_1.default.systemInfo.update({
        where: { id: systemId },
        data: {
            user: { disconnect: true },
            userDetachedAt: new Date(),
        },
    });
}
async function forceReassignUser(userId, newSystemId) {
    const user = await prisma_1.default.user.findUnique({
        where: { id: userId },
        select: { systemId: true }
    });
    if (!user || !user.systemId) {
        throw new error_middleware_1.CustomError('User not found or is not assigned to any system.', 404);
    }
    const oldSystemId = user.systemId;
    if (oldSystemId === newSystemId) {
        throw new error_middleware_1.CustomError('User is already assigned to this system.', 409);
    }
    return prisma_1.default.$transaction(async (tx) => {
        const updatedUser = await tx.user.update({
            where: { id: userId },
            data: {
                system: { connect: { id: newSystemId } },
            },
            include: {
                system: true
            }
        });
        await tx.systemInfo.update({
            where: { id: oldSystemId },
            data: {
                userDetachedAt: new Date(),
            },
        });
        await tx.systemInfo.update({
            where: { id: newSystemId },
            data: { userDetachedAt: null }
        });
        return updatedUser;
    });
}
async function getUserProfile(userId) {
    const user = await prisma_1.default.user.findUnique({
        where: { id: userId },
        include: {
            system: {
                include: {
                    user: true,
                    computerUsers: true,
                    hardware: { include: { cpu: true, memory: true } },
                    network: { include: { adapters: true } },
                    disks: true,
                    printers: true,
                },
            },
        },
    });
    if (!user) {
        throw new error_middleware_1.CustomError('User not found', 404);
    }
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
}
async function updateUserProfile(userId, data) {
    const updatedUser = await prisma_1.default.user.update({
        where: { id: userId },
        data: data,
    });
    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
}
async function changeUserPassword(userId, currentPassword, newPassword) {
    const user = await prisma_1.default.user.findUnique({
        where: { id: userId },
    });
    if (!user) {
        throw new error_middleware_1.CustomError('User not found', 404);
    }
    const isPasswordValid = await bcryptjs_1.default.compare(currentPassword, user.password);
    if (!isPasswordValid) {
        throw new error_middleware_1.CustomError('Incorrect current password', 403);
    }
    const hashedNewPassword = await bcryptjs_1.default.hash(newPassword, 10);
    await prisma_1.default.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword },
    });
    return { message: 'Password updated successfully' };
}
