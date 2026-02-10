import { db } from 'lib/firebase';
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
  getDoc
} from 'firebase/firestore';
import { notificationService } from './notificationService';
import { activityService } from './activityService';
import { proposalService } from './proposalService';
import { chatService } from './chatService';

export const orderService = {
  async createOrder(data) {
    const ordersRef = collection(db, 'orders');

    const orderData = {
      client_id: data.client_id,
      vendor_id: data.vendor_id,
      service_id: data.service_id,
      service_name: data.service_name || data.service_title || 'Service', // Snapshot name
      conversation_id: data.conversation_id || null,
      proposal_id: data.proposal_id || null,
      status: data.status || 'pending', // support overriding status (e.g. pending_payment)
      payment_status: data.payment_status || 'unpaid',
      total_amount: data.total_amount,
      package_name: data.package_name || null,
      delivery_time: data.delivery_time || null,
      revisions: data.revisions || null,
      requirements: data.requirements || '',
      delivery_due_at: data.delivery_due_at || null,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    };

    const docRef = await addDoc(ordersRef, orderData);

    const orderId = docRef.id;

    // NOTIFICATION (New Order for Vendor)
    if (data.vendor_id) {
      await notificationService.createNotification(
        data.vendor_id,
        'new_order',
        'New Order Received',
        'You have a new order – action required',
        { order_id: orderId, link: '/vendor/orders' }
      );
    }

    // SYSTEM MESSAGE (Client Placed Order)
    if (data.vendor_id && data.client_id) {
      try {
        // 1. Get or Create Conversation for this Order
        const conversationId = await chatService.getOrCreateConversationForOrder(
          orderId,
          data.client_id,
          data.vendor_id,
          data.service_id,
          orderData.service_name
        );

        // 2. Send System Message
        if (conversationId) {
          await chatService.sendSystemMessage(
            conversationId,
            'Client placed a new order'
          );
        }
      } catch (error) {
        console.error("Failed to send system message for new order:", error);
      }
    }

    // ACTIVITY (Client Placed Order)
    await activityService.createOrderActivity(
      { id: orderId, ...orderData },
      'new_order',
      'Order Placed',
      'New Order Received',
      `You placed an order for ${orderData.service_name}`,
      `New order received for ${orderData.service_name}`
    );

    return {
      id: orderId,
      ...orderData
    };
  },

  // Real-time subscription for client orders
  subscribeToClientOrders(clientId, callback) {
    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef,
      where('client_id', '==', clientId),
      orderBy('created_at', 'desc')
    );

    let unsubscribe = () => { };

    const setupFallback = () => {
      const fallbackQ = query(ordersRef, where('client_id', '==', clientId));
      unsubscribe = onSnapshot(fallbackQ, (snapshot) => {
        const fallbackOrders = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })).sort((a, b) => (b.created_at?.toMillis() || 0) - (a.created_at?.toMillis() || 0));
        callback(fallbackOrders);
      });
    };

    const initialUnsubscribe = onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(orders);
    }, (error) => {
      console.error("Error subscribing to client orders:", error);
      if (error.code === 'failed-precondition') {
        setupFallback();
      }
    });

    unsubscribe = initialUnsubscribe;
    return () => unsubscribe && unsubscribe();
  },

  // Real-time subscription for vendor orders
  subscribeToVendorOrders(vendorId, callback) {
    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef,
      where('vendor_id', '==', vendorId),
      orderBy('created_at', 'desc')
    );

    let unsubscribe = () => { };

    const setupFallback = () => {
      const fallbackQ = query(ordersRef, where('vendor_id', '==', vendorId));
      unsubscribe = onSnapshot(fallbackQ, (snapshot) => {
        const fallbackOrders = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })).sort((a, b) => (b.created_at?.toMillis() || 0) - (a.created_at?.toMillis() || 0));
        callback(fallbackOrders);
      });
    };

    const initialUnsubscribe = onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(orders);
    }, (error) => {
      console.error("Error subscribing to vendor orders:", error);
      if (error.code === 'failed-precondition') {
        setupFallback();
      }
    });

    unsubscribe = initialUnsubscribe;
    return () => unsubscribe && unsubscribe();
  },

  async updateOrderStatus(orderId, status) {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, {
      status,
      updated_at: serverTimestamp()
    });
  },

  async updateOrder(orderId, data) {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, {
      ...data,
      updated_at: serverTimestamp()
    });
  },

  async deliverOrder(orderId, deliveryDetails) {
    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);
    if (!orderSnap.exists()) throw new Error("Order not found");
    const orderData = orderSnap.data();

    // 1. Save Delivery in Firestore
    const attachments = deliveryDetails.attachments || (deliveryDetails.file_url ? [{
      name: 'Delivered File',
      url: deliveryDetails.file_url,
      type: 'file'
    }] : []);

    await addDoc(collection(db, 'deliveries'), {
      orderId: orderId,
      vendorId: orderData.vendor_id,
      clientId: orderData.client_id,
      conversationId: orderData.conversation_id,
      message: deliveryDetails.message,
      attachments: attachments,
      status: "submitted",
      createdAt: serverTimestamp()
    });

    // 2. Push into Client-Vendor Messages (Chat)
    if (orderData.conversation_id) {
      await addDoc(collection(db, 'conversations', orderData.conversation_id, 'messages'), {
        senderId: orderData.vendor_id,
        senderRole: "vendor",
        type: "work_delivered", // UPDATED: Special card type
        text: deliveryDetails.message,
        attachments: attachments, // UPDATED: Array of files
        orderId: orderId, // UPDATED: Reference to order
        createdAt: serverTimestamp(),
        readBy: { [orderData.vendor_id]: true }
      });

      // Update snippet
      await updateDoc(doc(db, 'conversations', orderData.conversation_id), {
        last_message: "📦 Work Delivered",
        updated_at: serverTimestamp()
      });
    }

    // 3. Create Client Notification
    await notificationService.createNotification(
      orderData.client_id,
      'work_delivered', // Updated to match iconMap
      'Work Delivered',
      'Vendor has delivered the work for your order.',
      {
        order_id: orderId,
        conversation_id: orderData.conversation_id,
        link: `/client/messages/${orderData.conversation_id}?focus=delivery`
      }
    );

    // 4. Update Order Status
    await updateDoc(orderRef, {
      status: 'delivered',
      delivery_details: {
        ...deliveryDetails,
        attachments,
        delivered_at: serverTimestamp()
      },
      updated_at: serverTimestamp()
    });

    // 5. Create Activity Records
    await activityService.createOrderActivity(
      { id: orderId, ...orderData },
      'work_delivered',
      'Delivery Received',
      'Work Delivered',
      `Vendor delivered work for Order #${orderId.slice(-6).toUpperCase()}`,
      `You delivered work for Order #${orderId.slice(-6).toUpperCase()}`,
      { delivery_message: deliveryDetails.message }
    );
  },

  async acceptDelivery(orderId) {
    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);
    if (!orderSnap.exists()) throw new Error("Order not found");
    const orderData = orderSnap.data();

    // 1. Update Order Status
    await updateDoc(orderRef, {
      status: 'awaiting_remaining_payment',
      accepted_at: serverTimestamp(),
      updated_at: serverTimestamp()
    });

    // 2. Create Activity Records
    await activityService.createOrderActivity(
      { id: orderId, ...orderData },
      'delivery_accepted',
      'Delivery Accepted',
      'Delivery Accepted',
      `You accepted delivery for Order #${orderId.slice(-6).toUpperCase()}`,
      `Client accepted delivery for Order #${orderId.slice(-6).toUpperCase()}`
    );
  }
};
