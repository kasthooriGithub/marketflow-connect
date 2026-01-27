import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await login(email, password);

    if (result.success) {
      navigate('/dashboard', { replace: true });
    } else {
      toast({
        title: 'Login failed',
        description: result.message || 'Please try again.',
        variant: 'destructive',
      });
    }

    setIsLoading(false);
  };

  return (
    // ✅ Full screen lock + no body scroll
    <div className="d-flex vh-100 overflow-hidden">
      {/* Left side - Form (scroll inside only if needed) */}
      <div className="flex-grow-1 h-100 overflow-auto p-4 d-flex align-items-center justify-content-center" style={{ minHeight: 0 }}>
  <div className="w-100" style={{ maxWidth: '400px' }}>

          <Link to="/" className="d-flex align-items-center gap-2 mb-4 text-decoration-none">
            <div
              className="bg-primary text-white rounded d-flex align-items-center justify-content-center fw-bold"
              style={{ width: 32, height: 32 }}
            >
              M
            </div>
            <span className="fw-bold fs-4 text-dark">MarketFlow</span>
          </Link>

          <h1 className="h3 fw-bold text-dark mb-2">Welcome back</h1>
          <p className="text-secondary mb-4">Please login to continue to your dashboard</p>

          <Form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
            <Form.Group>
              <Label className="mb-2">Email</Label>
              <div className="position-relative">
                <Mail className="position-absolute top-50 translate-middle-y text-secondary" style={{ left: 12 }} size={16} />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="ps-5"
                  required
                />
              </div>
            </Form.Group>

            <Form.Group>
              <Label className="mb-2">Password</Label>
              <div className="position-relative">
                <Lock className="position-absolute top-50 translate-middle-y text-secondary" style={{ left: 12 }} size={16} />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="ps-5"
                  required
                />
              </div>
            </Form.Group>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-100 mt-2 fw-bold"
              style={{ background: '#0A2540', borderRadius: '10px', padding: '12px 16px' }}
            >
              {isLoading ? (
                <span className="d-inline-flex align-items-center gap-2">
                  <Loader2 size={18} className="spin" /> Logging in...
                </span>
              ) : (
                <span className="d-inline-flex align-items-center justify-content-center gap-2">
                  Login <ArrowRight size={18} />
                </span>
              )}
            </Button>

            <div className="text-center mt-2">
              <span className="text-secondary">Don’t have an account? </span>
              <Link to="/signup" className="fw-semibold text-decoration-none">
                Sign up
              </Link>
            </div>
          </Form>
        </div>
      </div>

      {/* Right side - Decorative (Hidden on mobile) */}
      <div className="d-none d-lg-flex flex-grow-1 bg-primary align-items-center justify-content-center p-5 text-white text-center h-100">
        <div style={{ maxWidth: '420px' }}>
          <h2 className="display-6 fw-bold text-white mb-3">Welcome to MarketFlow</h2>
          <p className="text-white opacity-75">
            Find the right marketing services and manage your projects easily with one platform.
          </p>
        </div>
      </div>

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
