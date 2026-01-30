import { db } from 'lib/firebase';
import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    doc,
    getDoc,
    updateDoc,
    Timestamp,
    orderBy
} from 'firebase/firestore';
import { deleteDoc } from "firebase/firestore";

export const serviceService = {
    async createService(vendorId, data) {
        const servicesRef = collection(db, 'services');

        const serviceData = {
            vendor_id: vendorId,
            title: data.title,
            category_id: data.category_id || data.categoryId || '',
            category_slug: data.category_slug || data.categorySlug || '',
            short_description: data.short_description || data.shortDescription || '',
            long_description: data.long_description || data.longDescription || data.description || '',
            price: data.price,
            price_type: data.price_type || data.priceType || 'fixed',
            delivery_time_days: data.delivery_time_days || data.deliveryTimeDays || 7,
            features: data.features || [],
            tags: data.tags || [],
            featured: data.featured || false,
            is_active: data.is_active !== undefined ? data.is_active : true,
            average_rating: 0,
            total_reviews: 0,
            total_orders: 0,
            created_at: Timestamp.now(),
            updated_at: Timestamp.now(),
        };

        const docRef = await addDoc(servicesRef, serviceData);

        return {
            id: docRef.id,
            ...serviceData
        };
    },

    async getServicesByVendor(vendorId) {
        const servicesRef = collection(db, 'services');
        const q = query(servicesRef, where('vendor_id', '==', vendorId), orderBy('created_at', 'desc'));
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    },

    async getServiceById(serviceId) {
        const serviceRef = doc(db, 'services', serviceId);
        const serviceSnap = await getDoc(serviceRef);

        if (serviceSnap.exists()) {
            return {
                id: serviceSnap.id,
                ...serviceSnap.data()
            };
        }
        return null;
    },

    async updateService(serviceId, data) {
        const serviceRef = doc(db, 'services', serviceId);
        const updateData = {
            ...data,
            updated_at: Timestamp.now()
        };
        await updateDoc(serviceRef, updateData);
    },

    async deleteService(serviceId) {
        const serviceRef = doc(db, "services", serviceId);
        await deleteDoc(serviceRef);
    }
};
