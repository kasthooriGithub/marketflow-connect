import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ShieldCheck, Loader2 } from 'lucide-react';
import { Button } from 'components/ui/button';
import { useAuth } from 'contexts/AuthContext';
import { toast } from 'sonner';
import { Container, Card, Form, InputGroup } from 'react-bootstrap';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { adminLogin } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await adminLogin(email, password);

    if (result.success) {
      toast.success('Welcome back, Admin!');
      navigate('/admin/dashboard', { replace: true });
    } else {
      toast.error(result.error || 'Invalid admin credentials');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-dark p-4">
      <Container style={{ maxWidth: '420px' }}>
        <Card className="border-0 shadow-lg rounded-4 overflow-hidden">
          <div className="bg-primary py-4 text-center">
            <div className="d-inline-flex align-items-center justify-content-center bg-white bg-opacity-20 rounded-circle mb-2" style={{ width: 64, height: 64 }}>
              <ShieldCheck size={32} className="text-white" />
            </div>
            <h1 className="h4 fw-bold text-white mb-0">Admin Access</h1>
          </div>

          <Card.Body className="p-4 p-md-5">
            <p className="text-center text-muted small mb-4">
              Secure login for MarketFlow administrators. Unauthorized access is prohibited.
            </p>

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold text-secondary">Email Address</Form.Label>
                <InputGroup className="shadow-sm">
                  <InputGroup.Text className="bg-light border-end-0">
                    <Mail size={18} className="text-muted" />
                  </InputGroup.Text>
                  <Form.Control
                    type="email"
                    placeholder="admin@marketflow.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-light border-start-0 ps-0"
                    required
                  />
                </InputGroup>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="small fw-bold text-secondary">Password</Form.Label>
                <InputGroup className="shadow-sm">
                  <InputGroup.Text className="bg-light border-end-0">
                    <Lock size={18} className="text-muted" />
                  </InputGroup.Text>
                  <Form.Control
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-light border-start-0 ps-0"
                    required
                  />
                </InputGroup>
              </Form.Group>

              <Button
                type="submit"
                variant="default"
                size="lg"
                className="w-100 py-3 shadow border-0"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="d-flex align-items-center justify-content-center gap-2">
                    <Loader2 size={18} className="animate-spin" />
                    <span>Verifying...</span>
                  </div>
                ) : (
                  'Access Admin Panel'
                )}
              </Button>
            </Form>

            <div className="mt-5 pt-4 border-top text-center">
              <div className="p-3 bg-light rounded-3 mb-4 text-start">
                <p className="extra-small fw-bold text-uppercase text-muted mb-2 tracking-wider">Demo Access</p>
                <code className="small text-primary">admin@marketflow.com</code><br />
                <code className="small text-primary">admin123</code>
              </div>

              <Link to="/" className="text-decoration-none small text-muted hover-text-primary transition-all">
                ← Return to main site
              </Link>
            </div>
          </Card.Body>
        </Card>
      </Container>
      <style>{`
        .extra-small { font-size: 0.65rem; }
        .hover-text-primary:hover { color: var(--bs-primary) !important; text-decoration: underline !important; }
      `}</style>
    </div>
  );
}
