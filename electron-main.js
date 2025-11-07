const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const dns = require('dns');

let mainWindow;
let isOnline = false;

function checkInternetConnection() {
  dns.resolve('www.google.com', (err) => {
    const previousStatus = isOnline;
    isOnline = !err;
    
    if (previousStatus !== isOnline) {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('connection-status-changed', isOnline);
      }
      
      if (!isOnline) {
        showOfflineDialog();
      }
    }
  });
}

function showOfflineDialog() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    dialog.showMessageBox(mainWindow, {
      title: 'Tidak Ada Koneksi Internet',
      message: 'Aplikasi ini membutuhkan koneksi internet untuk beberapa fitur (seperti mengirim email ke pengembang).',
      detail: 'Silakan periksa koneksi internet Anda dan coba lagi.',
      type: 'warning',
      buttons: ['OK']
    });
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    icon: path.join(__dirname, 'assets/images/balloon-favicon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true
    },
    backgroundColor: '#7CC0FF',
    show: false,
    autoHideMenuBar: true
  });

  mainWindow.loadFile('index.html');

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  checkInternetConnection();
  setInterval(checkInternetConnection, 10000);
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

ipcMain.handle('check-online-status', () => {
  return isOnline;
});

ipcMain.on('manual-connection-check', () => {
  checkInternetConnection();
});
