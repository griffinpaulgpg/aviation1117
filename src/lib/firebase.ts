import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCeOH4KjIwmKLnsPD0oWA7g2o-5m9xcdZQ",
  authDomain: "arunands-aviation-academy.firebaseapp.com",
  projectId: "arunands-aviation-academy",
  storageBucket: "arunands-aviation-academy.firebasestorage.app",
  messagingSenderId: "762959296207",
  appId: "1:762959296207:web:d02849e4c229926e5069ba",
  measurementId: "G-WRX1PHD85V",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

export const initAnalytics = async () => {
  if (typeof window !== "undefined" && await isSupported()) {
    return getAnalytics(app);
  }
  return null;
};

export default app;
