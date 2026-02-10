import { Link } from 'react-router-dom';
import { Layout } from 'components/layout/Layout';
import {
  ArrowLeft,
  User,
  Bell,
  Shield,
  ChevronRight
} from 'lucide-react';
import { Container, Row, Col, Card } from 'react-bootstrap';

export default function Settings() {
  const settingsCards = [
    {
      title: 'Personal Information',
      description: 'Manage your name and email address',
      icon: User,
      to: '/client/settings/personal',
      color: 'primary'
    },
    {
      title: 'Account Security',
      description: 'Update your password and security settings',
      icon: Shield,
      to: '/client/settings/security',
      color: 'success'
    },
    {
      title: 'Notifications',
      description: 'Manage how you receive updates and alerts',
      icon: Bell,
      to: '/client/settings/notifications',
      color: 'warning'
    }
  ];

  return (
    <Layout footerVariant="dashboard">
      <div className="py-5 bg-light min-vh-100">
        <Container style={{ maxWidth: '900px' }}>
          {/* Header */}
          <div className="mb-5">
            <Link
              to="/dashboard"
              className="d-flex align-items-center text-muted text-decoration-none small mb-2 hover-text-dark"
            >
              <ArrowLeft size={16} className="me-2" />
              Back to Dashboard
            </Link>
            <h1 className="h2 fw-bold text-dark mb-1">Account Settings</h1>
            <p className="text-muted mt-1 mb-0">
              Manage your profile, security, and communication preferences
            </p>
          </div>

          <Row className="g-4">
            {settingsCards.map((item, idx) => (
              <Col md={12} key={idx}>
                <Link to={item.to} className="text-decoration-none">
                  <Card className="border-0 shadow-sm hover-card rounded-4 transition-all">
                    <Card.Body className="p-4">
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-4">
                          <div className={`p-3 rounded-4 bg-${item.color} bg-opacity-10 text-${item.color}`}>
                            <item.icon size={28} />
                          </div>
                          <div>
                            <h2 className="h5 fw-bold text-dark mb-1">{item.title}</h2>
                            <p className="text-muted mb-0">{item.description}</p>
                          </div>
                        </div>
                        <div className="text-muted opacity-50 d-flex align-items-center gap-2">
                          <span className="small fw-semibold d-none d-sm-inline">Manage</span>
                          <ChevronRight size={20} />
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Link>
              </Col>
            ))}
          </Row>
        </Container>
      </div>
      <style>{`
        .hover-card:hover {
          transform: translateX(8px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.05) !important;
        }
        .transition-all {
          transition: all 0.25s ease-in-out;
        }
        .hover-text-dark:hover { color: #212529 !important; }
        .rounded-4 { border-radius: 1rem !important; }
      `}</style>
    </Layout>
  );
}
