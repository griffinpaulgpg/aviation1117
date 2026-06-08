import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBBA9oSH2qaN5KtYl8Ai0e60Bu2R46E15o",
  authDomain: "arunands-aviation-company.firebaseapp.com",
  projectId: "arunands-aviation-company",
  storageBucket: "arunands-aviation-company.firebasestorage.app",
  messagingSenderId: "233821526687",
  appId: "1:233821526687:web:cf7231bcc48c1a1b51a0aa",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
export const auth = getAuth(app);

export const getFirebaseStorage = async () => {
  const { getStorage } = await import("firebase/storage");
  return getStorage(app);
};

export const initAnalytics = async () => {
  if (typeof window !== "undefined" && await isSupported()) {
    return getAnalytics(app);
  }
  return null;
};

export default app;
