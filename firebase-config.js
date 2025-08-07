// firebase-config.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// PASTE YOUR CONFIG HERE (from Step 2.2)
const firebaseConfig = {
  apiKey: "AIzaSyCMOKeTDqF9mvhkDXLX2zHzXkA5zqt7Caw",
  authDomain: "darawatch-bloodbank.firebaseapp.com",
  projectId: "darawatch-bloodbank",
  storageBucket: "darawatch-bloodbank.firebasestorage.app",
  messagingSenderId: "269723985126",
  appId: "1:269723985126:web:1bdb88656c3a4085470727"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);