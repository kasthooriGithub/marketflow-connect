import { db } from 'lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

export const activityService = {
    /**
     * Create an activity record for a user
     * @param {string} userId - The user ID
     * @param {string} type - Activity type
     * @param {string} title - Activity title
     * @param {string} message - Activity message
     * @param {object} metadata - Additional data (order_id, proposal_id, etc.)
     */
    async createActivity(userId, type, title, message, metadata = {}) {
        const activitiesRef = collection(db, 'activities');

        const activityData = {
            user_id: userId,
            type,
            title,
            message,
            created_at: serverTimestamp(),
            ...metadata
        };

        const docRef = await addDoc(activitiesRef, activityData);
        return { id: docRef.id, ...activityData };
    },

    /**
     * Create activity records for both client and vendor
     */
    async createOrderActivity(orderData, type, clientTitle, vendorTitle, clientMessage, vendorMessage, metadata = {}) {
        const activities = [];

        // Create client activity
        if (orderData.client_id) {
            activities.push(
                this.createActivity(
                    orderData.client_id,
                    type,
                    clientTitle,
                    clientMessage,
                    { order_id: orderData.id, ...metadata }
                )
            );
        }

        // Create vendor activity
        if (orderData.vendor_id) {
            activities.push(
                this.createActivity(
                    orderData.vendor_id,
                    type,
                    vendorTitle,
                    vendorMessage,
                    { order_id: orderData.id, ...metadata }
                )
            );
        }

        await Promise.all(activities);
    },

    /**
     * Get recent activities for a user
     * @param {string} userId - The user ID
     * @param {number} limitCount - Number of activities to fetch (default: 5)
     */
    async getUserActivities(userId, limitCount = 5) {
        const activitiesRef = collection(db, 'activities');
        const q = query(
            activitiesRef,
            where('user_id', '==', userId),
            orderBy('created_at', 'desc'),
            limit(limitCount)
        );

        try {
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Error fetching activities:", error);
            // Fallback: If index is missing, query without sorting
            if (error.code === 'failed-precondition') {
                const fallbackQ = query(
                    activitiesRef,
                    where('user_id', '==', userId),
                    limit(limitCount)
                );
                const snapshot = await getDocs(fallbackQ);
                return snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })).sort((a, b) => {
                    const dateA = a.created_at?.toMillis ? a.created_at.toMillis() : 0;
                    const dateB = b.created_at?.toMillis ? b.created_at.toMillis() : 0;
                    return dateB - dateA;
                });
            }
            return [];
        }
    },

    /**
     * Get recent activities for a user
     * @param {string} userId - The user ID
     * @param {number} limitCount - Number of activities to fetch (default: 5)
     */
    subscribeToRecentActivity(userId, limitCount = 5, callback) {
        const activitiesRef = collection(db, 'activities');
        const q = query(
            activitiesRef,
            where('user_id', '==', userId),
            orderBy('created_at', 'desc'),
            limit(limitCount)
        );

        let unsubscribe = () => { };

        const setupFallback = () => {
            const fallbackQ = query(
                activitiesRef,
                where('user_id', '==', userId),
                limit(limitCount)
            );

            unsubscribe = onSnapshot(fallbackQ, (snapshot) => {
                const fallbackActivities = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })).sort((a, b) => {
                    const dateA = a.created_at?.toMillis ? a.created_at.toMillis() : 0;
                    const dateB = b.created_at?.toMillis ? b.created_at.toMillis() : 0;
                    return dateB - dateA;
                });
                callback(fallbackActivities);
            }, (error) => {
                console.error("Fallback activity subscription failed:", error);
            });
        };

        const initialUnsubscribe = onSnapshot(q, (snapshot) => {
            const activities = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            callback(activities);
        }, (error) => {
            console.error("Error subscribing to recent activity:", error);
            if (error.code === 'failed-precondition') {
                setupFallback();
            }
        });

        unsubscribe = initialUnsubscribe;

        return () => {
            if (unsubscribe) unsubscribe();
        };
    },
};
