import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { chatService } from 'services/chatService';

const MessagingContext = createContext(undefined);

export function MessagingProvider({ children }) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);

  // Fetch conversations on load
  useEffect(() => {
    if (!user) {
      setConversations([]);
      return;
    }

    const fetchConversations = async () => {
      try {
        const firestoreConvs = await chatService.getUserConversations(user.uid);

        const mappedConvs = firestoreConvs.map(fc => ({
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
        }));

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
      const uiMessages = firestoreMessages.map(m => ({
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
    vendorId,
    vendorName,
    serviceId,
    serviceName
  ) => {
    if (!user) throw new Error('Must be logged in');

    try {
      const convId = await chatService.startConversation([user.id, vendorId], serviceId);

      // Optimistic UI update or fetch fresh
      const newConv = {
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

      const existing = conversations.find(c => c.id === convId);
      if (existing) return existing;

      setConversations(prev => [...prev, newConv]);
      return newConv;

    } catch (error) {
      console.error("Error starting conversation:", error);
      return null;
    }
  };

  const sendMessage = async (conversationId, content) => {
    if (!user) return;
    try {
      await chatService.sendMessage(conversationId, user.id, content);
      // Live listener will update state
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const getConversationMessages = (conversationId) => {
    // No-op here because we use subscription on setActiveConversation
  };

  const getUnreadCount = () => {
    return 0;
  };

  const markAsRead = (conversationId) => {
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
