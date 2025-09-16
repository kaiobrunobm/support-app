import { contextBridge, ipcRenderer, shell } from 'electron'


contextBridge.exposeInMainWorld('electronAPI', {
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  openExternal: (url: string) => shell.openExternal(url),
})

