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

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/how-it-works', label: 'How It Works' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/services', label: 'Services' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <BNavbar expand="md" className="bg-white border-bottom sticky-top shadow-sm" collapseOnSelect>
      <Container>
        <BNavbar.Brand as={Link} to="/" className="d-flex align-items-center gap-2">
          <div className="bg-primary text-white rounded p-1 d-flex align-items-center justify-content-center" style={{ width: 32, height: 32 }}>
            <span className="fw-bold">M</span>
          </div>
          <span className="fw-bold text-dark">MarketFlow</span>
        </BNavbar.Brand>

        <BNavbar.Toggle aria-controls="basic-navbar-nav" />

        <BNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {navLinks.map((link) => (
              <Nav.Link
                as={Link}
                to={link.href}
                key={link.href}
                active={isActive(link.href)}
                className={isActive(link.href) ? "text-primary fw-medium" : "text-secondary"}
              >
                {link.label}
              </Nav.Link>
            ))}
          </Nav>

          <div className="d-flex align-items-center gap-2 mt-3 mt-md-0">
            {/* Cart Icon */}
            <Link to="/cart" className="position-relative btn btn-link text-decoration-none">
              <ShoppingCart className="w-5 h-5 text-secondary" style={{ width: 20, height: 20 }} />
              {itemCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Messages Icon */}
            {isAuthenticated && (
              <Link to="/messages" className="position-relative btn btn-link text-decoration-none">
                <MessageSquare className="w-5 h-5 text-secondary" style={{ width: 20, height: 20 }} />
                {unreadCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
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
                    {user?.name}
                  </span>
                }
                id="user-nav-dropdown"
                align="end"
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
              <div className="d-flex gap-2">
                <Link to="/login">
                  <Button variant="ghost">Log in</Button>
                </Link>
                <Link to="/signup">
                  <Button variant="default">Get Started</Button>
                </Link>
              </div>
            )}
          </div>
        </BNavbar.Collapse>
      </Container>
    </BNavbar>
  );
}
