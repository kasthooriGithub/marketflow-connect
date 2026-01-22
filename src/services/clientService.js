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
        const clientRef = doc(db, 'clients', uid);
        const updateData = {
            ...data,
            updated_at: Timestamp.now()
        };
        await updateDoc(clientRef, updateData);
    }
};
