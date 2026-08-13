import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
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
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };

