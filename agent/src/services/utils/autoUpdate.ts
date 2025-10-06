import { app, BrowserWindow, ipcMain } from 'electron';
import log from 'electron-log/main';
import { autoUpdater } from 'electron-updater';

// Configure logging
autoUpdater.logger = log;
log.transports.file.level = 'info';

let updateWindow: BrowserWindow | null = null;

function createUpdateWindow() {
  updateWindow = new BrowserWindow({
    width: 400,
    height: 200,
    frame: false,
    resizable: false,
    movable: true,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  updateWindow.on('closed', () => {
    updateWindow = null;
  });
}

function sendStatusToWindow(channel: string, text: any) {
  log.info(text);
  if (updateWindow) {
    updateWindow.webContents.send(channel, text);
  }
}

export function initUpdater(win: BrowserWindow) {
  log.initialize();

  autoUpdater.on('checking-for-update', () => {
    win.webContents.send('update-status', { status: 'checking' });
    log.info('Checking for update...');
  });

  autoUpdater.on('update-available', (info) => {
    win.webContents.send('update-status', { status: 'available', info });
    log.info('Update available.');
  });

  autoUpdater.on('update-not-available', (info) => {
    win.webContents.send('update-status', { status: 'not-available', info });
    log.info('Update not available.');
  });

  autoUpdater.on('error', (err) => {
    win.webContents.send('update-status', { status: 'error', err });
    log.error('Error in auto-updater. ' + err);
  });

  autoUpdater.on('download-progress', (progressObj) => {
    win.webContents.send('update-status', { status: 'downloading', progress: progressObj });
    const log_message = "Download speed: " + progressObj.bytesPerSecond + ' - Downloaded ' + progressObj.percent + '% (' + progressObj.transferred + "/" + progressObj.total + ')';
    log.info(log_message);
  });

  autoUpdater.on('update-downloaded', (info) => {
    win.webContents.send('update-status', { status: 'downloaded', info });
    log.info('Update downloaded');
    autoUpdater.quitAndInstall();
  });

  ipcMain.on('install-update', () => {
    autoUpdater.quitAndInstall();
  });

  autoUpdater.checkForUpdatesAndNotify();
}

