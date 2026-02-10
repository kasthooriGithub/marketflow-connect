import { Link, useLocation } from 'react-router-dom';
import { User, ShoppingCart, MessageSquare } from 'lucide-react';
import { Button } from 'components/ui/button';
import { useAuth } from 'contexts/AuthContext';
import { useCart } from 'contexts/CartContext';
import { useMessaging } from 'contexts/MessagingContext';
import { NotificationBell } from 'components/layout/NotificationBell';
import { Navbar as BNavbar, Nav, Container, NavDropdown } from 'react-bootstrap';

export function Navbar() {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const { unreadCount = 0 } = useMessaging();

  const isHomePage = location.pathname === '/';
  const role = user?.role;

  // ✅ Role based paths (match App.jsx)
  const paths = {
    client: {
      dashboard: '/client/dashboard',
      orders: '/client/orders',
      messages: '/client/messages',
      profile: '/client/profile',
      settings: '/client/settings',
      saved: '/client/saved-services',
      paymentHistory: '/client/payment-history',
    },
    vendor: {
      dashboard: '/vendor/dashboard',
      orders: '/vendor/orders',
      messages: '/vendor/messages',
      profile: '/vendor/profile',
      settings: '/vendor/settings',
      myServices: '/my-services',
      guide: '/vendor/guide',
    }
  };

  const activePaths = role === 'vendor' ? paths.vendor : paths.client;

  const clientLinks = [
    { href: paths.client.dashboard, label: 'Dashboard' },
    { href: '/services', label: 'Browse Services' },
    { href: paths.client.orders, label: 'My Orders' },
  ];

  const vendorLinks = [
    { href: paths.vendor.dashboard, label: 'Dashboard' },
    { href: paths.vendor.myServices, label: 'My Services' },
    { href: paths.vendor.orders, label: 'Orders' },
    { href: paths.vendor.guide, label: 'Vendor Guide' },
  ];

  const guestLinks = isHomePage ? [
    { href: '#categories', label: 'Categories' },
    { href: '#features', label: 'Features' },
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
    navLinks = role === 'vendor' ? vendorLinks : clientLinks;
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
            {navLinks.map((link) => {
              const active = !isHomePage && isActive(link.href);

              return (
                <Nav.Link
                  as={isHomePage ? 'a' : Link}
                  to={isHomePage ? undefined : link.href}
                  href={isHomePage ? link.href : undefined}
                  key={link.label}
                  className={`px-3 py-2 fw-medium nav-link-hover ${active ? "nav-active" : "text-secondary"}`}
                  style={{ fontSize: '0.95rem' }}
                >
                  {link.label}
                </Nav.Link>
              );
            })}
          </Nav>

          <div className="d-flex align-items-center gap-3 mt-3 mt-md-0">

            {/* ✅ Cart icon client only */}
            {isAuthenticated && role === 'client' && (
              <Link to="/cart" className="position-relative text-secondary hover-primary" title="Cart" aria-label="Cart">
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

            {/* ✅ Notification Bell (New) */}
            {isAuthenticated && (
              <NotificationBell />
            )}

            {/* ✅ Messages icon role-based */}
            {isAuthenticated && (
              <Link
                to={activePaths.messages}
                className="position-relative text-secondary hover-primary"
                style={{ display: "inline-flex", alignItems: "center" }}
                title="Messages"
                aria-label="Messages"
              >
                <MessageSquare size={20} />
                {Number(unreadCount) > 0 && (
                  <span
                    className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary"
                    style={{
                      fontSize: "0.65rem",
                      padding: "0.25em 0.4em",
                      minWidth: "1.2rem",
                      transform: "translate(-20%, -30%)",
                      zIndex: 2
                    }}
                  >
                    {unreadCount > 99 ? "99+" : unreadCount}
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
                {/* ✅ Profile & Settings role-based */}
                <NavDropdown.Item as={Link} to={activePaths.profile}>Profile</NavDropdown.Item>
                <NavDropdown.Item as={Link} to={activePaths.settings}>Settings</NavDropdown.Item>

                {/* ✅ Client-only menu */}
                {role === 'client' && (
                  <>
                    <NavDropdown.Item as={Link} to={paths.client.paymentHistory}>Payment History</NavDropdown.Item>
                    <NavDropdown.Item as={Link} to={paths.client.saved}>Saved Services</NavDropdown.Item>
                  </>
                )}

                <NavDropdown.Divider />

                {/* ✅ Orders & Messages role-based */}
                <NavDropdown.Item as={Link} to={activePaths.orders}>Orders</NavDropdown.Item>
                <NavDropdown.Item as={Link} to={activePaths.messages}>Messages</NavDropdown.Item>

                <NavDropdown.Divider />
                <NavDropdown.Item onClick={logout} className="text-danger">Logout</NavDropdown.Item>
              </NavDropdown>
            ) : (
              <div className="d-flex align-items-center gap-3">
                <Link to="/login">
                  <Button variant="outline-secondary" size="sm" className="fw-semibold px-3">
                    Log in
                  </Button>
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
          border-radius: 10px;
        }
        .nav-link-hover:hover {
          background-color: #f8f9fa;
          color: #0A2540 !important;
        }
        .nav-active {
          color: #0A2540 !important;
          background: rgba(13,110,253,0.08);
          box-shadow: inset 0 -2px 0 rgba(13,110,253,0.9);
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
