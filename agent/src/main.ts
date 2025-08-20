import { app, BrowserWindow, Menu, Tray, ipcMain } from 'electron';
import path from 'path';
import { startPostData } from './services/dataPost';
import { collectSystemInfo } from './services/collectData'


let tray: Tray | null = null;
let mainWindow: BrowserWindow | null = null;


const createWindow = async () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 700,
    show: true,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

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
  tray = new Tray(path.join(__dirname, 'tray-icon.ico'))
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
  ipcMain.handle('get-system-info', async () => {
    const info = await collectSystemInfo()
    return info
  })

});

app.on('window-all-closed', (event) => {
  event.preventDefault();
});
