import { contextBridge, ipcRenderer, shell } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  openExternal: (url: string) => shell.openExternal(url),
  updater: {
    onUpdateMessage: (callback: (event: string, ...args: any[]) => void) => {
      const listener = (_event: any, event: string, ...args: any[]) => callback(event, ...args);
      ipcRenderer.on('update-message', listener);
      return () => ipcRenderer.removeListener('update-message', listener);
    },
    installUpdate: () => {
      ipcRenderer.send('install-update');
    },
  },
  showSummaryNotification: (body: string) => {
    ipcRenderer.invoke('show-summary-notification', body);
  },
});

