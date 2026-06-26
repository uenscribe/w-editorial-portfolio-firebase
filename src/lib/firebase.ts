import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with specific database ID if available
export const db = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

/**
 * Saves a document to the cloud under the 'portfolio' collection.
 */
export async function saveDocumentToCloud(docId: string, data: any): Promise<void> {
  try {
    const docRef = doc(db, 'portfolio', docId);
    await setDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error(`Error saving document ${docId} to cloud:`, error);
  }
}

/**
 * Loads a document from the cloud under the 'portfolio' collection.
 */
export async function loadDocumentFromCloud(docId: string): Promise<any | null> {
  try {
    const docRef = doc(db, 'portfolio', docId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data();
    }
  } catch (error) {
    console.error(`Error loading document ${docId} from cloud:`, error);
  }
  return null;
}

/**
 * Helper to sync standard lists
 */
export async function saveListToCloud(key: string, list: any[]): Promise<void> {
  await saveDocumentToCloud(key, { list });
}

/**
 * Helper to load standard lists
 */
export async function loadListFromCloud(key: string): Promise<any[] | null> {
  const data = await loadDocumentFromCloud(key);
  return data && Array.isArray(data.list) ? data.list : null;
}

// Interceptor and debouncing states
let saveTimeout: any = null;
let pendingKeys = new Set<string>();

const syncToCloud = async () => {
  if (pendingKeys.size === 0) return;
  const keysToProcess = Array.from(pendingKeys);
  pendingKeys.clear();

  const listKeys = [
    'archive_projects',
    'archive_notes',
    'archive_library',
    'archive_timeline',
    'playlist_tracks',
    'custom_nav_items'
  ];

  let configsChanged = false;
  const configsData: any = {};

  for (const key of keysToProcess) {
    if (listKeys.includes(key)) {
      const val = localStorage.getItem(key);
      if (val) {
        try {
          const list = JSON.parse(val);
          await saveListToCloud(key, list);
        } catch (e) {
          console.error(`Failed to sync list ${key} to Firestore:`, e);
        }
      }
    } else if (key !== 'admin_logged_in') { // Skip local sessions
      const val = localStorage.getItem(key);
      configsData[key] = val;
      configsChanged = true;
    }
  }

  if (configsChanged) {
    try {
      const existing = await loadDocumentFromCloud('configs') || {};
      await saveDocumentToCloud('configs', {
        ...existing,
        ...configsData
      });
    } catch (e) {
      console.error('Failed to sync configs to Firestore:', e);
    }
  }
};

const queueCloudSync = (key: string) => {
  pendingKeys.add(key);
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(syncToCloud, 1000);
};

export async function forceSyncToCloud(): Promise<void> {
  if (saveTimeout) clearTimeout(saveTimeout);
  await syncToCloud();
}

export function setupCloudSync() {
  if (typeof window === 'undefined') return;

  // Intercept localStorage.setItem
  const originalSetItem = localStorage.setItem;
  localStorage.setItem = function(key: string, value: string) {
    originalSetItem.apply(this, [key, value]);
    queueCloudSync(key);
  };

  // Intercept localStorage.removeItem
  const originalRemoveItem = localStorage.removeItem;
  localStorage.removeItem = function(key: string) {
    originalRemoveItem.apply(this, [key]);
    queueCloudSync(key);
  };
}

export async function initializeCloudAndLocalData(): Promise<void> {
  const listKeys = [
    'archive_projects',
    'archive_notes',
    'archive_library',
    'archive_timeline',
    'playlist_tracks',
    'custom_nav_items'
  ];

  let hasCloudData = false;

  // 1. Try to load list keys from cloud in parallel
  const loadPromises = listKeys.map(async (key) => {
    try {
      const list = await loadListFromCloud(key);
      if (list) {
        localStorage.setItem(key, JSON.stringify(list));
        hasCloudData = true;
      }
    } catch (e) {
      console.error(`Error loading cloud key ${key}:`, e);
    }
  });

  // 2. Try to load config values from cloud
  const loadConfigsPromise = loadDocumentFromCloud('configs').then((configs) => {
    if (configs) {
      hasCloudData = true;
      for (const [key, val] of Object.entries(configs)) {
        if (key !== 'updatedAt' && val !== null && val !== undefined) {
          localStorage.setItem(key, String(val));
        }
      }
    }
  }).catch((e) => {
    console.error('Error loading configs:', e);
  });

  await Promise.all([...loadPromises, loadConfigsPromise]);

  // 3. If there is absolutely no cloud data (first run), seed it from current localStorage
  if (!hasCloudData) {
    console.log('No cloud data detected. Seeding cloud with local storage defaults...');
    for (const key of listKeys) {
      const val = localStorage.getItem(key);
      if (val) {
        try {
          await saveListToCloud(key, JSON.parse(val));
        } catch (e) {}
      }
    }

    const configsData: any = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && !listKeys.includes(key) && key !== 'admin_logged_in') {
        const val = localStorage.getItem(key);
        if (val) configsData[key] = val;
      }
    }
    if (Object.keys(configsData).length > 0) {
      await saveDocumentToCloud('configs', configsData);
    }
  }
}
