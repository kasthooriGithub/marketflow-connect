import { db } from 'lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, updateDoc, doc, onSnapshot, orderBy, limit } from 'firebase/firestore';

export const notificationService = {
    /**
     * Create a notification for a user
     * @param {string} userId - The user ID to notify
     * @param {string} type - Notification type (e.g., 'proposal_accepted', 'proposal_rejected')
     * @param {string} title - Notification title
     * @param {string} message - Notification message
     * @param {object} metadata - Additional data (e.g., proposal_id, order_id)
     */
    async createNotification(userId, type, title, message, metadata = {}) {
        const notificationsRef = collection(db, 'notifications');

        const notificationData = {
            user_id: userId,
            type,
            title,
            message,
            read: false,
            created_at: serverTimestamp(),
            ...metadata
        };

        const docRef = await addDoc(notificationsRef, notificationData);
        return { id: docRef.id, ...notificationData };
    },

    /**
     * Mark notification as read
     */
    async markAsRead(notificationId) {
        const notificationRef = doc(db, 'notifications', notificationId);
        await updateDoc(notificationRef, {
            read: true,
            read_at: serverTimestamp()
        });
    },

    /**
     * Subscribe to user's notifications (real-time)
     */
    subscribeToNotifications(userId, callback) {
        const notificationsRef = collection(db, 'notifications');
        const q = query(
            notificationsRef,
            where('user_id', '==', userId),
            orderBy('created_at', 'desc'),
            limit(10)
        );

        let unsubscribe = () => { };

        // Helper to setup fallback
        const setupFallback = () => {
            const fallbackQ = query(
                notificationsRef,
                where('user_id', '==', userId),
                limit(10)
            );

            unsubscribe = onSnapshot(fallbackQ, (snapshot) => {
                const fallbackNotifications = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })).sort((a, b) => {
                    const dateA = a.created_at?.toMillis ? a.created_at.toMillis() : 0;
                    const dateB = b.created_at?.toMillis ? b.created_at.toMillis() : 0;
                    return dateB - dateA;
                });
                callback(fallbackNotifications);
            }, (error) => {
                console.error("Fallback notification subscription failed:", error);
            });
        };

        const initialUnsubscribe = onSnapshot(q, (snapshot) => {
            const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            callback(notifications);
        }, (error) => {
            console.error("Error subscribing to notifications:", error);
            if (error.code === 'failed-precondition') {
                setupFallback();
            }
        });

        unsubscribe = initialUnsubscribe;

        // Return a wrapper that calls the current unsubscribe
        return () => {
            if (unsubscribe) unsubscribe();
        };
    },


    /**
     * Get unread notifications for a user
     */
    async getUnreadNotifications(userId) {
        const notificationsRef = collection(db, 'notifications');
        const q = query(
            notificationsRef,
            where('user_id', '==', userId),
            where('read', '==', false)
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
};
