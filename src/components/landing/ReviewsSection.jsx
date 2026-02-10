import { useState, useEffect } from 'react';
import { db } from 'lib/firebase';
import { doc, collection, onSnapshot, query, limit, writeBatch, where } from 'firebase/firestore';
import { Star, CheckCircle } from 'lucide-react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import ReviewSkeleton from './ReviewSkeleton';

const trustLogos = ['Google', 'Microsoft', 'Amazon', 'Shopify', 'Stripe'];

export default function ReviewsSection() {
    const [stats, setStats] = useState({ avgRating: null, totalReviews: null });
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        // 1. Fetch Aggregate Stats
        const statsRef = doc(db, 'platformStats', 'overview');
        const unsubStats = onSnapshot(statsRef, (docSnap) => {
            if (docSnap.exists()) {
                setStats(docSnap.data());
            }
        }, (err) => console.error("Stats Error:", err));

        // 2. Fetch Platform Reviews (Featured Only)
        const reviewsRef = collection(db, 'platformReviews');
        const q = query(reviewsRef, where('featured', '==', true), limit(3));

        const unsubReviews = onSnapshot(q, (snapshot) => {
            const loadedReviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            setReviews(loadedReviews);
            setLoading(false);
            if (loadedReviews.length === 0) setError(true);
            else setError(false);
        }, (err) => {
            console.error("Reviews Error:", err);
            setError(true);
            setLoading(false);
        });

        return () => {
            unsubStats();
            unsubReviews();
        };
    }, []);

    const initializeData = async () => {
        try {
            const batch = writeBatch(db);

            // Platform Stats (Trust indicators)
            batch.set(doc(db, 'platformStats', 'overview'), {
                avgRating: 4.9,
                totalReviews: 12500
            }, { merge: true });

            // Platform Reviews (Focus on trust, ease of use, payments)
            const platformTestimonials = [
                {
                    name: 'Sarah Johnson',
                    role: 'CEO, TechStart Inc',
                    content: 'MarketFlow makes it incredibly easy to find verified talent. The secure payment system gives us total peace of mind.',
                    rating: 5,
                    avatar: 'SJ',
                    verified: true,
                    featured: true,
                    createdAt: new Date()
                },
                {
                    name: 'David Miller',
                    role: 'Freelance Designer',
                    content: 'The best marketplace experience I have had. Payments are always on time and the platform support is outstanding.',
                    rating: 5,
                    avatar: 'DM',
                    verified: true,
                    featured: true,
                    createdAt: new Date()
                },
                {
                    name: 'Emily Rodriguez',
                    role: 'Founder, Bloom Digital',
                    content: 'I love how transparent the fees are. MarketFlow has become our go-to place for scaling our creative team.',
                    rating: 5,
                    avatar: 'ER',
                    verified: true,
                    featured: true,
                    createdAt: new Date()
                }
            ];

            // Add reviews to batch
            platformTestimonials.forEach((rev, idx) => {
                const ref = doc(db, 'platformReviews', `trust_review_${idx}`);
                batch.set(ref, rev);
            });

            await batch.commit();
            alert("Success: Platform reviews initialized!");
        } catch (err) {
            console.error("Init Error:", err);
            alert(`Error: ${err.message}. Check console permissions.`);
        }
    };

    return (
        <section id="testimonials" className="section-padding" style={{ background: '#F7F7F7' }}>
            <Container>
                {/* Trust Logos */}
                <div className="text-center mb-5 pb-4">
                    <p className="text-muted mb-4">Trusted by teams at</p>
                    <div className="d-flex flex-wrap justify-content-center align-items-center gap-5">
                        {trustLogos.map((logo) => (
                            <div key={logo} className="text-muted fw-semibold" style={{ fontSize: '1.25rem', opacity: 0.6 }}>
                                {logo}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Ratings Summary */}
                <div className="text-center mb-5">
                    <div className="d-inline-flex align-items-center gap-2 mb-3">
                        <div className="d-flex">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} size={24} className="rating-star" fill="#FFB33E" stroke="#FFB33E" />
                            ))}
                        </div>
                    </div>
                    <h3 className="fw-bold mb-2" style={{ color: '#404145' }}>
                        Rated {stats.avgRating || '4.9'}/5 from over {stats.totalReviews ? stats.totalReviews.toLocaleString() : '10,000'} reviews
                    </h3>
                    <p className="text-muted">Join thousands of satisfied businesses</p>
                </div>

                {/* Testimonials Grid */}
                <Row className="g-4">
                    {loading ? (
                        // Skeleton Loader
                        [1, 2, 3].map(i => (
                            <Col md={4} key={i}>
                                <ReviewSkeleton />
                            </Col>
                        ))
                    ) : reviews.length > 0 ? (
                        // Real Reviews
                        reviews.map((testimonial) => (
                            <Col md={4} key={testimonial.id || testimonial.name}>
                                <Card className="h-100 border-0 shadow-sm">
                                    <Card.Body className="p-4">
                                        <div className="d-flex mb-3 gap-1">
                                            {[...Array(testimonial.rating || 5)].map((_, i) => (
                                                <Star key={i} size={16} fill="#FFB33E" stroke="#FFB33E" />
                                            ))}
                                        </div>
                                        <p className="mb-4" style={{ color: '#62646A', lineHeight: '1.7' }}>
                                            "{testimonial.content}"
                                        </p>
                                        <div className="d-flex align-items-center gap-3">
                                            <div
                                                className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white"
                                                style={{
                                                    width: 48,
                                                    height: 48,
                                                    background: 'linear-gradient(135deg, #0A2540 0%, #0d3b66 100%)'
                                                }}
                                            >
                                                {testimonial.avatar || (testimonial.name ? testimonial.name.charAt(0) : '?')}
                                            </div>
                                            <div>
                                                <div className="d-flex align-items-center gap-2">
                                                    <div className="fw-bold" style={{ color: '#404145' }}>{testimonial.name}</div>
                                                    {testimonial.verified && (
                                                        <CheckCircle size={16} style={{ color: '#00B67A' }} />
                                                    )}
                                                </div>
                                                <div className="small text-muted">{testimonial.role}</div>
                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))
                    ) : (
                        // Error / Empty State
                        <div className="w-100 text-center py-5">
                            <p className="text-muted mb-3">No platform reviews found (new collection).</p>
                            <Button variant="outline-primary" onClick={initializeData}>
                                Initialize Platform Reviews Data
                            </Button>
                        </div>
                    )}
                </Row>
            </Container>
        </section >
    );
}
