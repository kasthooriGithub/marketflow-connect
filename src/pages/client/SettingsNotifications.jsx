import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from 'components/layout/Layout';
import { Button } from 'components/ui/button';
import { useAuth } from 'contexts/AuthContext';
import { clientService } from 'services/clientService';
import { toast } from 'sonner';
import { ArrowLeft, Save, Bell, Loader2 } from 'lucide-react';
import { Container, Card, Form } from 'react-bootstrap';

export default function SettingsNotifications() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [preferences, setPreferences] = useState({
        email: true,
        orders: true,
        messages: true,
        marketing: false,
    });

    useEffect(() => {
        const fetchPrefs = async () => {
            if (!user) return;
            try {
                const data = await clientService.getOrCreateClientProfile(user);
                if (data.preferences) {
                    setPreferences({
                        email: data.preferences.email ?? true,
                        orders: data.preferences.orders ?? true,
                        messages: data.preferences.messages ?? true,
                        marketing: data.preferences.marketing ?? false,
                    });
                }
            } catch (err) {
                console.error("Error fetching preferences:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPrefs();
    }, [user]);

    const handleSave = async () => {
        if (!user?.uid || saving) return;
        setSaving(true);
        try {
            await clientService.updateClientProfile(user.uid, { preferences });
            toast.success("Notification preferences saved");
        } catch (err) {
            console.error("Error updating preferences:", err);
            toast.error("Failed to save changes");
        } finally {
            setSaving(false);
        }
    };

    const togglePref = (key) => {
        setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
    };

    if (loading) {
        return (
            <Layout>
                <div className="d-flex align-items-center justify-content-center min-vh-50">
                    <Loader2 className="animate-spin text-primary" size={48} />
                </div>
            </Layout>
        );
    }

    const notificationItems = [
        { key: 'email', label: 'General Email Notifications', desc: 'Main communication about your account' },
        { key: 'orders', label: 'Order Status Updates', desc: 'Get notified when your order status changes' },
        { key: 'messages', label: 'Message Alerts', desc: 'Notification when someone sends you a message' },
        { key: 'marketing', label: 'Marketing & Promotions', desc: 'Receive news, tips, and special offers' },
    ];

    return (
        <Layout>
            <div className="py-5 bg-light min-vh-100">
                <Container style={{ maxWidth: '700px' }}>
                    <div className="mb-4">
                        <Link to="/client/settings" className="d-flex align-items-center text-muted text-decoration-none small mb-2 hover-text-dark">
                            <ArrowLeft size={16} className="me-2" />
                            Back to Settings
                        </Link>
                        <h1 className="h3 fw-bold text-dark">Notification Settings</h1>
                    </div>

                    <Card className="border-0 shadow-sm rounded-4">
                        <Card.Body className="p-4 p-md-5">
                            <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
                                <div className="p-2 bg-warning bg-opacity-10 rounded text-warning">
                                    <Bell size={24} />
                                </div>
                                <div>
                                    <h2 className="h5 fw-bold mb-0">Communication</h2>
                                    <p className="text-muted small mb-0">Control how we contact you</p>
                                </div>
                            </div>

                            <div className="mb-4">
                                {notificationItems.map((item, idx) => (
                                    <div key={item.key} className={`py-3 d-flex align-items-center justify-content-between ${idx !== notificationItems.length - 1 ? 'border-bottom' : ''}`}>
                                        <div>
                                            <p className="fw-bold mb-0 text-dark">{item.label}</p>
                                            <p className="small text-muted mb-0">{item.desc}</p>
                                        </div>
                                        <Form.Check
                                            type="switch"
                                            id={`switch-${item.key}`}
                                            checked={preferences[item.key]}
                                            onChange={() => togglePref(item.key)}
                                            className="custom-switch-lg"
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="mt-5 d-flex justify-content-end">
                                <Button onClick={handleSave} disabled={saving} className="px-5 rounded-pill fw-bold">
                                    {saving ? (
                                        <><Loader2 size={18} className="me-2 animate-spin" /> Saving...</>
                                    ) : (
                                        <><Save size={18} className="me-2" /> Save Preferences</>
                                    )}
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Container>
            </div>
            <style>{`
        .custom-switch-lg .form-check-input {
          width: 3rem;
          height: 1.5rem;
          cursor: pointer;
        }
        .rounded-4 { border-radius: 1rem !important; }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
        </Layout>
    );
}
