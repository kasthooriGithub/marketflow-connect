import { db } from "lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  serverTimestamp,
  orderBy,
  onSnapshot,
  getDoc,
} from "firebase/firestore";

const getClientName = async (clientUid) => {
  const snap = await getDoc(doc(db, "clients", clientUid));
  return snap.exists() ? snap.data().display_name || "Client" : "Client";
};

const getVendorName = async (vendorUid) => {
  const snap = await getDoc(doc(db, "vendors", vendorUid));
  return snap.exists() ? snap.data().agency_name || "Vendor" : "Vendor";
};

export const chatService = {
  async getOrCreateConversation(clientId, vendorId, serviceId, serviceName) {
    const conversationsRef = collection(db, "conversations");

    const q = query(
      conversationsRef,
      where("client_id", "==", clientId),
      where("vendor_id", "==", vendorId),
      where("service_id", "==", serviceId)
    );

    const snapshot = await getDocs(q);
    if (!snapshot.empty) return snapshot.docs[0].id;

    // ✅ fetch names from profile collections
    const [clientName, vendorName] = await Promise.all([
      getClientName(clientId),
      getVendorName(vendorId),
    ]);

    const newConvData = {
      client_id: clientId,
      vendor_id: vendorId,
      client_name: clientName,
      vendor_name: vendorName,
      service_id: serviceId,
      service_name: serviceName,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
      lastMessage: null,
      last_message_at: null,
      last_message: null,
    };

    const docRef = await addDoc(conversationsRef, newConvData);
    return docRef.id;
  },

  // ✅ Messages subcollection uses sender_id/receiver_id/text/created_at/read
  async sendMessage(conversationId, senderId, content) {
    const text = (content || "").trim();
    if (!conversationId || !senderId || !text) return;

    const messagesRef = collection(db, "conversations", conversationId, "messages");
    const conversationRef = doc(db, "conversations", conversationId);

    // ✅ Get conversation to decide receiver_id
    const convSnap = await getDoc(conversationRef);
    if (!convSnap.exists()) throw new Error("Conversation not found");

    const conv = convSnap.data();

    // ✅ Determine receiver (other person in conversation)
    const receiverId = senderId === conv.client_id ? conv.vendor_id : conv.client_id;

    await addDoc(messagesRef, {
      sender_id: senderId,
      receiver_id: receiverId, // ✅ NEW (important for easy unread query)
      text,
      created_at: serverTimestamp(),
      read: false,
    });

    await updateDoc(conversationRef, {
      last_message: text,
      last_message_at: serverTimestamp(),
      updated_at: serverTimestamp(),
      lastMessage: {
        content: text,
        senderId: senderId,
        timestamp: serverTimestamp(),
      },
    });
  },

  subscribeToMessages(conversationId, callback) {
    const messagesRef = collection(db, "conversations", conversationId, "messages");
    const q = query(messagesRef, orderBy("created_at", "asc"));
    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(messages);
    });
  },

  async getUserConversations(userId) {
    const conversationsRef = collection(db, "conversations");

    const qClient = query(conversationsRef, where("client_id", "==", userId));
    const qVendor = query(conversationsRef, where("vendor_id", "==", userId));

    const [clientSnap, vendorSnap] = await Promise.all([
      getDocs(qClient),
      getDocs(qVendor),
    ]);

    const allConvs = [...clientSnap.docs, ...vendorSnap.docs].map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    return allConvs.sort(
      (a, b) => (b.updated_at?.toMillis?.() || 0) - (a.updated_at?.toMillis?.() || 0)
    );
  },
};
