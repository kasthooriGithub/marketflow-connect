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

export const orderService = {
    async createOrder(data) {
        const ordersRef = collection(db, 'orders');

        const orderData = {
            ...data,
            status: 'pending', // Default status
            created_at: Timestamp.now(),
            updated_at: Timestamp.now(),
        };

        const docRef = await addDoc(ordersRef, orderData);

        return {
            id: docRef.id,
            ...orderData
        };
    },

    async getOrdersByClient(clientId) {
        const ordersRef = collection(db, 'orders');
        const q = query(ordersRef, where('clientId', '==', clientId), orderBy('created_at', 'desc'));
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    },

    async getOrdersByVendor(vendorId) {
        const ordersRef = collection(db, 'orders');
        const q = query(ordersRef, where('vendorId', '==', vendorId), orderBy('created_at', 'desc'));
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    },

    async updateOrderStatus(orderId, status) {
        const orderRef = doc(db, 'orders', orderId);
        await updateDoc(orderRef, {
            status,
            updated_at: Timestamp.now()
        });
    }
};
