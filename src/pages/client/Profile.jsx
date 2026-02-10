import { useState, useEffect, useCallback } from 'react';
import { useAuth } from 'contexts/AuthContext';
import { clientService } from 'services/clientService';
import { Layout } from 'components/layout/Layout';
import { Container, Card, Row, Col, Image, Form, Button, Tabs, Tab, Badge, Spinner } from 'react-bootstrap';
import {
    Loader2,
    User,
    Mail,
    Phone,
    Calendar,
    CreditCard,
    Shield,
    Bell,
    Settings,
    CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        preferences: {
            order_updates: true,
            messages: true,
            payments: true
        }
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [activeTab, setActiveTab] = useState('info');

    const fetchProfile = useCallback(async () => {
        if (!user) return;
        try {
            setLoading(true);
            const data = await clientService.getOrCreateClientProfile(user);
            setProfile(data);

            // Initialize form data
            setFormData({
                name: data.name || '',
                phone: data.phone || '',
                preferences: {
                    order_updates: data.preferences?.order_updates ?? true,
                    messages: data.preferences?.messages ?? true,
                    payments: data.preferences?.payments ?? true
                }
            });
        } catch (err) {
            console.error("Error fetching profile:", err);
            toast.error("Failed to load profile");
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    // Check if form is dirty
    useEffect(() => {
        if (!profile) return;

        const hasChanges =
            formData.name !== (profile.name || '') ||
            formData.phone !== (profile.phone || '') ||
            formData.preferences.order_updates !== (profile.preferences?.order_updates ?? true) ||
            formData.preferences.messages !== (profile.preferences?.messages ?? true) ||
            formData.preferences.payments !== (profile.preferences?.payments ?? true);

        setIsDirty(hasChanges);
    }, [formData, profile]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePreferenceToggle = (key) => {
        setFormData(prev => ({
            ...prev,
            preferences: {
                ...prev.preferences,
                [key]: !prev.preferences[key]
            }
        }));
    };

    const handleSave = async (e) => {
        if (e) e.preventDefault();
        if (!user?.uid || !isDirty) return;

        setSaving(true);
        try {
            await clientService.updateClientProfile(user.uid, formData);
            setProfile(prev => ({ ...prev, ...formData }));
            toast.success("Profile updated successfully");
            setIsDirty(false);
        } catch (err) {
            console.error("Error updating profile:", err);
            toast.error("Update failed. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Layout footerVariant="dashboard">
                <div className="d-flex flex-column align-items-center justify-content-center min-vh-50 py-5">
                    <Loader2 className="animate-spin text-primary mb-3" size={48} />
                    <p className="text-muted fw-medium">Loading your profile...</p>
                </div>
            </Layout>
        );
    }

    const initials = profile?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U';

    return (
        <Layout footerVariant="dashboard">
            <div className="py-5 bg-light min-vh-100">
                <Container style={{ maxWidth: '900px' }}>

                    {/* PROFILE HEADER CARD */}
                    <Card className="border-0 shadow-sm mb-4 overflow-hidden rounded-4">
                        <div className="bg-primary bg-opacity-10 p-4" style={{ height: '100px' }}></div>
                        <Card.Body className="px-4 pt-0 mt-n4">
                            <Row className="align-items-end g-3">
                                <Col xs="auto">
                                    <div className="bg-white p-1 rounded-circle shadow-sm">
                                        <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold"
                                            style={{ width: '100px', height: '100px', fontSize: '2.5rem' }}>
                                            {initials}
                                        </div>
                                    </div>
                                </Col>
                                <Col className="pb-2">
                                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                                        <div>
                                            <h1 className="h4 fw-bold mb-1">{profile?.name || 'User'}</h1>
                                            <div className="d-flex align-items-center gap-2 text-muted small">
                                                <Mail size={14} />
                                                <span>{profile?.email}</span>
                                                <Badge bg="info" className="bg-opacity-10 text-info fw-medium rounded-pill px-3">Client</Badge>
                                            </div>
                                        </div>
                                        <Button
                                            variant="primary"
                                            className="rounded-pill px-4 fw-bold shadow-sm d-flex align-items-center gap-2"
                                            onClick={handleSave}
                                            disabled={!isDirty || saving}
                                        >
                                            {saving ? (
                                                <Spinner animation="border" size="sm" />
                                            ) : (
                                                <CheckCircle size={18} />
                                            )}
                                            Save Changes
                                        </Button>
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    {/* MAIN TABS SECTION */}
                    <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                        <Card.Body className="p-0">
                            <Tabs
                                activeKey={activeTab}
                                onSelect={(k) => setActiveTab(k)}
                                className="px-4 pt-3 border-bottom custom-tabs"
                            >
                                <Tab eventKey="info" title={<div className="d-flex align-items-center gap-2 py-2"><User size={18} /><span>Profile Info</span></div>}>
                                    <div className="p-4 p-md-5">
                                        <h5 className="fw-bold mb-4">Personal Information</h5>
                                        <Form onSubmit={handleSave}>
                                            <Row className="g-4">
                                                <Col md={6}>
                                                    <Form.Group>
                                                        <Form.Label className="small fw-bold text-muted text-uppercase">Full Name</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            name="name"
                                                            value={formData.name}
                                                            onChange={handleChange}
                                                            placeholder="Enter your full name"
                                                            className="py-2 px-3 border-2"
                                                        />
                                                        <Form.Text className="text-muted">This will be shown on your invoices and proposals.</Form.Text>
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group>
                                                        <Form.Label className="small fw-bold text-muted text-uppercase">Email Address</Form.Label>
                                                        <Form.Control
                                                            type="email"
                                                            value={profile?.email}
                                                            readOnly
                                                            className="py-2 px-3 border-2 bg-light cursor-not-allowed"
                                                        />
                                                        <Form.Text className="text-muted">Email cannot be changed.</Form.Text>
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group>
                                                        <Form.Label className="small fw-bold text-muted text-uppercase">Phone Number</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            name="phone"
                                                            value={formData.phone}
                                                            onChange={handleChange}
                                                            placeholder="+1 (555) 000-0000"
                                                            className="py-2 px-3 border-2"
                                                        />
                                                        <Form.Text className="text-muted">For order related notifications.</Form.Text>
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group>
                                                        <Form.Label className="small fw-bold text-muted text-uppercase">Joined Date</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            value={profile?.created_at?.toDate ? profile.created_at.toDate().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ''}
                                                            readOnly
                                                            className="py-2 px-3 border-2 bg-light cursor-not-allowed"
                                                        />
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                        </Form>
                                    </div>
                                </Tab>

                                <Tab eventKey="security" title={<div className="d-flex align-items-center gap-2 py-2"><Shield size={18} /><span>Security</span></div>}>
                                    <div className="p-4 p-md-5">
                                        <h5 className="fw-bold mb-4">Account Security</h5>
                                        <div className="alert alert-info border-0 shadow-sm d-flex gap-3 p-4 rounded-4 mb-4">
                                            <Shield className="text-info shrink-0" size={24} />
                                            <div>
                                                <p className="fw-bold mb-1">Your account is secured via Firebase Auth</p>
                                                <p className="small mb-0 text-muted">
                                                    Authentication and password management are handled securely through our identity provider.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="p-4 border-2 rounded-4 bg-light">
                                            <div className="d-flex justify-content-between align-items-center mb-0">
                                                <div>
                                                    <p className="fw-bold mb-0">Password Tracking</p>
                                                    <p className="small text-muted mb-0">Password resets are handled via the login page.</p>
                                                </div>
                                                <Button variant="outline-primary" size="sm" className="rounded-pill px-3" onClick={() => toast.info("Password reset link will be sent to your email next time you logout.")}>
                                                    Security Logs
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </Tab>

                                <Tab eventKey="billing" title={<div className="d-flex align-items-center gap-2 py-2"><CreditCard size={18} /><span>Billing</span></div>}>
                                    <div className="p-4 p-md-5">
                                        <h5 className="fw-bold mb-4">Billing & Payments</h5>
                                        <Row className="g-4">
                                            <Col md={7}>
                                                <Card className="border-2 rounded-4 p-4 h-100">
                                                    <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                                                        <CreditCard size={18} className="text-primary" />
                                                        Payment History
                                                    </h6>
                                                    <p className="text-muted small mb-4">View and download all your past transations and invoices.</p>
                                                    <Button
                                                        variant="primary"
                                                        className="w-100 py-2 rounded-3 fw-bold"
                                                        onClick={() => navigate('/client/payment-history')}
                                                    >
                                                        View Payment History
                                                    </Button>
                                                </Card>
                                            </Col>
                                            <Col md={5}>
                                                <Card className="border-2 border-dashed rounded-4 p-4 h-100 bg-light d-flex flex-column align-items-center justify-content-center text-center">
                                                    <div className="p-3 bg-white rounded-circle mb-3 shadow-sm text-muted">
                                                        <CreditCard size={24} />
                                                    </div>
                                                    <p className="fw-bold mb-1">Default Method</p>
                                                    <p className="text-muted small mb-0">Not set yet</p>
                                                </Card>
                                            </Col>
                                        </Row>
                                    </div>
                                </Tab>

                                <Tab eventKey="preferences" title={<div className="d-flex align-items-center gap-2 py-2"><Bell size={18} /><span>Preferences</span></div>}>
                                    <div className="p-4 p-md-5">
                                        <h5 className="fw-bold mb-4">Email & Notifications</h5>
                                        <div className="p-4 border-2 rounded-4">
                                            <div className="d-flex justify-content-between align-items-center mb-4">
                                                <div>
                                                    <p className="fw-bold mb-0">Order Updates</p>
                                                    <p className="small text-muted mb-0">Receive emails about your order status changes.</p>
                                                </div>
                                                <Form.Check
                                                    type="switch"
                                                    id="order_updates"
                                                    checked={formData.preferences.order_updates}
                                                    onChange={() => handlePreferenceToggle('order_updates')}
                                                    className="fs-4"
                                                />
                                            </div>
                                            <div className="d-flex justify-content-between align-items-center mb-4">
                                                <div>
                                                    <p className="fw-bold mb-0">Message Notifications</p>
                                                    <p className="small text-muted mb-0">Get notified when a vendor sends you a message.</p>
                                                </div>
                                                <Form.Check
                                                    type="switch"
                                                    id="messages"
                                                    checked={formData.preferences.messages}
                                                    onChange={() => handlePreferenceToggle('messages')}
                                                    className="fs-4"
                                                />
                                            </div>
                                            <div className="d-flex justify-content-between align-items-center mb-0">
                                                <div>
                                                    <p className="fw-bold mb-0">Payment Reminders</p>
                                                    <p className="small text-muted mb-0">Reminders for pending payments and new invoices.</p>
                                                </div>
                                                <Form.Check
                                                    type="switch"
                                                    id="payments"
                                                    checked={formData.preferences.payments}
                                                    onChange={() => handlePreferenceToggle('payments')}
                                                    className="fs-4"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </Tab>
                            </Tabs>
                        </Card.Body>
                    </Card>

                    <div className="mt-5 text-center text-muted small">
                        User Instance: <span className="font-monospace opacity-50">{profile?.uid}</span>
                    </div>
                </Container>
            </div>

            <style>{`
                .mt-n4 { margin-top: -1.5rem !important; }
                .mt-n5 { margin-top: -3rem !important; }
                .border-2 { border-width: 2px !important; }
                .border-dashed { border-style: dashed !important; }
                .rounded-4 { border-radius: 1rem !important; }
                .cursor-not-allowed { cursor: not-allowed !important; }
                
                .custom-tabs .nav-link {
                    border: none;
                    color: #6c757d;
                    font-weight: 600;
                    font-size: 0.9rem;
                    border-bottom: 2px solid transparent;
                    transition: all 0.2s;
                }
                
                .custom-tabs .nav-link:hover {
                    color: var(--bs-primary);
                    background: transparent;
                }
                
                .custom-tabs .nav-link.active {
                    color: var(--bs-primary) !important;
                    background: transparent !important;
                    border-bottom: 2px solid var(--bs-primary) !important;
                }
                
                .form-switch .form-check-input {
                    cursor: pointer;
                }

                .animate-spin {
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </Layout>
    );
}
