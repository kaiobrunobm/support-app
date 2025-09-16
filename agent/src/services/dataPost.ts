
import cron from 'node-cron';
import { sendToAPI } from './utils/ColectDataFunctions';
import { config } from '../config';

export const startPostData = () => {

  cron.schedule('*/30 * * * * *', async () => {
    try {
      console.log('Collecting system info...');
      const result = await sendToAPI(`${config.apiUrl}`);
      console.log('Data sent successfully:', result);
    } catch (err) {
      console.error('Error sending system info:', err);
    }
  });
}

