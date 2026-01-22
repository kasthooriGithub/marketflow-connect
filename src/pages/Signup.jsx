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
        description: result.error || 'Could not create account',
        variant: 'destructive',
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="d-flex min-vh-100">
      {/* Left side - Decorative (Hidden on mobile) */}
      <div className="d-none d-lg-flex flex-grow-1 bg-primary align-items-center justify-content-center p-5 text-white text-center">
        <div style={{ maxWidth: '400px' }}>
          <h2 className="display-6 fw-bold mb-3">Join MarketFlow Today</h2>
          <p className="opacity-75">
            Whether you're a business looking for marketing help or an agency ready to grow, we've got you covered.
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-grow-1 d-flex align-items-center justify-content-center p-4">
        <div className="w-100" style={{ maxWidth: '450px' }}>
          <Link to="/" className="d-flex align-items-center gap-2 mb-4 text-decoration-none">
            <div className="bg-primary text-white rounded d-flex align-items-center justify-content-center fw-bold" style={{ width: 32, height: 32 }}>
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
                  className={`flex-fill p-3 border rounded pointer cursor-pointer ${role === 'client' ? 'border-primary bg-primary bg-opacity-10' : 'border-secondary-subtle'}`}
                  onClick={() => setRole('client')}
                  role="button"
                >
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <Form.Check
                      type="radio"
                      name="role"
                      id="client"
                      checked={role === 'client'}
                      onChange={() => setRole('client')}
                      className="m-0"
                    />
                    <User size={20} className="text-primary" />
                    <span className="fw-medium">Client</span>
                  </div>
                  <p className="small text-muted mb-0 ms-4 ps-1">Looking for services</p>
                </div>

                <div
                  className={`flex-fill p-3 border rounded pointer cursor-pointer ${role === 'vendor' ? 'border-primary bg-primary bg-opacity-10' : 'border-secondary-subtle'}`}
                  onClick={() => setRole('vendor')}
                  role="button"
                >
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <Form.Check
                      type="radio"
                      name="role"
                      id="vendor"
                      checked={role === 'vendor'}
                      onChange={() => setRole('vendor')}
                      className="m-0"
                    />
                    <Building2 size={20} className="text-primary" />
                    <span className="fw-medium">Vendor</span>
                  </div>
                  <p className="small text-muted mb-0 ms-4 ps-1">Offering services</p>
                </div>
              </div>
            </Form.Group>

            <Form.Group>
              <Label htmlFor="name">{role === 'vendor' ? 'Business Name' : 'Full Name'}</Label>
              <div className="position-relative">
                <div className="position-absolute top-50 start-0 translate-middle-y ps-3">
                  {role === 'vendor' ? <Building2 size={18} className="text-secondary" /> : <User size={18} className="text-secondary" />}
                </div>
                <Input
                  id="name"
                  type="text"
                  placeholder={role === 'vendor' ? 'Your Agency Name' : 'John Doe'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="ps-5"
                  required
                />
              </div>
            </Form.Group>

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
                  minLength={6}
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
                  Creating account...
                </>
              ) : (
                <>
                  Create Account <ArrowRight className="ms-2" size={20} />
                </>
              )}
            </Button>
          </Form>

          <p className="text-center text-secondary mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-primary fw-medium text-decoration-none hover-underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
      <style>{`
        .cursor-pointer { cursor: pointer; }
        .hover-underline:hover { text-decoration: underline !important; }
      `}</style>
    </div>
  );
}
