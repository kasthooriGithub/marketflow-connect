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
import { notificationService } from './notificationService';

const getClientName = async (clientUid) => {
  const snap = await getDoc(doc(db, "clients", clientUid));
  return snap.exists() ? snap.data().display_name || "Client" : "Client";
};

const getVendorName = async (vendorUid) => {
  const snap = await getDoc(doc(db, "vendors", vendorUid));
  return snap.exists() ? snap.data().agency_name || "Vendor" : "Vendor";
};

export const chatService = {
  async getOrCreateConversation(clientId, vendorId, serviceId, serviceName, orderId = null) {
    const conversationsRef = collection(db, "conversations");

    // Try finding by order_id first if provided (Primary Rule)
    if (orderId) {
      const qOrder = query(conversationsRef, where("order_id", "==", orderId));
      const snapOrder = await getDocs(qOrder);
      if (!snapOrder.empty) return snapOrder.docs[0].id;
    }

    // Fallback: If no orderId or not found by orderId, find by IDs (secondary safety)
    const qIds = query(
      conversationsRef,
      where("client_id", "==", clientId),
      where("vendor_id", "==", vendorId),
      where("service_id", "==", serviceId)
    );

    const snapshot = await getDocs(qIds);
    if (!snapshot.empty) return snapshot.docs[0].id;

    // ✅ Create new conversation if not exists
    const [clientName, vendorName] = await Promise.all([
      getClientName(clientId),
      getVendorName(vendorId),
    ]);

    const newConvData = {
      order_id: orderId, // Link to order (MANDATORY if provided)
      client_id: clientId,
      vendor_id: vendorId,
      client_name: clientName,
      vendor_name: vendorName,
      service_id: serviceId,
      service_name: serviceName || "Service",
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
      last_message: "", // Requirement: empty string
      last_message_at: serverTimestamp(), // Requirement: current time
      lastMessage: null, // Legacy compatibility
    };

    const docRef = await addDoc(conversationsRef, newConvData);
    return docRef.id;
  },

  async getOrCreateConversationForOrder(orderId, clientId, vendorId, serviceId, serviceName) {
    if (!orderId) throw new Error("orderId is required");

    // 1. Read fresh from Firestore
    const orderRef = doc(db, "orders", orderId);
    const orderSnap = await getDoc(orderRef);

    if (!orderSnap.exists()) throw new Error("Order not found");
    const orderData = orderSnap.data();

    // 2. If conversation_id exists → return it
    if (orderData.conversation_id) {
      return orderData.conversation_id;
    }

    // 3. Else query conversations where order_id == orderId
    const conversationsRef = collection(db, "conversations");
    const q = query(conversationsRef, where("order_id", "==", orderId));
    const querySnap = await getDocs(q);

    let conversationId;

    if (!querySnap.empty) {
      conversationId = querySnap.docs[0].id;
    } else {
      // 4. If not exists → create conversation doc
      const [clientName, vendorName] = await Promise.all([
        getClientName(clientId),
        getVendorName(vendorId),
      ]);

      const newConvData = {
        order_id: orderId,
        client_id: clientId,
        vendor_id: vendorId,
        client_name: clientName,
        vendor_name: vendorName,
        service_id: serviceId,
        service_name: serviceName || orderData.service_name || "Service",
        created_at: serverTimestamp(),
        last_message: "",
        last_message_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      };

      const docRef = await addDoc(conversationsRef, newConvData);
      conversationId = docRef.id;
    }

    // 5. Update orders/{orderId} with the new conversation_id
    await updateDoc(orderRef, { conversation_id: conversationId });

    return conversationId;
  },

  // ✅ Messages subcollection uses sender_id/receiver_id/text/created_at/read
  async sendMessage(conversationId, senderId, content, metadata = {}) {
    const text = (content || "").trim();
    if (!conversationId || !senderId || !text) return;

    const messagesRef = collection(db, "conversations", conversationId, "messages");
    const conversationRef = doc(db, "conversations", conversationId);

    const convSnap = await getDoc(conversationRef);
    if (!convSnap.exists()) throw new Error("Conversation not found");

    const conv = convSnap.data();
    const receiverId = senderId === conv.client_id ? conv.vendor_id : conv.client_id;

    const docRef = await addDoc(messagesRef, {
      sender_id: senderId,
      receiver_id: receiverId,
      text,
      created_at: serverTimestamp(),
      read: false,
      ...metadata
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

    // Create Notification for Receiver
    try {
      await notificationService.createNotification(
        receiverId,
        'message',
        'New Message',
        `You have a new message from ${senderId === conv.client_id ? conv.client_name : conv.vendor_name}`,
        {
          conversation_id: conversationId,
          message_id: docRef.id, // Added message ID
          link: senderId === conv.client_id ? `/vendor/messages/${conversationId}?focus=msg_${docRef.id}` : `/client/messages/${conversationId}?focus=msg_${docRef.id}`
        }
      );
    } catch (error) {
      console.error("Failed to send message notification:", error);
    }
  },

  /**
   * Send system message to conversation
   */
  async sendSystemMessage(conversationId, message) {
    if (!conversationId) return;

    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    await addDoc(messagesRef, {
      text: message,
      type: 'system',
      sender_role: 'system',
      created_at: serverTimestamp(),
      read: false
    });

    // Update conversation last message
    const conversationRef = doc(db, 'conversations', conversationId);
    await updateDoc(conversationRef, {
      last_message: message,
      last_message_at: serverTimestamp(),
      updated_at: serverTimestamp()
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
