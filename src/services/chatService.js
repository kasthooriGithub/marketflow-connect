import { db } from 'lib/firebase';
import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    doc,
    updateDoc,
    Timestamp,
    orderBy,
    onSnapshot
} from 'firebase/firestore';

export const chatService = {
    // Create or get existing conversation
    async startConversation(participants, serviceId) {
        const conversationsRef = collection(db, 'conversations');

        const q = query(conversationsRef, where('participants', 'array-contains', participants[0]));
        const snapshot = await getDocs(q);

        const existing = snapshot.docs.find(doc => {
            const data = doc.data();
            return data.participants.includes(participants[1]) && data.participants.length === 2;
        });

        if (existing) {
            return existing.id;
        }

        // Create new
        const newConvData = {
            participants,
            serviceId,
            created_at: Timestamp.now(),
            updated_at: Timestamp.now()
        };

        const docRef = await addDoc(conversationsRef, newConvData);
        return docRef.id;
    },

    async sendMessage(conversationId, senderId, content) {
        const messagesRef = collection(db, 'conversations', conversationId, 'messages');
        const conversationRef = doc(db, 'conversations', conversationId);

        const messageData = {
            senderId,
            content,
            timestamp: Timestamp.now(),
            read: false
        };

        await addDoc(messagesRef, messageData);

        // Update last message in conversation
        await updateDoc(conversationRef, {
            lastMessage: {
                content,
                senderId,
                timestamp: Timestamp.now()
            },
            updated_at: Timestamp.now()
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
        const q = query(conversationsRef, where('participants', 'array-contains', userId), orderBy('updated_at', 'desc'));

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }
};
