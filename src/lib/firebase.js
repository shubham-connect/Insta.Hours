import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;

let app = null;
let authInstance = null;
let dbInstance = null;
let googleProviderInstance = null;
let isConfigured = false;

if (apiKey && !apiKey.startsWith('demo-') && apiKey !== 'YOUR_API_KEY') {
  try {
    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID
    };

    app = initializeApp(firebaseConfig);
    authInstance = getAuth(app);
    dbInstance = getFirestore(app);
    googleProviderInstance = new GoogleAuthProvider();
    isConfigured = true;
  } catch (error) {
    console.warn('Firebase failed to initialize with provided env. Falling back to Demo Mode.', error);
  }
} else {
  console.info('InstaHours running in Demo / Standalone Mode (No Firebase keys provided in .env).');
}

export const auth = authInstance;
export const db = dbInstance;
export const googleProvider = googleProviderInstance;
export const isFirebaseConfigured = isConfigured;
