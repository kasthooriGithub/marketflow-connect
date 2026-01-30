import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthContext";
import { chatService } from "services/chatService";
import { db } from "lib/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

const MessagingContext = createContext(undefined);

export function MessagingProvider({ children }) {
  const { user } = useAuth();
  const authUid = user?.uid;

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);

  // ✅ total unread + per conversation unread
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadCountByConversation, setUnreadCountByConversation] = useState({});

  const unreadUnsubsRef = useRef([]);

  // ✅ Navbar compatibility: getUnreadCount must exist
  const getUnreadCount = () => unreadCount || 0;

  // ✅ Sidebar badge compatibility
  const getUnreadCountByConversation = (conversationId) => {
    if (!conversationId) return 0;
    return unreadCountByConversation?.[String(conversationId)] || 0;
  };

  // helper: names
  const getClientNameByUid = async (uid) => {
    try {
      const snap = await getDoc(doc(db, "clients", uid));
      return snap.exists() ? snap.data().display_name || "Client" : "Client";
    } catch {
      return "Client";
    }
  };

  const getVendorNameByUid = async (uid) => {
    try {
      const snap = await getDoc(doc(db, "vendors", uid));
      return snap.exists() ? snap.data().agency_name || "Vendor" : "Vendor";
    } catch {
      return "Vendor";
    }
  };

  // ✅ mark as read (receiver_id based)
  const markConversationAsRead = async (conversationId) => {
    if (!authUid || !conversationId) return;

    const messagesRef = collection(db, "conversations", conversationId, "messages");
    const q = query(
      messagesRef,
      where("receiver_id", "==", authUid),
      where("read", "==", false)
    );

    try {
      const snap = await getDocs(q);
      await Promise.all(snap.docs.map((d) => updateDoc(d.ref, { read: true })));
    } catch (e) {
      // optional fallback for old messages without receiver_id
      try {
        const fallbackQ = query(
          messagesRef,
          where("read", "==", false),
          where("sender_id", "!=", authUid)
        );
        const snap2 = await getDocs(fallbackQ);
        await Promise.all(snap2.docs.map((d) => updateDoc(d.ref, { read: true })));
      } catch (err2) {
        console.error("markConversationAsRead error:", e, err2);
      }
    }
  };

  // ✅ Real-time subscription for conversations
  useEffect(() => {
    if (!authUid) {
      setConversations([]);
      setActiveConversation(null);
      setMessages([]);
      setUnreadCount(0);
      setUnreadCountByConversation({});
      return;
    }

    console.log("[MessagingContext] Subscribing to conversations for user:", authUid);

    // IMPORTANT: chatService must have this method
    const unsubscribe = chatService.subscribeToUserConversations(authUid, async (firestoreConvs) => {
      console.log("[MessagingContext] Received conversations:", firestoreConvs.length);

      // Enrich with names
      const enriched = await Promise.all(
        firestoreConvs.map(async (fc) => {
          const clientName = await getClientNameByUid(fc.client_id);
          const vendorName = await getVendorNameByUid(fc.vendor_id);

          const lastMessage =
            fc.last_message
              ? {
                  content: fc.last_message,
                  timestamp: fc.last_message_at?.toDate
                    ? fc.last_message_at.toDate().toISOString()
                    : null,
                  senderId: fc.last_message_sender_id || null,
                }
              : null;

          return {
            id: fc.id,
            serviceId: fc.service_id,
            serviceName: fc.service_name || "Service Inquiry",
            participants: {
              clientId: fc.client_id,
              clientName,
              vendorId: fc.vendor_id,
              vendorName,
            },
            lastMessage,
            createdAt: fc.created_at?.toDate
              ? fc.created_at.toDate().toISOString()
              : new Date().toISOString(),
            updatedAt: fc.updated_at?.toDate
              ? fc.updated_at.toDate().toISOString()
              : new Date().toISOString(),
          };
        })
      );

      console.log("[MessagingContext] Enriched conversations:", enriched);
      setConversations(enriched);
    });

    return () => {
      console.log("[MessagingContext] Unsubscribing from conversations");
      unsubscribe && unsubscribe();
    };
  }, [authUid]);

  // ✅ realtime unread per conversation + total
  useEffect(() => {
    unreadUnsubsRef.current.forEach((fn) => fn && fn());
    unreadUnsubsRef.current = [];
    setUnreadCount(0);
    setUnreadCountByConversation({});

    if (!authUid || conversations.length === 0) return;

    const countsMap = new Map();

    const recompute = () => {
      let total = 0;
      const obj = {};
      countsMap.forEach((v, key) => {
        total += v;
        obj[key] = v;
      });
      setUnreadCount(total);
      setUnreadCountByConversation(obj);
    };

    conversations.forEach((c) => {
      if (!c?.id) return;

      const messagesRef = collection(db, "conversations", c.id, "messages");

      // Primary: receiver_id based
      const q1 = query(
        messagesRef,
        where("receiver_id", "==", authUid),
        where("read", "==", false)
      );

      const unsub = onSnapshot(
        q1,
        (snap) => {
          countsMap.set(c.id, snap.size);
          recompute();
        },
        async (err) => {
          // Fallback for old messages without receiver_id (may require index)
          console.warn("Unread listener error (primary), trying fallback:", err.message);
          try {
            const q2 = query(
              messagesRef,
              where("read", "==", false),
              where("sender_id", "!=", authUid)
            );
            const unsub2 = onSnapshot(q2, (snap2) => {
              countsMap.set(c.id, snap2.size);
              recompute();
            });
            unreadUnsubsRef.current.push(unsub2);
          } catch (err2) {
            console.error("Unread listener error (fallback):", err2);
            countsMap.set(c.id, 0);
            recompute();
          }
        }
      );

      unreadUnsubsRef.current.push(unsub);
    });

    return () => {
      unreadUnsubsRef.current.forEach((fn) => fn && fn());
      unreadUnsubsRef.current = [];
    };
  }, [authUid, conversations]);

  // ✅ subscribe messages for active conversation
  useEffect(() => {
    if (!activeConversation?.id) {
      setMessages([]);
      return;
    }

    console.log("[MessagingContext] Subscribing to messages for conversation:", activeConversation.id);

    setMessages([]);
    markConversationAsRead(activeConversation.id);

    const unsubscribe = chatService.subscribeToMessages(activeConversation.id, (msgs) => {
      console.log("[MessagingContext] Received messages:", msgs.length);

      const mapped = msgs.map((m) => ({
        id: m.id,
        senderId: m.sender_id || m.senderId,
        receiverId: m.receiver_id || m.receiverId,
        content: m.text || m.content || "",
        senderName:
          (m.sender_id || m.senderId) === authUid
            ? (user?.name || user?.full_name || "Me")
            : "User",
        timestamp: m.created_at?.toDate
          ? m.created_at.toDate().toISOString()
          : m.timestamp?.toDate
          ? m.timestamp.toDate().toISOString()
          : new Date().toISOString(),
        read: m.read,
      }));

      setMessages(mapped);
    });

    return () => unsubscribe && unsubscribe();
  }, [activeConversation?.id, authUid, user]);

  const sendMessage = async (conversationId, text) => {
    if (!authUid || !conversationId || !text?.trim()) return;
    console.log("[MessagingContext] Sending message to conversation:", conversationId);
    await chatService.sendMessage(conversationId, authUid, text.trim());
  };

  return (
    <MessagingContext.Provider
      value={{
        conversations,
        activeConversation,
        setActiveConversation,
        messages,
        sendMessage,

        // ✅ navbar + sidebar
        unreadCount,
        unreadCountByConversation,
        getUnreadCount,
        getUnreadCountByConversation,

        markConversationAsRead,
      }}
    >
      {children}
    </MessagingContext.Provider>
  );
}

export function useMessaging() {
  const context = useContext(MessagingContext);
  if (!context) throw new Error("useMessaging must be used within a MessagingProvider");
  return context;
}
