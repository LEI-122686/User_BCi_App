// preload.js - exposes electron APIs and githubCache helpers
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld("electronAPI", {
    loadRouteConfig: () => ipcRenderer.invoke("routes:getConfig"),
    joinPaths: (...args) => ipcRenderer.invoke("path:join", ...args),
    fileExists: (path) => ipcRenderer.invoke("fs:fileExists", path),
    readFile: (path) => ipcRenderer.invoke("fs:readFile", path),
    logout: () => ipcRenderer.invoke("logout"),
    listAssetsCss: () => ipcRenderer.invoke('assets:listCss'),
    listAssetsJs: () => ipcRenderer.invoke('assets:listJs'),
    getLocalAsset: (path) => ipcRenderer.invoke('assets:getLocal', path),
    getDebugMode: () => ipcRenderer.invoke('app:getDebugMode'),
    rendererReady: () => ipcRenderer.send('renderer:ready'),
    navigate: (filePath) => ipcRenderer.invoke('navigate', filePath),
    clearBrowserCache: () => ipcRenderer.invoke('cache:clearBrowser'),
    
    // Metrics
    trackPageLoad: (pageName, startTime) => ipcRenderer.invoke('metrics:trackPageLoad', pageName, startTime),
    trackFeature: (featureName) => ipcRenderer.invoke('metrics:trackFeature', featureName),
    getMetrics: () => ipcRenderer.invoke('metrics:getSummary'),
    
    // Trigger updater actions in main
    downloadUpdate: () => ipcRenderer.send('download-update'),
    // Install and update (matches main ipc channel 'install-and-update')
    InstallAndUpdate: () => ipcRenderer.send('install-and-update'),
    installAndUpdate: () => ipcRenderer.send('install-and-update'),
        // Updater event listeners
        onUpdateAvailable: (cb) => {
            ipcRenderer.on('update-available', () => cb && cb());
        },
        onDownloadProgress: (cb) => {
            ipcRenderer.on('download-progress', (e, progress) => cb && cb(progress));
        },
        onUpdateDownloaded: (cb) => {
            ipcRenderer.on('update-downloaded', (e, info) => cb && cb(info));
        },
        // Debug: test updater triggers (only available if main registered handlers)
        testUpdater: {
        },
           // Removed debug-only testUpdater exposure after stabilization
});

contextBridge.exposeInMainWorld("electronStorage", {
    setItem: (key, value) => ipcRenderer.invoke("storage:set", key, value),
    getItem: (key) => ipcRenderer.invoke("storage:get", key),
    removeItem: (key) => ipcRenderer.invoke("storage:remove", key)
});

contextBridge.exposeInMainWorld("githubCache", {
    fetchFile: (pathRel, ttl) => ipcRenderer.invoke("github-cache:fetch", pathRel, ttl),
    fetchAsset: (pathRel, ttl) => ipcRenderer.invoke("github-cache:fetchAsset", pathRel, ttl),
    clearFile: (pathRel) => ipcRenderer.invoke("github-cache:clear", pathRel),
    clearAll: () => ipcRenderer.invoke("github-cache:clearAll")
});
