import { Search, UserCheck, Rocket } from 'lucide-react';
import { Container, Row, Col } from 'react-bootstrap';

const steps = [
    {
        icon: Search,
        title: 'Browse Services',
        description: 'Explore our marketplace of verified marketing professionals and agencies.',
    },
    {
        icon: UserCheck,
        title: 'Choose Your Expert',
        description: 'Review portfolios, ratings, and pricing to find the perfect match for your needs.',
    },
    {
        icon: Rocket,
        title: 'Launch & Grow',
        description: 'Work directly with your chosen expert and watch your business grow.',
    }
];

export default function HowItWorks() {
    return (
        <section id="how-it-works" className="py-5 bg-light bg-opacity-50">
            <Container className="py-5">
                <div className="text-center mb-5">
                    <h2 className="h2 fw-bold text-dark mb-3">How It Works</h2>
                    <div className="bg-navy mx-auto mb-4" style={{ height: '4px', width: '50px' }}></div>
                    <p className="text-muted lead fs-6">Get started in three simple steps</p>
                </div>

                <Row className="g-5">
                    {steps.map((step, index) => (
                        <Col md={4} key={step.title}>
                            <div className="text-center">
                                <div className="d-inline-flex align-items-center justify-content-center bg-navy-light text-navy rounded-circle mb-4 shadow-sm" style={{ width: 80, height: 80 }}>
                                    <step.icon size={32} />
                                </div>
                                <div className="position-relative">
                                    <span className="position-absolute top-0 start-50 translate-middle badge rounded-pill bg-navy" style={{ fontSize: '0.7rem' }}>
                                        {index + 1}
                                    </span>
                                </div>
                                <h4 className="h5 fw-bold mb-3 mt-3">{step.title}</h4>
                                <p className="text-muted">{step.description}</p>
                            </div>
                        </Col>
                    ))}
                </Row>
            </Container>
        </section>
    );
}
