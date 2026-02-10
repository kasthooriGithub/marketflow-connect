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
import { useNavigate } from 'react-router-dom';
import { proposalService } from 'services/proposalService';
import { orderService } from 'services/orderService';
import { paymentService } from 'services/paymentService';

export function ProposalDetailModal({ open, onOpenChange, proposal, onActionComplete }) {
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    if (!proposal) return null;

    const handleAccept = async () => {
        setLoading(true);
        try {
            // Use centralized service logic
            const { id: orderId } = await proposalService.acceptProposal(proposal.id);

            if (onActionComplete) onActionComplete('accepted');
            onOpenChange(false);

            // Navigate to payment
            navigate(`/client/payment/${orderId}`);
        } catch (error) {
            console.error("Error accepting proposal:", error);
            // Ideally show a toast here, but we might rely on the parent or service to not throw without reason
        } finally {
            setLoading(false);
        }
    };

    const handleRequestChanges = async () => {
        // Ask for feedback message
        const feedback = prompt("What changes would you like to request?");
        if (feedback === null) return;

        setLoading(true);
        try {
            await proposalService.requestProposalChanges(proposal.id, feedback);
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
            await proposalService.rejectProposal(proposal.id);
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
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogHeader>
                    <div className="d-flex justify-content-between align-items-center w-100 pe-4">
                        <DialogTitle>{proposal.title}</DialogTitle>
                        <Badge variant={getStatusVariant(proposal.status)}>
                            {proposal.status.replace('_', ' ')}
                        </Badge>
                    </div>
                </DialogHeader>

                <DialogContent>
                    <div className="proposal-modal-body" style={{
                        maxHeight: 'calc(85vh - 180px)',
                        overflowY: 'auto',
                        padding: '1.5rem'
                    }}>
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
                    </div>
                </DialogContent>

                <DialogFooter className="d-flex justify-content-end align-items-center gap-2 border-top pt-3">
                    {proposal.status === 'pending' || proposal.status === 'changes_requested' ? (
                        <>
                            <Button
                                variant="link"
                                className="text-danger text-decoration-none px-3"
                                onClick={handleReject}
                                disabled={loading}
                                size="sm"
                            >
                                Reject
                            </Button>
                            <Button
                                variant="outline-secondary"
                                onClick={handleRequestChanges}
                                disabled={loading}
                                size="sm"
                                className="px-3"
                            >
                                Request Changes
                            </Button>
                            <Button
                                onClick={handleAccept}
                                disabled={loading}
                                className="btn-success px-4 py-2 fw-semibold"
                                style={{ fontSize: '15px' }}
                            >
                                {loading ? 'Processing...' : 'Accept & Start Order'}
                            </Button>
                        </>
                    ) : (
                        <Button variant="outline-secondary" onClick={() => onOpenChange(false)}>Close</Button>
                    )}
                </DialogFooter>
            </Dialog>

            <style>{`
                .modal-content {
                    max-height: 85vh;
                    border-radius: 12px;
                    overflow: hidden;
                }
                
                .proposal-modal-body::-webkit-scrollbar {
                    width: 6px;
                }
                
                .proposal-modal-body::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 10px;
                }
                
                .proposal-modal-body::-webkit-scrollbar-track {
                    background: #f1f5f9;
                }
            `}</style>
        </>
    );
}
