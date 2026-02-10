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
import { orderService } from './orderService';
import { paymentService } from './paymentService';
import { chatService } from './chatService';
import { notificationService } from './notificationService';
import { activityService } from './activityService';

export const proposalService = {
    async createProposal(data) {
        const proposalsRef = collection(db, 'proposals');

        const proposalData = {
            vendor_id: data.vendor_id,
            client_id: data.client_id,
            service_id: data.service_id || null,
            service_name: data.service_name || 'Custom Proposal',
            conversation_id: data.conversation_id || null,
            order_id: data.order_id || null,
            title: data.title,
            description: data.description,
            price: data.price,
            delivery_time: data.delivery_time,
            status: 'pending', // pending, accepted, rejected, changes_requested
            created_at: serverTimestamp(),
            updated_at: serverTimestamp(),
        };

        const docRef = await addDoc(proposalsRef, proposalData);
        const proposalId = docRef.id;

        // If this proposal is linked to an existing order (Requirement), update its status
        let orderContext = {};
        if (data.order_id) {
            await orderService.updateOrderStatus(data.order_id, 'proposal_sent');
            orderContext = { order_id: data.order_id };
        }

        // NOTIFICATION (New Proposal for Client)
        if (data.client_id) {
            await notificationService.createNotification(
                data.client_id,
                'proposal_sent',
                'New Proposal Received',
                `Vendor sent a proposal for: ${data.service_name}`,
                {
                    proposal_id: proposalId,
                    ...orderContext,
                    link: `/client/messages/${data.conversation_id}?focus=proposal_${proposalId}`
                }
            );
        }

        // ACTIVITY
        await activityService.createActivity(
            data.vendor_id,
            'proposal_sent',
            'Proposal Sent',
            `You sent a proposal for ${data.service_name}`,
            { proposal_id: proposalId, ...orderContext }
        );

        await activityService.createActivity(
            data.client_id,
            'proposal_sent',
            'New Proposal',
            `You received a proposal for ${data.service_name}`,
            { proposal_id: proposalId, ...orderContext }
        );

        return {
            id: proposalId,
            ...proposalData
        };
    },

    async getProposalById(proposalId) {
        const proposalRef = doc(db, 'proposals', proposalId);
        const proposalSnap = await getDoc(proposalRef);

        if (proposalSnap.exists()) {
            return {
                id: proposalSnap.id,
                ...proposalSnap.data()
            };
        }
        return null;
    },

    subscribeToClientProposals(clientId, callback) {
        const proposalsRef = collection(db, 'proposals');
        const q = query(
            proposalsRef,
            where('client_id', '==', clientId),
            orderBy('created_at', 'desc')
        );

        return onSnapshot(q, (snapshot) => {
            const proposals = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            callback(proposals);
        });
    },

    subscribeToVendorProposals(vendorId, callback) {
        const proposalsRef = collection(db, 'proposals');
        const q = query(
            proposalsRef,
            where('vendor_id', '==', vendorId),
            orderBy('created_at', 'desc')
        );

        return onSnapshot(q, (snapshot) => {
            const proposals = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            callback(proposals);
        });
    },

    async updateProposalStatus(proposalId, status, additionalData = {}) {
        const proposalRef = doc(db, 'proposals', proposalId);
        await updateDoc(proposalRef, {
            status,
            ...additionalData,
            updated_at: serverTimestamp()
        });
    },



    async acceptProposal(proposalId) {
        const proposal = await this.getProposalById(proposalId);
        if (!proposal) throw new Error("Proposal not found");
        if (proposal.status !== 'pending' && proposal.status !== 'changes_requested') throw new Error("Proposal cannot be accepted");

        // 1. Update proposal status
        await this.updateProposalStatus(proposalId, 'accepted');

        // 2. Calculate Payment Amounts (30% advance, 70% remaining)
        const totalAmount = proposal.price;
        const advanceAmount = Math.round(totalAmount * 0.30);
        const remainingAmount = totalAmount - advanceAmount;

        let orderId = proposal.order_id;
        let order;

        // 3. Handle Order Logic
        if (orderId) {
            // Case A: Proposal linked to Existing Order (User Request)
            // Update Existing Order Status with Payment Stage Fields
            await orderService.updateOrder(orderId, {
                status: 'awaiting_payment',
                payment_stage: 'PENDING_ADVANCE',
                total_amount: totalAmount,
                advance_amount: advanceAmount,
                remaining_amount: remainingAmount,
                paid_advance: false,
                paid_remaining: false,
                delivery_time: proposal.delivery_time,
                proposal_id: proposalId,
                updated_at: serverTimestamp()
            });
            order = { id: orderId };

        } else {
            // Case B: Direct Proposal (No prior request found)
            // Create New Order with Payment Stage Fields
            const orderData = {
                client_id: proposal.client_id,
                vendor_id: proposal.vendor_id,
                service_id: proposal.service_id,
                service_name: proposal.service_name,
                total_amount: totalAmount,
                advance_amount: advanceAmount,
                remaining_amount: remainingAmount,
                paid_advance: false,
                paid_remaining: false,
                payment_stage: 'PENDING_ADVANCE',
                delivery_time: proposal.delivery_time,
                proposal_id: proposalId,
                status: 'awaiting_payment'
            };
            order = await orderService.createOrder(orderData);
            orderId = order.id;
        }

        // 4. Create ADVANCE Payment Record (30%)
        await paymentService.createPayment({
            order_id: orderId,
            proposal_id: proposalId,
            client_id: proposal.client_id,
            vendor_id: proposal.vendor_id,
            service_id: proposal.service_id,
            amount: advanceAmount,
            stage: 'advance',
            status: 'pending'
        });

        // 5. Send System Message to Vendor
        if (proposal.conversation_id) {
            await chatService.sendSystemMessage(
                proposal.conversation_id,
                `✅ Client accepted the proposal. Payment required to start the order.`
            );
        }

        // 6. Create Vendor Notification
        await notificationService.createNotification(
            proposal.vendor_id,
            'proposal_accepted',
            'Proposal Accepted',
            `Your proposal for "${proposal.service_name}" has been accepted by the client.`,
            {
                proposal_id: proposalId,
                order_id: orderId,
                conversation_id: proposal.conversation_id,
                link: `/vendor/messages/${proposal.conversation_id}?focus=proposal_${proposalId}`
            }
        );

        // 7. ACTIVITY
        await activityService.createActivity(
            proposal.vendor_id,
            'proposal_accepted',
            'Proposal Accepted',
            `Client accepted your proposal for ${proposal.service_name}`,
            { proposal_id: proposalId, order_id: orderId }
        );

        await activityService.createActivity(
            proposal.client_id,
            'proposal_accepted',
            'Proposal Accepted',
            `You accepted the proposal for ${proposal.service_name}`,
            { proposal_id: proposalId, order_id: orderId }
        );

        return { id: orderId };
    },

    async rejectProposal(proposalId) {
        const proposal = await this.getProposalById(proposalId);
        if (!proposal) throw new Error("Proposal not found");

        // 1. Update proposal status
        await this.updateProposalStatus(proposalId, 'rejected');

        // 2. Send System Message to Vendor
        if (proposal.conversation_id) {
            await chatService.sendSystemMessage(
                proposal.conversation_id,
                `❌ Client rejected the proposal.`
            );
        }

        // 3. Create Vendor Notification
        await notificationService.createNotification(
            proposal.vendor_id,
            'proposal_rejected',
            'Proposal Rejected',
            `Your proposal for "${proposal.service_name}" was rejected by the client.`,
            {
                proposal_id: proposalId,
                conversation_id: proposal.conversation_id,
                link: `/vendor/messages/${proposal.conversation_id}?focus=proposal_${proposalId}`
            }
        );

        // 4. ACTIVITY
        await activityService.createActivity(
            proposal.vendor_id,
            'proposal_rejected',
            'Proposal Rejected',
            `Client rejected your proposal for ${proposal.service_name}`,
            { proposal_id: proposalId }
        );

        await activityService.createActivity(
            proposal.client_id,
            'proposal_rejected',
            'Proposal Rejected',
            `You rejected the proposal for ${proposal.service_name}`,
            { proposal_id: proposalId }
        );
    },

    async requestProposalChanges(proposalId, clientFeedback = '') {
        const proposal = await this.getProposalById(proposalId);
        if (!proposal) throw new Error("Proposal not found");

        // 1. Update proposal status with feedback
        await this.updateProposalStatus(proposalId, 'changes_requested', {
            client_feedback: clientFeedback
        });

        // 2. Send System Message to Vendor
        if (proposal.conversation_id) {
            const feedbackText = clientFeedback ? `: ${clientFeedback}` : '.';
            await chatService.sendSystemMessage(
                proposal.conversation_id,
                `📝 Client requested changes to the proposal${feedbackText}`
            );
        }

        // 3. Create Vendor Notification
        await notificationService.createNotification(
            proposal.vendor_id,
            'proposal_changes_requested',
            'Changes Requested',
            `Client requested changes to your proposal for "${proposal.service_name}".`,
            {
                proposal_id: proposalId,
                conversation_id: proposal.conversation_id,
                client_feedback: clientFeedback,
                link: `/vendor/messages/${proposal.conversation_id}?focus=proposal_${proposalId}`
            }
        );

        // 4. ACTIVITY
        await activityService.createActivity(
            proposal.vendor_id,
            'proposal_changes',
            'Changes Requested',
            `Client requested changes for ${proposal.service_name}`,
            { proposal_id: proposalId }
        );

        await activityService.createActivity(
            proposal.client_id,
            'proposal_changes',
            'Changes Requested',
            `You requested changes for ${proposal.service_name}`,
            { proposal_id: proposalId }
        );
    }
};
