import NetInfo from '@react-native-community/netinfo';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base cache directory
const CACHE_DIR = `${FileSystem.cacheDirectory}quran_app_cache/`;
const AUDIO_CACHE_DIR = `${CACHE_DIR}audio/`;
const IMAGES_CACHE_DIR = `${CACHE_DIR}images/`;
const DATA_CACHE_FILE = `${CACHE_DIR}data_cache.json`;

// Create cache directories on init
(async () => {
  try {
    await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
    await FileSystem.makeDirectoryAsync(AUDIO_CACHE_DIR, { intermediates: true });
    await FileSystem.makeDirectoryAsync(IMAGES_CACHE_DIR, { intermediates: true });
  } catch (e) {
    console.log('Cache directories already exist');
  }
})();

// Data cache management
const dataCache = {
  async get(key) {
    try {
      // Check if cache file exists
      const cacheExists = await FileSystem.getInfoAsync(DATA_CACHE_FILE);
      if (!cacheExists.exists) {
        return null;
      }
      
      // Read cache file
      const cacheData = await FileSystem.readAsStringAsync(DATA_CACHE_FILE);
      const cache = JSON.parse(cacheData || '{}');
      
      // Get cached item
      const item = cache[key];
      if (!item) return null;
      
      // Check if item has expired
      if (item.expiry && Date.now() > item.expiry) {
        // Remove expired item
        delete cache[key];
        await FileSystem.writeAsStringAsync(DATA_CACHE_FILE, JSON.stringify(cache));
        return null;
      }
      
      return item.data;
    } catch (e) {
      console.error('Error reading from cache', e);
      return null;
    }
  },
  
  async set(key, data, ttl = null) {
    try {
      // Read existing cache
      let cache = {};
      const cacheExists = await FileSystem.getInfoAsync(DATA_CACHE_FILE);
      
      if (cacheExists.exists) {
        const cacheData = await FileSystem.readAsStringAsync(DATA_CACHE_FILE);
        cache = JSON.parse(cacheData || '{}');
      }
      
      // Calculate expiry time if ttl provided
      const expiry = ttl ? Date.now() + ttl : null;
      
      // Store data in cache
      cache[key] = {
        data,
        expiry,
        timestamp: Date.now(),
      };
      
      // Write cache to file
      await FileSystem.writeAsStringAsync(DATA_CACHE_FILE, JSON.stringify(cache));
      return true;
    } catch (e) {
      console.error('Error writing to cache', e);
      return false;
    }
  },
  
  async clear() {
    try {
      await FileSystem.deleteAsync(DATA_CACHE_FILE, { idempotent: true });
      return true;
    } catch (e) {
      console.error('Error clearing cache', e);
      return false;
    }
  },
};

// Network status monitoring
class NetworkManager {
  constructor() {
    this.isConnected = true;
    this.listeners = [];
    this.unsubscribe = null;
  }

  init() {
    this.unsubscribe = NetInfo.addEventListener(state => {
      const prevConnection = this.isConnected;
      this.isConnected = state.isConnected;
      
      // Notify listeners if connection status changed
      if (prevConnection !== this.isConnected) {
        this.notify();
      }
    });
  }

  addListener(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  notify() {
    this.listeners.forEach(listener => listener(this.isConnected));
  }

  cleanup() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}

const networkManager = new NetworkManager();
networkManager.init();

// Syncing manager for offline-first operations
class SyncManager {
  constructor() {
    this.syncQueue = [];
    this.isSyncing = false;
  }

  async loadQueueFromStorage() {
    try {
      const queueData = await AsyncStorage.getItem('syncQueue');
      if (queueData) {
        this.syncQueue = JSON.parse(queueData);
      }
    } catch (e) {
      console.error('Error loading sync queue', e);
    }
  }

  async saveQueueToStorage() {
    try {
      await AsyncStorage.setItem('syncQueue', JSON.stringify(this.syncQueue));
    } catch (e) {
      console.error('Error saving sync queue', e);
    }
  }

  addToQueue(operation) {
    this.syncQueue.push({
      ...operation,
      timestamp: Date.now(),
      attempts: 0,
    });
    this.saveQueueToStorage();
    this.attemptSync();
  }

  async attemptSync() {
    if (this.isSyncing || !networkManager.isConnected || this.syncQueue.length === 0) {
      return;
    }

    this.isSyncing = true;

    try {
      // Process the queue in order
      const pendingOperations = [...this.syncQueue];
      const completedOperations = [];

      for (const operation of pendingOperations) {
        try {
          // Execute the operation
          await operation.execute();
          completedOperations.push(operation);
        } catch (error) {
          operation.attempts += 1;
          if (operation.attempts >= 3) {
            // Remove from queue after max attempts
            completedOperations.push(operation);
          }
        }
      }

      // Remove completed operations
      this.syncQueue = this.syncQueue.filter(
        op => !completedOperations.some(completedOp => completedOp === op)
      );

      await this.saveQueueToStorage();
    } finally {
      this.isSyncing = false;
    }
  }
}

const syncManager = new SyncManager();
syncManager.loadQueueFromStorage();

// Listen for network reconnection to trigger sync
networkManager.addListener(isConnected => {
  if (isConnected) {
    syncManager.attemptSync();
  }
});

export {
  dataCache,
  networkManager,
  syncManager,
  CACHE_DIR,
  AUDIO_CACHE_DIR,
  IMAGES_CACHE_DIR,
};