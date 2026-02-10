import {
    doc,
    setDoc,
    deleteDoc,
    getDoc,
    collection,
    getCountFromServer,
    serverTimestamp,
    getDocs,
    query,
    orderBy
} from 'firebase/firestore';
import { db } from 'lib/firebase';

/**
 * Checks if a service is saved by the user
 * @param {string} uid - User ID
 * @param {string} serviceId - Service ID
 * @returns {Promise<boolean>}
 */
export const isServiceSaved = async (uid, serviceId) => {
    if (!uid || !serviceId) return false;
    try {
        const docRef = doc(db, 'users', uid, 'saved_services', serviceId);
        const docSnap = await getDoc(docRef);
        return docSnap.exists();
    } catch (error) {
        console.error('Error checking if service is saved:', error);
        return false;
    }
};

/**
 * Saves a service to the user's wishlist
 * @param {string} uid - User ID
 * @param {Object} service - Service object
 * @returns {Promise<void>}
 */
export const saveService = async (uid, service) => {
    if (!uid || !service?.id) return;
    try {
        const docRef = doc(db, 'users', uid, 'saved_services', service.id);
        await setDoc(docRef, {
            service_id: service.id,
            title: service.title,
            price: service.price,
            vendor_name: service.vendorName || service.vendor_name || '',
            category: service.category || '',
            saved_at: serverTimestamp()
        });
    } catch (error) {
        console.error('Error saving service:', error);
        throw error;
    }
};

/**
 * Removes a service from the user's wishlist
 * @param {string} uid - User ID
 * @param {string} serviceId - Service ID
 * @returns {Promise<void>}
 */
export const unsaveService = async (uid, serviceId) => {
    if (!uid || !serviceId) return;
    try {
        const docRef = doc(db, 'users', uid, 'saved_services', serviceId);
        await deleteDoc(docRef);
    } catch (error) {
        console.error('Error unsaving service:', error);
        throw error;
    }
};

/**
 * Gets the total count of saved services for a user
 * @param {string} uid - User ID
 * @returns {Promise<number>}
 */
export const getSavedServicesCount = async (uid) => {
    if (!uid) return 0;
    try {
        const collRef = collection(db, 'users', uid, 'saved_services');
        const snapshot = await getCountFromServer(collRef);
        return snapshot.data().count;
    } catch (error) {
        console.error('Error getting saved services count:', error);
        return 0;
    }
};

/**
 * Gets all saved services for a user
 * @param {string} uid - User ID
 * @returns {Promise<Array>}
 */
export const getSavedServices = async (uid) => {
    if (!uid) return [];
    try {
        const collRef = collection(db, 'users', uid, 'saved_services');
        const q = query(collRef, orderBy('saved_at', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error getting saved services:', error);
        return [];
    }
};
