import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// isi konfigurasi sesuai dengan konfigurasi firebase kalian
const firebaseConfig = {
  apiKey: "AIzaSyChnppHaIaAIiHptqrxCmqU6uNA9dAKqBM",
  authDomain: "latihanjs-aca.firebaseapp.com",
  projectId: "latihanjs-aca",
  storageBucket: "latihanjs-aca.firebasestorage.app",
  messagingSenderId: "572225470508",
  appId: "1:572225470508:web:a4ff04308ced2431cd5189",
  measurementId: "G-2JTLNGD415",
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
