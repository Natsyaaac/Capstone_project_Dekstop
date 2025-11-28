const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');

let mainWindow;
let isOnline = true;              // Status koneksi
let hasShownOfflineDialog = false; // Agar popup tidak muncul berkali-kali
let isCurrentlyShowing404 = false; // Agar tidak terus load file 404

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1140,
        height: 700,
        minWidth: 1140,
        minHeight: 768,
        center: true,
        autoHideMenuBar: true,
        icon: path.join(__dirname, 'assets/images/icon.png'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    // Load halaman utama
    mainWindow.loadFile(path.join(__dirname, 'index.html'));

    // Cek koneksi pertama kali
    checkInternetConnection();
}

function checkInternetConnection() {
    require('dns').resolve('www.google.com', (err) => {
        
        // ---------------------- ONLINE ----------------------
        if (!err) {  
            if (!isOnline) {
                console.log('Internet Back Online!');
            }

            isOnline = true;
            hasShownOfflineDialog = false;  // Reset supaya popup bisa muncul lagi jika offline nanti

            // Jika sedang menampilkan 404, kembalikan ke halaman utama
            if (isCurrentlyShowing404) {
                isCurrentlyShowing404 = false;
                mainWindow.loadFile(path.join(__dirname, 'index.html'));
            }

            return;
        }

        // ---------------------- OFFLINE ----------------------
        if (isOnline) {
            console.log('Internet Offline!');
        }

        isOnline = false;

        // Tampilkan halaman offline hanya sekali
        if (!isCurrentlyShowing404) {
            isCurrentlyShowing404 = true;
            mainWindow.loadFile(path.join(__dirname, '404.html'));
        }

        // Tampilkan popup hanya sekali
        if (!hasShownOfflineDialog) {
            hasShownOfflineDialog = true;
            showOfflineDialog();
        }
    });
}

// Jalankan pengecekan setiap 10 detik
setInterval(checkInternetConnection, 10000);

// Dialog offline
function showOfflineDialog() {
    dialog.showMessageBox(mainWindow, {
        type: 'warning',
        title: 'Koneksi Terputus',
        message: 'Koneksi internet Anda terputus. Beberapa fitur mungkin tidak dapat digunakan.',
        buttons: ['OK']
    });
}

// Buka link eksternal ke browser default
ipcMain.on('open-external-link', (event, url) => {
    shell.openExternal(url);
});

// Aplikasi ready
app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// Quit ketika semua window tertutup
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
