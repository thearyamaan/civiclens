import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB9_qJQTgBTW94Dk-6IR94frfgyUMnskKw",
  authDomain: "civiclens-66030.firebaseapp.com",
  projectId: "civiclens-66030",
  storageBucket: "civiclens-66030.firebasestorage.app",
  messagingSenderId: "46132369645",
  appId: "1:46132369645:web:50b6ea508e8101a19094e4"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);