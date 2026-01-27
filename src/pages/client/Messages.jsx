import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Layout } from 'components/layout/Layout';
import { useMessaging } from 'contexts/MessagingContext';
import { useAuth } from 'contexts/AuthContext';
import { Button } from 'components/ui/button';
import { Input } from 'components/ui/input';
import { Send, MessageSquare, ArrowLeft } from 'lucide-react';
import { Container, Row, Col } from 'react-bootstrap';

export default function Messages() {
  const { user } = useAuth();
  const { conversationId } = useParams();
  const {
    conversations,
    activeConversation,
    setActiveConversation,
    sendMessage,
    messages,
  } = useMessaging();

  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  // Set active conversation from URL param
  useEffect(() => {
    if (conversationId && conversations.length > 0) {
      const found = conversations.find(c => c.id === conversationId);
      if (found && activeConversation?.id !== found.id) {
        setActiveConversation(found);
      }
    }
  }, [conversationId, conversations, setActiveConversation, activeConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;
    sendMessage(activeConversation.id, newMessage.trim());
    setNewMessage('');
  };

  const getOtherParticipant = (conv) => {
    if (!user) return { name: '', id: '' };
    if (user.role === 'vendor') {
      return { name: conv.participants.clientName, id: conv.participants.clientId };
    }
    return { name: conv.participants.vendorName, id: conv.participants.vendorId };
  };

  const formatTime = (timestamp) => {
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

  return (
    <Layout>
      <Container className="py-5">
        <h1 className="h3 fw-bold mb-4">Messages</h1>

        <Row className="g-0 border rounded-4 overflow-hidden bg-white shadow-sm" style={{ height: 'calc(100vh - 280px)', minHeight: '500px' }}>
          {/* Conversations List */}
          <Col md={4} className={`border-end flex-column ${activeConversation && 'd-none d-md-flex'}`} style={{ display: 'flex' }}>
            <div className="p-3 border-bottom bg-light bg-opacity-50">
              <h2 className="h6 fw-bold mb-0">Conversations</h2>
            </div>
            <div className="flex-grow-1 overflow-auto">
              {conversations.length === 0 ? (
                <div className="p-4 text-center text-muted small">
                  No conversations found.
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {conversations.map(conv => {
                    const other = getOtherParticipant(conv);
                    const isActive = activeConversation?.id === conv.id;

                    return (
                      <button
                        key={conv.id}
                        onClick={() => setActiveConversation(conv)}
                        className={`list-group-item list-group-item-action border-0 border-bottom p-3 ${isActive ? 'bg-primary bg-opacity-10' : ''}`}
                      >
                        <div className="d-flex gap-3">
                          <div className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 40, height: 40 }}>
                            <span className="text-primary fw-bold">{other.name.charAt(0)}</span>
                          </div>
                          <div className="flex-grow-1 min-w-0">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <div className="fw-semibold text-dark truncate small">{other.name}</div>
                              {conv.lastMessage && (
                                <span className="text-muted" style={{ fontSize: '0.7rem' }}>
                                  {formatTime(conv.lastMessage.timestamp)}
                                </span>
                              )}
                            </div>
                            <div className="text-primary small truncate fw-medium" style={{ fontSize: '0.75rem' }}>
                              {conv.serviceName}
                            </div>
                            {conv.lastMessage && (
                              <div className="text-muted small truncate mt-1" style={{ fontSize: '0.75rem' }}>
                                {conv.lastMessage.senderId === user?.id ? 'You: ' : ''}
                                {conv.lastMessage.content}
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </Col>

          {/* Chat Area */}
          <Col md={8} className={`flex-column ${!activeConversation && 'd-none d-md-flex'}`} style={{ display: 'flex' }}>
            {activeConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-3 border-bottom d-flex align-items-center gap-3 bg-light bg-opacity-25">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveConversation(null)}
                    className="d-md-none p-1"
                  >
                    <ArrowLeft size={20} />
                  </Button>
                  <div className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 40, height: 40 }}>
                    <span className="text-primary fw-bold">
                      {getOtherParticipant(activeConversation).name.charAt(0)}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="fw-bold text-dark truncate">{getOtherParticipant(activeConversation).name}</div>
                    <div className="text-primary small truncate fw-medium">{activeConversation.serviceName}</div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-grow-1 overflow-auto p-4 bg-light bg-opacity-10">
                  <div className="d-flex flex-column gap-3">
                    {messages.map(msg => {
                      const isOwn = msg.senderId === user?.id;

                      return (
                        <div
                          key={msg.id}
                          className={`d-flex gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}
                        >
                          <div className="rounded-circle bg-light d-flex align-items-center justify-content-center flex-shrink-0 shadow-sm border" style={{ width: 32, height: 32 }}>
                            <span className={`small fw-bold ${isOwn ? 'text-primary' : 'text-muted'}`}>
                              {msg.senderName.charAt(0)}
                            </span>
                          </div>
                          <div className={`p-3 rounded-4 shadow-sm border max-w-75 ${isOwn ? 'bg-primary text-white border-primary' : 'bg-white text-dark'}`}>
                            <p className="mb-1 small">{msg.content}</p>
                            <div className={`text-end ${isOwn ? 'text-white-50' : 'text-muted'}`} style={{ fontSize: '0.65rem' }}>
                              {formatTime(msg.timestamp)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Message Input */}
                <div className="p-3 border-top bg-white">
                  <form onSubmit={handleSendMessage} className="d-flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-grow-1 px-3 py-2 border-primary border-opacity-25 shadow-none"
                    />
                    <Button type="submit" disabled={!newMessage.trim()} className="rounded-circle p-2 d-flex align-items-center justify-content-center">
                      <Send size={18} />
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-grow-1 d-flex flex-column align-items-center justify-content-center p-5 text-center">
                <div className="p-4 bg-light rounded-circle mb-4 shadow-sm border">
                  <MessageSquare size={48} className="text-muted opacity-50" />
                </div>
                <h3 className="h5 fw-bold text-dark">Your Messages</h3>
                <p className="text-muted small" style={{ maxWidth: 300 }}>
                  Select a conversation from the list to start messaging with your clients or vendors.
                </p>
              </div>
            )}
          </Col>
        </Row>
      </Container>
      <style>{`
        .max-w-75 { max-width: 75%; }
        @media (max-width: 767.98px) {
            .max-w-75 { max-width: 85%; }
        }
      `}</style>
    </Layout>
  );
}
