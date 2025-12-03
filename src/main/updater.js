// Auto-updater configuration and handlers
const { autoUpdater } = require('electron-updater');
const { BrowserWindow, ipcMain } = require('electron');
const { DEBUG } = require('./config');

// Configure auto-updater
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = false;
autoUpdater.logger = require('electron-log');
autoUpdater.logger.transports.file.level = 'debug';

// Event handlers
autoUpdater.on('update-available', () => {
  const win = BrowserWindow.getFocusedWindow();
  if (win) {
    win.webContents.send('update-available');
  }
});

autoUpdater.on('download-progress', (progressObj) => {
  const win = BrowserWindow.getFocusedWindow();
  if (win) {
    win.webContents.send('download-progress', {
      percent: progressObj.percent,
      transferred: progressObj.transferred,
      total: progressObj.total
    });
  }
});

autoUpdater.on('update-downloaded', (info) => {
  const win = BrowserWindow.getFocusedWindow();
  if (win) {
    win.webContents.send('update-downloaded', info);
  }
});

// IPC handlers
function setupUpdateHandlers() {
  ipcMain.on('download-update', () => {
    DEBUG && console.log('[UPDATER] Starting update download');
    autoUpdater.downloadUpdate();
  });

  ipcMain.on('install-and-update', () => {
    DEBUG && console.log('[UPDATER] Installing update and restarting app');
    BrowserWindow.getAllWindows().forEach(win => {
      if (!win.isDestroyed()) {
        win.destroy();
      }
    });
    autoUpdater.quitAndInstall(true, true);
  });
}

// Check for updates (delayed start to avoid startup impact)
function checkForUpdates() {
  setTimeout(() => {
    autoUpdater.checkForUpdates().catch(e => 
      DEBUG && console.log('[UPDATE] Check failed:', e.message)
    );
  }, 5 * 60 * 1000); // 5 minutes
}

module.exports = {
  setupUpdateHandlers,
  checkForUpdates
};
