import { Link } from 'react-router-dom';
import { Button } from 'components/ui/button';
import { useAuth } from 'contexts/AuthContext';
import { Navbar as BNavbar, Nav, Container } from 'react-bootstrap';

export default function Navbar() {
    const { isAuthenticated } = useAuth();

    const navLinks = [
        { href: '#features', label: 'Features' },
        { href: '#how-it-works', label: 'How It Works' },
        { href: '#pricing', label: 'Pricing' },
        { href: '#testimonials', label: 'Testimonials' },
    ];

    return (
        <BNavbar expand="lg" className="bg-white sticky-top navbar-compact" collapseOnSelect>
            <Container className="d-flex align-items-center" style={{ height: '64px' }}>
                <BNavbar.Brand as={Link} to="/" className="d-flex align-items-center gap-2 me-4 mb-0">
                    <div className="bg-navy-light text-navy rounded d-flex align-items-center justify-content-center fw-bold" style={{ width: 32, height: 32 }}>
                        M
                    </div>
                    <span className="fw-bold fs-5 text-dark tracking-tight">MarketFlow</span>
                </BNavbar.Brand>

                <BNavbar.Toggle aria-controls="landing-navbar-nav" className="border-0 shadow-none" />

                <BNavbar.Collapse id="landing-navbar-nav">
                    <Nav className="mx-auto gap-lg-1 d-flex align-items-center">
                        {navLinks.map((link) => (
                            <Nav.Link
                                href={link.href}
                                key={link.label}
                                className="nav-link-pill px-3 py-2 text-secondary fw-semibold transition-all"
                            >
                                {link.label}
                            </Nav.Link>
                        ))}
                    </Nav>

                    <div className="d-flex align-items-center gap-3">
                        {isAuthenticated ? (
                            <Link to="/dashboard">
                                <Button variant="default" className="rounded-pill px-4 btn-navy btn-sm">Dashboard</Button>
                            </Link>
                        ) : (
                            <>
                                <Link to="/login" className="text-secondary text-decoration-none fw-semibold hover-navy-text small">
                                    Sign in
                                </Link>
                                <Link to="/signup">
                                    <Button variant="default" className="rounded-pill px-4 btn-navy shadow-sm btn-sm fw-bold">
                                        Get Started
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                </BNavbar.Collapse>
            </Container>
            <style>{`
        .navbar-compact { 
            height: 64px;
            margin: 0 !important;
            padding: 0 !important;
            top: 0 !important;
            position: sticky !important;
            z-index: 1020;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03);
            border-bottom: 1px solid rgba(0,0,0,0.06);
        }
        .nav-link-pill {
            border-radius: 99px;
            font-size: 0.925rem;
            color: #4b5563 !important;
        }
        .nav-link-pill:hover { 
            color: var(--navy-primary) !important; 
            background-color: var(--navy-light);
        }
        .hover-navy-text:hover {
            color: var(--navy-primary) !important;
        }
        .btn-navy {
            background-color: var(--navy-primary) !important;
            border: none !important;
            color: white !important;
            padding: 0.5rem 1.25rem !important;
            font-size: 0.875rem !important;
        }
        .btn-navy:hover {
            background-color: #0d3b66 !important;
            transform: translateY(-1px);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .tracking-tight { letter-spacing: -0.025em; }
        .transition-all { transition: all 0.2s ease-in-out; }
      `}</style>
        </BNavbar>
    );
}
