// Error handling and crash reporting
const { app, dialog } = require('electron');
const fs = require('fs');
const path = require('path');
const { DEBUG } = require('./config');

// Create logs directory if it doesn't exist
const logsDir = path.join(app.getPath('userData'), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log error to file
function logError(error, type = 'error') {
  const timestamp = new Date().toISOString();
  const logFile = path.join(logsDir, `crash-${timestamp.split('T')[0]}.log`);
  
  const errorLog = {
    timestamp,
    type,
    message: error.message || String(error),
    stack: error.stack || '',
    version: app.getVersion()
  };
  
  const logEntry = `\n[${timestamp}] ${type.toUpperCase()}\n${JSON.stringify(errorLog, null, 2)}\n`;
  
  try {
    fs.appendFileSync(logFile, logEntry);
    DEBUG && console.log('[ERROR] Logged to:', logFile);
  } catch (e) {
    console.error('[ERROR] Failed to write log:', e);
  }
}

// Show error dialog
function showErrorDialog(error, win) {
  const message = DEBUG 
    ? `${error.message}\n\nStack:\n${error.stack}`
    : 'Ocorreu um erro inesperado. A aplicação será reiniciada.';
    
  dialog.showErrorBox('Erro na Aplicação', message);
}

// Setup error handlers
function setupErrorHandlers() {
  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    console.error('[UNCAUGHT EXCEPTION]', error);
    logError(error, 'uncaughtException');
    
    if (!DEBUG) {
      showErrorDialog(error);
      app.relaunch();
      app.exit(1);
    }
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    const error = reason instanceof Error ? reason : new Error(String(reason));
    console.error('[UNHANDLED REJECTION]', error);
    logError(error, 'unhandledRejection');
    
    if (DEBUG) {
      console.error('Promise:', promise);
    }
  });

  // Handle renderer process crashes
  app.on('render-process-gone', (event, webContents, details) => {
    const error = new Error(`Renderer process gone: ${details.reason}`);
    console.error('[RENDERER CRASH]', details);
    logError(error, 'rendererCrash');
    
    if (details.reason !== 'clean-exit') {
      showErrorDialog(error);
      app.relaunch();
      app.quit();
    }
  });

  // Handle child process crashes
  app.on('child-process-gone', (event, details) => {
    const error = new Error(`Child process gone: ${details.type}`);
    console.error('[CHILD PROCESS CRASH]', details);
    logError(error, 'childProcessCrash');
  });

  DEBUG && console.log('[ERROR HANDLER] Error handlers initialized');
}

// Clean old log files (keep last 7 days)
function cleanOldLogs() {
  try {
    const files = fs.readdirSync(logsDir);
    const now = Date.now();
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
    
    let cleaned = 0;
    files.forEach(file => {
      const filePath = path.join(logsDir, file);
      const stats = fs.statSync(filePath);
      if (now - stats.mtime.getTime() > maxAge) {
        fs.unlinkSync(filePath);
        cleaned++;
      }
    });
    
    DEBUG && cleaned > 0 && console.log(`[ERROR HANDLER] Cleaned ${cleaned} old log files`);
  } catch (e) {
    console.error('[ERROR HANDLER] Failed to clean logs:', e);
  }
}

module.exports = {
  setupErrorHandlers,
  cleanOldLogs,
  logError
};
