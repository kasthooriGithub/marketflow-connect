import { useState, useEffect, useRef } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useMessaging, Conversation, Message } from '@/contexts/MessagingContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, MessageSquare, ArrowLeft, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

export default function Messages() {
  const { user } = useAuth();
  const {
    conversations,
    activeConversation,
    setActiveConversation,
    sendMessage,
    getConversationMessages,
    markAsRead,
  } = useMessaging();

  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (activeConversation) {
      setCurrentMessages(getConversationMessages(activeConversation.id));
      markAsRead(activeConversation.id);
    }
  }, [activeConversation, getConversationMessages, markAsRead]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;
    sendMessage(activeConversation.id, newMessage.trim());
    setNewMessage('');
    // Refresh messages
    setTimeout(() => {
      setCurrentMessages(getConversationMessages(activeConversation.id));
    }, 100);
  };

  const getOtherParticipant = (conv: Conversation) => {
    if (!user) return { name: '', id: '' };
    if (user.role === 'vendor') {
      return { name: conv.participants.clientName, id: conv.participants.clientId };
    }
    return { name: conv.participants.vendorName, id: conv.participants.vendorId };
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  if (conversations.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-md mx-auto">
            <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">No messages yet</h1>
            <p className="text-muted-foreground mb-6">
              Start a conversation with a vendor by visiting a service page
            </p>
            <Link to="/services">
              <Button variant="gradient">Browse Services</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Messages</h1>

        <div className="grid md:grid-cols-3 gap-6 h-[calc(100vh-250px)] min-h-[500px]">
          {/* Conversations List */}
          <Card className={cn(
            "md:col-span-1 overflow-hidden",
            activeConversation && "hidden md:block"
          )}>
            <div className="p-4 border-b">
              <h2 className="font-semibold">Conversations</h2>
            </div>
            <ScrollArea className="h-[calc(100%-60px)]">
              {conversations.map(conv => {
                const other = getOtherParticipant(conv);
                const isActive = activeConversation?.id === conv.id;
                
                return (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConversation(conv)}
                    className={cn(
                      "w-full p-4 text-left hover:bg-muted/50 transition-colors border-b",
                      isActive && "bg-primary/5 border-l-2 border-l-primary"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {other.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium truncate">{other.name}</p>
                          {conv.lastMessage && (
                            <span className="text-xs text-muted-foreground">
                              {formatTime(conv.lastMessage.timestamp)}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {conv.serviceName}
                        </p>
                        {conv.lastMessage && (
                          <p className="text-sm text-muted-foreground truncate mt-1">
                            {conv.lastMessage.senderId === user?.id ? 'You: ' : ''}
                            {conv.lastMessage.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </ScrollArea>
          </Card>

          {/* Chat Area */}
          <Card className={cn(
            "md:col-span-2 flex flex-col overflow-hidden",
            !activeConversation && "hidden md:flex"
          )}>
            {activeConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b flex items-center gap-3">
                  <button
                    onClick={() => setActiveConversation(null)}
                    className="md:hidden p-1"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getOtherParticipant(activeConversation).name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">
                      {getOtherParticipant(activeConversation).name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {activeConversation.serviceName}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {currentMessages.map(msg => {
                      const isOwn = msg.senderId === user?.id;
                      
                      return (
                        <div
                          key={msg.id}
                          className={cn(
                            "flex gap-3",
                            isOwn && "flex-row-reverse"
                          )}
                        >
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarFallback className={cn(
                              "text-sm",
                              isOwn ? "bg-primary text-primary-foreground" : "bg-muted"
                            )}>
                              {msg.senderName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className={cn(
                            "max-w-[70%] rounded-2xl px-4 py-2",
                            isOwn
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          )}>
                            <p className="text-sm">{msg.content}</p>
                            <p className={cn(
                              "text-xs mt-1",
                              isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                            )}>
                              {formatTime(msg.timestamp)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1"
                    />
                    <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
}
