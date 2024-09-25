import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage here

const firebaseConfig = {
  apiKey: "AIzaSyAg1Cd0h6wlxdqhbreInDCyGY8ER5WLh_s",
  authDomain: "cinemawala-fd658.firebaseapp.com",
  projectId: "cinemawala-fd658",
  storageBucket: "cinemawala-fd658.appspot.com",
  messagingSenderId: "97857123748",
  appId: "1:97857123748:web:bd0f62e75ea134cd05fd31",
  measurementId: "G-88FC2FFEW0"
  };

const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
const firestore = getFirestore(app);

export { app, auth, firestore };

