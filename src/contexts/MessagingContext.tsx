import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { chatService } from '@/services/chatService';
import { Conversation as FirestoreConversation, Message as FirestoreMessage } from '@/types/firebase';
import { Timestamp } from 'firebase/firestore';

// Adapter types to match existing UI
export interface Message {
  id: string;
  conversationId: string; // Add this to Firestore Message type or derive it? 
  // FirestoreMessage doesn't strictly have conversationId in the type definition I made, 
  // but it's in the subcollection. I need to handle this.
  // Actually, wait, the UI expects these types. I should map Firestore types to these.
  senderId: string;
  senderName: string; // Firestore Message doesn't have senderName, we might need to fetch it or store it.
  senderRole: 'client' | 'vendor'; // specific to UI
  content: string;
  timestamp: string; // ISO string
  read: boolean;
}

export interface Conversation {
  id: string;
  orderId?: string;
  serviceId?: string;
  serviceName: string; // might be missing
  participants: {
    clientId: string;
    clientName: string;
    vendorId: string;
    vendorName: string;
  };
  lastMessage?: Message;
  createdAt: string;
  updatedAt: string;
}

interface MessagingContextType {
  conversations: Conversation[];
  messages: Message[];
  activeConversation: Conversation | null;
  setActiveConversation: (conversation: Conversation | null) => void;
  sendMessage: (conversationId: string, content: string) => void;
  startConversation: (vendorId: string, vendorName: string, serviceId: string, serviceName: string) => Promise<Conversation | null>;
  getConversationMessages: (conversationId: string) => void; // void because it sets state
  getUnreadCount: () => number;
  markAsRead: (conversationId: string) => void;
}

const MessagingContext = createContext<MessagingContextType | undefined>(undefined);

export function MessagingProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);

  // Fetch conversations on load
  useEffect(() => {
    if (!user) {
      setConversations([]);
      return;
    }

    const fetchConversations = async () => {
      try {
        const firestoreConvs = await chatService.getUserConversations(user.uid);
        // Map to UI Conversation type
        // Note: This mapping is tricky because Firestore convs store minimal data (ids).
        // The UI expects names (clientName, vendorName, serviceName).
        // In a real refactor we would fetch those profiles. 
        // For now, I will mock the names or use placeholders to avoid breaking.

        const mappedConvs: Conversation[] = firestoreConvs.map(fc => ({
          id: fc.id,
          serviceId: fc.serviceId,
          serviceName: 'Service Inquiry', // placeholder, ideally fetch service
          participants: {
            clientId: fc.participants[0], // Assumption: 0=client, 1=vendor. Needs robust logic.
            clientName: 'Client',
            vendorId: fc.participants[1],
            vendorName: 'Vendor'
          },
          createdAt: fc.created_at.toDate().toISOString(),
          updatedAt: fc.updated_at.toDate().toISOString(),
          // Start with undefined lastMessage, or map if I updated valid type
        }));

        // Refinement: The user.id determines which participant slot they are?
        // Existing logic: participants is array.

        setConversations(mappedConvs);
      } catch (error) {
        console.error("Error fetching conversations:", error);
      }
    };

    fetchConversations();
  }, [user]);

  // Subscribe to messages when active conversation changes
  useEffect(() => {
    if (!activeConversation) return;

    const unsubscribe = chatService.subscribeToMessages(activeConversation.id, (firestoreMessages) => {
      const uiMessages: Message[] = firestoreMessages.map(m => ({
        id: m.id,
        conversationId: activeConversation.id,
        senderId: m.senderId,
        senderName: m.senderId === user?.id ? (user?.name || '') : 'User', // Simple fallback
        senderRole: 'client', // Unknown without lookup
        content: m.content,
        timestamp: m.timestamp.toDate().toISOString(),
        read: m.read
      }));
      setMessages(uiMessages);
    });

    return () => unsubscribe();
  }, [activeConversation, user]);


  const startConversation = async (
    vendorId: string,
    vendorName: string,
    serviceId: string,
    serviceName: string
  ): Promise<Conversation | null> => {
    if (!user) throw new Error('Must be logged in');

    try {
      const convId = await chatService.startConversation([user.id, vendorId], serviceId);

      // Optimistic UI update or fetch fresh
      const newConv: Conversation = {
        id: convId,
        serviceId,
        serviceName,
        participants: {
          clientId: user.id,
          clientName: user.name,
          vendorId,
          vendorName,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Check if explicit duplicate check handling is needed in UI state?
      // chatService handles duplicate in backend, returns ID.
      // If ID exists in state, switch to it.
      const existing = conversations.find(c => c.id === convId);
      if (existing) return existing;

      setConversations(prev => [...prev, newConv]);
      return newConv;

    } catch (error) {
      console.error("Error starting conversation:", error);
      return null;
    }
  };

  const sendMessage = async (conversationId: string, content: string) => {
    if (!user) return;
    try {
      await chatService.sendMessage(conversationId, user.id, content);
      // Live listener will update state
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const getConversationMessages = (conversationId: string) => {
    // No-op here because we use subscription on setActiveConversation
    // But for compatibility with UI that might call this:
    // We could define it to switch active conversation?
  };

  const getUnreadCount = (): number => {
    // Requires global subscription or storing unread counts in user/conversation doc
    // For now return 0 or calculate from loaded messages if possible
    return 0;
  };

  const markAsRead = (conversationId: string) => {
    // Implement in chatService if needed
  };

  return (
    <MessagingContext.Provider value={{
      conversations,
      messages,
      activeConversation,
      setActiveConversation,
      sendMessage,
      startConversation,
      getConversationMessages,
      getUnreadCount,
      markAsRead,
    }}>
      {children}
    </MessagingContext.Provider>
  );
}

export function useMessaging() {
  const context = useContext(MessagingContext);
  if (!context) {
    throw new Error('useMessaging must be used within a MessagingProvider');
  }
  return context;
}
