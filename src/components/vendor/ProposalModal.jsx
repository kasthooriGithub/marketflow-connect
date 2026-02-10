import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from 'components/ui/dialog';
import { Button } from 'components/ui/button';
import { Input } from 'components/ui/input';
import { Textarea } from 'components/ui/textarea';
import { Form } from 'react-bootstrap';
import { proposalService } from 'services/proposalService';
import { chatService } from 'services/chatService';
import { useMessaging } from 'contexts/MessagingContext';
import { db } from 'lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { toast } from 'sonner';

export function ProposalModal({ open, onOpenChange, client, vendor, service, conversationId: explicitConversationId }) {
    const { activeConversation } = useMessaging();
    const targetConversation = activeConversation || {};

    const [loading, setLoading] = useState(false);
    const [serviceName, setServiceName] = useState(service?.name || targetConversation.service_name || 'Loading service...');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        delivery_time: '',
    });

    // Prefill Service Name and Data logic
    React.useEffect(() => {
        const fetchServiceData = async () => {
            if (open) {
                // Determine service ID
                const sId = service?.id || targetConversation.service_id;
                const sName = service?.name || targetConversation.service_name;

                if (sName && sName !== 'Service') {
                    setServiceName(sName);
                } else if (sId) {
                    try {
                        const sSnap = await getDoc(doc(db, 'services', sId));
                        if (sSnap.exists()) {
                            const data = sSnap.data();
                            setServiceName(data.title || data.service_name || 'Custom Service');

                            // Auto-fill form data from service if available
                            setFormData(prev => ({
                                ...prev,
                                title: prev.title || data.title || '',
                                price: prev.price || data.price || '',
                                delivery_time: prev.delivery_time || data.delivery_time || '',
                            }));
                        } else {
                            setServiceName('Custom Service');
                        }
                    } catch (err) {
                        console.error("Error fetching service data:", err);
                        setServiceName('Custom Service');
                    }
                } else {
                    setServiceName('Custom Service');
                }

                // If we have an active conversation, try to fill order_id
                if (targetConversation.order_id) {
                    console.log("Linking to order:", targetConversation.order_id);
                }
            }
        };

        fetchServiceData();
    }, [open, service, targetConversation]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!client || !vendor) return;

        setLoading(true);
        try {
            // Determine the order ID (either passed explicitly or from active conversation)
            const linkedOrderId = explicitConversationId ? null : targetConversation.order_id;

            const proposal = await proposalService.createProposal({
                vendor_id: vendor.uid,
                client_id: client.uid,
                service_id: service?.id || targetConversation.service_id || null,
                service_name: serviceName,
                conversation_id: explicitConversationId || targetConversation.id || null,
                order_id: linkedOrderId || null,
                ...formData,
                price: parseFloat(formData.price),
            });

            // If we are responding to an existing order, update its status
            if (linkedOrderId) {
                // You might want to import orderService here or handle it in proposalService.createProposal
                // For now, let's assume proposalService handles the status update if order_id is present
                // or we can do it here if we import orderService.
                // BETTER: Let proposalService.createProposal handle the side effect on the order.
            }

            // ✅ Automatically send a message to the chat
            try {
                let targetConversationId = explicitConversationId || targetConversation.id;

                if (!targetConversationId) {
                    targetConversationId = await chatService.getOrCreateConversation(
                        client.uid,
                        vendor.uid,
                        service?.id || 'custom',
                        service?.name || 'Custom Service'
                    );
                }

                if (targetConversationId) {
                    await chatService.sendMessage(
                        targetConversationId,
                        vendor.uid,
                        `Proposal sent: ${formData.title} - $${formData.price} (Delivery: ${formData.delivery_time}) • Proposal ID: ${proposal.id}`,
                        {
                            proposal_id: proposal.id,
                            type: 'proposal'
                        }
                    );
                }
            } catch (chatError) {
                console.error("Error sending proposal message:", chatError);
            }

            onOpenChange(false);
            setFormData({
                title: '',
                description: '',
                price: '',
                delivery_time: '',
            });
            toast.success("Proposal sent successfully!");
        } catch (error) {
            console.error("Error creating proposal:", error);
            toast.error("Failed to send proposal");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogHeader>
                <DialogTitle>Send Proposal to {client?.name || targetConversation.client_name}</DialogTitle>
            </DialogHeader>
            <DialogContent>
                <Form onSubmit={handleSubmit} className="p-3">
                    <div className="mb-4 p-3 bg-light rounded-3 border">
                        <div className="small text-muted text-uppercase fw-bold mb-1">Service Context</div>
                        <div className="h6 mb-0 fw-bold text-primary">{serviceName}</div>
                    </div>

                    <Form.Group className="mb-3">
                        <Form.Label>Proposal Title</Form.Label>
                        <Input
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="e.g., Website Redesign Project"
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Description / Custom Notes</Form.Label>
                        <Textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Add any custom notes or specific details for this proposal..."
                            rows={4}
                            required
                        />
                    </Form.Group>
                    <div className="row">
                        <div className="col-md-6">
                            <Form.Group className="mb-3">
                                <Form.Label>Price ($)</Form.Label>
                                <Input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    required
                                />
                            </Form.Group>
                        </div>
                        <div className="col-md-6">
                            <Form.Group className="mb-3">
                                <Form.Label>Delivery Time</Form.Label>
                                <Input
                                    name="delivery_time"
                                    value={formData.delivery_time}
                                    onChange={handleChange}
                                    placeholder="e.g., 5 days"
                                    required
                                />
                            </Form.Group>
                        </div>
                    </div>
                </Form>
            </DialogContent>
            <DialogFooter>
                <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={loading}>
                    {loading ? 'Sending...' : 'Send Proposal'}
                </Button>
            </DialogFooter>
        </Dialog>
    );
}
