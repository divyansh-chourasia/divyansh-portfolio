// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from "firebase/firestore"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "react-portfolio-divyansh.firebaseapp.com",
  projectId: "react-portfolio-divyansh",
  storageBucket: "react-portfolio-divyansh.appspot.com",
  messagingSenderId: "219024545513",
  appId: "1:219024545513:web:722c93591d7d22b1558278"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

export const db = getFirestore()