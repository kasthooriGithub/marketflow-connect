import { Star, CheckCircle } from 'lucide-react';
import { Container, Row, Col, Card } from 'react-bootstrap';

const testimonials = [
    {
        name: 'Sarah Johnson',
        role: 'CEO, TechStart Inc',
        content: 'MarketFlow helped us find the perfect SEO expert. Our organic traffic increased by 300% in just 3 months!',
        rating: 5,
        avatar: 'SJ',
        verified: true
    },
    {
        name: 'Michael Chen',
        role: 'Marketing Director, GrowthCo',
        content: 'The quality of professionals on this platform is outstanding. We\'ve built long-term partnerships that deliver real results.',
        rating: 5,
        avatar: 'MC',
        verified: true
    },
    {
        name: 'Emily Rodriguez',
        role: 'Founder, Bloom Digital',
        content: 'As a vendor, MarketFlow has been a game-changer. The platform makes it easy to connect with quality clients.',
        rating: 5,
        avatar: 'ER',
        verified: true
    }
];

const trustLogos = ['Google', 'Microsoft', 'Amazon', 'Shopify', 'Stripe'];

export default function Testimonials() {
    return (
        <section id="testimonials" className="section-padding" style={{ background: '#F7F7F7' }}>
            <Container>
                {/* Trust Logos */}
                <div className="text-center mb-5 pb-4">
                    <p className="text-muted mb-4">Trusted by teams at</p>
                    <div className="d-flex flex-wrap justify-content-center align-items-center gap-5">
                        {trustLogos.map((logo) => (
                            <div
                                key={logo}
                                className="text-muted fw-semibold"
                                style={{ fontSize: '1.25rem', opacity: 0.6 }}
                            >
                                {logo}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Ratings Summary */}
                <div className="text-center mb-5">
                    <div className="d-inline-flex align-items-center gap-2 mb-3">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} size={24} className="rating-star" fill="#FFB33E" />
                        ))}
                    </div>
                    <h3 className="fw-bold mb-2" style={{ color: '#404145' }}>Rated 4.9/5 from over 10,000 reviews</h3>
                    <p className="text-muted">Join thousands of satisfied businesses</p>
                </div>

                {/* Testimonials */}
                <Row className="g-4">
                    {testimonials.map((testimonial) => (
                        <Col md={4} key={testimonial.name}>
                            <Card className="h-100 border-0 shadow-sm">
                                <Card.Body className="p-4">
                                    <div className="d-flex mb-3">
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                            <Star key={i} size={16} className="rating-star" fill="#FFB33E" />
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
                                            {testimonial.avatar}
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
                    ))}
                </Row>
            </Container>
        </section>
    );
}
