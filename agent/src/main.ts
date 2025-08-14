import { app, BrowserWindow, Menu, Tray, nativeImage } from 'electron';
import path from 'path'

let tray: Tray | null = null
let mainWindow: BrowserWindow | null = null

const createWindow = async () => {
  if (mainWindow) {
    mainWindow.show();
    mainWindow.focus();
    return;
  }

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 700,
    show: false, // Start hidden
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });


  try {
    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
      await mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    } else {
      await mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
    }
  } catch (error) {
    console.error('Failed to load window:', error);
  }

  mainWindow.on('close', (event) => {
    event.preventDefault();
    mainWindow?.hide();
  });
};

app.on('ready', async () => {
  await createWindow(); const iconPath = path.join(__dirname, 'tray-icon.png');
  const icon = nativeImage.createFromPath(iconPath);
  if (icon.isEmpty()) {
    console.error('Tray icon not found at:', iconPath);
  }

  tray = new Tray(icon);
  tray.setToolTip('My Tray App');
  tray.setContextMenu(
    Menu.buildFromTemplate([
      {
        label: 'Show App',
        click: () => {
          mainWindow?.show();
          mainWindow?.focus();
        },
      },
      {
        label: 'Quit',
        click: () => {
          app.quit();
        },
      },
    ])
  );

  // macOS: Hide dock icon
  if (process.platform === 'darwin') {
    app.dock.hide();
  }

  if (process.argv.includes('--hidden')) {
    mainWindow?.hide();
  } else {
    mainWindow?.show();
  }
});

app.on('window-all-closed', (event) => {
  // Prevent full quit — keep tray alive
  event.preventDefault();
});

