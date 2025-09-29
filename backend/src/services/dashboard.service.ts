import prisma from '../prisma';
import { TicketStatus } from '@prisma/client';


export async function getDashboardStats() {
 
  const [
    openTicketsCount,
    pendingTicketsCount,
    totalSystemsCount,
    unassignedSystemsCount,
  ] = await prisma.$transaction([
    prisma.ticket.count({ where: { status: TicketStatus.OPEN } }),
    prisma.ticket.count({ where: { status: TicketStatus.PENDING } }),
    prisma.systemInfo.count(),
    prisma.systemInfo.count({ where: { user: null } }),
  ]);

  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  
  const resolvedTodayCount = await prisma.ticket.count({
    where: {
      status: TicketStatus.RESOLVED,
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
