import { db } from 'lib/firebase';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';

export const userService = {
    async createUserProfile(uid, data) {
        const userRef = doc(db, 'users', uid);
        const userData = {
            uid,
            email: data.email,
            full_name: data.full_name,
            role: data.role,
            created_at: Timestamp.now(),
            is_active: true,
            photo_url: data.photo_url || '',
        };

        await setDoc(userRef, userData, { merge: true });
        return userData;
    },

    async getUserProfile(uid) {
        const userRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            return userSnap.data();
        } else {
            return null;
        }
    }
};
