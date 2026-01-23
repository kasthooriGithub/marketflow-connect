import { Star } from 'lucide-react';
import { Container, Row, Col, Card } from 'react-bootstrap';

const testimonials = [
    {
        name: 'Sarah Johnson',
        role: 'CEO, TechStart Inc',
        content: 'MarketFlow Connect helped us find the perfect SEO agency. Our organic traffic increased by 300% in just 3 months!',
        rating: 5,
        avatar: 'SJ'
    },
    {
        name: 'Michael Chen',
        role: 'Marketing Director, GrowthCo',
        content: 'The quality of vendors on this platform is outstanding. We\'ve built long-term partnerships that continue to deliver results.',
        rating: 5,
        avatar: 'MC'
    },
    {
        name: 'Emily Rodriguez',
        role: 'Founder, Bloom Digital',
        content: 'As a vendor, MarketFlow has been a game-changer. The platform makes it easy to connect with quality clients.',
        rating: 5,
        avatar: 'ER'
    }
];

export default function Testimonials() {
    return (
        <section id="testimonials" className="py-5 bg-light bg-opacity-50">
            <Container className="py-5">
                <div className="text-center mb-5">
                    <h2 className="h2 fw-bold text-dark mb-3">What Our Users Say</h2>
                    <div className="bg-navy mx-auto mb-4" style={{ height: '4px', width: '50px' }}></div>
                    <p className="text-muted lead fs-6">Trusted by thousands of businesses worldwide</p>
                </div>

                <Row className="g-4">
                    {testimonials.map((testimonial) => (
                        <Col md={4} key={testimonial.name}>
                            <Card className="h-100 border-0 shadow-sm rounded-4">
                                <Card.Body className="p-4">
                                    <div className="d-flex mb-3">
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                            <Star key={i} size={16} className="text-warning fill-warning" />
                                        ))}
                                    </div>
                                    <p className="text-muted mb-4">{testimonial.content}</p>
                                    <div className="d-flex align-items-center">
                                        <div className="bg-navy-light text-navy rounded-circle d-flex align-items-center justify-content-center fw-bold me-3" style={{ width: 48, height: 48 }}>
                                            {testimonial.avatar}
                                        </div>
                                        <div>
                                            <div className="fw-bold text-dark">{testimonial.name}</div>
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
