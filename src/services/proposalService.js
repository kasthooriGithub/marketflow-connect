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

export const proposalService = {
    async createProposal(data) {
        const proposalsRef = collection(db, 'proposals');

        const proposalData = {
            vendor_id: data.vendor_id,
            client_id: data.client_id,
            service_id: data.service_id || null,
            service_name: data.service_name || 'Custom Proposal',
            title: data.title,
            description: data.description,
            price: data.price,
            delivery_time: data.delivery_time,
            status: 'pending', // pending, accepted, rejected, changes_requested
            created_at: serverTimestamp(),
            updated_at: serverTimestamp(),
        };

        const docRef = await addDoc(proposalsRef, proposalData);

        return {
            id: docRef.id,
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
    }
};
