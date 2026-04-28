import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, push, set } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAe3452QDD533IatbVVhAuhdlyFGuDQ4Fk",
  authDomain: "notebookcoro.firebaseapp.com",
  databaseURL: "https://notebookcoro-default-rtdb.firebaseio.com",
  projectId: "notebookcoro",
  storageBucket: "notebookcoro.firebasestorage.app",
  messagingSenderId: "210497174745",
  appId: "1:210497174745:web:2a36f91664b3939a8492c8",
  measurementId: "G-CC20MLQXXT"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export { ref, onValue, push, set };