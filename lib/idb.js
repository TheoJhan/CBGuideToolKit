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

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = IDBWrapper;
} else {
  window.IDBWrapper = IDBWrapper;
} 