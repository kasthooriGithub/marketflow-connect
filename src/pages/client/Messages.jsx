import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMessaging } from "contexts/MessagingContext";
import { useAuth } from "contexts/AuthContext";
import { Layout } from "components/layout/Layout";
import { ProposalModal } from "components/vendor/ProposalModal";
import { ProposalDetailModal } from "components/client/ProposalDetailModal";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { Send, ArrowLeft, FileText, MessageSquare, User, Search, AlertCircle, Package, Check } from "lucide-react";
import { db } from "lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { toast } from "sonner";
import { proposalService } from "services/proposalService";

/**
 * Real-world Modern Messaging UI
 * Logic: Handles conversations, unread badges, and vendor proposals.
 * Navigation: Back button leads to Vendor Dashboard.
 */
export default function Messages() {
  const { user } = useAuth();
  const { conversationId } = useParams();
  const navigate = useNavigate();

  const {
    conversations,
    activeConversation,
    setActiveConversation,
    messages,
    sendMessage,
    unreadByConversation,
  } = useMessaging();

  const [text, setText] = useState("");
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [error, setError] = useState(null);

  // NEW: Client Viewing Modal State
  const [viewProposal, setViewProposal] = useState(null);
  const [isViewProposalOpen, setIsViewProposalOpen] = useState(false);

  const bottomRef = useRef(null);

  // URL-il conversationId irundhal adhai active conversation-aga set seiyum logic
  useEffect(() => {
    const resolveConversation = async () => {
      if (!conversationId) {
        setActiveConversation(null);
        return;
      }

      // 1. Try finding in local state first
      const found = conversations.find(
        (c) => String(c.id) === String(conversationId)
      );

      if (found) {
        setActiveConversation(found);
        setError(null);
        return;
      }

      // 2. If not in local state, fetch fresh from Firestore
      setIsPageLoading(true);
      setError(null);
      console.log(`[Messages Debug] Fetching fresh conversation: ${conversationId}`);

      try {
        const docRef = doc(db, "conversations", conversationId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();

          // Auth Check
          const isParticipant = data.client_id === user?.uid || data.vendor_id === user?.uid;
          if (!isParticipant) {
            setError("You are not authorized to view this conversation.");
            toast.error("Unauthorized access");
            return;
          }

          setActiveConversation({ id: docSnap.id, ...data });
        } else {
          setError("Conversation not found.");
          console.error(`[Messages Debug] Conversation ${conversationId} does not exist.`);
        }
      } catch (err) {
        console.error("[Messages Debug] Error fetching conversation:", err);
        setError("Failed to load conversation.");
      } finally {
        setIsPageLoading(false);
      }
    };

    resolveConversation();
  }, [conversationId, conversations, setActiveConversation, user?.uid]);

  // 1. Pudhu message varum pothu bottom-kku scroll seiyum
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const focusId = params.get('focus');

    // If we have a focusId, don't auto-scroll to bottom, let the focus logic handle it
    if (!focusId) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // 2. Focus handling: Scroll to specific message/proposal
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const focusId = params.get('focus');
    if (!focusId || messages.length === 0) return;

    // Wait slightly for render
    const timer = setTimeout(() => {
      const element = document.getElementById(focusId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('highlight-pulse');
        // Remove highlight after animation
        setTimeout(() => element.classList.remove('highlight-pulse'), 3000);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [messages, conversationId]);

  const getOtherName = (conv) => {
    if (!conv) return "";
    return user?.role === "vendor"
      ? conv.client_name || "Client"
      : conv.vendor_name || "Vendor";
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const msg = text.trim();
    if (!msg) return;
    await sendMessage(msg);
    setText("");
  };

  // Back button press panna dashboard-kku poga intha function udhavum
  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  if (isPageLoading) {
    return (
      <Layout footerVariant="dashboard">
        <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center bg-white">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Loading your conversation...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout footerVariant="dashboard">
        <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center bg-white p-4 text-center">
          <div className="bg-light p-4 rounded-circle mb-4">
            <AlertCircle size={48} className="text-danger" />
          </div>
          <h3 className="fw-bold mb-2">Oops! Something went wrong</h3>
          <p className="text-muted mb-4">{error}</p>
          <Button
            variant="primary"
            className="rounded-pill px-5"
            onClick={() => navigate("/client/orders")}
          >
            Back to My Orders
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout footerVariant="dashboard">
      <div className="messages-wrapper">
        <div className="messages-container">

          {/* 1. Sidebar: Chat List */}
          <div className={`sidebar ${conversationId ? 'd-none d-md-flex' : 'd-flex'}`}>
            <div className="sidebar-header">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h4 className="fw-bold m-0 text-dark">Messages</h4>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={handleBackToDashboard}
                  className="rounded-pill px-3"
                >
                  <ArrowLeft size={16} className="me-1" /> Dashboard
                </Button>
              </div>
              <div className="search-bar">
                <Search size={16} className="text-muted" />
                <input type="text" placeholder="Search chats..." />
              </div>
            </div>

            <div className="conversation-list custom-scrollbar">
              {conversations.length === 0 ? (
                <div className="empty-sidebar text-center p-5">
                  <MessageSquare size={40} className="text-muted opacity-25 mb-2" />
                  <p className="text-muted small">No conversations found</p>
                </div>
              ) : (
                conversations.map((c) => {
                  const unread = unreadByConversation?.[c.id] || 0;
                  const isActive = String(activeConversation?.id) === String(c.id);

                  return (
                    <div
                      key={c.id}
                      className={`conv-item ${isActive ? "active" : ""}`}
                      onClick={() => navigate(`/messages/${c.id}`)}
                    >
                      <div className="avatar-circle">
                        {getOtherName(c).charAt(0).toUpperCase()}
                      </div>
                      <div className="conv-info">
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="fw-bold text-dark truncate-name">{getOtherName(c)}</span>
                          {unread > 0 && <span className="unread-dot">{unread}</span>}
                        </div>
                        <div className="service-tag">{c.service_name}</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* 2. Chat Area */}
          <div className={`chat-area ${!conversationId ? 'd-none d-md-flex' : 'd-flex'}`}>
            {!activeConversation ? (
              <div className="no-chat-selected">
                <div className="icon-circle">
                  <MessageSquare size={48} className="text-primary opacity-20" />
                </div>
                <h5>Your Conversations</h5>
                <p className="text-muted small">Select a client from the left to view messages and send proposals.</p>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className="chat-header">
                  <div className="d-flex align-items-center gap-3">
                    <Button
                      variant="ghost"
                      className="d-md-none p-0"
                      onClick={() => navigate("/messages")}
                    >
                      <ArrowLeft size={24} />
                    </Button>
                    <div className="header-avatar">
                      {getOtherName(activeConversation).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h6 className="m-0 fw-bold">{getOtherName(activeConversation)}</h6>
                      <span className="text-primary smaller fw-medium">{activeConversation.service_name}</span>
                    </div>
                  </div>

                  {user?.role === "vendor" && (
                    <Button
                      variant="primary"
                      size="sm"
                      className="rounded-pill d-flex align-items-center gap-2"
                      onClick={() => setIsProposalModalOpen(true)}
                    >
                      <FileText size={16} /> <span className="d-none d-sm-inline">Send Proposal</span>
                    </Button>
                  )}
                </div>

                {/* Chat Messages Body */}
                <div className="chat-body custom-scrollbar">
                  <div className="message-bubbles-wrapper">
                    {messages.map((m) => {
                      const isOwn = String(m.sender_id || m.senderId) === String(user?.uid);
                      const isSystem = m.sender_id === 'system' || m.senderId === 'system';

                      if (m.type === 'proposal' && m.proposal_id) {
                        return (
                          <div key={m.id} id={`proposal_${m.proposal_id}`} className={`msg-row ${isOwn ? "own" : "incoming"} mb-3`}>
                            <div className="proposal-card shadow-sm border rounded-4 bg-white overflow-hidden" style={{ minWidth: '280px', maxWidth: '350px' }}>
                              <div className="bg-primary bg-opacity-10 p-3 border-bottom d-flex align-items-center gap-2">
                                <FileText size={18} className="text-primary" />
                                <span className="fw-bold text-primary small">Custom Proposal</span>
                              </div>
                              <div className="p-3">
                                <p className="mb-2 small text-dark fw-medium line-clamp-2">{m.text || "New proposal received"}</p>
                                <div className="d-flex flex-column gap-2 mt-3">
                                  <Button
                                    size="sm"
                                    className="w-100 rounded-pill"
                                    variant={isOwn ? "outline-primary" : "primary"}
                                    onClick={async () => {
                                      try {
                                        const p = await proposalService.getProposalById(m.proposal_id);
                                        if (p) {
                                          setViewProposal(p);
                                          setIsViewProposalOpen(true);
                                        } else {
                                          toast.error("Proposal no longer available");
                                        }
                                      } catch (err) {
                                        console.error("Fetch proposal error:", err);
                                        toast.error("Could not load proposal details");
                                      }
                                    }}
                                  >
                                    {isOwn ? "View Sent Proposal" : "View Proposal"}
                                  </Button>

                                  {isOwn && (
                                    <div className="text-center mt-2">
                                      <span className="tiny text-muted">You sent this offer</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      }

                      if (m.type === 'work_delivered' || m.type === 'delivery') {
                        const attachments = m.attachments || (m.fileUrl ? [{ url: m.fileUrl, name: 'Delivered File' }] : []);

                        return (
                          <div key={m.id} id="delivery" className={`msg-row ${isOwn ? "own" : "incoming"} mb-3`}>
                            <div className="delivery-card shadow-sm border rounded-4 bg-white overflow-hidden" style={{ minWidth: '300px', maxWidth: '380px' }}>
                              <div className="bg-success bg-opacity-10 p-3 border-bottom d-flex align-items-center justify-content-between">
                                <div className="d-flex align-items-center gap-2">
                                  <div className="p-2 bg-white rounded-circle">
                                    <Package size={20} className="text-success" />
                                  </div>
                                  <div>
                                    <span className="fw-bold text-success d-block">Work Delivered</span>
                                    <span className="tiny text-muted ms-1" style={{ fontSize: '0.75rem' }}>
                                      {m.createdAt?.toDate ? m.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                                    </span>
                                  </div>
                                </div>
                                {m.orderId && (
                                  <span className="badge bg-white text-dark border shadow-sm">
                                    #{m.orderId.slice(-6).toUpperCase()}
                                  </span>
                                )}
                              </div>

                              <div className="p-4">
                                {m.text && (
                                  <div className="mb-3 p-3 bg-light rounded-3 border-start border-4 border-success">
                                    <p className="mb-0 small text-dark fw-medium" style={{ whiteSpace: 'pre-wrap' }}>{m.text}</p>
                                  </div>
                                )}

                                {attachments.length > 0 && (
                                  <div className="d-flex flex-column gap-2">
                                    {attachments.map((file, idx) => (
                                      <div key={idx} className="d-flex align-items-center p-2 border rounded-3 bg-white hover-shadow transition-all">
                                        <div className="me-3 p-2 bg-light rounded">
                                          <FileText size={20} className="text-primary" />
                                        </div>
                                        <div className="flex-grow-1 overflow-hidden">
                                          <p className="mb-0 small fw-bold text-truncate">{file.name || `File ${idx + 1}`}</p>
                                          <p className="mb-0 tiny text-muted">{file.size ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Attachment'}</p>
                                        </div>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="text-primary"
                                          onClick={() => window.open(file.url, '_blank')}
                                        >
                                          Download
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                <div className="text-center mt-3 pt-2">
                                  <span className="badge bg-success bg-opacity-10 text-success fw-bold px-3 py-2 rounded-pill">
                                    <Check size={14} className="me-1" /> Ready for Review
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div key={m.id} id={`msg_${m.id}`} className={`msg-row ${isOwn ? "own" : "incoming"}`}>
                          <div className={`bubble shadow-sm ${isSystem ? 'system-msg' : ''}`}>
                            {m.text}
                          </div>
                        </div>
                      );
                    })}
                    <div ref={bottomRef} />
                  </div>
                </div>

                {/* Chat Input Field */}
                <div className="chat-footer">
                  <form className="input-container" onSubmit={handleSend}>
                    <Input
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Write your message..."
                      className="message-input border-0 shadow-none"
                    />
                    <Button type="submit" disabled={!text.trim()} className="send-btn">
                      <Send size={18} />
                    </Button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Vendor Sending Modal */}
      {user?.role === "vendor" && activeConversation && (
        <ProposalModal
          open={isProposalModalOpen}
          onOpenChange={setIsProposalModalOpen}
          client={{
            uid: activeConversation.client_id || activeConversation.participants?.clientId,
            name: activeConversation.client_name || activeConversation.participants?.clientName || "Client"
          }}
          vendor={{ uid: user.uid, name: user.displayName || "Vendor" }}
          service={{
            id: activeConversation.service_id || activeConversation.serviceId,
            name: activeConversation.service_name || activeConversation.serviceName
          }}
          conversationId={activeConversation.id}
        />
      )}

      {/* Client Viewing Modal */}
      <ProposalDetailModal
        open={isViewProposalOpen}
        onOpenChange={setIsViewProposalOpen}
        proposal={viewProposal}
        onActionComplete={(action) => {
          if (action === 'accepted') toast.success("Proposal accepted!");
          if (action === 'rejected') toast.success("Proposal rejected");
        }}
      />

      {/* Modern Professional CSS */}
      <style>{`
        .messages-wrapper {
          padding: 24px 0;
          background: #f8fafc;
        }
        .messages-container {
          display: flex;
          height: calc(100vh - 160px);
          max-width: 1200px;
          margin: 0 auto;
          background: #fff;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          overflow: hidden;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
        }

        /* Sidebar Styling */
        .sidebar {
          width: 350px;
          flex-direction: column;
          border-right: 1px solid #f1f5f9;
        }
        .sidebar-header { padding: 24px; border-bottom: 1px solid #f1f5f9; }
        .search-bar {
          display: flex; align-items: center; gap: 10px;
          background: #f1f5f9; padding: 8px 16px; border-radius: 12px;
        }
        .search-bar input {
          border: none; background: transparent; outline: none; font-size: 14px; width: 100%;
        }

        .conversation-list { flex: 1; overflow-y: auto; }
        .conv-item {
          display: flex; align-items: center; gap: 15px;
          padding: 16px 24px; cursor: pointer; transition: 0.2s;
          border-bottom: 1px solid #f8fafc;
        }
        .conv-item:hover { background: #f8fafc; }
        .conv-item.active { background: #eff6ff; border-left: 4px solid #3b82f6; }

        .avatar-circle {
          width: 48px; height: 48px; border-radius: 50%;
          background: #3b82f6; color: #fff;
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; flex-shrink: 0;
        }
        .conv-info { flex: 1; min-width: 0; }
        .truncate-name { font-size: 15px; display: block; }
        .service-tag { font-size: 11px; color: #64748b; margin-top: 2px; }
        .unread-dot {
          background: #ef4444; color: #fff; font-size: 10px;
          padding: 2px 7px; border-radius: 20px; font-weight: 700;
        }

        /* Chat Area Styling */
        .chat-area { flex: 1; display: flex; flex-direction: column; background: #fff; }
        .chat-header {
          padding: 16px 28px; display: flex; align-items: center; 
          justify-content: space-between; border-bottom: 1px solid #f1f5f9;
        }
        .header-avatar {
          width: 40px; height: 40px; border-radius: 50%;
          background: #f1f5f9; display: flex; align-items: center; justify-content: center;
          font-weight: 600; color: #3b82f6;
        }

        .chat-body { 
          flex: 1; padding: 24px; overflow-y: auto; 
          background-color: #fbfcfe;
          background-image: radial-gradient(#e2e8f0 0.5px, transparent 0.5px);
          background-size: 20px 20px;
        }
        .message-bubbles-wrapper { display: flex; flex-direction: column; gap: 12px; }
        
        .msg-row { display: flex; width: 100%; }
        .msg-row.own { justify-content: flex-end; }
        .msg-row.incoming { justify-content: flex-start; }

        .bubble {
          max-width: 65%; padding: 12px 18px; font-size: 14.5px;
          border-radius: 18px; line-height: 1.5;
        }
        .own .bubble {
          background: #3b82f6; color: #fff;
          border-bottom-right-radius: 4px;
        }
        .incoming .bubble {
          background: #fff; color: #1e293b;
          border: 1px solid #e2e8f0;
          border-bottom-left-radius: 4px;
        }

        .chat-footer { padding: 20px 28px; background: #fff; border-top: 1px solid #f1f5f9; }
        .input-container {
          display: flex; align-items: center; gap: 10px;
          background: #f8fafc; border: 1px solid #e2e8f0;
          padding: 6px 6px 6px 18px; border-radius: 30px;
        }
        .message-input { background: transparent !important; }
        .send-btn { width: 40px; height: 40px; border-radius: 50% !important; padding: 0 !important; }

        .no-chat-selected {
          flex: 1; display: flex; flex-direction: column;
          align-items: center; justify-content: center; text-align: center;
          padding: 40px;
        }
        .icon-circle {
          width: 80px; height: 80px; background: #f1f5f9;
          border-radius: 50%; display: flex; align-items: center;
          justify-content: center; margin-bottom: 20px;
        }

        .smaller { font-size: 12px; }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }

        @keyframes highlight-pulse {
          0% { background-color: rgba(59, 130, 246, 0); transform: scale(1); }
          20% { background-color: rgba(59, 130, 246, 0.15); transform: scale(1.02); }
          100% { background-color: rgba(59, 130, 246, 0); transform: scale(1); }
        }
        .highlight-pulse {
          animation: highlight-pulse 2s ease-in-out;
          border-left: 4px solid #3b82f6 !important;
          z-index: 10;
        }

        @media (max-width: 768px) {
          .messages-container { height: calc(100vh - 120px); border-radius: 0; }
          .sidebar { width: 100%; }
          .bubble { max-width: 85%; }
        }
      `}</style>
    </Layout>
  );
}