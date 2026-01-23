import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { Button } from 'components/ui/button';
import { Container, Row, Col, Card, Badge } from 'react-bootstrap';

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
        ]
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
        popular: true
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
        ]
    }
];

export default function Pricing() {
    return (
        <section id="pricing" className="py-5 bg-white">
            <Container className="py-5">
                <div className="text-center mb-5">
                    <Badge className="bg-navy-light text-navy mb-3 px-3 py-2 rounded-pill fw-normal">Pricing Plans</Badge>
                    <h2 className="h2 fw-bold text-dark mb-3">Choose Your Plan</h2>
                    <p className="text-muted lead fs-6">Flexible pricing for businesses of all sizes</p>
                </div>

                <Row className="g-4 justify-content-center">
                    {plans.map((plan) => (
                        <Col md={6} lg={4} key={plan.name}>
                            <Card className={`h-100 border-2 rounded-4 shadow-sm ${plan.popular ? 'border-navy' : 'border-light'}`}>
                                {plan.popular && (
                                    <div className="position-absolute top-0 start-50 translate-middle">
                                        <Badge bg="navy" className="px-3 py-2">Most Popular</Badge>
                                    </div>
                                )}
                                <Card.Body className="p-4 p-lg-5">
                                    <h3 className="h4 fw-bold mb-2">{plan.name}</h3>
                                    <p className="text-muted small mb-4">{plan.description}</p>
                                    <div className="mb-4">
                                        <span className="display-4 fw-bold text-dark">{plan.price}</span>
                                        {plan.period && <span className="text-muted">{plan.period}</span>}
                                    </div>
                                    <ul className="list-unstyled mb-4">
                                        {plan.features.map((feature) => (
                                            <li key={feature} className="mb-3 d-flex align-items-start">
                                                <Check size={20} className="text-navy me-2 flex-shrink-0 mt-1" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <Link to="/signup" className="d-block">
                                        <Button
                                            variant={plan.popular ? 'default' : 'outline-primary'}
                                            className={`w-100 rounded-pill py-3 ${plan.popular ? 'btn-navy' : ''}`}
                                        >
                                            Get Started
                                        </Button>
                                    </Link>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Container>
        </section>
    );
}
