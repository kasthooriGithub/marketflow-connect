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
    serverTimestamp,
    orderBy,
    onSnapshot
} from 'firebase/firestore';

export const chatService = {
    // Create or get existing conversation
    async getOrCreateConversation(clientId, vendorId, serviceId, serviceName) {
        const conversationsRef = collection(db, 'conversations');

        const q = query(
            conversationsRef,
            where('client_id', '==', clientId),
            where('vendor_id', '==', vendorId),
            where('service_id', '==', serviceId)
        );

        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            return snapshot.docs[0].id;
        }

        // Create new conversation with complete schema
        const newConvData = {
            client_id: clientId,
            vendor_id: vendorId,
            service_id: serviceId,
            service_name: serviceName || 'Service Inquiry',
            last_message: null,
            last_message_at: null,
            last_message_sender_id: null,
            created_at: serverTimestamp(),
            updated_at: serverTimestamp()
        };

        const docRef = await addDoc(conversationsRef, newConvData);
        return docRef.id;
    },

    // Legacy support for startConversation
    async startConversation(participants, serviceId) {
        return this.getOrCreateConversation(participants[0], participants[1], serviceId, 'Service Inquiry');
    },

    async sendMessage(conversationId, senderId, content) {
        const messagesRef = collection(db, 'conversations', conversationId, 'messages');
        const conversationRef = doc(db, 'conversations', conversationId);

        // Get conversation to determine receiver
        const convSnap = await getDoc(conversationRef);
        if (!convSnap.exists()) {
            throw new Error('Conversation not found');
        }

        const convData = convSnap.data();
        const receiverId = senderId === convData.client_id ? convData.vendor_id : convData.client_id;

        // Complete message schema
        const messageData = {
            sender_id: senderId,
            receiver_id: receiverId,
            text: content,
            type: 'text',
            read: false,
            created_at: serverTimestamp()
        };

        await addDoc(messagesRef, messageData);

        // Update conversation with last message
        await updateDoc(conversationRef, {
            last_message: content,
            last_message_at: serverTimestamp(),
            last_message_sender_id: senderId,
            updated_at: serverTimestamp()
        });
    },

    // Real-time listener for messages
    subscribeToMessages(conversationId, callback) {
        const messagesRef = collection(db, 'conversations', conversationId, 'messages');
        const q = query(messagesRef, orderBy('created_at', 'asc'));

        return onSnapshot(q, (snapshot) => {
            const messages = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                // Map to UI-friendly names for backward compatibility
                senderId: doc.data().sender_id,
                content: doc.data().text,
                timestamp: doc.data().created_at
            }));
            callback(messages);
        }, (error) => {
            console.error('Error subscribing to messages:', error);
            // Fallback without orderBy if index missing
            const fallbackQ = query(messagesRef);
            return onSnapshot(fallbackQ, (snapshot) => {
                const messages = snapshot.docs
                    .map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                        senderId: doc.data().sender_id,
                        content: doc.data().text,
                        timestamp: doc.data().created_at
                    }))
                    .sort((a, b) => {
                        const aTime = a.created_at?.toMillis?.() || 0;
                        const bTime = b.created_at?.toMillis?.() || 0;
                        return aTime - bTime;
                    });
                callback(messages);
            });
        });
    },

    async getUserConversations(userId) {
        const conversationsRef = collection(db, 'conversations');

        try {
            // Try with orderBy first (requires composite index)
            const qClient = query(conversationsRef, where('client_id', '==', userId), orderBy('updated_at', 'desc'));
            const qVendor = query(conversationsRef, where('vendor_id', '==', userId), orderBy('updated_at', 'desc'));

            const [clientSnap, vendorSnap] = await Promise.all([getDocs(qClient), getDocs(qVendor)]);

            const allConvs = [...clientSnap.docs, ...vendorSnap.docs].map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            return allConvs.sort((a, b) => (b.updated_at?.toMillis() || 0) - (a.updated_at?.toMillis() || 0));
        } catch (error) {
            // Fallback without orderBy if index missing
            console.warn('Firestore index missing for conversations, using fallback query. Error:', error.message);

            const qClient = query(conversationsRef, where('client_id', '==', userId));
            const qVendor = query(conversationsRef, where('vendor_id', '==', userId));

            const [clientSnap, vendorSnap] = await Promise.all([getDocs(qClient), getDocs(qVendor)]);

            const allConvs = [...clientSnap.docs, ...vendorSnap.docs].map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Sort in memory
            return allConvs.sort((a, b) => (b.updated_at?.toMillis() || 0) - (a.updated_at?.toMillis() || 0));
        }
    },

    // Real-time subscription for user conversations
    subscribeToUserConversations(userId, callback) {
        const conversationsRef = collection(db, 'conversations');

        const qClient = query(conversationsRef, where('client_id', '==', userId));
        const qVendor = query(conversationsRef, where('vendor_id', '==', userId));

        const unsubscribers = [];
        const conversationsMap = new Map();

        const updateCallback = () => {
            const allConvs = Array.from(conversationsMap.values());
            const sorted = allConvs.sort((a, b) => (b.updated_at?.toMillis() || 0) - (a.updated_at?.toMillis() || 0));
            callback(sorted);
        };

        // Subscribe to client conversations
        const unsubClient = onSnapshot(qClient, (snapshot) => {
            snapshot.docs.forEach(doc => {
                conversationsMap.set(doc.id, { id: doc.id, ...doc.data() });
            });
            updateCallback();
        }, (error) => {
            console.error('Error subscribing to client conversations:', error);
        });

        // Subscribe to vendor conversations
        const unsubVendor = onSnapshot(qVendor, (snapshot) => {
            snapshot.docs.forEach(doc => {
                conversationsMap.set(doc.id, { id: doc.id, ...doc.data() });
            });
            updateCallback();
        }, (error) => {
            console.error('Error subscribing to vendor conversations:', error);
        });

        unsubscribers.push(unsubClient, unsubVendor);

        // Return combined unsubscribe function
        return () => {
            unsubscribers.forEach(unsub => unsub());
        };
    }
};
