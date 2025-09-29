"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSystemHistory = getSystemHistory;
exports.getTicketHistory = getTicketHistory;
const prisma_1 = __importDefault(require("../prisma"));
async function getSystemHistory(systemId) {
    return prisma_1.default.assignmentHistory.findMany({
        where: { systemId },
        orderBy: { createdAt: 'desc' },
    });
}
async function getTicketHistory(ticketId) {
    return prisma_1.default.ticketHistory.findMany({
        where: { ticketId },
        orderBy: { createdAt: 'desc' },
        include: {
            user: {
                select: { fullname: true, avatarUrl: true }
            }
        }
    });
}
