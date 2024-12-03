// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA2d3VbXxQ15cl948unQh23W0KfsZm_W8U",
  authDomain: "productivity-48083.firebaseapp.com",
  projectId: "productivity-48083",
  storageBucket: "productivity-48083.firebasestorage.app",
  messagingSenderId: "218713041457",
  appId: "1:218713041457:web:aff0992d7a74e39f39c310",
  measurementId: "G-P1KLS0GGG5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
