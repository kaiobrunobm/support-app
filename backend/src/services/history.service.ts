import prisma from '../prisma';

export async function getSystemHistory(systemId: string) {
  return prisma.assignmentHistory.findMany({
    where: { systemId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getTicketHistory(ticketId: string) {
  return prisma.ticketHistory.findMany({
    where: { ticketId },
    orderBy: { createdAt: 'desc' },
    include: {
      user: { 
        select: { fullname: true, avatarUrl: true }
      }
    }
  });
}
