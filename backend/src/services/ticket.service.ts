import prisma from '../prisma';
import { CustomError } from '../api/middlewares/error.middleware';
import { TicketStatus } from '@prisma/client';
import { Server as SocketIOServer } from 'socket.io'; 


export async function createTicket(subject: string, initialMessage: string, requesterId: string) {
  const requester = await prisma.user.findUnique({
    where: { id: requesterId },
    select: { systemId: true }
  });

  if (!requester || !requester.systemId) {
    throw new CustomError('Could not find an associated system for this user.', 404);
  }

  return prisma.$transaction(async (tx) => {
    const newTicket = await tx.ticket.create({
      data: {
        subject: subject,
        status: 'OPEN',
        requesterId: requesterId,
        systemId: requester.systemId!,
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

export async function getTicketsByStatus(status: TicketStatus, userId: string, userRole: string) {
  const queryOptions: any = {
    orderBy: { createdAt: 'desc' },
    include: {
      requester: { 
        select: { 
          fullname: true, 
          avatarUrl: true,
          sector: true,
        } 
      },
      system: { select: { hostname: true } },
      assignee: {
        select: {
            fullname: true,
            avatarUrl: true,
        }
      }
    }
  };

  const whereClause: any = { status };

  if (status === 'PENDING' && (userRole === 'IT_SUPPORT' || userRole === 'ADMIN')) {
    whereClause.assigneeId = userId;
  }
  
  queryOptions.where = whereClause;

  return prisma.ticket.findMany(queryOptions);
}


export async function getTicketDetails(ticketId: string, userId: string, userRole: string) {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: {
      messages: { orderBy: { createdAt: 'asc' }, include: { sender: { select: { fullname: true, avatarUrl: true, role: true } } } },
      requester: true,
      assignee: true,
      system: true,
    }
  });

  if (!ticket) {
    throw new CustomError('Ticket not found', 404);
  }

  if (userRole === 'USER' && ticket.requesterId !== userId) {
    throw new CustomError('Forbidden: You do not have permission to view this ticket.', 403);
  }

  return ticket;
}

export async function updateTicketStatus(
  ticketId: string, 
  newStatus: TicketStatus, 
  itSupportUserId: string,
  io: SocketIOServer 
) {
  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) {
    throw new CustomError('Ticket not found', 404);
  }

  const oldStatus = ticket.status;
  let assigneeId = ticket.assigneeId;

  if (!assigneeId && newStatus === 'PENDING') {
    assigneeId = itSupportUserId;
  }

  const updatedTicket = await prisma.ticket.update({
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
    await prisma.ticketHistory.create({
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


export async function addMessageToTicket(ticketId: string, senderId: string, content: string, imageUrl: string | undefined, io: any) {
    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) {
        throw new CustomError('Ticket not found', 404);
    }

    const newMessage = await prisma.message.create({
        data: { content, imageUrl, ticketId, senderId },
        include: {
            sender: { select: { fullname: true, avatarUrl: true, role: true } }
        }
    });

    io.to(ticketId).emit('receiveMessage', newMessage);

    return newMessage;
}

export async function assignAndPendTicket(ticketId: string, itSupportUserId: string) {

  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    select: { status: true }
  });


  if (!ticket || ticket.status !== 'OPEN') {

    return null;
  }

  const updatedTicket = await prisma.ticket.update({
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

  await prisma.ticketHistory.create({
    data: {
      action: 'ASSIGNED',
      ticketId: ticketId,
      userId: itSupportUserId,
      details: { assigneeName: updatedTicket.assignee?.fullname }
    }
  });

  return updatedTicket;
}


export async function findActiveTicketForUser(requesterId: string) {
  return prisma.ticket.findFirst({
    where: {
      requesterId: requesterId,
      status: {
        in: ['OPEN', 'PENDING'], 
      },
    },
    select: {
      id: true,
    },
  });
}
