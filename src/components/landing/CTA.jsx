import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from 'components/ui/button';
import { Container } from 'react-bootstrap';

export default function CTA() {
    return (
        <section className="py-5 bg-white">
            <Container className="py-5">
                <div
                    className="rounded-4 p-5 text-center position-relative overflow-hidden"
                    style={{
                        background: 'linear-gradient(135deg, #0A2540 0%, #0d3b66 100%)',
                        boxShadow: '0 20px 40px rgba(10, 37, 64, 0.25)'
                    }}
                >
                    {/* Decorative elements */}
                    <div className="position-absolute top-0 start-0 w-100 h-100 opacity-10" style={{ background: 'radial-gradient(circle at 10% 20%, #00B67A 0%, transparent 40%), radial-gradient(circle at 90% 80%, #00B67A 0%, transparent 40%)' }}></div>

                    <div className="position-relative z-1 py-4">
                        <h2 className="display-4 fw-bold text-white mb-4">
                            Ready to scale your marketing?
                        </h2>
                        <p className="mb-5 text-white opacity-75 fs-4 mx-auto" style={{ maxWidth: '650px', lineHeight: '1.6' }}>
                            Join 50,000+ businesses growing with MarketFlow's vetted experts.
                        </p>
                        <div className="d-flex flex-column flex-sm-row justify-content-center gap-4">
                            <Link to="/signup">
                                <Button
                                    size="lg"
                                    className="px-5 py-3 shadow-lg border-0"
                                    style={{
                                        background: '#00B67A',
                                        borderRadius: '12px',
                                        fontWeight: 700,
                                        fontSize: '1.1rem',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    Start Growing Now <ArrowRight className="ms-2" size={20} />
                                </Button>
                            </Link>
                            <Link to="/services">
                                <Button
                                    size="lg"
                                    className="px-5 py-3 border-0"
                                    style={{
                                        background: 'rgba(255,255,255,0.1)',
                                        color: 'white',
                                        backdropFilter: 'blur(10px)',
                                        borderRadius: '12px',
                                        fontWeight: 600,
                                        fontSize: '1.1rem',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    Browse Services
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </Container>
            <style>{`
                .rounded-4 button:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 10px 20px rgba(0,0,0,0.2) !important;
                }
            `}</style>
        </section>
    );
}
