import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';
import { Star } from 'lucide-react';
import { useAuth } from 'contexts/AuthContext';
import { db } from 'lib/firebase';
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { Layout } from 'components/layout/Layout'; // Assuming standard layout wrapper

export default function PlatformReviewForm() {
    const { user } = useAuth();
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [hasSubmitted, setHasSubmitted] = useState(false);

    useEffect(() => {
        const checkExistingReview = async () => {
            if (!user) return;
            try {
                const q = query(
                    collection(db, 'platformReviews'),
                    where('userId', '==', user.uid)
                );
                const snapshot = await getDocs(q);
                if (!snapshot.empty) {
                    setHasSubmitted(true);
                }
            } catch (err) {
                console.error("Error checking reviews:", err);
            }
        };
        checkExistingReview();
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            setError('Please select a star rating.');
            return;
        }
        if (comment.trim().length < 10) {
            setError('Please provide a comment with at least 10 characters.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await addDoc(collection(db, 'platformReviews'), {
                userId: user.uid,
                name: user.name || user.displayName || 'MarketFlow User', // Fallback for name
                userRole: user.role || 'User',
                rating,
                content: comment,
                avatar: user.avatar || user.photoURL || '',
                verified: true, // Logged in users are verified by definition for this purpose
                featured: false, // Default to hidden until admin approves
                createdAt: serverTimestamp()
            });

            setSuccess(true);
            setHasSubmitted(true);
        } catch (err) {
            console.error("Submission error:", err);
            setError('Failed to submit review. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <Container className="py-5 text-center">Please log in to review.</Container>;

    return (
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col md={8} lg={6}>
                    <Card className="shadow-sm border-0">
                        <Card.Body className="p-4 p-md-5">
                            <div className="text-center mb-4">
                                <h2 className="fw-bold mb-2">Rate Your Experience</h2>
                                <p className="text-muted">How has MarketFlow helped your business?</p>
                            </div>

                            {hasSubmitted && !success ? (
                                <Alert variant="info" className="text-center">
                                    You have already submitted a review. Thank you for your feedback!
                                </Alert>
                            ) : success ? (
                                <Alert variant="success" className="text-center">
                                    <h4 className="alert-heading h5">Thank you! 🎉</h4>
                                    <p className="mb-0">Your review has been submitted successfully.</p>
                                </Alert>
                            ) : (
                                <Form onSubmit={handleSubmit}>
                                    {error && <Alert variant="danger">{error}</Alert>}

                                    {/* Star Rating */}
                                    <div className="d-flex justify-content-center gap-2 mb-4">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                className="btn p-0 border-0 bg-transparent"
                                                onClick={() => setRating(star)}
                                                onMouseEnter={() => setHoveredRating(star)}
                                                onMouseLeave={() => setHoveredRating(0)}
                                            >
                                                <Star
                                                    size={40}
                                                    fill={(hoveredRating || rating) >= star ? "#FFB33E" : "none"}
                                                    stroke={(hoveredRating || rating) >= star ? "#FFB33E" : "#cbd5e1"}
                                                    style={{ transition: 'all 0.2s ease' }}
                                                />
                                            </button>
                                        ))}
                                    </div>

                                    <Form.Group className="mb-4">
                                        <Form.Label className="fw-semibold">Your Feedback</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={4}
                                            placeholder="Share your experience with the platform..."
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            style={{ resize: 'none' }}
                                        />
                                        <Form.Text className="text-muted">
                                            Please focus on the platform features, ease of use, and support.
                                        </Form.Text>
                                    </Form.Group>

                                    <div className="d-grid">
                                        <Button
                                            variant="primary"
                                            type="submit"
                                            size="lg"
                                            disabled={loading}
                                            className="fw-bold"
                                        >
                                            {loading ? 'Submitting...' : 'Submit Review'}
                                        </Button>
                                    </div>
                                </Form>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}
