import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyB0NOxTCx7fnweXLdQjRtFOFbBJlGJZleA",
    authDomain: "dsplatform-8a859.firebaseapp.com",
    projectId: "dsplatform-8a859",
    storageBucket: "dsplatform-8a859.firebasestorage.app",
    messagingSenderId: "253342536134",
    appId: "1:253342536134:web:4fa8b77f91177e6cb822c7",
    measurementId: "G-84LJ9TW546"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
