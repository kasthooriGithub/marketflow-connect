import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from 'components/ui/button';
import { Container } from 'react-bootstrap';

export default function CTA() {
    return (
        <section className="py-5 bg-white mb-5">
            <Container>
                <div className="bg-primary bg-gradient rounded-5 p-5 text-center position-relative overflow-hidden shadow-lg border border-primary border-4 border-opacity-10">
                    <div className="position-absolute bottom-0 start-0 w-100 h-100 opacity-10 bg-pattern-white"></div>
                    <div className="position-relative z-1 py-4">
                        <h2 className="display-5 fw-bold text-white mb-4">Ready to Grow Your Business?</h2>
                        <p className="mb-5 text-white opacity-75 fs-5 mx-auto" style={{ maxWidth: '650px' }}>
                            Join over 50,000+ businesses who have already found their perfect marketing partner on MarketFlow Connect.
                        </p>
                        <div className="d-flex flex-column flex-sm-row justify-content-center gap-4 mt-2">
                            <Link to="/signup">
                                <Button size="lg" variant="default" className="bg-navy text-white border-navy fw-bold px-5 py-3 rounded-pill shadow-lg">
                                    Get Started Free <ArrowRight className="ms-2" size={20} />
                                </Button>
                            </Link>
                            <Link to="/how-it-works">
                                <Button size="lg" variant="outline-primary" className="btn-cta-secondary px-5 py-3 rounded-pill">
                                    See How It Works
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </Container>

            <style>{`
                .bg-pattern-white {
                    background-image: repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.05) 75%, transparent 75%, transparent);
                    background-size: 40px 40px;
                }
            `}</style>
        </section>
    );
}
