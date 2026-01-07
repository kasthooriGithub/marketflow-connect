import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: 'client' | 'vendor';
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  orderId?: string;
  serviceId?: string;
  serviceName: string;
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
  startConversation: (vendorId: string, vendorName: string, serviceId: string, serviceName: string) => Conversation;
  getConversationMessages: (conversationId: string) => Message[];
  getUnreadCount: () => number;
  markAsRead: (conversationId: string) => void;
}

const MessagingContext = createContext<MessagingContextType | undefined>(undefined);

export function MessagingProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem('marketflow_conversations');
    return saved ? JSON.parse(saved) : [];
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('marketflow_messages');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);

  useEffect(() => {
    localStorage.setItem('marketflow_conversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem('marketflow_messages', JSON.stringify(messages));
  }, [messages]);

  const startConversation = (
    vendorId: string,
    vendorName: string,
    serviceId: string,
    serviceName: string
  ): Conversation => {
    if (!user) throw new Error('Must be logged in');

    // Check if conversation already exists
    const existing = conversations.find(
      c => c.participants.vendorId === vendorId && 
           c.participants.clientId === user.id &&
           c.serviceId === serviceId
    );
    if (existing) return existing;

    const newConversation: Conversation = {
      id: `conv_${Date.now()}`,
      serviceId,
      serviceName,
      participants: {
        clientId: user.id,
        clientName: user.name,
        vendorId,
        vendorName,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setConversations(prev => [...prev, newConversation]);
    return newConversation;
  };

  const sendMessage = (conversationId: string, content: string) => {
    if (!user) return;

    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      conversationId,
      senderId: user.id,
      senderName: user.name,
      senderRole: user.role === 'vendor' ? 'vendor' : 'client',
      content,
      timestamp: new Date().toISOString(),
      read: false,
    };

    setMessages(prev => [...prev, newMessage]);

    // Update conversation's lastMessage
    setConversations(prev =>
      prev.map(conv =>
        conv.id === conversationId
          ? { ...conv, lastMessage: newMessage, updatedAt: new Date().toISOString() }
          : conv
      )
    );

    // Simulate vendor auto-reply for demo
    if (user.role !== 'vendor') {
      setTimeout(() => {
        const conv = conversations.find(c => c.id === conversationId);
        if (conv) {
          const replyMessage: Message = {
            id: `msg_${Date.now()}_reply`,
            conversationId,
            senderId: conv.participants.vendorId,
            senderName: conv.participants.vendorName,
            senderRole: 'vendor',
            content: getAutoReply(content),
            timestamp: new Date().toISOString(),
            read: false,
          };
          setMessages(prev => [...prev, replyMessage]);
          setConversations(prev =>
            prev.map(c =>
              c.id === conversationId
                ? { ...c, lastMessage: replyMessage, updatedAt: new Date().toISOString() }
                : c
            )
          );
        }
      }, 2000);
    }
  };

  const getAutoReply = (userMessage: string): string => {
    const lowerMsg = userMessage.toLowerCase();
    if (lowerMsg.includes('price') || lowerMsg.includes('cost')) {
      return "Great question! Our pricing is competitive and depends on your specific needs. Would you like me to provide a custom quote?";
    }
    if (lowerMsg.includes('timeline') || lowerMsg.includes('how long') || lowerMsg.includes('delivery')) {
      return "Typical turnaround is 5-7 business days, but we can expedite if needed. When would you need the project completed?";
    }
    if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
      return "Hi there! Thanks for reaching out. How can I help you today?";
    }
    return "Thanks for your message! I'll review this and get back to you with more details shortly.";
  };

  const getConversationMessages = (conversationId: string): Message[] => {
    return messages
      .filter(m => m.conversationId === conversationId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  };

  const getUnreadCount = (): number => {
    if (!user) return 0;
    return messages.filter(m => !m.read && m.senderId !== user.id).length;
  };

  const markAsRead = (conversationId: string) => {
    if (!user) return;
    setMessages(prev =>
      prev.map(m =>
        m.conversationId === conversationId && m.senderId !== user.id
          ? { ...m, read: true }
          : m
      )
    );
  };

  // Filter conversations for current user
  const userConversations = conversations.filter(conv => {
    if (!user) return false;
    return conv.participants.clientId === user.id || conv.participants.vendorId === user.id;
  });

  return (
    <MessagingContext.Provider value={{
      conversations: userConversations,
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
