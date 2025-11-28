const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {

    // SYSTEM INFORMATION
    getAppVersion: () => ipcRenderer.invoke('get-app-version'),
    getPlatformInfo: () => ipcRenderer.invoke('get-platform-info'),

    // Open external URL
    openExternalUrl: (url) => ipcRenderer.invoke('open-external-url', url),
    openExternal: (url) => ipcRenderer.invoke('open-external-url', url), // alias

    // Dialogs
    showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
    showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),

    // CONNECTION STATUS
    onConnectionStatusChanged: (callback) => {
        ipcRenderer.on('connection-status-changed', (event, isOnline) => callback(isOnline));
    },

    checkOnlineStatus: () => ipcRenderer.invoke('check-online-status'),

    manualConnectionCheck: () => ipcRenderer.send('manual-connection-check'),

    // GENERIC MESSAGING
    onMessage: (callback) => {
        ipcRenderer.on('message', (event, ...args) => callback(...args));
    },

    // BASIC FLAGS
    isElectron: true,
    platform: process.platform
});


// DOM EVENTS (Online indicator)
window.addEventListener('DOMContentLoaded', () => {
    console.log('Electron preload script loaded');
    console.log('Platform:', process.platform);

    const updateOnlineStatus = () => {
        const statusElement = document.getElementById('electron-status');
        if (statusElement) {
            if (navigator.onLine) {
                statusElement.innerHTML = '<i class="fas fa-wifi"></i> Online';
                statusElement.className = 'electron-status online';
            } else {
                statusElement.innerHTML = '<i class="fas fa-wifi-slash"></i> Offline';
                statusElement.className = 'electron-status offline';
            }
        }
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    setTimeout(updateOnlineStatus, 500);
});
