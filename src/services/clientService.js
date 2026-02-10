import { db } from 'lib/firebase';
import { doc, getDoc, setDoc, updateDoc, Timestamp } from 'firebase/firestore';

export const clientService = {
    async createClientProfile(uid, data = {}) {
        const clientRef = doc(db, 'clients', uid);

        // Default client data
        const clientData = {
            uid,
            display_name: data.display_name || '',
            preferences: data.preferences || [],
            created_at: Timestamp.now(),
            updated_at: Timestamp.now(),
            ...data
        };

        await setDoc(clientRef, clientData, { merge: true });
        return clientData;
    },

    async getClientProfile(uid) {
        const clientRef = doc(db, 'clients', uid);
        const clientSnap = await getDoc(clientRef);

        if (clientSnap.exists()) {
            return clientSnap.data();
        }
        return null;
    },

    async updateClientProfile(uid, data) {
        const clientRef = doc(db, 'client_profiles', uid);
        const updateData = {
            ...data,
            updated_at: Timestamp.now()
        };
        await updateDoc(clientRef, updateData);
    },

    async getOrCreateClientProfile(user) {
        if (!user || (!user.uid && !user.id)) throw new Error("Invalid user object");
        const uid = user.uid || user.id;

        // Use 'client_profiles' collection as requested
        const profileRef = doc(db, 'client_profiles', uid);
        const profileSnap = await getDoc(profileRef);

        if (profileSnap.exists()) {
            return profileSnap.data();
        }

        // Create new profile
        const newProfile = {
            uid,
            name: user.displayName || user.name || '',
            email: user.email || '',
            phone: '',
            avatar: user.photoURL || '',
            created_at: Timestamp.now(),
            updated_at: Timestamp.now()
        };

        await setDoc(profileRef, newProfile);
        return newProfile;
    }
};
