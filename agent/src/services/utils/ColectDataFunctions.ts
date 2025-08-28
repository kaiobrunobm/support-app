import axios from 'axios'
import fetch from 'node-fetch';
import { collectSystemInfo } from '../collectData';

export const formatUptime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

export const getPrinters = () => {
  const data = []
  return data
};

export const getPublicIP = async () => {
  try {
    const res = await axios.get('https://api.ipify.org?format=json');
    return res.data.ip;
  } catch (err) {
    console.log(err.message);
    return 'We could not find your public IP';
  }
};

export async function sendToAPI(apiUrl: string) {
  const data = await collectSystemInfo();
  console.log(data)
  const res = await fetch(`${apiUrl}/system-info`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${await res.text()}`);
  }

  return await res.json();
}


