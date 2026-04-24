// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC2jgwdPNUg5C_BJB68o2OJ3uPFIvKy2g8",
  authDomain: "skin-browser.firebaseapp.com",
  projectId: "skin-browser",
  storageBucket: "skin-browser.firebasestorage.app",
  messagingSenderId: "1012520829269",
  appId: "1:1012520829269:web:30f037658b1eee4c4d2fdc",
  measurementId: "G-02PH6CB5R8",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const db = getFirestore(app);
