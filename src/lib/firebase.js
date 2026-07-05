// Firebase Storage Image Uploader
// Fallbacks to client-side base64 previews if Firebase environment variables are missing.

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Check if credentials exist
const isFirebaseConfigured = () => {
  return !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
};

let app;
let storage;

if (isFirebaseConfigured()) {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  storage = getStorage(app);
}

/**
 * Uploads a file (blob/file object) to Firebase Storage
 * @param {File} file 
 * @param {string} folder 
 * @returns {Promise<string>} The public download URL or local base64 preview as fallback
 */
export const uploadImage = async (file, folder = 'suits') => {
  if (!isFirebaseConfigured()) {
    console.warn('Firebase is not configured. Falling back to base64 preview.');
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  try {
    const fileExtension = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExtension}`;
    const storageRef = ref(storage, fileName);
    
    // Upload bytes
    const snapshot = await uploadBytes(storageRef, file);
    // Get public link
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (err) {
    console.error('Error uploading file to Firebase Storage:', err);
    throw new Error('Image upload failed: ' + err.message);
  }
};
