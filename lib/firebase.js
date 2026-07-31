"use client";

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// بيانات Firebase (يفضّل نقلها إلى متغيرات بيئية .env.local في الإنتاج)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAFZcWQNOATI18UrOIaN6N11T_-r7bTgUk",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "arpd-4d038.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "arpd-4d038",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "arpd-4d038.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1046805235935",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1046805235935:web:eadbf2c9851997f594816a",
};

// تفادي إعادة التهيئة عند إعادة التحميل (Hot Reload) في Next.js
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
