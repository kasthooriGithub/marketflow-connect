import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, ShoppingCart, MessageSquare } from 'lucide-react';
import { Button } from 'components/ui/button';
import { useAuth } from 'contexts/AuthContext';
import { useCart } from 'contexts/CartContext';
import { useMessaging } from 'contexts/MessagingContext';
import { Navbar as BNavbar, Nav, Container, NavDropdown } from 'react-bootstrap';

export function Navbar() {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const { getUnreadCount } = useMessaging();
  const unreadCount = getUnreadCount();
  const isHomePage = location.pathname === '/';

  const clientLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/services', label: 'Browse Services' },
    { href: '/orders', label: 'My Orders' },
  ];

  const vendorLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/my-services', label: 'My Services' },
    { href: '/orders', label: 'Orders' },
    { href: '/vendor/guide', label: 'Vendor Guide' },
  ];

  const guestLinks = isHomePage ? [
    { href: '#features', label: 'Features' },
    { href: '#categories', label: 'Categories' },
    { href: '#how-it-works', label: 'How It Works' },
    { href: '#pricing', label: 'Pricing' },
  ] : [
    { href: '/', label: 'Home' },
    { href: '/how-it-works', label: 'How It Works' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/services', label: 'Services' },
  ];

  let navLinks = guestLinks;
  if (isAuthenticated) {
    navLinks = user?.role === 'vendor' ? vendorLinks : clientLinks;
  }

  const isActive = (path) => location.pathname === path;

  return (
    <BNavbar expand="md" className="bg-white border-bottom sticky-top shadow-sm py-2" collapseOnSelect style={{ zIndex: 1050 }}>
      <Container>
        <BNavbar.Brand as={Link} to="/" className="d-flex align-items-center gap-2">
          <div
            className="rounded-2 d-flex align-items-center justify-content-center fw-bold text-white"
            style={{
              width: 32,
              height: 32,
              background: 'linear-gradient(135deg, #0A2540 0%, #0d3b66 100%)',
              fontSize: '1rem'
            }}
          >
            M
          </div>
          <span className="fw-bold text-dark" style={{ letterSpacing: '-0.5px' }}>MarketFlow</span>
        </BNavbar.Brand>

        <BNavbar.Toggle aria-controls="basic-navbar-nav" className="border-0 shadow-none" />

        <BNavbar.Collapse id="basic-navbar-nav">
          <Nav className="mx-auto gap-1">
            {navLinks.map((link) => (
              <Nav.Link
                as={isHomePage ? 'a' : Link}
                to={isHomePage ? undefined : link.href}
                href={isHomePage ? link.href : undefined}
                key={link.label}
                active={!isHomePage && isActive(link.href)}
                className={`px-3 py-2 fw-medium ${(!isHomePage && isActive(link.href)) ? "text-primary" : "text-secondary"
                  } nav-link-hover`}
                style={{ fontSize: '0.95rem' }}
              >
                {link.label}
              </Nav.Link>
            ))}
          </Nav>

          <div className="d-flex align-items-center gap-3 mt-3 mt-md-0">

            {/* Cart Icon */}
            {isAuthenticated && user?.role === 'client' && (
              <Link to="/cart" className="position-relative text-secondary hover-primary">
                <ShoppingCart size={20} />
                {itemCount > 0 && (
                  <span
                    className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary"
                    style={{
                      fontSize: '0.65rem',
                      padding: '0.25em 0.4em',
                      minWidth: '1.2rem',
                      transform: 'translate(-20%, -30%)',
                      zIndex: 2
                    }}
                  >
                    {itemCount}
                  </span>
                )}
              </Link>
            )}

            {/* Messages Icon */}
            {isAuthenticated && (
              <Link to="/messages" className="position-relative text-secondary hover-primary">
                <MessageSquare size={20} />
                {unreadCount > 0 && (
                  <span
                    className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                    style={{
                      fontSize: '0.6rem',
                      padding: '0.25em 0.4em',
                      minWidth: '1.2rem',
                      transform: 'translate(-20%, -30%)'
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </Link>
            )}

            {isAuthenticated ? (
              <NavDropdown
                title={
                  <span className="d-inline-flex align-items-center gap-2">
                    <div className="bg-light rounded-circle d-flex align-items-center justify-content-center" style={{ width: 32, height: 32 }}>
                      <User size={16} className="text-primary" />
                    </div>
                    <span className="d-none d-lg-inline">{user?.name}</span>
                  </span>
                }
                id="user-nav-dropdown"
                align="end"
                className="user-dropdown"
              >
                <NavDropdown.Item as={Link} to="/dashboard">Dashboard</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/orders">Orders</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/messages">Messages</NavDropdown.Item>
                {user?.role === 'vendor' && (
                  <NavDropdown.Item as={Link} to="/vendor/profile">Vendor Profile</NavDropdown.Item>
                )}
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={logout} className="text-danger">Logout</NavDropdown.Item>
              </NavDropdown>
            ) : (
              <div className="d-flex align-items-center gap-3">
                <Link
                  to="/login"
                  className="text-decoration-none fw-semibold text-secondary small"
                >
                  Log in
                </Link>
                <Link to="/signup">
                  <Button
                    variant="default"
                    size="sm"
                    className="px-4 fw-bold"
                    style={{
                      background: '#00B67A',
                      borderRadius: '8px'
                    }}
                  >
                    Join Now
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </BNavbar.Collapse>
      </Container>
      <style>{`
        .nav-link-hover {
          transition: all 0.2s ease;
          border-radius: 6px;
        }
        .nav-link-hover:hover {
          background-color: #f8f9fa;
          color: #0A2540 !important;
        }
        .hover-primary:hover {
          color: #0A2540 !important;
        }
        .user-dropdown .dropdown-toggle::after {
          display: none;
        }
      `}</style>
    </BNavbar>
  );
}
