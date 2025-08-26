/**
 * Context State Persistence Utilities
 * Provides debounced localStorage and sessionStorage helpers for context providers
 */

interface PersistenceConfig {
  key: string;
  storage?: 'localStorage' | 'sessionStorage';
  debounceMs?: number;
}

interface PersistenceState<T> {
  value: T;
  timestamp: number;
  version?: string;
}

// Debounced save timeouts storage
const saveTimeouts = new Map<string, NodeJS.Timeout>();

/**
 * Debounced save to storage
 */
export function debouncedSave<T>(data: T, config: PersistenceConfig): void {
  const { key, storage = 'localStorage', debounceMs = 300 } = config;

  // Clear existing timeout
  const existingTimeout = saveTimeouts.get(key);
  if (existingTimeout) {
    clearTimeout(existingTimeout);
  }

  // Set new timeout
  const timeoutId = setTimeout(() => {
    try {
      const storageObj =
        storage === 'sessionStorage' ? sessionStorage : localStorage;
      const persistenceState: PersistenceState<T> = {
        value: data,
        timestamp: Date.now(),
        version: '1.0',
      };

      storageObj.setItem(key, JSON.stringify(persistenceState));
      console.log(`✅ Saved ${key} to ${storage}:`, data);
    } catch (error) {
      console.error(`❌ Failed to save ${key} to ${storage}:`, error);
    } finally {
      saveTimeouts.delete(key);
    }
  }, debounceMs);

  saveTimeouts.set(key, timeoutId);
}

/**
 * Load from storage with validation
 */
export function loadFromStorage<T>(
  config: PersistenceConfig,
  validator?: (data: unknown) => data is T
): T | null {
  const { key, storage = 'localStorage' } = config;

  try {
    const storageObj =
      storage === 'sessionStorage' ? sessionStorage : localStorage;
    const stored = storageObj.getItem(key);

    if (!stored) return null;

    const parsed: unknown = JSON.parse(stored);

    // Handle both old format (direct data) and new format (with metadata)
    let data: unknown;
    if (parsed && typeof parsed === 'object' && 'value' in parsed) {
      // New format with metadata
      data = (parsed as PersistenceState<unknown>).value;
    } else {
      // Old format (direct data) - for backwards compatibility
      data = parsed;
    }

    // Validate if validator provided
    if (validator && !validator(data)) {
      console.warn(`⚠️ Invalid data format for ${key}, ignoring stored value`);
      return null;
    }

    return data as T;
  } catch (error) {
    console.error(`❌ Failed to load ${key} from ${storage}:`, error);
    return null;
  }
}

/**
 * Clear storage data
 */
export function clearStorage(config: PersistenceConfig): void {
  const { key, storage = 'localStorage' } = config;

  try {
    const storageObj =
      storage === 'sessionStorage' ? sessionStorage : localStorage;
    storageObj.removeItem(key);
    console.log(`🗑️ Cleared ${key} from ${storage}`);
  } catch (error) {
    console.error(`❌ Failed to clear ${key} from ${storage}:`, error);
  }

  // Clear any pending saves
  const timeoutId = saveTimeouts.get(key);
  if (timeoutId) {
    clearTimeout(timeoutId);
    saveTimeouts.delete(key);
  }
}

/**
 * Check if storage is available
 */
export function isStorageAvailable(
  storage: 'localStorage' | 'sessionStorage' = 'localStorage'
): boolean {
  try {
    const storageObj =
      storage === 'sessionStorage' ? sessionStorage : localStorage;
    const test = '__storage_test__';
    storageObj.setItem(test, 'test');
    storageObj.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get storage usage info (for debugging)
 */
export function getStorageInfo(
  storage: 'localStorage' | 'sessionStorage' = 'localStorage'
): {
  available: boolean;
  used: number;
  remaining: number;
  keys: string[];
} {
  if (!isStorageAvailable(storage)) {
    return { available: false, used: 0, remaining: 0, keys: [] };
  }

  try {
    const storageObj =
      storage === 'sessionStorage' ? sessionStorage : localStorage;
    const keys = Object.keys(storageObj);
    const used = JSON.stringify(storageObj).length;

    // Rough estimate of remaining space (5MB typical limit)
    const limit = 5 * 1024 * 1024; // 5MB in bytes
    const remaining = Math.max(0, limit - used);

    return {
      available: true,
      used,
      remaining,
      keys,
    };
  } catch {
    return { available: false, used: 0, remaining: 0, keys: [] };
  }
}
