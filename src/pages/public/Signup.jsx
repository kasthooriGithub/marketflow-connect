import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Building2, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from 'components/ui/button';
import { Input } from 'components/ui/input';
import { Label } from 'components/ui/label';
import { useAuth } from 'contexts/AuthContext';
import { useToast } from 'hooks/use-toast';
import { Form } from 'react-bootstrap';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('client');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signup } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await signup(email, password, name, role);

    if (result.success) {
      toast({
        title: 'Account created!',
        description: 'Welcome to MarketFlow.',
      });
      navigate('/dashboard', { replace: true });
    } else {
      toast({
        title: 'Signup failed',
        description: result.message || 'Please try again.',
        variant: 'destructive',
      });
    }

    setIsLoading(false);
  };

  return (
    // ✅ Full screen lock + no body scroll
    <div className="d-flex vh-100 overflow-hidden">
      {/* Left side - Decorative (Hidden on mobile) */}
      <div className="d-none d-lg-flex flex-grow-1 bg-primary align-items-center justify-content-center p-5 text-white text-center h-100">
        <div style={{ maxWidth: '400px' }}>
          <h2 className="display-6 fw-bold mb-3">Join MarketFlow Today</h2>
          <p className="opacity-75">
            Whether you're a business looking for marketing help or an agency ready to grow, we've got you covered.
          </p>
        </div>
      </div>

      {/* Right side - Form (scroll inside only if needed) */}
      <div
        className="flex-grow-1 h-100 overflow-auto p-4"
        style={{ minHeight: 0 }} // ✅ important for flex overflow
      >
        <div className="w-100" style={{ maxWidth: '450px', margin: '0 auto' }}>
          <Link to="/" className="d-flex align-items-center gap-2 mb-4 text-decoration-none">
            <div
              className="bg-primary text-white rounded d-flex align-items-center justify-content-center fw-bold"
              style={{ width: 32, height: 32 }}
            >
              M
            </div>
            <span className="fw-bold fs-4 text-dark">MarketFlow</span>
          </Link>

          <h1 className="h3 fw-bold text-dark mb-2">Create your account</h1>
          <p className="text-secondary mb-4">Get started with MarketFlow in seconds</p>

          <Form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
            <Form.Group>
              <Label className="mb-2">I am a...</Label>
              <div className="d-flex gap-3">
                <div
                  className={`flex-fill p-3 border rounded pointer cursor-pointer ${
                    role === 'client' ? 'border-primary bg-primary bg-opacity-10' : 'border-secondary-subtle'
                  }`}
                  onClick={() => setRole('client')}
                  role="button"
                >
                  <div className="d-flex align-items-center gap-2">
                    <User size={18} />
                    <div>
                      <div className="fw-semibold">Client</div>
                      <div className="text-secondary small">Looking for services</div>
                    </div>
                  </div>
                </div>

                <div
                  className={`flex-fill p-3 border rounded pointer cursor-pointer ${
                    role === 'vendor' ? 'border-primary bg-primary bg-opacity-10' : 'border-secondary-subtle'
                  }`}
                  onClick={() => setRole('vendor')}
                  role="button"
                >
                  <div className="d-flex align-items-center gap-2">
                    <Building2 size={18} />
                    <div>
                      <div className="fw-semibold">Vendor</div>
                      <div className="text-secondary small">Offering services</div>
                    </div>
                  </div>
                </div>
              </div>
            </Form.Group>

            <Form.Group>
              <Label className="mb-2">Full Name</Label>
              <div className="position-relative">
                <User className="position-absolute top-50 translate-middle-y text-secondary" style={{ left: 12 }} size={16} />
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="ps-5"
                  required
                />
              </div>
            </Form.Group>

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
                  <Loader2 size={18} className="spin" /> Creating...
                </span>
              ) : (
                <span className="d-inline-flex align-items-center justify-content-center gap-2">
                  Create Account <ArrowRight size={18} />
                </span>
              )}
            </Button>

            <div className="text-center mt-2">
              <span className="text-secondary">Already have an account? </span>
              <Link to="/login" className="fw-semibold text-decoration-none">
                Log in
              </Link>
            </div>
          </Form>
        </div>
      </div>

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
