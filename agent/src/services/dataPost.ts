
import cron from 'node-cron';
import { sendToAPI } from './utils/ColectDataFunctions';

export const startPostData = () => {

  cron.schedule('*/30 * * * * *', async () => {
    try {
      console.log('Collecting system info...');
      const result = await sendToAPI(`${process.env.API_URL}`);
      console.log('Data sent successfully:', result);
    } catch (err) {
      console.error('Error sending system info:', err);
    }
  });
}

