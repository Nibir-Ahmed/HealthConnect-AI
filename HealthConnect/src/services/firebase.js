import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyD51W5FSqS2Rxsa3C2ApWd-_bJHkU5EjcY",
  authDomain: "healthconnect-f7fcb.firebaseapp.com",
  projectId: "healthconnect-f7fcb",
  storageBucket: "healthconnect-f7fcb.firebasestorage.app",
  messagingSenderId: "710819612061",
  appId: "1:710819612061:web:d1dec7e6f337fddc48db74"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

// Use forced long polling to ensure bulletproof network connectivity on Web & mobile
let db;
try {
  db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
  });
} catch (e) {
  db = getFirestore(app);
}

const storage = getStorage(app);

export { app, auth, db, storage };

