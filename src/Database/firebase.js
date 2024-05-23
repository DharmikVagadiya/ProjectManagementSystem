import { initializeApp } from "firebase/app";
import { getFirestore } from '@firebase/firestore';
import { getStorage } from '@firebase/storage';

// const firebaseConfig = {
//   apiKey: "AIzaSyDlDQpp50TPSZDQmnjS2BVaLgAFnxZxkv0",
//   authDomain: "test-project-53f5b.firebaseapp.com",
//   projectId: "test-project-53f5b",
//   storageBucket: "test-project-53f5b.appspot.com",
//   messagingSenderId: "847978122944",
//   appId: "1:847978122944:web:a2e1c2e554d63c3ebfe725"
// };

const firebaseConfig = {
  apiKey: "AIzaSyA2xOHGWOEeF99ywtIJcTWqDPDS0nZVUpE",
  authDomain: "test2-52b3d.firebaseapp.com",
  projectId: "test2-52b3d",
  storageBucket: "test2-52b3d.appspot.com",
  messagingSenderId: "1051515369497",
  appId: "1:1051515369497:web:a8d5d2a0becf87509e9288"
};

const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);
export const storage = getStorage();