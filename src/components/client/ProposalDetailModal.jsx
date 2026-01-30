import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from 'components/ui/dialog';
import { Button } from 'components/ui/button';
import { Badge } from 'components/ui/badge';
import { proposalService } from 'services/proposalService';
import { orderService } from 'services/orderService';

export function ProposalDetailModal({ open, onOpenChange, proposal, onActionComplete }) {
    const [loading, setLoading] = useState(false);

    if (!proposal) return null;

    const handleAccept = async () => {
        setLoading(true);
        try {
            // 1. Update proposal status
            await proposalService.updateProposalStatus(proposal.id, 'accepted');

            // 2. Create order with proper links
            await orderService.createOrder({
                client_id: proposal.client_id,
                vendor_id: proposal.vendor_id,
                service_id: proposal.service_id,
                service_name: proposal.service_name,
                proposal_id: proposal.id,
                total_amount: proposal.price,
                requirements: proposal.description,
            });

            if (onActionComplete) onActionComplete('accepted');
            onOpenChange(false);
        } catch (error) {
            console.error("Error accepting proposal:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRequestChanges = async () => {
        // In a real app, we might ask for a message here
        const feedback = prompt("What changes would you like to request?");
        if (feedback === null) return;

        setLoading(true);
        try {
            await proposalService.updateProposalStatus(proposal.id, 'changes_requested', {
                client_feedback: feedback
            });
            if (onActionComplete) onActionComplete('changes_requested');
            onOpenChange(false);
        } catch (error) {
            console.error("Error requesting changes:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async () => {
        if (!window.confirm("Are you sure you want to reject this proposal?")) return;

        setLoading(true);
        try {
            await proposalService.updateProposalStatus(proposal.id, 'rejected');
            if (onActionComplete) onActionComplete('rejected');
            onOpenChange(false);
        } catch (error) {
            console.error("Error rejecting proposal:", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusVariant = (status) => {
        switch (status) {
            case 'pending': return 'warning';
            case 'accepted': return 'success';
            case 'rejected': return 'destructive';
            case 'changes_requested': return 'secondary';
            default: return 'outline';
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogHeader>
                <div className="d-flex justify-content-between align-items-center w-100 pe-4">
                    <DialogTitle>{proposal.title}</DialogTitle>
                    <Badge variant={getStatusVariant(proposal.status)}>
                        {proposal.status.replace('_', ' ')}
                    </Badge>
                </div>
            </DialogHeader>
            <DialogContent className="p-4">
                <div className="mb-4">
                    <h4 className="h6 fw-bold text-muted mb-2">Service</h4>
                    <p>{proposal.service_name}</p>
                </div>
                <div className="mb-4">
                    <h4 className="h6 fw-bold text-muted mb-2">Description</h4>
                    <p className="text-secondary" style={{ whiteSpace: 'pre-wrap' }}>
                        {proposal.description}
                    </p>
                </div>
                <div className="row mb-4">
                    <div className="col-6">
                        <h4 className="h6 fw-bold text-muted mb-2">Price</h4>
                        <p className="h5 fw-bold text-primary">${proposal.price}</p>
                    </div>
                    <div className="col-6">
                        <h4 className="h6 fw-bold text-muted mb-2">Delivery</h4>
                        <p className="h5 fw-bold text-dark">{proposal.delivery_time}</p>
                    </div>
                </div>

                {proposal.client_feedback && (
                    <div className="p-3 bg-light rounded border mb-4">
                        <h4 className="h6 fw-bold text-muted mb-1">Your Feedback</h4>
                        <p className="small mb-0">{proposal.client_feedback}</p>
                    </div>
                )}
            </DialogContent>
            <DialogFooter className="gap-2">
                {proposal.status === 'pending' || proposal.status === 'changes_requested' ? (
                    <>
                        <Button variant="outline-danger" onClick={handleReject} disabled={loading}>
                            Reject
                        </Button>
                        <Button variant="outline-primary" onClick={handleRequestChanges} disabled={loading}>
                            Request Changes
                        </Button>
                        <Button onClick={handleAccept} disabled={loading}>
                            {loading ? 'Processing...' : 'Accept & Start Order'}
                        </Button>
                    </>
                ) : (
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>Close</Button>
                )}
            </DialogFooter>
        </Dialog>
    );
}
