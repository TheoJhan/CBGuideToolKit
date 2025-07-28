// IndexedDB wrapper for storing selector data
class IDBWrapper {
  constructor() {
    this.dbName = 'CBGuideToolkitDB';
    this.dbVersion = 1;
    this.storeName = 'selectors';
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'domain' });
          store.createIndex('domain', 'domain', { unique: true });
        }
      };
    });
  }

  async saveSelector(selectorData) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put({
        domain: selectorData.domain,
        config: selectorData.config,
        lastUpdated: selectorData.lastUpdated || new Date().toISOString()
      });
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getSelector(domain) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(domain);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllSelectors() {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getLastUpdateTime() {
    try {
      const allConfigs = await this.getAllSelectors();
      if (allConfigs.length === 0) {
        return null;
      }
      
      // Find the most recent update time
      const mostRecent = allConfigs.reduce((latest, current) => {
        if (!latest || !latest.lastUpdated) return current;
        if (!current || !current.lastUpdated) return latest;
        
        return new Date(current.lastUpdated) > new Date(latest.lastUpdated) ? current : latest;
      });
      
      return mostRecent ? mostRecent.lastUpdated : null;
    } catch (error) {
      console.error('Error getting last update time:', error);
      return null;
    }
  }

  async clearData() {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

// GitHub Integration and Background Updates
const GITHUB_REPO = 'TheoJhan/CBGuideToolKit';
const SELECTORS_PATH = 'selectors';
const UPDATE_INTERVAL = 5 * 60 * 1000; // 5 minutes

// Initialize IndexedDB
let db;

// Initialize the extension
chrome.runtime.onInstalled.addListener(async () => {
  console.log("CB Guide Toolkit: Extension installed.");
  
  // Set default enabled state
  chrome.storage.sync.get(['enabled'], (result) => {
    if (result.enabled === undefined) {
      chrome.storage.sync.set({ enabled: true });
      console.log("CB Guide Toolkit: Extension enabled by default");
    }
  });
  
  // Initialize IndexedDB
  await initIndexedDB();
  
  // Fetch selectors from GitHub
  await fetchAllSelectors();
  
  // Set up periodic updates every 5 minutes
  setInterval(fetchAllSelectors, UPDATE_INTERVAL);
});

// Initialize IndexedDB
async function initIndexedDB() {
  try {
    // Use the existing IDBWrapper class
    db = new IDBWrapper();
    await db.init();
    console.log('CB Guide Toolkit: IndexedDB initialized');
  } catch (error) {
    console.error('CB Guide Toolkit: IndexedDB initialization failed:', error);
  }
}

// Fetch all selector configurations from GitHub
async function fetchAllSelectors() {
  try {
    console.log('CB Guide Toolkit: Fetching selectors from GitHub...');
    
    // Get list of files in selectors directory
    const filesResponse = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${SELECTORS_PATH}`);
    if (!filesResponse.ok) {
      throw new Error(`GitHub API error: ${filesResponse.status}`);
    }
    
    const files = await filesResponse.json();
    const jsonFiles = files.filter(file => file.name.endsWith('.json'));
    
    console.log(`CB Guide Toolkit: Found ${jsonFiles.length} selector files`);
    
    // Fetch each JSON file
    for (const file of jsonFiles) {
      try {
        const domain = file.name.replace('.json', '');
        const rawUrl = `https://raw.githubusercontent.com/${GITHUB_REPO}/main/${SELECTORS_PATH}/${file.name}`;
        
        const response = await fetch(rawUrl);
        if (!response.ok) {
          console.warn(`CB Guide Toolkit: Failed to fetch ${file.name}: ${response.status}`);
          continue;
        }
        
        const config = await response.json();
        
        // Store in IndexedDB
        await storeSelectorConfig(domain, config);
        console.log(`CB Guide Toolkit: Updated config for ${domain}`);
        
      } catch (error) {
        console.error(`CB Guide Toolkit: Error processing ${file.name}:`, error);
      }
    }
    
    console.log('CB Guide Toolkit: Selector fetch completed');
    
  } catch (error) {
    console.error('CB Guide Toolkit: Failed to fetch selectors:', error);
  }
}

// Store selector configuration in IndexedDB
async function storeSelectorConfig(domain, config) {
  try {
    if (!db) {
      console.error('CB Guide Toolkit: IndexedDB not initialized');
      return;
    }
    
    // Store with domain as part of the data
    await db.saveSelector({
      domain: domain,
      config: config,
      lastUpdated: new Date().toISOString()
    });
    
  } catch (error) {
    console.error(`CB Guide Toolkit: Failed to store config for ${domain}:`, error);
  }
}

// Get selector configuration from IndexedDB
async function getSelectorConfig(domain) {
  try {
    if (!db) {
      console.error('CB Guide Toolkit: IndexedDB not initialized');
      return null;
    }
    
    const result = await db.getSelector(domain);
    if (result && result.config) {
      console.log(`CB Guide Toolkit: Found config for ${domain} in IndexedDB`);
      return result.config;
    }
    
    // Fallback: Try to load from local selectors
    console.log(`CB Guide Toolkit: No config found for ${domain} in IndexedDB, trying local fallback`);
    try {
      // This fallback is no longer needed as we are fetching from GitHub
      // If we wanted to load a specific local config, we would add it here.
      // For now, if no config is found in IndexedDB, we return null.
      return null;
    } catch (localError) {
      console.error(`CB Guide Toolkit: Failed to load local config for ${domain}:`, localError);
    }
    
    console.warn(`CB Guide Toolkit: No config found for ${domain}`);
    return null;
    
  } catch (error) {
    console.error(`CB Guide Toolkit: Failed to get config for ${domain}:`, error);
    return null;
  }
}

// Get the most recent update time from IndexedDB
async function getLastUpdateTime() {
  try {
    if (!db) {
      console.error('CB Guide Toolkit: IndexedDB not initialized');
      return null;
    }
    
    return await db.getLastUpdateTime();
    
  } catch (error) {
    console.error('CB Guide Toolkit: Failed to get last update time:', error);
    return null;
  }
}

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSelectorConfig') {
    const domain = request.domain;
    
    getSelectorConfig(domain).then(config => {
      sendResponse({ success: true, config: config });
    }).catch(error => {
      console.error('CB Guide Toolkit: Error getting config:', error);
      sendResponse({ success: false, error: error.message });
    });
    
    return true; // Keep message channel open for async response
  }
  
  if (request.action === 'forceUpdate') {
    fetchAllSelectors().then(() => {
      sendResponse({ success: true, message: 'Update completed' });
    }).catch(error => {
      sendResponse({ success: false, error: error.message });
    });
    
    return true;
  }
  
  if (request.action === 'getLastUpdateTime') {
    getLastUpdateTime().then(lastUpdate => {
      sendResponse({ success: true, lastUpdate: lastUpdate });
    }).catch(error => {
      console.error('CB Guide Toolkit: Error getting last update time:', error);
      sendResponse({ success: false, error: error.message });
    });
    
    return true;
  }
});

// Handle extension startup
chrome.runtime.onStartup.addListener(async () => {
  console.log('CB Guide Toolkit: Extension started');
  await initIndexedDB();
  await fetchAllSelectors();
});
