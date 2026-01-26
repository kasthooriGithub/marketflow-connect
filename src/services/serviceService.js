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
            ...data,
            vendorId,
            created_at: Timestamp.now(),
            updated_at: Timestamp.now(),
        };

        const docRef = await addDoc(servicesRef, serviceData);

        // Return the service with the generated ID
        return {
            id: docRef.id,
            ...serviceData
        };
    },

    async getServicesByVendor(vendorId) {
        const servicesRef = collection(db, 'services');
        const q = query(servicesRef, where('vendorId', '==', vendorId), orderBy('created_at', 'desc'));
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
