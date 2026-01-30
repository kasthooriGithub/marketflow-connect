import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from 'components/ui/dialog';
import { Button } from 'components/ui/button';
import { Textarea } from 'components/ui/textarea';
import { Form } from 'react-bootstrap';
import { Star } from 'lucide-react';
import { reviewService } from 'services/reviewService';

export function ReviewModal({ open, onOpenChange, order, user }) {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!order || !user) return;

        setLoading(true);
        try {
            await reviewService.createReview({
                order_id: order.id,
                client_id: user.uid,
                client_name: user.full_name || user.name,
                vendor_id: order.vendor_id,
                service_id: order.service_id,
                rating: rating,
                comment: comment,
            });
            onOpenChange(false);
            setRating(5);
            setComment('');
        } catch (error) {
            console.error("Error submitting review:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogHeader>
                <DialogTitle>Leave a Review</DialogTitle>
            </DialogHeader>
            <DialogContent className="p-4">
                <Form onSubmit={handleSubmit}>
                    <div className="text-center mb-4">
                        <p className="text-muted mb-2">How was your experience with {order?.service_name}?</p>
                        <div className="d-flex justify-content-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    className="border-0 bg-transparent p-1 transition-transform hover-scale"
                                    onClick={() => setRating(star)}
                                >
                                    <Star
                                        size={32}
                                        fill={star <= rating ? "#ffc107" : "none"}
                                        stroke={star <= rating ? "#ffc107" : "#dee2e6"}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    <Form.Group className="mb-3">
                        <Form.Label>Your Feedback</Form.Label>
                        <Textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Share your experience with other clients..."
                            rows={4}
                            required
                        />
                    </Form.Group>
                </Form>
            </DialogContent>
            <DialogFooter>
                <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit Review'}
                </Button>
            </DialogFooter>
            <style>{`
                .hover-scale:hover { transform: scale(1.1); }
            `}</style>
        </Dialog>
    );
}
