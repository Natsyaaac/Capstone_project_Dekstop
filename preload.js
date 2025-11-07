const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  
  onConnectionStatusChanged: (callback) => {
    ipcRenderer.on('connection-status-changed', (event, isOnline) => {
      callback(isOnline);
    });
  },
  
  checkOnlineStatus: async () => {
    return await ipcRenderer.invoke('check-online-status');
  },
  
  manualConnectionCheck: () => {
    ipcRenderer.send('manual-connection-check');
  },
  
  isElectron: true
});

window.addEventListener('DOMContentLoaded', () => {
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
