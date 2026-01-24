import { Link } from 'react-router-dom';
import { Button } from 'components/ui/button';
import { useAuth } from 'contexts/AuthContext';
import { Navbar as BNavbar, Nav, Container } from 'react-bootstrap';

export default function Navbar() {
    const { isAuthenticated } = useAuth();

    const navLinks = [
        { href: '#categories', label: 'Categories' },
        { href: '#how-it-works', label: 'How It Works' },
        { href: '#pricing', label: 'Pricing' },
    ];

    return (
        <BNavbar expand="lg" className="bg-white sticky-top navbar-compact" collapseOnSelect>
            <Container className="d-flex align-items-center" style={{ height: '72px' }}>
                <BNavbar.Brand as={Link} to="/" className="d-flex align-items-center gap-2 me-4 mb-0">
                    <div
                        className="rounded-2 d-flex align-items-center justify-content-center fw-bold text-white"
                        style={{
                            width: 36,
                            height: 36,
                            background: 'linear-gradient(135deg, #0A2540 0%, #0d3b66 100%)',
                            fontSize: '1.1rem'
                        }}
                    >
                        M
                    </div>
                    <span className="fw-bold fs-5" style={{ color: '#404145', letterSpacing: '-0.5px' }}>
                        MarketFlow
                    </span>
                </BNavbar.Brand>

                <BNavbar.Toggle aria-controls="landing-navbar-nav" className="border-0 shadow-none" />

                <BNavbar.Collapse id="landing-navbar-nav">
                    <Nav className="mx-auto gap-1 d-flex align-items-center">
                        {navLinks.map((link) => (
                            <Nav.Link
                                href={link.href}
                                key={link.label}
                                className="nav-link-modern px-3 py-2"
                            >
                                {link.label}
                            </Nav.Link>
                        ))}
                    </Nav>

                    <div className="d-flex align-items-center gap-3 mt-3 mt-lg-0">
                        {isAuthenticated ? (
                            <Link to="/dashboard">
                                <Button
                                    variant="default"
                                    className="px-4 py-2"
                                    style={{
                                        background: 'linear-gradient(135deg, #0A2540 0%, #0d3b66 100%)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontWeight: 600,
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    Dashboard
                                </Button>
                            </Link>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="text-decoration-none fw-semibold d-none d-md-block"
                                    style={{ color: '#62646A', fontSize: '0.95rem' }}
                                >
                                    Sign in
                                </Link>
                                <Link to="/signup">
                                    <Button
                                        variant="default"
                                        className="px-4 py-2"
                                        style={{
                                            background: '#00B67A',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontWeight: 600,
                                            fontSize: '0.9rem',
                                            color: 'white'
                                        }}
                                    >
                                        Join Now
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                </BNavbar.Collapse>
            </Container>
            <style>{`
        .navbar-compact { 
            height: 72px;
            margin: 0 !important;
            padding: 0 !important;
            top: 0 !important;
            position: sticky !important;
            z-index: 1020;
            box-shadow: 0 1px 2px rgba(0,0,0,0.04);
            border-bottom: 1px solid #E4E5E7;
            background: white !important;
        }
        .nav-link-modern {
            border-radius: 6px;
            font-size: 0.95rem;
            color: #62646A !important;
            font-weight: 500;
            transition: all 0.2s ease;
        }
        .nav-link-modern:hover { 
            color: #404145 !important; 
            background-color: #F7F7F7;
        }
      `}</style>
        </BNavbar>
    );
}
