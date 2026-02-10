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
        <section id="pricing" className="py-5" style={{ background: '#F8F9FA' }}>
            <Container className="py-5">
                <div className="text-center mb-5">
                    <h2 className="fw-bold mb-3" style={{ color: '#0A2540', fontSize: '2.75rem', letterSpacing: '-0.02em' }}>
                        Simple, transparent pricing
                    </h2>
                    <p className="text-muted fs-5 mx-auto" style={{ maxWidth: '600px' }}>
                        No hidden fees. Choose the plan that scales with your business needs.
                    </p>
                </div>

                <Row className="g-4 justify-content-center align-items-stretch">
                    {plans.map((plan) => (
                        <Col md={6} lg={4} key={plan.name} className="d-flex">
                            <Card
                                className={`w-100 border-0 shadow-sm overflow-hidden`}
                                style={{
                                    borderRadius: '20px',
                                    transition: 'all 0.3s ease',
                                    transform: plan.highlighted ? 'scale(1.02)' : 'scale(1)',
                                    zIndex: plan.highlighted ? 1 : 0,
                                    border: plan.highlighted ? '2px solid #00B67A' : '1px solid transparent'
                                }}
                            >
                                {plan.badge && (
                                    <div
                                        className="position-absolute top-0 end-0 px-4 py-2 fw-bold shadow-sm"
                                        style={{
                                            background: '#00B67A',
                                            color: 'white',
                                            fontSize: '0.75rem',
                                            borderRadius: '0 0 0 20px',
                                            letterSpacing: '0.05em'
                                        }}
                                    >
                                        {plan.badge.toUpperCase()}
                                    </div>
                                )}
                                <Card.Body className="p-5 d-flex flex-column">
                                    <div className="mb-4">
                                        <h3 className="h4 fw-bold mb-2" style={{ color: '#0A2540' }}>{plan.name}</h3>
                                        <p className="text-muted fs-6" style={{ height: '3rem' }}>{plan.description}</p>
                                    </div>
                                    <div className="mb-5 pb-3 border-bottom">
                                        <span className="display-4 fw-bold" style={{ color: '#0A2540' }}>{plan.price}</span>
                                        {plan.period && <span className="text-muted fs-5 fw-medium">{plan.period}</span>}
                                    </div>
                                    <ul className="list-unstyled mb-auto">
                                        {plan.features.map((feature) => (
                                            <li key={feature} className="mb-3 d-flex align-items-start">
                                                <div
                                                    className="me-3 mt-1 d-flex align-items-center justify-content-center rounded-circle"
                                                    style={{ width: 22, height: 22, background: plan.highlighted ? '#00B67A15' : '#F0F2F5' }}
                                                >
                                                    <Check size={14} style={{ color: '#00B67A' }} strokeWidth={3} />
                                                </div>
                                                <span className="fw-medium" style={{ color: '#404145' }}>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="mt-5">
                                        <Link to="/signup" className="text-decoration-none">
                                            <Button
                                                className="w-100 py-3 fw-bold border-0"
                                                style={{
                                                    background: plan.highlighted ? '#00B67A' : '#F0F2F5',
                                                    color: plan.highlighted ? 'white' : '#0A2540',
                                                    borderRadius: '12px',
                                                    fontSize: '1rem',
                                                    transition: 'all 0.2s ease'
                                                }}
                                            >
                                                {plan.cta}
                                            </Button>
                                        </Link>
                                    </div>
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
