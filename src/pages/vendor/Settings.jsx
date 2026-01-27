import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from 'components/layout/Layout';
import { Button } from 'components/ui/button';
import { useAuth } from 'contexts/AuthContext';
import { toast } from 'sonner';
import {
  ArrowLeft,
  User,
  Bell,
  Shield,
  CreditCard,
  Save
} from 'lucide-react';
import { Container, Row, Col, Card, Form } from 'react-bootstrap';

export default function Settings() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  const [notifications, setNotifications] = useState({
    email: true,
    orders: true,
    messages: true,
    marketing: false,
  });

  const handleSaveProfile = () => {
    toast.success('Profile updated successfully!');
  };

  const handleSaveNotifications = () => {
    toast.success('Notification preferences saved!');
  };

  return (
    <Layout>
      <Container className="py-5" style={{ maxWidth: '900px' }}>
        {/* Header */}
        <div className="mb-5">
          <Link
            to="/dashboard"
            className="d-flex align-items-center text-muted text-decoration-none small mb-2 hover-text-dark"
          >
            <ArrowLeft size={16} className="me-2" />
            Back to Dashboard
          </Link>
          <h1 className="h2 fw-bold text-dark mb-1">
            Settings
          </h1>
          <p className="text-muted mt-1 mb-0">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="d-flex flex-column gap-5">
          {/* Profile Section */}
          <Card className="shadow-sm border-0 border-top border-primary border-4 rounded-4">
            <Card.Body className="p-4">
              <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
                <div className="p-2 bg-primary bg-opacity-10 rounded text-primary">
                  <User size={20} />
                </div>
                <div>
                  <h2 className="h5 fw-bold mb-0">Profile Information</h2>
                  <p className="text-muted small mb-0">Update your personal details</p>
                </div>
              </div>

              <Form>
                <Row className="g-4">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="small fw-semibold">Full Name</Form.Label>
                      <Form.Control
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        className="shadow-none"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="small fw-semibold">Email Address</Form.Label>
                      <Form.Control
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="shadow-none"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="mt-4 d-flex justify-content-end">
                  <Button onClick={handleSaveProfile} className="px-4">
                    <Save size={16} className="me-2" />
                    Save Changes
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>

          {/* Notifications Section */}
          <Card className="shadow-sm border-0 border-top border-primary border-4 rounded-4">
            <Card.Body className="p-4">
              <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
                <div className="p-2 bg-primary bg-opacity-10 rounded text-primary">
                  <Bell size={20} />
                </div>
                <div>
                  <h2 className="h5 fw-bold mb-0">Notifications</h2>
                  <p className="text-muted small mb-0">Manage how you receive updates</p>
                </div>
              </div>

              <div className="d-flex flex-column gap-1">
                {[
                  { key: 'email', label: 'Email Notifications', desc: 'Receive updates via email' },
                  { key: 'orders', label: 'Order Updates', desc: 'Get notified about order status changes' },
                  { key: 'messages', label: 'Message Alerts', desc: 'Receive notifications for new messages' },
                  { key: 'marketing', label: 'Marketing Emails', desc: 'Receive tips, updates, and offers' }
                ].map((item, idx, arr) => (
                  <div key={item.key}>
                    <div className="d-flex align-items-center justify-content-between py-3">
                      <div>
                        <p className="fw-semibold text-dark mb-0">{item.label}</p>
                        <p className="text-muted small mb-0">{item.desc}</p>
                      </div>
                      <Form.Check
                        type="switch"
                        id={`switch-${item.key}`}
                        checked={notifications[item.key]}
                        onChange={(e) => setNotifications(prev => ({ ...prev, [item.key]: e.target.checked }))}
                        className="custom-switch-lg"
                      />
                    </div>
                    {idx < arr.length - 1 && <hr className="my-0 opacity-10" />}
                  </div>
                ))}
              </div>

              <div className="mt-4 d-flex justify-content-end">
                <Button onClick={handleSaveNotifications} className="px-4">
                  <Save size={16} className="me-2" />
                  Save Preferences
                </Button>
              </div>
            </Card.Body>
          </Card>

          {/* Security Section */}
          <Card className="shadow-sm border-0 border-top border-primary border-4 rounded-4">
            <Card.Body className="p-4">
              <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
                <div className="p-2 bg-primary bg-opacity-10 rounded text-primary">
                  <Shield size={20} />
                </div>
                <div>
                  <h2 className="h5 fw-bold mb-0">Security</h2>
                  <p className="text-muted small mb-0">Manage your account security</p>
                </div>
              </div>

              <div className="d-flex flex-column gap-3">
                <div className="d-flex align-items-center justify-content-between py-2">
                  <div>
                    <p className="fw-semibold text-dark mb-0">Change Password</p>
                    <p className="text-muted small mb-0">Update your account password</p>
                  </div>
                  <Button variant="outline-primary" size="sm" className="px-4 rounded-pill">
                    Change
                  </Button>
                </div>
                <hr className="my-0 opacity-10" />
                <div className="d-flex align-items-center justify-content-between py-2">
                  <div>
                    <p className="fw-semibold text-dark mb-0">Two-Factor Authentication</p>
                    <p className="text-muted small mb-0">Add an extra layer of security</p>
                  </div>
                  <Button variant="outline-primary" size="sm" className="px-4 rounded-pill">
                    Enable
                  </Button>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Billing Section */}
          <Card className="shadow-sm border-0 border-top border-primary border-4 rounded-4">
            <Card.Body className="p-4">
              <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
                <div className="p-2 bg-primary bg-opacity-10 rounded text-primary">
                  <CreditCard size={20} />
                </div>
                <div>
                  <h2 className="h5 fw-bold mb-0">Billing & Payments</h2>
                  <p className="text-muted small mb-0">Manage your payment methods</p>
                </div>
              </div>

              <div className="text-center py-5 bg-light bg-opacity-50 rounded-4 border border-dashed">
                <div className="p-3 bg-white rounded-circle shadow-sm d-inline-block mb-3">
                  <CreditCard size={32} className="text-muted" />
                </div>
                <p className="text-muted mb-4 small fw-medium">No payment methods added yet</p>
                <Button variant="outline-primary" className="rounded-pill px-4">
                  Add Payment Method
                </Button>
              </div>
            </Card.Body>
          </Card>
        </div>
      </Container>
      <style>{`
        .hover-text-dark:hover { color: #212529 !important; }
        .custom-switch-lg .form-check-input {
            width: 3rem;
            height: 1.5rem;
            cursor: pointer;
        }
      `}</style>
    </Layout>
  );
}
