import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

// TODO: Replace with your Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyBMxejPC3zYTvOLIksrZ1LOf4mFj899KEo",
    authDomain: "dates-647d5.firebaseapp.com",
    projectId: "dates-647d5",
    storageBucket: "dates-647d5.firebasestorage.app",
    messagingSenderId: "824250415351",
    appId: "1:824250415351:web:bbfe09da6891d891b37bf2",
    measurementId: "G-PS6SBZQD82"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);