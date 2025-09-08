import { contextBridge, ipcRenderer, shell } from 'electron'
import axios from 'axios'

contextBridge.exposeInMainWorld('electronAPI', {
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  openExternal: (url: string) => shell.openExternal(url),
  async login(email: string, password: string) {
    try {
      const res = await axios.post("http://localhost:3000/auth/login", {
        email,
        password,
      });
      return res.data;
    } catch (err: any) {
      return { success: false, error: err.response?.data?.error || err.message };
    }
  },
})

