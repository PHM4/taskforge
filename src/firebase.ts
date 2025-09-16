import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBMxccugVjVU3ObV8tsO79eQaiYSR0eAnw",
  authDomain: "taskforge-4324c.firebaseapp.com",
  projectId: "taskforge-4324c",
  storageBucket: "taskforge-4324c.firebasestorage.app",
  messagingSenderId: "902299216971",
  appId: "1:902299216971:web:e166240e695256374ab1ce",
  measurementId: "G-7N9ETN7657"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app); // 👈 add this
