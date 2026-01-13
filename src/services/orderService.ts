import { db } from '@/lib/firebase';
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
import { Order } from '@/types/firebase';

export const orderService = {
    async createOrder(data: Omit<Order, 'id' | 'created_at' | 'updated_at' | 'status'>) {
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
        } as Order;
    },

    async getOrdersByClient(clientId: string): Promise<Order[]> {
        const ordersRef = collection(db, 'orders');
        const q = query(ordersRef, where('clientId', '==', clientId), orderBy('created_at', 'desc'));
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Order));
    },

    async getOrdersByVendor(vendorId: string): Promise<Order[]> {
        const ordersRef = collection(db, 'orders');
        const q = query(ordersRef, where('vendorId', '==', vendorId), orderBy('created_at', 'desc'));
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Order));
    },

    async updateOrderStatus(orderId: string, status: Order['status']) {
        const orderRef = doc(db, 'orders', orderId);
        await updateDoc(orderRef, {
            status,
            updated_at: Timestamp.now()
        });
    }
};
