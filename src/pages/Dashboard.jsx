import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from 'contexts/AuthContext';
import { Layout } from 'components/layout/Layout';
import { Button } from 'components/ui/button';
import { AddServiceModal } from 'components/vendor/AddServiceModal';
import {
  LayoutDashboard,
  ShoppingBag,
  Heart,
  MessageSquare,
  Settings,
  Plus,
  Package,
  TrendingUp,
  Users,
  DollarSign,
  Briefcase
} from 'lucide-react';
import { Container, Row, Col, Card } from 'react-bootstrap';

export default function Dashboard() {
  const { user } = useAuth();
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);

  const clientStats = [
    { label: 'Active Orders', value: '3', icon: ShoppingBag },
    { label: 'Saved Services', value: '12', icon: Heart },
    { label: 'Messages', value: '5', icon: MessageSquare },
  ];

  const vendorStats = [
    { label: 'Active Services', value: '8', icon: Package },
    { label: 'Total Orders', value: '47', icon: ShoppingBag },
    { label: 'Revenue', value: '$12,450', icon: DollarSign },
    { label: 'Profile Views', value: '1,234', icon: TrendingUp },
  ];

  const stats = user?.role === 'vendor' ? vendorStats : clientStats;

  const vendorQuickLinks = [
    { to: '/my-services', label: 'My Services', icon: Briefcase },
    { to: '/orders', label: 'Orders', icon: ShoppingBag },
    { to: '/messages', label: 'Messages', icon: MessageSquare },
    { to: '/earnings', label: 'Earnings', icon: DollarSign },
    { to: '/settings', label: 'Settings', icon: Settings },
    { to: '/vendor/profile', label: 'My Profile', icon: Users },
  ];

  const clientQuickLinks = [
    { to: '/services', label: 'Browse Services', icon: LayoutDashboard },
    { to: '/orders', label: 'My Orders', icon: ShoppingBag },
    { to: '/messages', label: 'Messages', icon: MessageSquare },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const quickLinks = user?.role === 'vendor' ? vendorQuickLinks : clientQuickLinks;

  return (
    <Layout>
      <div className="py-5">
        <Container>
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4">
            <div>
              <h1 className="h3 fw-bold text-dark mb-2">
                Welcome back, {user?.name}!
              </h1>
              <p className="text-secondary">
                {user?.role === 'vendor'
                  ? 'Manage your services and track your performance'
                  : 'Manage your orders and discover new services'}
              </p>
            </div>
            {user?.role === 'vendor' && (
              <Button variant="default" className="mt-3 mt-md-0 d-flex align-items-center" onClick={() => setIsAddServiceOpen(true)}>
                <Plus size={16} className="me-2" />
                Add New Service
              </Button>
            )}
          </div>

          <Row className="mb-4 g-3">
            {stats.map((stat) => (
              <Col md={user?.role === 'vendor' ? 3 : 4} key={stat.label}>
                <Card className="h-100 border p-3">
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <p className="small text-muted mb-1">{stat.label}</p>
                      <p className="h4 fw-bold text-dark mb-0">{stat.value}</p>
                    </div>
                    <div className="p-3 rounded bg-primary bg-opacity-10 d-flex align-items-center justify-content-center">
                      <stat.icon size={24} className="text-primary" />
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          <Row className="g-4">
            <Col md={6}>
              <Card className="h-100 border">
                <Card.Body className="p-4">
                  <h2 className="h5 fw-bold mb-4">Recent Activity</h2>
                  <div className="d-flex flex-column gap-3">
                    <div className="d-flex align-items-center gap-3 p-3 rounded bg-light">
                      <div className="rounded-circle bg-warning bg-opacity-25 p-2 d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
                        <ShoppingBag size={20} className="text-warning" />
                      </div>
                      <div className="flex-grow-1">
                        <p className="small fw-bold text-dark mb-0">New order received</p>
                        <p className="small text-muted mb-0">SEO Audit Package • 2 hours ago</p>
                      </div>
                    </div>
                    <div className="d-flex align-items-center gap-3 p-3 rounded bg-light">
                      <div className="rounded-circle bg-primary bg-opacity-25 p-2 d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
                        <MessageSquare size={20} className="text-primary" />
                      </div>
                      <div className="flex-grow-1">
                        <p className="small fw-bold text-dark mb-0">New message</p>
                        <p className="small text-muted mb-0">From SearchPro Digital • 5 hours ago</p>
                      </div>
                    </div>
                    <div className="d-flex align-items-center gap-3 p-3 rounded bg-light">
                      <div className="rounded-circle bg-success bg-opacity-25 p-2 d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
                        <TrendingUp size={20} className="text-success" />
                      </div>
                      <div className="flex-grow-1">
                        <p className="small fw-bold text-dark mb-0">Order completed</p>
                        <p className="small text-muted mb-0">Social Media Package • Yesterday</p>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6}>
              <Card className="h-100 border">
                <Card.Body className="p-4">
                  <h2 className="h5 fw-bold mb-4">Quick Links</h2>
                  <Row className="g-3">
                    {quickLinks.map((link) => (
                      <Col xs={6} key={link.to}>
                        <Link
                          to={link.to}
                          className="d-flex align-items-center gap-3 p-3 rounded bg-light text-decoration-none hover-bg-gray transition-colors h-100"
                        >
                          <link.icon size={20} className="text-primary" />
                          <span className="small fw-medium text-dark">{link.label}</span>
                        </Link>
                      </Col>
                    ))}
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      {user?.role === 'vendor' && (
        <AddServiceModal
          open={isAddServiceOpen}
          onOpenChange={setIsAddServiceOpen}
        />
      )}
      <style>{`
        .hover-bg-gray:hover { background-color: #e9ecef !important; }
      `}</style>
    </Layout>
  );
}
