"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = getDashboardStats;
const prisma_1 = __importDefault(require("../prisma"));
const client_1 = require("@prisma/client");
async function getDashboardStats() {
    const [openTicketsCount, pendingTicketsCount, totalSystemsCount, unassignedSystemsCount,] = await prisma_1.default.$transaction([
        prisma_1.default.ticket.count({ where: { status: client_1.TicketStatus.OPEN } }),
        prisma_1.default.ticket.count({ where: { status: client_1.TicketStatus.PENDING } }),
        prisma_1.default.systemInfo.count(),
        prisma_1.default.systemInfo.count({ where: { user: null } }),
    ]);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const resolvedTodayCount = await prisma_1.default.ticket.count({
        where: {
            status: client_1.TicketStatus.RESOLVED,
            updatedAt: {
                gte: today,
            },
        },
    });
    return {
        openTickets: openTicketsCount,
        pendingTickets: pendingTicketsCount,
        resolvedToday: resolvedTodayCount,
        totalSystems: totalSystemsCount,
        systemsNeedingUsers: unassignedSystemsCount,
    };
}
