// GitHub cache module with rate limiting and retry logic
const ElectronStorage = require('../../js/storage');
const { GITHUB_CONFIG, DEBUG } = require('./config');

const STORAGE_PREFIX = GITHUB_CONFIG.STORAGE_PREFIX;

// Exponential backoff configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1s
  maxDelay: 10000  // 10s
};

// Offline request queue
let offlineQueue = [];
let isOnline = true;
const OWNER = GITHUB_CONFIG.OWNER;
const REPO = GITHUB_CONFIG.REPO;
const BRANCH = GITHUB_CONFIG.BRANCH;

// Rate limiting for GitHub API calls (50/hour without token, 4500/hour with token)
const rateLimitQueue = [];
let rateLimitProcessing = false;

async function rateLimitedFetch(url, options) {
  return new Promise((resolve, reject) => {
    rateLimitQueue.push({ url, options, resolve, reject });
    processRateLimitQueue();
  });
}

async function processRateLimitQueue() {
  if (rateLimitProcessing || rateLimitQueue.length === 0) return;
  rateLimitProcessing = true;
  
  const { url, options, resolve, reject } = rateLimitQueue.shift();
  
  try {
    const resp = await fetch(url, options);
    resolve(resp);
  } catch (err) {
    reject(err);
  }
  
  // Wait 750ms between requests (allows ~48 calls/min = safe for 50/hour limit)
  setTimeout(() => {
    rateLimitProcessing = false;
    processRateLimitQueue();
  }, 750);
}

/**
 * Fetch a file from the GitHub repo with ETag-based caching and configurable TTL.
 * @param {string} pathRel - Relative path (e.g., "login/index.html")
 * @param {string} basePath - Base path prefix (e.g., "pages/", "" for repo root)
 * @param {number} ttl - Time-to-live in milliseconds
 */
async function githubFetchWithCache(pathRel, basePath, ttl) {
  const key = STORAGE_PREFIX + pathRel;
  const cached = ElectronStorage.getItem(key);
  const now = Date.now();
  const url = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${basePath}${pathRel}`;

  // Validate URL before fetching
  const security = require('./security');
  if (!security.isUrlSafe(url)) {
    throw new Error(`Unsafe URL blocked: ${url}`);
  }

  const doFetch = async (retryCount = 0) => {
    try {
      const headers = { 'User-Agent': 'electron-app' };
      if (cached && cached.etag) {
        headers['If-None-Match'] = cached.etag;
      }
      const resp = await fetch(url, { headers });
      
      // Handle 304 Not Modified
      if (resp.status === 304 && cached) {
        // Update fetchedAt timestamp but keep existing content
        cached.fetchedAt = now;
        ElectronStorage.setItem(key, cached);
        DEBUG && console.log(`[CACHE HIT] ${pathRel} (304 Not Modified)`);
        
        // Track cache hit
        try {
          const metrics = require('./metrics');
          metrics.trackCacheHit(true);
        } catch (e) {}
        
        return cached;
      }
      
      if (resp.ok) {
        const text = await resp.text();
        const etag = resp.headers.get('etag');
        const payload = { content: text, etag, fetchedAt: now };
        ElectronStorage.setItem(key, payload);
        DEBUG && console.log(`[CACHE MISS] ${pathRel} (fetched fresh)`);
        
        // Track cache miss
        try {
          const metrics = require('./metrics');
          metrics.trackCacheHit(false);
        } catch (e) {}
        
        return payload;
      }
      throw new Error(`HTTP ${resp.status}: ${url}`);
    } catch (err) {
      // Exponential backoff retry with jitter
      if (retryCount < RETRY_CONFIG.maxRetries) {
        const delay = Math.min(
          RETRY_CONFIG.baseDelay * Math.pow(2, retryCount) + Math.random() * 1000,
          RETRY_CONFIG.maxDelay
        );
        DEBUG && console.log(`[RETRY ${retryCount + 1}/${RETRY_CONFIG.maxRetries}] ${pathRel} after ${Math.round(delay)}ms - ${err.message}`);
        await new Promise(r => setTimeout(r, delay));
        return doFetch(retryCount + 1);
      }
      
      // If all retries failed and offline, queue the request
      if (!isOnline) {
        DEBUG && console.log(`[OFFLINE QUEUE] Adding ${pathRel} to queue`);
        offlineQueue.push({ pathRel, basePath, ttl, resolve: null, reject: null });
        
        // Return cached version if available
        if (cached) {
          DEBUG && console.log(`[OFFLINE] Returning stale cache for ${pathRel}`);
          return cached;
        }
      }
      
      throw err;
    }
  };
  return doFetch();
}

// IPC handler to fetch page content with cache
function handleFetch(event, pathRel, ttl) {
  const effectiveTTL = ttl || GITHUB_CONFIG.PAGE_TTL;
  return githubFetchWithCache(pathRel, 'pages/', effectiveTTL);
}

// IPC handler to fetch assets from repo root
function handleFetchAsset(event, pathRel, ttl) {
  const effectiveTTL = ttl || GITHUB_CONFIG.ASSET_TTL;
  return githubFetchWithCache(pathRel, '', effectiveTTL);
}

// IPC handler to clear cache for a specific file
function handleClear(event, pathRel) {
  ElectronStorage.removeItem(STORAGE_PREFIX + pathRel);
}

// IPC handler to clear all cache
function handleClearAll() {
  Object.keys(ElectronStorage.data)
    .filter(k => k.startsWith(STORAGE_PREFIX))
    .forEach(k => ElectronStorage.removeItem(k));
}

/**
 * List CSS files under assets/css in the repo using GitHub Contents API.
 */
async function listCssFiles() {
  try {
    DEBUG && console.log('[assets:listCss] attempting GitHub Contents API...');
    const apiUrl = `https://api.github.com/repos/${OWNER}/${REPO}/contents/assets/css?ref=${BRANCH}`;
    const headers = { 
      'User-Agent': 'electron-app', 
      'Accept': 'application/vnd.github.v3+json' 
    };
    
    // Add GitHub token if available to increase rate limit (60 -> 5000 req/hour)
    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
    }
    
    const resp = await rateLimitedFetch(apiUrl, { headers });
    if (resp && resp.ok) {
      const data = await resp.json();
      if (Array.isArray(data)) {
        const files = data.filter(f => f && f.type === 'file' && f.name && f.name.endsWith('.css')).map(f => f.name);
        DEBUG && console.log('[assets:listCss] ✓ GitHub API success:', files);
        return files;
      }
    }
    console.warn('[assets:listCss] ✗ GitHub API failed with status', resp?.status);
    return [];
  } catch (e) {
    console.error('[assets:listCss] error:', e.message);
    return [];
  }
}

/**
 * List JS files under assets/js in the repo using GitHub Contents API.
 */
async function listJsFiles() {
  try {
    DEBUG && console.log('[assets:listJs] attempting GitHub Contents API...');
    const apiUrl = `https://api.github.com/repos/${OWNER}/${REPO}/contents/assets/js?ref=${BRANCH}`;
    const headers = { 
      'User-Agent': 'electron-app', 
      'Accept': 'application/vnd.github.v3+json' 
    };
    
    // Add GitHub token if available to increase rate limit (60 -> 5000 req/hour)
    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
    }
    
    const resp = await rateLimitedFetch(apiUrl, { headers });
    if (resp && resp.ok) {
      const data = await resp.json();
      if (Array.isArray(data)) {
        const files = data.filter(f => f && f.type === 'file' && f.name && f.name.endsWith('.js')).map(f => f.name);
        DEBUG && console.log('[assets:listJs] ✓ GitHub API success:', files);
        return files;
      }
    }
    console.warn('[assets:listJs] ✗ GitHub API failed with status', resp?.status);
    return [];
  } catch (e) {
    console.error('[assets:listJs] error:', e.message);
    return [];
  }
}

// Clean old cache entries (remove entries older than MAX_CACHE_AGE)
function cleanOldCache() {
  const now = Date.now();
  const keys = Object.keys(ElectronStorage.data).filter(k => k.startsWith(GITHUB_CONFIG.STORAGE_PREFIX));
  let cleaned = 0;
  keys.forEach(k => {
    const item = ElectronStorage.getItem(k);
    if (item && item.fetchedAt && (now - item.fetchedAt > GITHUB_CONFIG.MAX_CACHE_AGE)) {
      ElectronStorage.removeItem(k);
      cleaned++;
    }
  });
  DEBUG && cleaned > 0 && console.log(`[CACHE CLEANUP] Removed ${cleaned} old entries`);
}

// Set online/offline status
function setOnlineStatus(online) {
  const wasOffline = !isOnline;
  isOnline = online;
  
  DEBUG && console.log(`[NETWORK] Status changed: ${online ? 'ONLINE' : 'OFFLINE'}`);
  
  // Process offline queue when coming back online
  if (online && wasOffline && offlineQueue.length > 0) {
    processOfflineQueue();
  }
}

// Process offline queue
async function processOfflineQueue() {
  if (offlineQueue.length === 0) return;
  
  DEBUG && console.log(`[OFFLINE QUEUE] Processing ${offlineQueue.length} queued requests`);
  
  const queue = [...offlineQueue];
  offlineQueue = [];
  
  for (const { pathRel, basePath, ttl } of queue) {
    try {
      await githubFetchWithCache(pathRel, basePath, ttl);
      DEBUG && console.log(`[OFFLINE QUEUE] ✓ Synced ${pathRel}`);
    } catch (err) {
      DEBUG && console.log(`[OFFLINE QUEUE] ✗ Failed to sync ${pathRel}:`, err.message);
    }
  }
  
  DEBUG && console.log('[OFFLINE QUEUE] Sync complete');
}

// Preload frequently accessed pages
async function preloadFrequentPages() {
  const frequentPages = ['dashboard', 'rules', 'withdraw'];
  
  DEBUG && console.log('[CACHE] Preloading frequent pages...');
  
  for (const page of frequentPages) {
    try {
      await githubFetchWithCache(`${page}/index.html`, 'pages/', GITHUB_CONFIG.PAGE_TTL);
      await githubFetchWithCache(`${page}/styles.css`, 'pages/', GITHUB_CONFIG.PAGE_TTL);
      DEBUG && console.log(`[CACHE] ✓ Preloaded ${page}`);
    } catch (err) {
      DEBUG && console.log(`[CACHE] ✗ Failed to preload ${page}:`, err.message);
    }
  }
}

// Background cache refresh (updates cache without blocking)
function startBackgroundSync() {
  // Refresh cache every 30 minutes
  setInterval(async () => {
    if (!isOnline) return;
    
    DEBUG && console.log('[BACKGROUND SYNC] Starting cache refresh...');
    
    try {
      // Refresh CSS/JS assets
      const cssFiles = await listCssFiles();
      const jsFiles = await listJsFiles();
      
      for (const file of cssFiles) {
        await githubFetchWithCache(`assets/css/${file}`, '', GITHUB_CONFIG.ASSET_TTL);
      }
      
      for (const file of jsFiles) {
        await githubFetchWithCache(`assets/js/${file}`, '', GITHUB_CONFIG.ASSET_TTL);
      }
      
      DEBUG && console.log('[BACKGROUND SYNC] Cache refresh complete');
    } catch (err) {
      DEBUG && console.log('[BACKGROUND SYNC] Error:', err.message);
    }
  }, 30 * 60 * 1000); // 30 minutes
  
  DEBUG && console.log('[BACKGROUND SYNC] Background sync started (30min interval)');
}

module.exports = {
  handleFetch,
  handleFetchAsset,
  handleClear,
  handleClearAll,
  listCssFiles,
  listJsFiles,
  cleanOldCache,
  setOnlineStatus,
  preloadFrequentPages,
  startBackgroundSync
};
