/**
 * FIREBASE CONFIG — NINJA'S CORP (App Proprio)
 * Même projet Firebase que l'app vendeur "ninja-s-fries"
 * Les deux apps partagent Firestore et Realtime Database
 */

const { initializeApp, getApps } = require('firebase/app');
const { getFirestore }           = require('firebase/firestore');
const { getDatabase }            = require('firebase/database');

const firebaseConfig = {
  apiKey:            "AIzaSyDJS5sgI7rFyAQAOZNgJsZ1nkWwjFI-cDE",
  authDomain:        "ninja-s-fries.firebaseapp.com",
  projectId:         "ninja-s-fries",
  storageBucket:     "ninja-s-fries.firebasestorage.app",
  messagingSenderId: "187217291987",
  appId:             "1:187217291987:web:f15c681cb2db7a1af28226",
  measurementId:     "G-6RZ70ZWBPN",
  // Realtime Database URL — à activer dans la console Firebase
  databaseURL:       "https://ninja-s-fries-default-rtdb.firebaseio.com",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

const db      = getFirestore(app);   // Firestore — données commandes/ventes
const rtdb    = getDatabase(app);    // Realtime DB — signalisation WebRTC

module.exports = { app, db, rtdb };
