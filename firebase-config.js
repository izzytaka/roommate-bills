// Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyBiAl9KJB6yXc1eIyhJ0w3ur-_bUs0bMac",
    authDomain: "roommate-bills-e65d2.firebaseapp.com",
    projectId: "roommate-bills-e65d2",
    storageBucket: "roommate-bills-e65d2.firebasestorage.app",
    messagingSenderId: "366881078647",
    appId: "1:366881078647:web:71f22b453f268f044ab572",
    measurementId: "G-2YJVWZE5HD"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
