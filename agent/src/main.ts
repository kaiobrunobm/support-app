import { app, BrowserWindow, Menu, Tray, ipcMain, Event } from 'electron';
import path from 'path';
import { startPostData } from './services/dataPost';
import { collectSystemInfo } from './services/collectData'
import { autoUpdater } from 'electron-updater'
import { loginUser } from './auth/auth'

let tray: Tray | null = null;
let mainWindow: BrowserWindow | null = null;


const createWindow = async () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 700,
    show: true,
    skipTaskbar: true,
    icon: path.join(__dirname, 'tray-icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.once('ready-to-show', () => {
    autoUpdater.checkForUpdatesAndNotify();
  });

  //Menu.setApplicationMenu(null)

  try {
    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
      await mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    } else {
      await mainWindow.loadFile(
        path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
      );
    }
  } catch (error) {
    console.error('Failed to load window:', error);
  }

  mainWindow.on('close', (event) => {
    event.preventDefault();
    mainWindow?.hide();
  });
};

const createTray = () => {
  tray = new Tray(path.join(__dirname, 'tray-icon.png'))
  tray.setToolTip('Support App');
  tray.setContextMenu(
    Menu.buildFromTemplate([
      {

        label: 'Show App',
        click: () => {
          if (!mainWindow) {
            createWindow();
          }
          mainWindow?.show();
          mainWindow?.focus();
        },
      },
      { type: 'separator' },
      {
        label: 'Quit',
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
  startPostData();

  if (process.platform === 'darwin') {
    app.dock.hide();
  }

  if (process.argv.includes('--hidden')) {
    mainWindow?.hide();
  } else {
    mainWindow?.show();
  }
});

autoUpdater.on('update-available', () => {
  console.log('Update available');
});

autoUpdater.on('update-downloaded', () => {
  console.log('Update downloaded, will install on restart');
  autoUpdater.quitAndInstall();
});

app.on("before-quit", (event: Event) => {
  event.preventDefault(); // works here
});
