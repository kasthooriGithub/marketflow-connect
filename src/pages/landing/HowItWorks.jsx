import { Search, UserCheck, CreditCard } from 'lucide-react';
import { Container, Row, Col } from 'react-bootstrap';

const steps = [
    {
        icon: Search,
        title: 'Search',
        description: 'Browse services or search for what you need',
    },
    {
        icon: UserCheck,
        title: 'Choose',
        description: 'Compare experts and select the best fit',
    },
    {
        icon: CreditCard,
        title: 'Get Started',
        description: 'Secure payment and project kickoff',
    }
];

export default function HowItWorks() {
    return (
        <section id="how-it-works" className="section-padding bg-white">
            <Container>
                <div className="text-center mb-5">
                    <h2 className="fw-bold mb-3" style={{ color: '#404145' }}>How MarketFlow Works</h2>
                    <p className="text-muted">Get started in three simple steps</p>
                </div>

                <Row className="g-5 justify-content-center">
                    {steps.map((step, index) => (
                        <Col md={4} key={step.title}>
                            <div className="text-center">
                                <div
                                    className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4 position-relative"
                                    style={{
                                        width: 80,
                                        height: 80,
                                        background: 'linear-gradient(135deg, #0A2540 0%, #0d3b66 100%)',
                                        boxShadow: '0 4px 12px rgba(10, 37, 64, 0.2)'
                                    }}
                                >
                                    <step.icon size={32} color="white" />
                                    <span
                                        className="position-absolute top-0 end-0 translate-middle badge rounded-pill"
                                        style={{
                                            background: '#00B67A',
                                            fontSize: '0.75rem',
                                            padding: '0.35rem 0.6rem'
                                        }}
                                    >
                                        {index + 1}
                                    </span>
                                </div>
                                <h4 className="fw-bold mb-3" style={{ color: '#404145' }}>{step.title}</h4>
                                <p className="text-muted">{step.description}</p>
                            </div>
                        </Col>
                    ))}
                </Row>
            </Container>
        </section>
    );
}
