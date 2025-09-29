import prisma from '../prisma';
import { CustomError } from '../api/middlewares/error.middleware';
import { TicketStatus } from '@prisma/client';

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
        systemId: requester.systemId, //TODO systemID type
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

export async function getTicketsByStatus(status: TicketStatus) {
  return prisma.ticket.findMany({
    where: { status },
    orderBy: { createdAt: 'desc' },
    include: {
      requester: { select: { fullname: true, avatarUrl: true } },
      system: { select: { hostname: true } }
    }
  });
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

export async function updateTicketStatus(ticketId: string, newStatus: TicketStatus, itSupportUserId: string) {
  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) {
    throw new CustomError('Ticket not found', 404);
  }

  let assigneeId = ticket.assigneeId;
  if (!assigneeId && newStatus === 'PENDING') {
    assigneeId = itSupportUserId;
  }

  return prisma.ticket.update({
    where: { id: ticketId },
    data: {
      status: newStatus,
      assigneeId: assigneeId,
    },
  });
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
      requester: true,
      assignee: true,
      system: true,
    }
  });

  return updatedTicket;
}
