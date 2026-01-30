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

const MessagingContext = createContext(null);

export function MessagingProvider({ children }) {
  const { user } = useAuth();

  // ✅ IMPORTANT: support both uid & id
  const authUid = user?.uid || user?.id;

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);

  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadByConversation, setUnreadByConversation] = useState({}); // ✅ NEW

  const unreadUnsubsRef = useRef([]);

  // helper: load names from profile collections
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

  // ✅ Mark unread messages as read (when open)
  const markConversationAsRead = async (conversationId) => {
    if (!authUid || !conversationId) return;

    const messagesRef = collection(db, "conversations", conversationId, "messages");
    const q = query(
      messagesRef,
      where("receiver_id", "==", authUid),
      where("read", "==", false)
    );

    const snap = await getDocs(q);
    await Promise.all(snap.docs.map((d) => updateDoc(d.ref, { read: true })));
  };

  // Load conversations + enrich names
  useEffect(() => {
    if (!authUid) {
      setConversations([]);
      setActiveConversation(null);
      setMessages([]);
      setUnreadCount(0);
      setUnreadByConversation({}); // ✅ NEW reset
      return;
    }

    const load = async () => {
      try {
        const convs = await chatService.getUserConversations(authUid);

        const enriched = await Promise.all(
          convs.map(async (c) => {
            const clientName =
              !c.client_name || c.client_name === "Client"
                ? c.client_id
                  ? await getClientNameByUid(c.client_id)
                  : "Client"
                : c.client_name;

            const vendorName =
              !c.vendor_name || c.vendor_name === "Vendor"
                ? c.vendor_id
                  ? await getVendorNameByUid(c.vendor_id)
                  : "Vendor"
                : c.vendor_name;

            return {
              ...c,
              client_name: clientName,
              vendor_name: vendorName,
            };
          })
        );

        setConversations(enriched);
      } catch (e) {
        console.error("Error loading conversations:", e);
        setConversations([]);
      }
    };

    load();
  }, [authUid]);

  // ✅ REALTIME unreadCount + unreadByConversation
  useEffect(() => {
    unreadUnsubsRef.current.forEach((fn) => fn && fn());
    unreadUnsubsRef.current = [];
    setUnreadCount(0);
    setUnreadByConversation({}); // ✅ NEW reset

    if (!authUid || conversations.length === 0) return;

    const countsMap = new Map();

    const recompute = () => {
      let total = 0;
      const obj = {};

      countsMap.forEach((v, k) => {
        total += v;
        obj[k] = v;
      });

      setUnreadCount(total);
      setUnreadByConversation(obj); // ✅ NEW
    };

    conversations.forEach((c) => {
      if (!c?.id) return;

      const messagesRef = collection(db, "conversations", c.id, "messages");
      const q = query(
        messagesRef,
        where("receiver_id", "==", authUid),
        where("read", "==", false)
      );

      const unsub = onSnapshot(
        q,
        (snap) => {
          countsMap.set(c.id, snap.size);
          recompute();
        },
        (err) => console.error("Unread listener error:", err)
      );

      unreadUnsubsRef.current.push(unsub);
    });

    return () => {
      unreadUnsubsRef.current.forEach((fn) => fn && fn());
      unreadUnsubsRef.current = [];
    };
  }, [authUid, conversations]);

  // Subscribe messages when activeConversation changes
  useEffect(() => {
    if (!activeConversation?.id) {
      setMessages([]);
      return;
    }

    setMessages([]);

    // ✅ opened => mark as read
    markConversationAsRead(activeConversation.id);

    const unsubscribe = chatService.subscribeToMessages(activeConversation.id, (msgs) => {
      const mapped = msgs.map((m) => ({
        id: m.id,
        senderId: m.sender_id,
        receiverId: m.receiver_id,
        text: m.text,
        createdAt: m.created_at?.toDate ? m.created_at.toDate() : new Date(),
        read: m.read,
      }));
      setMessages(mapped);
    });

    return () => unsubscribe && unsubscribe();
  }, [activeConversation?.id]);

  const sendMessage = async (text) => {
    if (!activeConversation?.id || !authUid || !text.trim()) return;
    await chatService.sendMessage(activeConversation.id, authUid, text.trim());
  };

  return (
    <MessagingContext.Provider
      value={{
        conversations,
        activeConversation,
        setActiveConversation,
        messages,
        sendMessage,
        unreadCount,
        unreadByConversation, // ✅ NEW (Sidebar badge uses this)
        markConversationAsRead,
      }}
    >
      {children}
    </MessagingContext.Provider>
  );
}

export function useMessaging() {
  const ctx = useContext(MessagingContext);
  if (!ctx) throw new Error("useMessaging must be used inside provider");
  return ctx;
}
