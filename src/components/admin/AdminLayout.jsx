import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2,
  Package,
  Settings,
  LogOut,
  Menu,
  ChevronRight
} from 'lucide-react';
import { Button } from 'components/ui/button';
import { useAuth } from 'contexts/AuthContext';
import { Container, Offcanvas, Nav } from 'react-bootstrap';

export function AdminLayout({ children, title }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const SidebarContent = () => (
    <div className="d-flex flex-column h-100 bg-light border-end">
      {/* Logo */}
      <div className="p-4 border-bottom">
        <Link to="/admin/dashboard" className="d-flex align-items-center gap-2 text-decoration-none">
          <div className="bg-primary text-white rounded d-flex align-items-center justify-content-center fw-bold" style={{ width: 32, height: 32 }}>
            M
          </div>
          <div>
            <span className="fw-bold text-dark d-block">MarketFlow</span>
            <span className="small text-muted">Admin Panel</span>
          </div>
        </Link>
      </div>

      {/* Nav Items */}
      <Nav className="flex-column flex-grow-1 p-3 gap-1">
        {[
          { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { href: '/admin/users', label: 'Users', icon: Users },
          { href: '/admin/vendors', label: 'Vendors', icon: Building2 },
          { href: '/admin/services', label: 'Services', icon: Package },
          { href: '/admin/settings', label: 'Settings', icon: Settings },
        ].map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Nav.Link
              as={Link}
              key={item.href}
              to={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`d-flex align-items-center gap-3 px-3 py-2 rounded ${isActive
                ? 'bg-primary text-white'
                : 'text-secondary hover-bg-light'
                }`}
            >
              <item.icon size={20} />
              <span className="fw-medium">{item.label}</span>
            </Nav.Link>
          );
        })}
      </Nav>

      {/* Logout */}
      <div className="p-3 border-top">
        <Button variant="ghost" className="w-100 d-flex justify-content-start gap-3 text-secondary" onClick={handleLogout}>
          <LogOut size={20} />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-vh-100 bg-white">
      {/* Mobile Header */}
      <div className="d-lg-none d-flex align-items-center justify-content-between p-3 border-bottom bg-white">
        <div className="d-flex align-items-center gap-2">
          <div className="bg-primary text-white rounded d-flex align-items-center justify-content-center fw-bold" style={{ width: 32, height: 32 }}>
            M
          </div>
          <span className="fw-bold">Admin</span>
        </div>
        <button className="btn btn-link p-0 text-dark" onClick={() => setSidebarOpen(true)}>
          <Menu size={24} />
        </button>
      </div>

      <div className="d-flex">
        {/* Desktop Sidebar */}
        <div className="d-none d-lg-block" style={{ width: 280, minHeight: '100vh' }}>
          <SidebarContent />
        </div>

        {/* Mobile Sidebar */}
        <Offcanvas show={sidebarOpen} onHide={() => setSidebarOpen(false)} responsive="lg">
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>Admin Menu</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body className="p-0">
            <SidebarContent />
          </Offcanvas.Body>
        </Offcanvas>

        {/* Main Content */}
        <main className="flex-grow-1 p-4 bg-light">
          <Container fluid>
            <div className="d-flex align-items-center gap-2 small text-muted mb-3">
              <Link to="/admin/dashboard" className="text-decoration-none text-muted hover-text-dark">Admin</Link>
              <ChevronRight size={16} />
              <span className="text-dark">{title}</span>
            </div>
            <h1 className="h3 fw-bold text-dark mb-4">{title}</h1>
            {children}
          </Container>
        </main>
      </div>
    </div>
  );
}
