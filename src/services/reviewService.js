import { db } from 'lib/firebase';
import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    doc,
    updateDoc,
    serverTimestamp,
    orderBy,
    increment
} from 'firebase/firestore';

export const reviewService = {
    async createReview(data) {
        const reviewsRef = collection(db, 'reviews');

        const reviewData = {
            order_id: data.order_id,
            client_id: data.client_id,
            client_name: data.client_name,
            vendor_id: data.vendor_id,
            service_id: data.service_id,
            rating: data.rating,
            comment: data.comment,
            created_at: serverTimestamp(),
        };

        const docRef = await addDoc(reviewsRef, reviewData);

        // Update vendor rating (this is a simplified version, ideally use a Cloud Function)
        const vendorRef = doc(db, 'vendors', data.vendor_id);
        await updateDoc(vendorRef, {
            review_count: increment(1),
            // Note: Proper average rating calculation would require all ratings
            // For now, we'll just track the count. 
            // rating: ??? 
        });

        return {
            id: docRef.id,
            ...reviewData
        };
    },

    async getVendorReviews(vendorId) {
        const reviewsRef = collection(db, 'reviews');
        const q = query(
            reviewsRef,
            where('vendor_id', '==', vendorId),
            orderBy('created_at', 'desc')
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    },

    async getServiceReviews(serviceId) {
        const reviewsRef = collection(db, 'reviews');
        const q = query(
            reviewsRef,
            where('service_id', '==', serviceId),
            orderBy('created_at', 'desc')
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }
};
