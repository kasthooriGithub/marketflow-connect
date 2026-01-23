import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';

export default function Footer() {
    const footerLinks = {
        Product: [
            { label: 'Features', href: '#features' },
            { label: 'Pricing', href: '#pricing' },
            { label: 'How It Works', href: '#how-it-works' },
        ],
        Company: [
            { label: 'About Us', href: '/about' },
            { label: 'Contact', href: '/contact' },
            { label: 'Careers', href: '/careers' },
        ],
        Resources: [
            { label: 'Blog', href: '/blog' },
            { label: 'Help Center', href: '/help' },
            { label: 'Community', href: '/community' },
        ],
        Legal: [
            { label: 'Privacy Policy', href: '/privacy' },
            { label: 'Terms of Service', href: '/terms' },
            { label: 'Cookie Policy', href: '/cookies' },
        ],
    };

    return (
        <footer className="bg-dark text-white py-5">
            <Container className="py-4">
                <Row className="g-4">
                    <Col lg={4} className="mb-4 mb-lg-0">
                        <div className="d-flex align-items-center gap-2 mb-3">
                            <div className="bg-navy-light text-navy rounded d-flex align-items-center justify-content-center fw-bold" style={{ width: 40, height: 40 }}>
                                M
                            </div>
                            <span className="h5 mb-0 fw-bold">MarketFlow</span>
                        </div>
                        <p className="text-white-50 mb-0">
                            The #1 marketplace for digital marketing services. Connect with top professionals and grow your business.
                        </p>
                    </Col>

                    {Object.entries(footerLinks).map(([category, links]) => (
                        <Col sm={6} lg={2} key={category}>
                            <h6 className="fw-bold mb-3">{category}</h6>
                            <ul className="list-unstyled">
                                {links.map((link) => (
                                    <li key={link.label} className="mb-2">
                                        <Link to={link.href} className="text-white-50 text-decoration-none hover-text-white">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </Col>
                    ))}
                </Row>

                <hr className="my-4 border-secondary opacity-25" />

                <div className="text-center text-white-50 small">
                    <p className="mb-0">© {new Date().getFullYear()} MarketFlow Connect. All rights reserved.</p>
                </div>
            </Container>

            <style>{`
                .hover-text-white:hover {
                    color: white !important;
                }
            `}</style>
        </footer>
    );
}
