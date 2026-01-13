import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { User, UserRole } from '@/types/firebase';

export const userService = {
    async createUserProfile(uid: string, data: { email: string; full_name: string; role: UserRole; photo_url?: string }) {
        const userRef = doc(db, 'users', uid);
        const userData: User = {
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

    async getUserProfile(uid: string): Promise<User | null> {
        const userRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            return userSnap.data() as User;
        } else {
            return null;
        }
    }
};
