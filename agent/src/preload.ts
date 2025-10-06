import { contextBridge, ipcRenderer, shell } from 'electron';

// Expose existing API
contextBridge.exposeInMainWorld('electronAPI', {
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  openExternal: (url: string) => shell.openExternal(url),
});

// Expose the new updater API. This is the part that was missing.
contextBridge.exposeInMainWorld('updater', {
  // Function for the renderer to listen to messages from the main process
  onUpdateMessage: (callback: (channel: string, ...args: any[]) => void) => {
    const subscription = (_event: any, channel: string, ...args: any[]) =>
      callback(channel, ...args);
    ipcRenderer.on('update-message', subscription);

    // Return a cleanup function to remove the listener
    return () => {
      ipcRenderer.removeListener('update-message', subscription);
    };
  },
  // Function for the renderer to tell the main process to install the update
  installUpdate: () => ipcRenderer.send('install-update'),
  // A function to remove all listeners, useful for component cleanup
  removeListeners: () => {
    ipcRenderer.removeAllListeners('update-message');
  }
});

