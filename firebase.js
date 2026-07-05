// Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
  getAuth
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
  getStorage
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyAWT5IHI-3k6trCWADJ55q3mwGEjLg3fdE",
  authDomain: "oiky-songothon.firebaseapp.com",
  projectId: "oiky-songothon",
  storageBucket: "oiky-songothon.firebasestorage.app",
  messagingSenderId: "953735594819",
  appId: "1:953735594819:web:8539b1ffdcf396598525f6",
  measurementId: "G-HYYB7HGLVD"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = getFirestore(app);

export const storage = getStorage(app);