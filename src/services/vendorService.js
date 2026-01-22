import { db } from 'lib/firebase';
import { doc, getDoc, setDoc, updateDoc, Timestamp } from 'firebase/firestore';

export const vendorService = {
    async createVendorProfile(uid, data = {}) {
        const vendorRef = doc(db, 'vendors', uid);

        // Default vendor data
        const vendorData = {
            uid,
            agency_name: data.agency_name || '',
            bio: data.bio || '',
            categories: data.categories || [],
            profile_image: data.profile_image || '',
            cover_image: data.cover_image || '',
            rating: 0,
            review_count: 0,
            location: data.location || '',
            created_at: Timestamp.now(),
            updated_at: Timestamp.now(),
            ...data
        };

        await setDoc(vendorRef, vendorData, { merge: true });
        return vendorData;
    },

    async getVendorProfile(uid) {
        const vendorRef = doc(db, 'vendors', uid);
        const vendorSnap = await getDoc(vendorRef);

        if (vendorSnap.exists()) {
            return vendorSnap.data();
        }
        return null;
    },

    async updateVendorProfile(uid, data) {
        const vendorRef = doc(db, 'vendors', uid);
        const updateData = {
            ...data,
            updated_at: Timestamp.now()
        };
        await updateDoc(vendorRef, updateData);
    }
};
