import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from 'components/ui/button';
import { Input } from 'components/ui/input';
import { Label } from 'components/ui/label';
import { useAuth } from 'contexts/AuthContext';
import { useToast } from 'hooks/use-toast';
import { Form } from 'react-bootstrap';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await login(email, password);

    if (result.success) {
      toast({
        title: 'Welcome back!',
        description: 'You have successfully logged in.',
      });
      navigate(from, { replace: true });
    } else {
      toast({
        title: 'Login failed',
        description: result.error || 'Invalid credentials',
        variant: 'destructive',
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="d-flex min-vh-100">
      {/* Left side - Form */}
      <div className="flex-grow-1 d-flex align-items-center justify-content-center p-4">
        <div className="w-100" style={{ maxWidth: '400px' }}>
          <Link to="/" className="d-flex align-items-center gap-2 mb-4 text-decoration-none">
            <div className="bg-primary text-white rounded d-flex align-items-center justify-content-center fw-bold" style={{ width: 32, height: 32 }}>
              M
            </div>
            <span className="fw-bold fs-4 text-dark">MarketFlow</span>
          </Link>

          <h1 className="h3 fw-bold text-dark mb-2">Welcome back</h1>
          <p className="text-secondary mb-4">Enter your credentials to access your account</p>

          <Form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
            <Form.Group>
              <Label htmlFor="email">Email</Label>
              <div className="position-relative">
                <div className="position-absolute top-50 start-0 translate-middle-y ps-3">
                  <Mail size={18} className="text-secondary" />
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="ps-5"
                  required
                />
              </div>
            </Form.Group>

            <Form.Group>
              <Label htmlFor="password">Password</Label>
              <div className="position-relative">
                <div className="position-absolute top-50 start-0 translate-middle-y ps-3">
                  <Lock size={18} className="text-secondary" />
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="ps-5"
                  required
                />
              </div>
            </Form.Group>

            <Button
              type="submit"
              variant="gradient"
              size="lg"
              className="w-100 mt-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="me-2 animate-spin" size={20} />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in <ArrowRight className="ms-2" size={20} />
                </>
              )}
            </Button>
          </Form>

          <p className="text-center text-secondary mt-4">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary fw-medium text-decoration-none hover-underline">
              Sign up
            </Link>
          </p>

          <div className="mt-4 p-3 bg-light rounded border">
            <p className="small text-secondary mb-1">Demo credentials:</p>
            <p className="smaller text-muted mb-0">Vendor: vendor@example.com / vendor123</p>
            <p className="smaller text-muted mb-0">Client: client@example.com / client123</p>
          </div>
        </div>
      </div>

      {/* Right side - Decorative (Hidden on mobile) */}
      <div className="d-none d-lg-flex flex-grow-1 bg-primary align-items-center justify-content-center p-5 text-white text-center">
        <div style={{ maxWidth: '400px' }}>
          <h2 className="display-6 fw-bold mb-3">Scale Your Marketing</h2>
          <p className="opacity-75">
            Access thousands of vetted marketing services and grow your business with the best agencies in the industry.
          </p>
        </div>
      </div>

      <style>{`
        .smaller { font-size: 0.75rem; }
        .hover-underline:hover { text-decoration: underline !important; }
      `}</style>
    </div>
  );
}
