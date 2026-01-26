import { Link } from 'react-router-dom';
import { Check, Star } from 'lucide-react';
import { Button } from 'components/ui/button';
import { Container, Row, Col, Card } from 'react-bootstrap';

const plans = [
    {
        name: 'Starter',
        price: 'Free',
        description: 'Perfect for trying out the platform',
        features: [
            'Browse all services',
            'Message vendors',
            'Basic support',
            'Secure payments'
        ],
        cta: 'Get Started',
        highlighted: false
    },
    {
        name: 'Business',
        price: '$29',
        period: '/month',
        description: 'For growing businesses',
        features: [
            'Everything in Starter',
            'Priority support',
            'Advanced analytics',
            'Team collaboration',
            'Custom branding'
        ],
        cta: 'Start Free Trial',
        highlighted: true,
        badge: 'Most Popular'
    },
    {
        name: 'Enterprise',
        price: 'Custom',
        description: 'For large organizations',
        features: [
            'Everything in Business',
            'Dedicated account manager',
            'Custom integrations',
            'SLA guarantees',
            'Advanced security'
        ],
        cta: 'Contact Sales',
        highlighted: false
    }
];

export default function Pricing() {
    return (
        <section id="pricing" className="section-padding bg-white">
            <Container>
                <div className="text-center mb-5">
                    <h2 className="fw-bold mb-3" style={{ color: '#404145', fontSize: '2.5rem' }}>
                        Simple, transparent pricing
                    </h2>
                    <p className="text-muted fs-5">Choose the plan that's right for you</p>
                </div>

                <Row className="g-4 justify-content-center align-items-center">
                    {plans.map((plan) => (
                        <Col md={6} lg={4} key={plan.name}>
                            <Card
                                className={`h-100 position-relative ${plan.highlighted ? 'shadow-lg' : 'shadow-sm'}`}
                                style={{
                                    border: plan.highlighted ? '2px solid #00B67A' : '1px solid #E4E5E7',
                                    borderRadius: '16px',
                                    transition: 'all 0.3s ease',
                                    transform: plan.highlighted ? 'scale(1.05)' : 'scale(1)'
                                }}
                            >
                                {plan.badge && (
                                    <div
                                        className="position-absolute top-0 start-50 translate-middle px-3 py-1 rounded-pill fw-semibold"
                                        style={{
                                            background: '#00B67A',
                                            color: 'white',
                                            fontSize: '0.75rem'
                                        }}
                                    >
                                        <Star size={12} fill="white" className="me-1" />
                                        {plan.badge}
                                    </div>
                                )}
                                <Card.Body className="p-5">
                                    <h3 className="h5 fw-bold mb-2" style={{ color: '#404145' }}>{plan.name}</h3>
                                    <p className="text-muted small mb-4">{plan.description}</p>
                                    <div className="mb-4">
                                        <span className="display-5 fw-bold" style={{ color: '#404145' }}>{plan.price}</span>
                                        {plan.period && <span className="text-muted fs-6">{plan.period}</span>}
                                    </div>
                                    <ul className="list-unstyled mb-4">
                                        {plan.features.map((feature) => (
                                            <li key={feature} className="mb-3 d-flex align-items-start">
                                                <Check size={18} style={{ color: '#00B67A' }} className="me-2 flex-shrink-0 mt-1" />
                                                <span style={{ color: '#62646A' }}>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <Link to="/signup" className="d-block">
                                        <Button
                                            className="w-100 py-3 fw-semibold"
                                            style={{
                                                background: plan.highlighted ? '#00B67A' : 'white',
                                                color: plan.highlighted ? 'white' : '#0A2540',
                                                border: plan.highlighted ? 'none' : '2px solid #E4E5E7',
                                                borderRadius: '8px',
                                                fontSize: '1rem'
                                            }}
                                        >
                                            {plan.cta}
                                        </Button>
                                    </Link>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>

                <div className="text-center mt-5 pt-4">
                    <p className="text-muted">
                        All plans include our marketplace fee of 10% on transactions
                    </p>
                </div>
            </Container>
        </section>
    );
}
