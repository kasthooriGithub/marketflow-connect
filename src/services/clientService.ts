import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { Client } from '@/types/firebase';

export const clientService = {
    async createClientProfile(uid: string, data: Partial<Client> = {}) {
        const clientRef = doc(db, 'clients', uid);

        // Default client data
        const clientData: Client = {
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

    async getClientProfile(uid: string): Promise<Client | null> {
        const clientRef = doc(db, 'clients', uid);
        const clientSnap = await getDoc(clientRef);

        if (clientSnap.exists()) {
            return clientSnap.data() as Client;
        }
        return null;
    },

    async updateClientProfile(uid: string, data: Partial<Client>) {
        const clientRef = doc(db, 'clients', uid);
        const updateData = {
            ...data,
            updated_at: Timestamp.now()
        };
        await updateDoc(clientRef, updateData);
    }
};
