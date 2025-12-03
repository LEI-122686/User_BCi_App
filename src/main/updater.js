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
autoUpdater.on('checking-for-update', () => {
  DEBUG && console.log('[UPDATER] Checking for update...');
});

autoUpdater.on('update-available', (info) => {
  DEBUG && console.log('[UPDATER] Update available:', info.version);
  const win = BrowserWindow.getFocusedWindow();
  if (win) {
    win.webContents.send('update-available');
  }
});

autoUpdater.on('update-not-available', (info) => {
  DEBUG && console.log('[UPDATER] Update not available. Current version:', info.version);
});

autoUpdater.on('error', (err) => {
  DEBUG && console.error('[UPDATER] Error:', err.message);
});

autoUpdater.on('download-progress', (progressObj) => {
  DEBUG && console.log(`[UPDATER] Download progress: ${Math.round(progressObj.percent)}%`);
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
  DEBUG && console.log('[UPDATER] Update downloaded:', info.version);
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
    DEBUG && console.log('[UPDATER] Checking for updates...');
    autoUpdater.checkForUpdates().catch(e => 
      DEBUG && console.log('[UPDATE] Check failed:', e.message)
    );
  }, 10 * 1000); // 10 seconds after startup
}

module.exports = {
  setupUpdateHandlers,
  checkForUpdates
};
