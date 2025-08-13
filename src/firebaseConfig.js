// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCfRixhpWYFuGYrFsj0AY958EqUD8SjzVU",
  authDomain: "faizaryaputra-portofolio.firebaseapp.com",
  projectId: "faizaryaputra-portofolio",
  storageBucket: "faizaryaputra-portofolio.appspot.com",
  messagingSenderId: "288054338989",
  appId: "1:288054338989:web:f2e4643925f9e90c4ded24",
  measurementId: "G-CEB35XXQ63",
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);

// Inisialisasi Firestore dan Storage
const db = getFirestore(app);
const storage = getStorage(app);

// Opsional: Analytics
let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

// Ekspor semua yang dibutuhkan
export { app, analytics, db, storage };
