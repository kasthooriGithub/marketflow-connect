import { Link } from 'react-router-dom';
import { ArrowRight, Zap } from 'lucide-react';
import { Button } from 'components/ui/button';
import { Container, Row, Col, Card } from 'react-bootstrap';

const stats = [
    { value: '2,500+', label: 'Active Vendors' },
    { value: '50K+', label: 'Services Sold' },
    { value: '98%', label: 'Satisfaction Rate' },
    { value: '$12M+', label: 'Paid to Vendors' },
];

export default function Hero() {
    return (
        <section className="bg-gradient-to-b from-primary-light to-white py-5 position-relative overflow-hidden">
            <div className="position-absolute top-0 end-0 p-5 opacity-10 d-none d-lg-block">
                <div className="bg-primary rounded-circle" style={{ width: 400, height: 400, filter: 'blur(100px)' }}></div>
            </div>

            <Container className="py-5 position-relative z-1">
                <div className="text-center mx-auto" style={{ maxWidth: '850px' }}>
                    <div className="d-inline-flex align-items-center gap-2 px-4 py-2 rounded-pill bg-navy-light text-navy mb-4 border border-navy border-opacity-10 animate-fade-in shadow-sm">
                        <Zap size={16} style={{ fill: 'var(--navy-primary)' }} />
                        <span className="small fw-bold text-uppercase tracking-wider">The #1 Digital Marketing Marketplace</span>
                    </div>

                    <h1 className="display-3 fw-bold mb-4 text-dark font-display leading-tight">
                        Grow Your Business with{' '}
                        <span className="highlight-navy">Expert Marketing</span>
                    </h1>

                    <p className="lead text-muted mb-5 px-lg-5 fs-5">
                        Connect with top digital marketing agencies and freelancers. From SEO to social media, find the perfect service to scale your business to new heights.
                    </p>

                    <div className="d-flex flex-column flex-sm-row align-items-center justify-content-center gap-3 mb-5 mt-4">
                        <Link to="/services">
                            <Button variant="default" size="lg" className="px-5 py-3 shadow-lg rounded-pill">
                                Browse Services <ArrowRight className="ms-2" size={20} />
                            </Button>
                        </Link>
                        <Link to="/signup">
                            <Button variant="outline-primary" size="lg" className="px-5 py-3 rounded-pill bg-white">
                                Become a Vendor
                            </Button>
                        </Link>
                    </div>

                    {/* Stats */}
                    <Row className="mt-5 pt-5 g-4">
                        {stats.map((stat) => (
                            <Col xs={6} md={3} key={stat.label} className="text-center">
                                <Card className="border-0 bg-transparent h-100">
                                    <Card.Body className="p-0">
                                        <div className="h2 fw-bold text-dark mb-1 font-display">{stat.value}</div>
                                        <div className="text-muted small fw-medium text-uppercase tracking-wider" style={{ fontSize: '0.65rem' }}>{stat.label}</div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </div>
            </Container>
        </section>
    );
}
