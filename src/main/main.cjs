const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Load the Vite dev server in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handler for showing save dialog
ipcMain.handle('show-save-dialog', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'Select folder to save website files',
  });
  return result;
});

// IPC Handler for saving website files
ipcMain.handle('save-website-files', async (event, { folderPath, htmlContent, cssContent }) => {
  try {
    const indexPath = path.join(folderPath, 'index.html');
    const stylePath = path.join(folderPath, 'style.css');

    fs.writeFileSync(indexPath, htmlContent, 'utf8');
    fs.writeFileSync(stylePath, cssContent, 'utf8');

    return { success: true, message: 'Files saved successfully!' };
  } catch (error) {
    return { success: false, message: error.message };
  }
});
