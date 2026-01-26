import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { Twitter, Linkedin, Instagram, Facebook } from 'lucide-react';

export default function Footer() {
    const footerLinks = {
        'For Clients': [
            { label: 'How It Works', href: '#how-it-works' },
            { label: 'Browse Services', href: '/services' },
            { label: 'Pricing', href: '#pricing' },
            { label: 'Trust & Safety', href: '/trust' },
        ],
        'For Freelancers': [
            { label: 'Become a Seller', href: '/signup' },
            { label: 'Seller Resources', href: '/resources' },
            { label: 'Community', href: '/community' },
            { label: 'Success Stories', href: '/stories' },
        ],
        Company: [
            { label: 'About Us', href: '/about' },
            { label: 'Careers', href: '/careers' },
            { label: 'Press', href: '/press' },
            { label: 'Contact', href: '/contact' },
        ],
        Support: [
            { label: 'Help Center', href: '/help' },
            { label: 'FAQ', href: '/faq' },
            { label: 'Terms of Service', href: '/terms' },
            { label: 'Privacy Policy', href: '/privacy' },
        ],
    };

    const socialLinks = [
        { icon: Twitter, href: '#', label: 'Twitter' },
        { icon: Facebook, href: '#', label: 'Facebook' },
        { icon: Instagram, href: '#', label: 'Instagram' },
        { icon: Linkedin, href: '#', label: 'LinkedIn' },
    ];

    return (
        <footer className="bg-white border-top" style={{ borderColor: '#E4E5E7' }}>
            <Container className="py-5">
                <Row className="g-4 py-4">
                    {/* Brand Column */}
                    <Col lg={4} className="mb-4 mb-lg-0">
                        <div className="d-flex align-items-center gap-2 mb-3">
                            <div
                                className="rounded-2 d-flex align-items-center justify-content-center fw-bold text-white"
                                style={{
                                    width: 40,
                                    height: 40,
                                    background: 'linear-gradient(135deg, #0A2540 0%, #0d3b66 100%)',
                                    fontSize: '1.2rem'
                                }}
                            >
                                M
                            </div>
                            <span className="h5 mb-0 fw-bold" style={{ color: '#404145' }}>MarketFlow</span>
                        </div>
                        <p className="mb-4" style={{ color: '#62646A', lineHeight: '1.7' }}>
                            The #1 marketplace for digital marketing services. Connect with top professionals and grow your business.
                        </p>
                        <div className="d-flex gap-3">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    className="d-flex align-items-center justify-content-center rounded-circle"
                                    style={{
                                        width: 40,
                                        height: 40,
                                        background: '#F7F7F7',
                                        color: '#62646A',
                                        transition: 'all 0.2s ease'
                                    }}
                                    aria-label={social.label}
                                >
                                    <social.icon size={18} />
                                </a>
                            ))}
                        </div>
                    </Col>

                    {/* Links Columns */}
                    {Object.entries(footerLinks).map(([category, links]) => (
                        <Col sm={6} lg={2} key={category}>
                            <h6 className="fw-bold mb-3" style={{ color: '#404145' }}>{category}</h6>
                            <ul className="list-unstyled">
                                {links.map((link) => (
                                    <li key={link.label} className="mb-2">
                                        <Link
                                            to={link.href}
                                            className="text-decoration-none"
                                            style={{
                                                color: '#62646A',
                                                fontSize: '0.95rem',
                                                transition: 'color 0.2s ease'
                                            }}
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </Col>
                    ))}
                </Row>

                <hr style={{ borderColor: '#E4E5E7', margin: '2rem 0' }} />

                <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
                    <p className="mb-0" style={{ color: '#95979D', fontSize: '0.9rem' }}>
                        © {new Date().getFullYear()} MarketFlow. All rights reserved.
                    </p>
                    <div className="d-flex gap-4 mt-3 mt-md-0">
                        <Link to="/terms" className="text-decoration-none" style={{ color: '#95979D', fontSize: '0.9rem' }}>
                            Terms
                        </Link>
                        <Link to="/privacy" className="text-decoration-none" style={{ color: '#95979D', fontSize: '0.9rem' }}>
                            Privacy
                        </Link>
                        <Link to="/cookies" className="text-decoration-none" style={{ color: '#95979D', fontSize: '0.9rem' }}>
                            Cookies
                        </Link>
                    </div>
                </div>
            </Container>
        </footer>
    );
}
