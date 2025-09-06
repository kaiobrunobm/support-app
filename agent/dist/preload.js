'use strict';

const electron = require('electron');

electron.contextBridge.exposeInMainWorld("electronAPI", {
  getSystemInfo: () => electron.ipcRenderer.invoke("get-system-info"),
  openExternal: (url) => electron.shell.openExternal(url)
});
