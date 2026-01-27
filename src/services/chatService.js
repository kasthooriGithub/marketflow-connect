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

        // Create new
        const newConvData = {
            client_id: clientId,
            vendor_id: vendorId,
            service_id: serviceId,
            service_name: serviceName,
            created_at: serverTimestamp(),
            updated_at: serverTimestamp(),
            lastMessage: null,
            last_message_at: null
        };

        const docRef = await addDoc(conversationsRef, newConvData);
        return docRef.id;
    },

    // Legacy support for startConversation if still used elsewhere (optional but safer)
    async startConversation(participants, serviceId) {
        // Fallback or internal use
        return this.getOrCreateConversation(participants[0], participants[1], serviceId, 'Service Inquiry');
    },

    async sendMessage(conversationId, senderId, content) {
        const messagesRef = collection(db, 'conversations', conversationId, 'messages');
        const conversationRef = doc(db, 'conversations', conversationId);

        const messageData = {
            senderId,
            content,
            timestamp: serverTimestamp(),
            read: false
        };

        await addDoc(messagesRef, messageData);

        // Update last message in conversation
        await updateDoc(conversationRef, {
            last_message: content,
            last_message_at: serverTimestamp(),
            lastMessage: { // Keep for UI compatibility
                content,
                senderId,
                timestamp: serverTimestamp()
            },
            updated_at: serverTimestamp()
        });
    },

    // Real-time listener for messages
    subscribeToMessages(conversationId, callback) {
        const messagesRef = collection(db, 'conversations', conversationId, 'messages');
        const q = query(messagesRef, orderBy('timestamp', 'asc'));

        return onSnapshot(q, (snapshot) => {
            const messages = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            callback(messages);
        });
    },

    async getUserConversations(userId) {
        const conversationsRef = collection(db, 'conversations');
        // Search as either client or vendor
        const qClient = query(conversationsRef, where('client_id', '==', userId), orderBy('updated_at', 'desc'));
        const qVendor = query(conversationsRef, where('vendor_id', '==', userId), orderBy('updated_at', 'desc'));

        const [clientSnap, vendorSnap] = await Promise.all([getDocs(qClient), getDocs(qVendor)]);

        const allConvs = [...clientSnap.docs, ...vendorSnap.docs].map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Deduplicate and sort if needed (though usually client and vendor IDs are distinct)
        return allConvs.sort((a, b) => (b.updated_at?.toMillis() || 0) - (a.updated_at?.toMillis() || 0));
    }
};
