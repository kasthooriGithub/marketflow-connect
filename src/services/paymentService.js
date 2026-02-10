import { db } from 'lib/firebase';
import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    doc,
    updateDoc,
    setDoc,
    serverTimestamp,
    orderBy,
    getDoc,
    writeBatch
} from 'firebase/firestore';
import { notificationService } from './notificationService';
import { activityService } from './activityService';
import { proposalService } from './proposalService';

export const paymentService = {
    async createPayment(data) {
        if (!data.order_id) {
            throw new Error("Missing order_id for payment");
        }

        // Use auto-generated ID to support multiple payments per order
        const paymentRef = doc(collection(db, 'payments'));

        const paymentData = {
            order_id: data.order_id,
            proposal_id: data.proposal_id || null,
            client_id: data.client_id,
            vendor_id: data.vendor_id,
            service_id: data.service_id,
            amount: data.amount,
            stage: data.stage || 'full', // 'advance' | 'remaining' | 'full'
            currency: data.currency || 'USD',
            payment_method: data.payment_method || 'card',
            status: data.status || 'pending',
            created_at: serverTimestamp(),
            updated_at: serverTimestamp(),
            paid_at: null
        };

        try {
            await setDoc(paymentRef, paymentData);

            // NOTIFICATION: Payment Pending (Vendor)
            try {
                await notificationService.createNotification(
                    data.vendor_id,
                    'payment_pending',
                    'Payment Initiated',
                    `Client has initiated a ${data.stage} payment of $${data.amount}. Status: Pending.`,
                    { order_id: data.order_id, payment_id: paymentRef.id, link: '/vendor/orders' }
                );
            } catch (e) {
                console.error("Failed to send pending notification:", e);
            }

            return { id: paymentRef.id, ...paymentData };
        } catch (error) {
            console.error("[Payment Service] CRITICAL ERROR creating payment:", error);
            throw error;
        }
    },

    async getPaymentByOrderId(orderId, stage = null) {
        const paymentsRef = collection(db, 'payments');
        let q = query(paymentsRef, where('order_id', '==', orderId));

        if (stage) {
            q = query(paymentsRef, where('order_id', '==', orderId), where('stage', '==', stage));
        }

        const snap = await getDocs(q);

        if (!snap.empty) {
            return { id: snap.docs[0].id, ...snap.docs[0].data() };
        }
        return null;
    },

    async updatePaymentStatus(paymentId, status, paymentMethod = null, metadata = {}) {
        const paymentRef = doc(db, 'payments', paymentId);
        const updateData = {
            status,
            updated_at: serverTimestamp(),
            ...metadata
        };

        if (status === 'paid') {
            updateData.paid_at = serverTimestamp();
        }

        if (paymentMethod) {
            updateData.payment_method = paymentMethod;
        }

        await updateDoc(paymentRef, updateData);
    },

    async getClientPayments(clientId) {
        try {
            const paymentsRef = collection(db, 'payments');
            const q = query(
                paymentsRef,
                where('client_id', '==', clientId),
                orderBy('created_at', 'desc')
            );
            const snap = await getDocs(q);
            return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Error fetching payments with order:", error);
            if (error.code === 'failed-precondition') {
                console.warn("Index missing for payments. Performing local sort fallback.");
                const paymentsRef = collection(db, 'payments');
                const q = query(paymentsRef, where('client_id', '==', clientId));
                const snap = await getDocs(q);
                return snap.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .sort((a, b) => (b.created_at?.toMillis?.() || 0) - (a.created_at?.toMillis?.() || 0));
            }
            throw error;
        }
    },

    // Atomic Payment Processing with Stage Support
    async processSuccessfulPayment(orderData, paymentId, paymentMetadata, paymentStage = 'full') {
        if (!orderData || !paymentId) {
            throw new Error("Missing data for payment processing");
        }

        const batch = writeBatch(db);
        const COMMISSION_RATE = 0.20; // 20% to Admin

        // 1. Update Payment Record
        const paymentRef = doc(db, 'payments', paymentId);
        const paymentUpdate = {
            status: 'paid',
            updated_at: serverTimestamp(),
            paid_at: serverTimestamp(),
            ...paymentMetadata
        };
        batch.update(paymentRef, paymentUpdate);

        // 2. Calculate Earnings for THIS Payment Stage
        const amount = paymentStage === 'advance'
            ? parseFloat(orderData.advance_amount)
            : paymentStage === 'remaining'
                ? parseFloat(orderData.remaining_amount)
                : parseFloat(orderData.total_amount);

        const adminShare = amount * COMMISSION_RATE;
        const vendorShare = amount - adminShare;

        const earningRef = doc(collection(db, 'earnings'));
        const earningData = {
            order_id: orderData.id,
            payment_id: paymentId,
            payment_stage: paymentStage,
            vendor_id: orderData.vendor_id,
            client_id: orderData.client_id,
            total_amount: amount,
            currency: 'USD',
            commission_rate: COMMISSION_RATE * 100,
            admin_share: Number(adminShare.toFixed(2)),
            vendor_share: Number(vendorShare.toFixed(2)),
            status: 'available',
            created_at: serverTimestamp(),
            calculated_at: new Date().toISOString()
        };
        batch.set(earningRef, earningData);

        // 3. Update Order Based on Payment Stage
        const orderRef = doc(db, 'orders', orderData.id);
        let orderUpdate = {
            updated_at: serverTimestamp()
        };

        if (paymentStage === 'advance') {
            orderUpdate = {
                ...orderUpdate,
                paid_advance: true,
                advance_paid_at: serverTimestamp(),
                payment_stage: 'IN_PROGRESS',
                payment_status: 'advance_paid',
                status: 'in_progress'
            };
        } else if (paymentStage === 'remaining') {
            orderUpdate = {
                ...orderUpdate,
                paid_remaining: true,
                remaining_paid_at: serverTimestamp(),
                payment_stage: 'PAID_FULL',
                payment_status: 'paid',
                status: 'completed',
                commission_calculated: true
            };
        } else {
            // Legacy full payment support
            orderUpdate = {
                ...orderUpdate,
                commission_calculated: true,
                payment_status: 'paid',
                status: 'in_progress',
                paid_at: serverTimestamp()
            };
        }

        batch.update(orderRef, orderUpdate);

        // Commit Batch
        try {
            await batch.commit();

            // 5. Send System Messages & Notifications Based on Stage
            try {
                if (paymentStage === 'advance') {
                    // Get conversation_id from order
                    const orderSnap = await getDoc(orderRef);
                    const updatedOrder = orderSnap.data();

                    // Send system message to vendor
                    if (updatedOrder.conversation_id) {
                        await proposalService.sendSystemMessage(
                            updatedOrder.conversation_id,
                            `💰 Advance payment received (30%). Vendor can start work.`
                        );
                    }

                    // Create vendor notification
                    await notificationService.createNotification(
                        orderData.vendor_id,
                        'advance_paid',
                        'Advance Payment Received',
                        `Client paid 30% advance for Order #${orderData.id.slice(-6).toUpperCase()}`,
                        {
                            order_id: orderData.id,
                            payment_id: paymentId,
                            conversation_id: updatedOrder.conversation_id,
                            amount: orderData.advance_amount,
                            link: '/vendor/orders'
                        }
                    );

                    // Create activity records
                    await activityService.createOrderActivity(
                        orderData,
                        'advance_paid',
                        'Advance Payment Sent',
                        'Advance Payment Received',
                        `You paid 30% advance for Order #${orderData.id.slice(-6).toUpperCase()}`,
                        `Client paid 30% advance for Order #${orderData.id.slice(-6).toUpperCase()}`,
                        { amount: orderData.advance_amount }
                    );

                } else if (paymentStage === 'remaining') {
                    // Get conversation_id from order
                    const orderSnap = await getDoc(orderRef);
                    const updatedOrder = orderSnap.data();

                    // Send system message to vendor
                    if (updatedOrder.conversation_id) {
                        await proposalService.sendSystemMessage(
                            updatedOrder.conversation_id,
                            `✅ Remaining payment received. Order completed.`
                        );
                    }

                    // Create vendor notification
                    await notificationService.createNotification(
                        orderData.vendor_id,
                        'remaining_paid',
                        'Final Payment Received',
                        `Client paid remaining 70% for Order #${orderData.id.slice(-6).toUpperCase()}`,
                        {
                            order_id: orderData.id,
                            payment_id: paymentId,
                            conversation_id: updatedOrder.conversation_id,
                            amount: orderData.remaining_amount,
                            link: '/vendor/orders'
                        }
                    );

                    // Create activity records
                    await activityService.createOrderActivity(
                        orderData,
                        'order_completed',
                        'Order Completed',
                        'Order Completed',
                        `Order #${orderData.id.slice(-6).toUpperCase()} completed successfully`,
                        `Order #${orderData.id.slice(-6).toUpperCase()} completed successfully`,
                        { amount: orderData.remaining_amount }
                    );
                }
            } catch (notifyError) {
                console.error("Non-critical error sending notifications:", notifyError);
            }

            // NOTIFICATION: Payment Success (Client Confirmation)
            try {
                await notificationService.createNotification(
                    orderData.client_id,
                    'payment_received',
                    'Payment Successful',
                    `Your ${paymentStage} payment of $${amount} was successful.`,
                    { order_id: orderData.id, link: `/client/payment/${orderData.id}` }
                );
            } catch (e) {
                console.error("Failed to send client success notification:", e);
            }

            console.log(`Payment processed successfully for stage: ${paymentStage}`);
            return true;
        } catch (error) {
            console.error("Batch Commit Failed:", error);
            throw error;
        }
    },

    // Legacy Commission Logic (Kept for reference, but processSuccessfulPayment is preferred)
    async processCommission(orderData, paymentId) {
        if (!orderData || !paymentId) {
            console.error("Missing data for commission calculation");
            return;
        }

        // Idempotency Check: Don't calculate if already done
        if (orderData.commission_calculated) {
            console.warn("Commission already calculated for order:", orderData.id);
            return;
        }

        const COMMISSION_RATE = 0.20; // 20% to Admin
        const totalAmount = parseFloat(orderData.total_amount);

        if (isNaN(totalAmount)) {
            console.error("Invalid amount for commission:", orderData.total_amount);
            return;
        }

        const adminShare = totalAmount * COMMISSION_RATE;
        const vendorShare = totalAmount - adminShare;

        const earningData = {
            order_id: orderData.id,
            payment_id: paymentId,
            vendor_id: orderData.vendor_id,
            client_id: orderData.client_id,
            total_amount: totalAmount,
            currency: 'USD',
            commission_rate: COMMISSION_RATE * 100, // 20%
            admin_share: Number(adminShare.toFixed(2)),
            vendor_share: Number(vendorShare.toFixed(2)),
            status: 'available', // Ready for withdrawal
            created_at: serverTimestamp(),
            calculated_at: new Date().toISOString()
        };

        try {
            // 1. Create Earnings Record
            await addDoc(collection(db, 'earnings'), earningData);

            // 2. Mark Order as Commission Calculated
            const orderRef = doc(db, 'orders', orderData.id);
            await updateDoc(orderRef, {
                commission_calculated: true,
                payment_status: 'paid', // Ensure paid status is set
                status: 'completed'   // Ensure status is updated
            });

            console.log("Commission calculated successfully:", earningData);
            return earningData;
        } catch (error) {
            console.error("Failed to process commission:", error);
            // Don't throw to prevent blocking the UI success state, but log criticality
        }
    },

    // Create Remaining Payment (70%) after delivery
    async createRemainingPayment(orderId) {
        const orderRef = doc(db, 'orders', orderId);
        const orderSnap = await getDoc(orderRef);

        if (!orderSnap.exists()) {
            throw new Error("Order not found");
        }

        const order = { id: orderSnap.id, ...orderSnap.data() };

        // Validation
        if (!order.paid_advance) {
            throw new Error("Advance payment not completed");
        }
        if (order.paid_remaining) {
            throw new Error("Remaining payment already completed");
        }
        if (order.status !== 'delivered') {
            throw new Error("Order must be delivered before remaining payment");
        }

        // Create remaining payment record
        return await this.createPayment({
            order_id: orderId,
            proposal_id: order.proposal_id,
            amount: order.remaining_amount,
            stage: 'remaining',
            client_id: order.client_id,
            vendor_id: order.vendor_id,
            service_id: order.service_id,
            status: 'pending'
        });
    },

    async getEarnings(filter = 'all') {
        const earningsRef = collection(db, 'earnings');
        let q = query(earningsRef, orderBy('created_at', 'desc'));

        if (filter !== 'all') {
            q = query(earningsRef, where('status', '==', filter), orderBy('created_at', 'desc'));
        }

        const snap = await getDocs(q);
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
};
