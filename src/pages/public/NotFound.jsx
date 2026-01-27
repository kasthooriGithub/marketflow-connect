import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Container, Button } from "react-bootstrap";
import { Home, AlertCircle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <Container className="text-center py-5">
        <div className="mb-4 d-inline-block p-4 bg-white rounded-circle shadow-sm">
          <AlertCircle size={80} className="text-primary opacity-50" />
        </div>
        <h1 className="display-1 fw-bold text-dark mb-2">404</h1>
        <h2 className="h4 fw-bold text-secondary mb-4">Oops! Page not found</h2>
        <p className="text-muted mb-5 mx-auto" style={{ maxWidth: '400px' }}>
          We couldn't find the page you were looking for. It might have been moved, deleted, or you might have mistyped the address.
        </p>
        <Link to="/">
          <Button variant="primary" className="px-5 py-3 rounded-pill shadow-sm d-inline-flex align-items-center">
            <Home size={20} className="me-2" />
            Return to Home
          </Button>
        </Link>
      </Container>
    </div>
  );
};

export default NotFound;
