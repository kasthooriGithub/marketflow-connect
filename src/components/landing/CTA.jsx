import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from 'components/ui/button';
import { Container } from 'react-bootstrap';

export default function CTA() {
    return (
        <section className="section-padding bg-white">
            <Container>
                <div
                    className="rounded-4 p-5 text-center position-relative overflow-hidden"
                    style={{
                        background: 'linear-gradient(135deg, #0A2540 0%, #0d3b66 100%)',
                        boxShadow: '0 12px 32px rgba(10, 37, 64, 0.2)'
                    }}
                >
                    <div className="position-relative z-1 py-4">
                        <h2 className="display-5 fw-bold text-white mb-4">
                            Ready to find your perfect marketing expert?
                        </h2>
                        <p className="mb-5 text-white opacity-75 fs-5 mx-auto" style={{ maxWidth: '650px' }}>
                            Join 50,000+ businesses growing with MarketFlow
                        </p>
                        <div className="d-flex flex-column flex-sm-row justify-content-center gap-3">
                            <Link to="/signup">
                                <Button
                                    size="lg"
                                    className="px-5 py-3"
                                    style={{
                                        background: '#00B67A',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontWeight: 600
                                    }}
                                >
                                    Get Started Free <ArrowRight className="ms-2" size={20} />
                                </Button>
                            </Link>
                            <Link to="/services">
                                <Button
                                    size="lg"
                                    className="px-5 py-3"
                                    style={{
                                        background: 'white',
                                        color: '#0A2540',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontWeight: 600
                                    }}
                                >
                                    Browse Services
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    );
}
