import { Link } from 'react-router-dom';
import { Layout } from 'components/layout/Layout';
import { Button } from 'components/ui/button';
import { toast } from 'sonner';
import { ArrowLeft, Shield, Key, Smartphone } from 'lucide-react';
import { Container, Card } from 'react-bootstrap';

export default function SettingsSecurity() {
    const handleSoon = () => {
        toast.info("This feature is coming soon!");
    };

    return (
        <Layout>
            <div className="py-5 bg-light min-vh-100">
                <Container style={{ maxWidth: '700px' }}>
                    <div className="mb-4">
                        <Link to="/client/settings" className="d-flex align-items-center text-muted text-decoration-none small mb-2 hover-text-dark">
                            <ArrowLeft size={16} className="me-2" />
                            Back to Settings
                        </Link>
                        <h1 className="h3 fw-bold text-dark">Account Security</h1>
                    </div>

                    <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                        <Card.Body className="p-4 p-md-5">
                            <div className="d-flex align-items-center gap-3 mb-5 pb-3 border-bottom">
                                <div className="p-2 bg-success bg-opacity-10 rounded text-success">
                                    <Shield size={24} />
                                </div>
                                <div>
                                    <h2 className="h5 fw-bold mb-0">Protection</h2>
                                    <p className="text-muted small mb-0">Manage password and authentication</p>
                                </div>
                            </div>

                            <div className="d-flex flex-column gap-5">
                                {/* Change Password */}
                                <div className="d-flex align-items-start gap-4">
                                    <div className="p-3 bg-light rounded-circle text-dark shadow-sm">
                                        <Key size={24} />
                                    </div>
                                    <div className="flex-grow-1">
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <div>
                                                <h3 className="h6 fw-bold mb-1">Passowrd</h3>
                                                <p className="text-muted small mb-0">Update your account access password regularly to keep it secure.</p>
                                            </div>
                                            <Button variant="outline-primary" className="rounded-pill px-4" onClick={handleSoon}>
                                                Update
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* 2FA */}
                                <div className="d-flex align-items-start gap-4">
                                    <div className="p-3 bg-light rounded-circle text-dark shadow-sm">
                                        <Smartphone size={24} />
                                    </div>
                                    <div className="flex-grow-1">
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <div>
                                                <h3 className="h6 fw-bold mb-1">Two-Factor Authentication (2FA)</h3>
                                                <p className="text-muted small mb-0">Add an extra layer of security to your account by requiring a code from your phone.</p>
                                            </div>
                                            <Button variant="outline-primary" className="rounded-pill px-4" onClick={handleSoon}>
                                                Enable
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-5 p-4 bg-light rounded-4 border-2 border-dashed text-center">
                                <p className="text-muted small mb-0">
                                    <Shield size={14} className="me-1" />
                                    Your account security is our priority. Passwords are encrypted for your safety.
                                </p>
                            </div>
                        </Card.Body>
                    </Card>
                </Container>
            </div>
            <style>{`
        .border-2 { border-width: 2px !important; }
        .border-dashed { border-style: dashed !important; }
        .rounded-4 { border-radius: 1rem !important; }
      `}</style>
        </Layout>
    );
}
