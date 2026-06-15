import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";

import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBiAl9KJB6yXc1eIyhJ0w3ur-_bUs0bMac",
  authDomain: "roommate-bills-e65d2.firebaseapp.com",
  projectId: "roommate-bills-e65d2",
  storageBucket: "roommate-bills-e65d2.firebasestorage.app",
  messagingSenderId: "366881078647",
  appId: "1:366881078647:web:71f22b453f268f044ab572",
  measurementId: "G-2YJVWZE5HD"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
