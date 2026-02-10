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

  ChevronRight,
  Star,
  DollarSign
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

  // Common Sidebar Content
  const SidebarContent = () => (
    <div className="d-flex flex-column h-100 bg-white border-end shadow-sm">
      {/* Logo Section */}
      <div className="p-4 border-bottom bg-light bg-opacity-10">
        <Link to="/admin/dashboard" className="d-flex align-items-center gap-2 text-decoration-none">
          <div className="bg-primary text-white rounded d-flex align-items-center justify-content-center fw-bold shadow-sm" style={{ width: 32, height: 32 }}>
            M
          </div>
          <div>
            <span className="fw-bold text-dark d-block" style={{ fontSize: '1.1rem' }}>MarketFlow</span>
            <span className="small text-muted fw-medium">Admin Panel</span>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <Nav className="flex-column flex-grow-1 p-3 gap-2 mt-2">
        {[
          { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { href: '/admin/users', label: 'Users', icon: Users },
          { href: '/admin/vendors', label: 'Vendors', icon: Building2 },
          { href: '/admin/services', label: 'Services', icon: Package },
          { href: '/admin/reviews', label: 'Platform Reviews', icon: Star },
          { href: '/admin/revenue', label: 'Revenue', icon: DollarSign },
          { href: '/admin/settings', label: 'Settings', icon: Settings },
        ].map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Nav.Link
              as={Link}
              key={item.href}
              to={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`d-flex align-items-center gap-3 px-3 py-2 rounded-3 transition-all ${isActive
                ? 'bg-primary text-white shadow-sm'
                : 'text-secondary hover-bg-light fw-medium'
                }`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Nav.Link>
          );
        })}
      </Nav>

      {/* Logout Footer */}
      <div className="p-3 border-top bg-light bg-opacity-20">
        <Button
          variant="ghost"
          className="w-100 d-flex justify-content-start gap-3 text-danger hover-bg-danger-light border-0 py-2"
          onClick={handleLogout}
        >
          <LogOut size={20} />
          <span className="fw-bold">Logout</span>
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-vh-100 bg-light d-flex flex-column flex-lg-row">

      {/* 📱 Mobile Header (Hidden on Desktop) */}
      <div className="d-lg-none d-flex align-items-center justify-content-between p-3 border-bottom bg-white sticky-top shadow-sm">
        <div className="d-flex align-items-center gap-2">
          <div className="bg-primary text-white rounded d-flex align-items-center justify-content-center fw-bold" style={{ width: 32, height: 32 }}>
            M
          </div>
          <span className="fw-bold text-dark">Admin</span>
        </div>
        <button className="btn btn-light shadow-sm border" onClick={() => setSidebarOpen(true)}>
          <Menu size={24} className="text-dark" />
        </button>
      </div>

      {/* 💻 Desktop Sidebar (Hidden on Mobile) */}
      <aside className="d-none d-lg-block sticky-top" style={{ width: 280, height: '100vh' }}>
        <SidebarContent />
      </aside>

      {/* 📱 Mobile Sidebar Offcanvas */}
      <Offcanvas
        show={sidebarOpen}
        onHide={() => setSidebarOpen(false)}
        placement="start"
        className="d-lg-none" // This is important: hide on desktop
        style={{ width: 280 }}
      >
        <Offcanvas.Body className="p-0">
          <SidebarContent />
        </Offcanvas.Body>
      </Offcanvas>

      {/* 📄 Main Content Area */}
      <main className="flex-grow-1 overflow-hidden">
        <div className="p-4 p-lg-5">
          <Container fluid>
            {/* Breadcrumbs */}
            <div className="d-flex align-items-center gap-2 small text-muted mb-3 fw-medium">
              <Link to="/admin/dashboard" className="text-decoration-none text-muted hover-text-primary">Admin</Link>
              <ChevronRight size={14} />
              <span className="text-dark opacity-75">{title}</span>
            </div>

            {/* Title Section */}
            <div className="mb-4">
              <h1 className="h2 fw-bold text-dark mb-1" style={{ letterSpacing: '-0.5px' }}>{title}</h1>
              <p className="text-muted small">Manage your marketplace {title.toLowerCase()} from here.</p>
            </div>

            {/* Page Content */}
            <div className="fade-in">
              {children}
            </div>
          </Container>
        </div>
      </main>

      <style>{`
        .hover-bg-light:hover { background-color: #f8f9fa; color: #0d6efd !important; }
        .hover-bg-danger-light:hover { background-color: #fff5f5; color: #dc3545 !important; }
        .transition-all { transition: all 0.2s ease-in-out; }
        .fade-in { animation: fadeIn 0.4s ease-in; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}