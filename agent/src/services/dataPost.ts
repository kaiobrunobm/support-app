
import cron from 'node-cron';
import { sendToAPI } from './collectData';

export const startPostData = () => {
  cron.schedule('*/30 * * * * *', async () => {
    try {
      console.log('Collecting system info...');
      const result = await sendToAPI('http://localhost:4000');
      console.log('Data sent successfully:', result);
    } catch (err) {
      console.error('Error sending system info:', err);
    }
  });
}

