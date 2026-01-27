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
    onSnapshot
} from 'firebase/firestore';

export const orderService = {
    async createOrder(data) {
        const ordersRef = collection(db, 'orders');

        const orderData = {
            client_id: data.client_id,
            vendor_id: data.vendor_id,
            service_id: data.service_id,
            service_name: data.service_name,
            total_amount: data.total_amount,
            status: 'pending', // Default status
            payment_status: 'unpaid',
            created_at: serverTimestamp(),
            updated_at: serverTimestamp(),
        };

        const docRef = await addDoc(ordersRef, orderData);

        return {
            id: docRef.id,
            ...orderData
        };
    },

    // Real-time subscription for client orders
    subscribeToClientOrders(clientId, callback) {
        const ordersRef = collection(db, 'orders');
        const q = query(
            ordersRef,
            where('client_id', '==', clientId),
            orderBy('created_at', 'desc')
        );

        return onSnapshot(q, (snapshot) => {
            const orders = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            callback(orders);
        }, (error) => {
            console.error("Error subscribing to client orders:", error);
            // Fallback query if index is missing (remove orderBy)
            if (error.code === 'failed-precondition') {
                const fallbackQ = query(ordersRef, where('client_id', '==', clientId));
                onSnapshot(fallbackQ, (snapshot) => {
                    const fallbackOrders = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    })).sort((a, b) => (b.created_at?.toMillis() || 0) - (a.created_at?.toMillis() || 0));
                    callback(fallbackOrders);
                });
            }
        });
    },

    // Real-time subscription for vendor orders
    subscribeToVendorOrders(vendorId, callback) {
        const ordersRef = collection(db, 'orders');
        const q = query(
            ordersRef,
            where('vendor_id', '==', vendorId),
            orderBy('created_at', 'desc')
        );

        return onSnapshot(q, (snapshot) => {
            const orders = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            callback(orders);
        }, (error) => {
            console.error("Error subscribing to vendor orders:", error);
            // Fallback query if index is missing
            if (error.code === 'failed-precondition') {
                const fallbackQ = query(ordersRef, where('vendor_id', '==', vendorId));
                onSnapshot(fallbackQ, (snapshot) => {
                    const fallbackOrders = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    })).sort((a, b) => (b.created_at?.toMillis() || 0) - (a.created_at?.toMillis() || 0));
                    callback(fallbackOrders);
                });
            }
        });
    },

    async updateOrderStatus(orderId, status) {
        const orderRef = doc(db, 'orders', orderId);
        await updateDoc(orderRef, {
            status,
            updated_at: serverTimestamp()
        });
    }
};
