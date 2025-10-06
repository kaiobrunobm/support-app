import { app, BrowserWindow, Menu, Tray, ipcMain, Event, dialog, MessageBoxOptions  } from 'electron';
import { autoUpdater } from 'electron-updater';
import path from 'path';
import { collectSystemInfo } from './services/collectData'
import { sendToAPI } from './services/utils/ColectDataFunctions';
import { config } from './config'
import 'dotenv/config';

//const server = 'https://hazel-updater-blush.vercel.app/'; 
//const url = `${server}/update/${process.platform}/${app.getVersion()}`;

let tray: Tray | null = null;
let mainWindow: BrowserWindow | null = null;
//autoUpdater.setFeedURL({ url });

const createWindow = async () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    minWidth: 600,
    height: 700,
    show: true,
    skipTaskbar: false,
    icon: path.join(__dirname, 'tray-icon.png'),
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'), 
      contextIsolation: true,
      nodeIntegration: false,
    },
  });


   if (process.env.VITE_DEV_SERVER_URL) {
    await mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
    
  } else {
    Menu.setApplicationMenu(null)
    await mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }


  mainWindow.on('close', (event) => {
    event.preventDefault();
    mainWindow?.hide();
  });
};

const createTray = () => {
  tray = new Tray(path.join(__dirname, 'tray-icon.png'))
  tray.setToolTip('SystemPulse');
  tray.setContextMenu(
    Menu.buildFromTemplate([
      {

        label: 'Abri suporte',
        click: () => {
          if (!mainWindow) {
            createWindow();
          }
          mainWindow?.show();
          mainWindow?.focus();
        },
      },
      {
        label: 'Sair',
        click: () => {
          app.quit();
        },
      },
    ])
  );
};

ipcMain.handle('get-system-info', async () => {
  const info = await collectSystemInfo()
  return info
})


app.on('ready', async () => {
  await createWindow();
  createTray();
  setTimeout(() => autoUpdater.checkForUpdatesAndNotify(), 5000);
  setInterval(() => {
    autoUpdater.checkForUpdatesAndNotify();
  }, 60000);

  console.log(path.join(__dirname, '../renderer/index.html'));
  console.log('Application is ready. Sending initial system information...');
  try {
    await sendToAPI(config.apiUrl);
    console.log('Initial system information sent successfully.');
  } catch (error) {
    console.error('Failed to send initial system information:', error);
  }

  if (process.platform === 'darwin') {
    app.dock.hide();
  }

  if (process.argv.includes('--hidden')) {
    mainWindow?.hide();
  } else {
    mainWindow?.show();
  }
});

const sendUpdateMessage = (channel: string, ...args: any[]) => {
  BrowserWindow.getAllWindows().forEach(window => {
    window.webContents.send('update-message', channel, ...args);
  });
};

autoUpdater.on('checking-for-update', () => {
  sendUpdateMessage('checking-for-update');
});

autoUpdater.on('update-available', (info) => {
  sendUpdateMessage('update-available', info);
});

autoUpdater.on('update-not-available', (info) => {
  sendUpdateMessage('update-not-available', info);
});

autoUpdater.on('error', (err) => {
  sendUpdateMessage('error', err);
});

autoUpdater.on('download-progress', (progressObj) => {
  sendUpdateMessage('download-progress', progressObj);
});

autoUpdater.on('update-downloaded', (info) => {
  sendUpdateMessage('update-downloaded', info);
});

// Listen for the renderer to request quitting and installing the update
ipcMain.on('install-update', () => {
  autoUpdater.quitAndInstall();
});
