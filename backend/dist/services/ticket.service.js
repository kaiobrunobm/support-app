"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTicket = createTicket;
exports.getTicketsByStatus = getTicketsByStatus;
exports.getTicketDetails = getTicketDetails;
exports.updateTicketStatus = updateTicketStatus;
exports.addMessageToTicket = addMessageToTicket;
exports.assignAndPendTicket = assignAndPendTicket;
exports.findActiveTicketForUser = findActiveTicketForUser;
const prisma_1 = __importDefault(require("../prisma"));
const error_middleware_1 = require("../api/middlewares/error.middleware");
async function createTicket(subject, initialMessage, requesterId) {
    const requester = await prisma_1.default.user.findUnique({
        where: { id: requesterId },
        select: { systemId: true }
    });
    if (!requester || !requester.systemId) {
        throw new error_middleware_1.CustomError('Could not find an associated system for this user.', 404);
    }
    return prisma_1.default.$transaction(async (tx) => {
        const newTicket = await tx.ticket.create({
            data: {
                subject: subject,
                status: 'OPEN',
                requesterId: requesterId,
                systemId: requester.systemId,
            },
        });
        await tx.message.create({
            data: {
                content: initialMessage,
                ticketId: newTicket.id,
                senderId: requesterId,
            },
        });
        return newTicket;
    });
}
async function getTicketsByStatus(status) {
    return prisma_1.default.ticket.findMany({
        where: { status },
        orderBy: { createdAt: 'desc' },
        include: {
            requester: { select: { fullname: true, avatarUrl: true, sector: true } },
            system: { select: { hostname: true } }
        }
    });
}
async function getTicketDetails(ticketId, userId, userRole) {
    const ticket = await prisma_1.default.ticket.findUnique({
        where: { id: ticketId },
        include: {
            messages: { orderBy: { createdAt: 'asc' }, include: { sender: { select: { fullname: true, avatarUrl: true, role: true } } } },
            requester: true,
            assignee: true,
            system: true,
        }
    });
    if (!ticket) {
        throw new error_middleware_1.CustomError('Ticket not found', 404);
    }
    if (userRole === 'USER' && ticket.requesterId !== userId) {
        throw new error_middleware_1.CustomError('Forbidden: You do not have permission to view this ticket.', 403);
    }
    return ticket;
}
async function updateTicketStatus(ticketId, newStatus, itSupportUserId, io) {
    const ticket = await prisma_1.default.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) {
        throw new error_middleware_1.CustomError('Ticket not found', 404);
    }
    const oldStatus = ticket.status;
    let assigneeId = ticket.assigneeId;
    if (!assigneeId && newStatus === 'PENDING') {
        assigneeId = itSupportUserId;
    }
    const updatedTicket = await prisma_1.default.ticket.update({
        where: { id: ticketId },
        data: {
            status: newStatus,
            assigneeId: assigneeId,
        },
        include: {
            messages: { orderBy: { createdAt: 'asc' }, include: { sender: { select: { fullname: true, avatarUrl: true, role: true } } } },
            requester: true,
            assignee: true,
            system: true,
        }
    });
    if (oldStatus !== newStatus) {
        await prisma_1.default.ticketHistory.create({
            data: {
                action: 'STATUS_CHANGED',
                ticketId: ticketId,
                userId: itSupportUserId,
                details: { from: oldStatus, to: newStatus }
            }
        });
    }
    io.to(ticketId).emit('ticketStatusUpdated', updatedTicket);
    return updatedTicket;
}
async function addMessageToTicket(ticketId, senderId, content, imageUrl, io) {
    const ticket = await prisma_1.default.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) {
        throw new error_middleware_1.CustomError('Ticket not found', 404);
    }
    const newMessage = await prisma_1.default.message.create({
        data: { content, imageUrl, ticketId, senderId },
        include: {
            sender: { select: { fullname: true, avatarUrl: true, role: true } }
        }
    });
    io.to(ticketId).emit('receiveMessage', newMessage);
    return newMessage;
}
async function assignAndPendTicket(ticketId, itSupportUserId) {
    const ticket = await prisma_1.default.ticket.findUnique({
        where: { id: ticketId },
        select: { status: true }
    });
    if (!ticket || ticket.status !== 'OPEN') {
        return null;
    }
    const updatedTicket = await prisma_1.default.ticket.update({
        where: { id: ticketId },
        data: {
            status: 'PENDING',
            assigneeId: itSupportUserId,
        },
        include: {
            messages: { orderBy: { createdAt: 'asc' }, include: { sender: { select: { fullname: true, avatarUrl: true, role: true } } } },
            requester: true,
            assignee: true,
            system: true,
        }
    });
    await prisma_1.default.ticketHistory.create({
        data: {
            action: 'ASSIGNED',
            ticketId: ticketId,
            userId: itSupportUserId,
            details: { assigneeName: updatedTicket.assignee?.fullname }
        }
    });
    return updatedTicket;
}
async function findActiveTicketForUser(requesterId) {
    // A user should only have one active ticket at a time.
    // We find the first one that matches.
    return prisma_1.default.ticket.findFirst({
        where: {
            requesterId: requesterId,
            status: {
                in: ['OPEN', 'PENDING'], // Check for either status
            },
        },
        // Only select the ID, as that's all we need for redirection
        select: {
            id: true,
        },
    });
}
