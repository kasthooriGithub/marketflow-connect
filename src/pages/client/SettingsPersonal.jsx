import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from 'components/layout/Layout';
import { Button } from 'components/ui/button';
import { useAuth } from 'contexts/AuthContext';
import { clientService } from 'services/clientService';
import { toast } from 'sonner';
import { ArrowLeft, Save, User, Loader2 } from 'lucide-react';
import { Container, Card, Form, Row, Col } from 'react-bootstrap';

export default function SettingsPersonal() {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return;
            try {
                const data = await clientService.getOrCreateClientProfile(user);
                setProfile(data);
                setName(data.name || '');
            } catch (err) {
                console.error("Error fetching profile:", err);
                toast.error("Failed to load settings");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [user]);

    const handleSave = async (e) => {
        e.preventDefault();
        if (!user?.uid || saving) return;

        setSaving(true);
        try {
            await clientService.updateClientProfile(user.uid, { name });
            toast.success("Personal information updated");
        } catch (err) {
            console.error("Error updating profile:", err);
            toast.error("Update failed");
        } finally {
            setSaving(false);
        }
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

    return (
        <Layout>
            <div className="py-5 bg-light min-vh-100">
                <Container style={{ maxWidth: '700px' }}>
                    <div className="mb-4">
                        <Link to="/client/settings" className="d-flex align-items-center text-muted text-decoration-none small mb-2 hover-text-dark">
                            <ArrowLeft size={16} className="me-2" />
                            Back to Settings
                        </Link>
                        <h1 className="h3 fw-bold text-dark">Personal Information</h1>
                    </div>

                    <Card className="border-0 shadow-sm rounded-4">
                        <Card.Body className="p-4 p-md-5">
                            <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
                                <div className="p-2 bg-primary bg-opacity-10 rounded text-primary">
                                    <User size={24} />
                                </div>
                                <div>
                                    <h2 className="h5 fw-bold mb-0">Identity Details</h2>
                                    <p className="text-muted small mb-0">Update your account display name</p>
                                </div>
                            </div>

                            <Form onSubmit={handleSave}>
                                <Row className="g-4">
                                    <Col md={12}>
                                        <Form.Group>
                                            <Form.Label className="small fw-bold text-muted text-uppercase">Full Name</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                placeholder="John Doe"
                                                className="py-2 px-3 border-2 shadow-none"
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={12}>
                                        <Form.Group>
                                            <Form.Label className="small fw-bold text-muted text-uppercase">Email Address</Form.Label>
                                            <Form.Control
                                                type="email"
                                                value={profile?.email}
                                                readOnly
                                                className="py-2 px-3 border-2 bg-light cursor-not-allowed shadow-none"
                                            />
                                            <Form.Text className="text-muted">Your email address is managed by your authentication provider.</Form.Text>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <div className="mt-5 d-flex justify-content-end">
                                    <Button type="submit" disabled={saving || name === profile?.name} className="px-5 rounded-pill fw-bold">
                                        {saving ? (
                                            <><Loader2 size={18} className="me-2 animate-spin" /> Saving...</>
                                        ) : (
                                            <><Save size={18} className="me-2" /> Save Changes</>
                                        )}
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Container>
            </div>
            <style>{`
        .cursor-not-allowed { cursor: not-allowed !important; }
        .border-2 { border-width: 2px !important; }
        .rounded-4 { border-radius: 1rem !important; }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
        </Layout>
    );
}
