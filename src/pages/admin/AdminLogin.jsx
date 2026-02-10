import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import { Container, Card, Form, InputGroup, Button, Alert } from 'react-bootstrap'; 
import { useAuth } from 'contexts/AuthContext';
import { toast } from 'sonner';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(''); 
  
  const navigate = useNavigate();
  const { adminLogin } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(''); // Reset error message on new attempt

    const result = await adminLogin(email, password);

    if (result.success) {
      toast.success('Welcome back, Admin!');
      navigate('/admin/dashboard', { replace: true });
    } else {
      // Set the simple error message from AuthContext
      setErrorMsg(result.error);
      toast.error(result.error);
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
            {/* 🔥 Simple Error Alert Box */}
            {errorMsg && (
              <Alert variant="danger" className="d-flex align-items-center gap-2 py-2 small border-0 shadow-sm">
                <AlertCircle size={18} />
                <span>{errorMsg}</span>
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold text-secondary text-uppercase">Email Address</Form.Label>
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
                <Form.Label className="small fw-bold text-secondary text-uppercase">Password</Form.Label>
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
                variant="primary"
                size="lg"
                className="w-100 py-3 fw-bold shadow border-0"
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

            <div className="mt-4 text-center">
              <Link to="/" className="text-decoration-none text-muted small hover-primary">
                &larr; Back to Landing Page
              </Link>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}