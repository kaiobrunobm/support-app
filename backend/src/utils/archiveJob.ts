import cron from 'node-cron';
import prisma from '../prisma';

export function startArchiveJob() {
  cron.schedule('0 2 * * *', async () => {
    console.log('Running scheduled job: Archiving old unassigned systems...');
    
    const thirtyDaysAgo = new Date(new Date().setDate(new Date().getDate() - 30));

    try {
      const result = await prisma.systemInfo.updateMany({
        where: {
          status: 'ACTIVE',
          user: null, 
          userDetachedAt: {
            lt: thirtyDaysAgo,
          },
        },
        data: {
          status: 'ARCHIVED',
        },
      });

      if (result.count > 0) {
        console.log(`Successfully archived ${result.count} systems.`);
      } else {
        console.log('No systems met the criteria for archiving.');
      }
    } catch (error) {
      console.error('Error during system archiving job:', error);
    }
  });

  console.log('System archiving job scheduled to run daily at 2 AM.');
}

