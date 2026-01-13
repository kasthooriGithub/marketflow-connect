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
    orderBy,
    onSnapshot
} from 'firebase/firestore';
import { Conversation, Message } from '@/types/firebase';

export const chatService = {
    // Create or get existing conversation
    async startConversation(participants: string[], serviceId?: string): Promise<string> {
        const conversationsRef = collection(db, 'conversations');

        // Check if conversation already exists between these participants
        // Note: This matches exact participants array. For scalability with >2 participants, logic differs.
        // For 2 users, we can just query where 'participants' array-contains one, then filter in code, 
        // or use a composite key if strictly 1-on-1. For now, simple query.
        // Simpler approach: Check if a conv exists with these EXACT participants.

        const q = query(conversationsRef, where('participants', 'array-contains', participants[0]));
        const snapshot = await getDocs(q);

        const existing = snapshot.docs.find(doc => {
            const data = doc.data() as Conversation;
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

    async sendMessage(conversationId: string, senderId: string, content: string) {
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
    subscribeToMessages(conversationId: string, callback: (messages: Message[]) => void) {
        const messagesRef = collection(db, 'conversations', conversationId, 'messages');
        const q = query(messagesRef, orderBy('timestamp', 'asc'));

        return onSnapshot(q, (snapshot) => {
            const messages = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Message));
            callback(messages);
        });
    },

    async getUserConversations(userId: string): Promise<Conversation[]> {
        const conversationsRef = collection(db, 'conversations');
        const q = query(conversationsRef, where('participants', 'array-contains', userId), orderBy('updated_at', 'desc'));

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Conversation));
    }
};
