import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import {
  connectAuthEmulator,
  getAuth,
  type Auth
} from 'firebase/auth';
import {
  connectDataConnectEmulator,
  getDataConnect,
  type DataConnect
} from 'firebase/data-connect';
import { connectStorageEmulator, getStorage, type FirebaseStorage } from 'firebase/storage';
import { connectorConfig } from '@historias/dataconnect';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId
);

const requestedBackend = import.meta.env.VITE_DATA_BACKEND?.trim().toLowerCase();
export const useFirebaseBackend =
  requestedBackend === 'firebase' || (requestedBackend !== 'local' && isFirebaseConfigured);

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dataConnectInstance: DataConnect | null = null;
let storageInstance: FirebaseStorage | null = null;

if (isFirebaseConfigured) {
  app = getApps()[0] ?? initializeApp(firebaseConfig);
  authInstance = getAuth(app);
  dataConnectInstance = getDataConnect(app, connectorConfig);
  storageInstance = getStorage(app);

  if (import.meta.env.VITE_FIREBASE_USE_EMULATORS === 'true') {
    const host = import.meta.env.VITE_FIREBASE_EMULATOR_HOST || '127.0.0.1';
    connectAuthEmulator(authInstance, `http://${host}:9099`, { disableWarnings: true });
    connectDataConnectEmulator(
      dataConnectInstance,
      host,
      Number(import.meta.env.VITE_DATA_CONNECT_EMULATOR_PORT || 9399)
    );
    connectStorageEmulator(storageInstance, host, Number(import.meta.env.VITE_STORAGE_EMULATOR_PORT || 9199));
  }
}

export const firebaseApp = app;
export const firebaseAuth = authInstance;
export const firebaseDataConnect = dataConnectInstance;
export const firebaseStorage = storageInstance;

export function requireFirebase() {
  if (!firebaseAuth || !firebaseDataConnect || !firebaseStorage) {
    throw new Error(
      'Firebase no está configurado. Define VITE_FIREBASE_API_KEY, VITE_FIREBASE_PROJECT_ID y VITE_FIREBASE_APP_ID.'
    );
  }
  return { auth: firebaseAuth, dataConnect: firebaseDataConnect, storage: firebaseStorage };
}
