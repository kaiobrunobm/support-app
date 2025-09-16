import { contextBridge, ipcRenderer, shell } from 'electron'
import axios from 'axios'
import dotenv from "dotenv";

dotenv.config();

contextBridge.exposeInMainWorld('electronAPI', {
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  openExternal: (url: string) => shell.openExternal(url),
  async login(email: string, password: string) {
    try {
      const res = await axios.post(`${process.env.API_URL}/auth/login`, {
        email,
        password,
      });
      return res.data;
    } catch (err: any) {
      return { success: false, error: err.response?.data?.error || err.message };
    }
  },
})

