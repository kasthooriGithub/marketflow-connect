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

export function ProposalModal({ open, onOpenChange, client, vendor, service, conversationId: explicitConversationId }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        delivery_time: '',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!client || !vendor) return;

        setLoading(true);
        try {
            const proposal = await proposalService.createProposal({
                vendor_id: vendor.uid,
                client_id: client.uid,
                service_id: service?.id || null,
                service_name: service?.name || service?.title || 'Custom Proposal',
                ...formData,
                price: parseFloat(formData.price),
            });

            // ✅ Automatically send a message to the chat
            try {
                // Use provided conversationId or look it up
                let targetConversationId = explicitConversationId;

                if (!targetConversationId) {
                    targetConversationId = await chatService.getOrCreateConversation(
                        client.uid,
                        vendor.uid,
                        service?.id || 'custom',
                        service?.name || 'Custom Service'
                    );
                }

                if (targetConversationId) {
                    // Send a system message
                    await chatService.sendMessage(
                        targetConversationId,
                        vendor.uid,
                        `📋 I've sent you a proposal: "${formData.title}" for $${formData.price}. Please check your Pending Proposals.`
                    );
                }
            } catch (chatError) {
                console.error("Error sending proposal message:", chatError);
                // Don't block the UI if chat message fails, proposal is already created
            }

            onOpenChange(false);
            // Reset form
            setFormData({
                title: '',
                description: '',
                price: '',
                delivery_time: '',
            });
        } catch (error) {
            console.error("Error creating proposal:", error);
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
                <DialogTitle>Send Proposal to {client?.name}</DialogTitle>
            </DialogHeader>
            <DialogContent>
                <Form onSubmit={handleSubmit} className="p-3">
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
                        <Form.Label>Description</Form.Label>
                        <Textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Describe what you will provide..."
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
