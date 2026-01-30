import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMessaging } from "contexts/MessagingContext";
import { useAuth } from "contexts/AuthContext";
import { Layout } from "components/layout/Layout";

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
  unreadByConversation, // ✅ NEW
} = useMessaging();


  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  // ✅ select active conversation from URL
  useEffect(() => {
    if (!conversationId) {
      setActiveConversation(null);
      return;
    }
    if (conversations.length === 0) return;

    const found = conversations.find(
      (c) => String(c.id) === String(conversationId)
    );
    setActiveConversation(found || null);
  }, [conversationId, conversations, setActiveConversation]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getOtherName = (conv) => {
    if (!conv) return "";
    return user?.role === "vendor"
      ? conv.client_name || "Client"
      : conv.vendor_name || "Vendor";
  };

  // ✅ IMPORTANT: when opened via /messages/:id -> show only that one conversation in left
  const visibleConversations = conversationId
    ? conversations.filter((c) => String(c.id) === String(conversationId))
    : conversations;

  const handleSend = async (e) => {
    e.preventDefault();
    const msg = text.trim();
    if (!msg) return;
    await sendMessage(msg);
    setText("");
  };

  return (
    <Layout>
      <div className="messages-page">
        {/* Sidebar */}
        <div className="sidebar">
          <div className="d-flex align-items-center justify-content-between mb-2">
            <h4 className="m-0">Conversations</h4>

            {/* ✅ When opened from order chat, give a back button */}
            {conversationId && (
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => navigate("/orders")}
              >
                Back
              </button>
            )}
          </div>

          {visibleConversations.length === 0 && <p>No conversations</p>}

          {visibleConversations.map((c) => {
  const unread = unreadByConversation?.[c.id] || 0;

  return (
    <div
      key={c.id}
      className={`conv-item ${
        String(activeConversation?.id) === String(c.id) ? "active" : ""
      }`}
      onClick={() => navigate(`/messages/${c.id}`)}
      style={{ position: "relative" }} // ✅ needed for badge positioning
    >
      <strong>{getOtherName(c)}</strong>
      <div className="service">{c.service_name}</div>

      {/* ✅ Unread badge (only when unread > 0) */}
      {unread > 0 && (
        <span className="unread-badge">
          {unread > 99 ? "99+" : unread}
        </span>
      )}
    </div>
  );
})}

        </div>

        {/* Chat Area */}
        <div className="chat-area">
          {!activeConversation ? (
            <div className="empty">Select a conversation</div>
          ) : (
            <>
              <div className="chat-header">{getOtherName(activeConversation)}</div>

              <div className="chat-body">
                {messages.map((m) => {
                  const isOwn = String(m.senderId) === String(user?.uid);
                  return (
                    <div key={m.id} className={`msg ${isOwn ? "own" : ""}`}>
                      <div className="bubble">{m.text}</div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              <form className="chat-input" onSubmit={handleSend}>
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type message..."
                />
                <button type="submit" disabled={!text.trim()}>
                  Send
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      {/* ✅ layout CSS (without this, it looks like everything is "one column") */}
      <style>{`
        .messages-page{
          display:flex;
          height: calc(100vh - 180px);
          border:1px solid #eee;
          border-radius:12px;
          overflow:hidden;
          background:#fff;
        }
        .sidebar{
          width:320px;
          border-right:1px solid #eee;
          padding:16px;
          overflow:auto;
        }
        .chat-area{
          flex:1;
          display:flex;
          flex-direction:column;
        }
        .chat-header{
          padding:16px;
          border-bottom:1px solid #eee;
          font-weight:700;
        }
        .chat-body{
          flex:1;
          padding:16px;
          overflow:auto;
          background:#fafafa;
        }
        .chat-input{
          display:flex;
          gap:8px;
          padding:12px;
          border-top:1px solid #eee;
          background:#fff;
        }
        .chat-input input{
          flex:1;
          padding:10px 12px;
          border:1px solid #ddd;
          border-radius:8px;
          outline:none;
        }
        .chat-input button{
          padding:10px 14px;
          border-radius:8px;
          border:1px solid #0d6efd;
          background:#0d6efd;
          color:#fff;
        }
        .conv-item{
          padding:10px 12px;
          border:1px solid #eee;
          border-radius:10px;
          margin-bottom:10px;
          cursor:pointer;
        }
        .conv-item.active{
          border-color:#0d6efd;
          background: rgba(13,110,253,0.08);
        }
        .service{ font-size:12px; color:#666; margin-top:4px; }
        .msg{ display:flex; margin-bottom:10px; }
        .msg.own{ justify-content:flex-end; }
        .bubble{
          max-width:70%;
          padding:10px 12px;
          border-radius:12px;
          background:#fff;
          border:1px solid #eaeaea;
        }
        .msg.own .bubble{
          background:#0d6efd;
          color:#fff;
          border-color:#0d6efd;
        }
        @media (max-width: 768px){
          .messages-page{ flex-direction:column; height:auto; }
          .sidebar{ width:100%; border-right:0; border-bottom:1px solid #eee; }
        }
          .unread-badge{
  position:absolute;
  top:10px;
  right:10px;
  background:#0d6efd;
  color:#fff;
  font-size:0.65rem;
  padding:0.25em 0.45em;
  border-radius:999px;
  min-width:1.4rem;
  text-align:center;
  font-weight:600;
}

      `}</style>
    </Layout>
  );
}
