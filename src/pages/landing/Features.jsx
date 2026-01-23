import { Shield, Zap, Users, TrendingUp } from 'lucide-react';
import { Container, Row, Col } from 'react-bootstrap';

const features = [
    {
        icon: Shield,
        title: 'Verified Vendors',
        description: 'Every vendor goes through a rigorous vetting process to ensure quality service delivery.',
    },
    {
        icon: Zap,
        title: 'Fast Delivery',
        description: 'Get your marketing services delivered quickly with our streamlined project management.',
    },
    {
        icon: Users,
        title: 'Expert Support',
        description: '24/7 support team ready to help you find the perfect service for your needs.',
    },
    {
        icon: TrendingUp,
        title: 'Growth Focused',
        description: 'Services designed to help your business scale and achieve measurable results.',
    }
];

export default function Features() {
    return (
        <section id="features" className="py-5 bg-white">
            <Container className="py-5">
                <div className="text-center mb-5">
                    <h2 className="h2 fw-bold text-dark mb-3">Why Choose MarketFlow?</h2>
                    <div className="bg-navy mx-auto mb-4" style={{ height: '4px', width: '50px' }}></div>
                    <p className="text-muted lead fs-6">We make it easy to find, hire, and work with the best marketing professionals</p>
                </div>

                <Row className="g-4">
                    {features.map((feature) => (
                        <Col md={6} lg={3} key={feature.title}>
                            <div className="text-center p-4 h-100 rounded-4 hover-lift">
                                <div className="d-inline-flex align-items-center justify-content-center bg-navy-light text-navy rounded-circle mb-4 shadow-sm" style={{ width: 80, height: 80 }}>
                                    <feature.icon size={32} />
                                </div>
                                <h4 className="h5 fw-bold mb-3">{feature.title}</h4>
                                <p className="text-muted small mb-0">{feature.description}</p>
                            </div>
                        </Col>
                    ))}
                </Row>
            </Container>

            <style>{`
                .hover-lift:hover {
                    transform: translateY(-5px);
                    transition: transform 0.3s ease;
                }
            `}</style>
        </section>
    );
}
