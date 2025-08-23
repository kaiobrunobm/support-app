
import cron from 'node-cron';
import { sendToAPI } from './utils/ColectDataFunctions';
import dotenv from "dotenv";

dotenv.config()

export const startPostData = () => {

  const PORT = process.env.PORT || 4000;

  cron.schedule('*/30 * * * * *', async () => {
    try {
      console.log('Collecting system info...');
      const result = await sendToAPI(`http://localhost:${PORT}`);
      console.log('Data sent successfully:', result);
    } catch (err) {
      console.error('Error sending system info:', err);
    }
  });
}

