import { Link } from 'react-router-dom';
import { Layout } from 'components/layout/Layout';
import { useAuth } from 'contexts/AuthContext';
import { ArrowLeft } from 'lucide-react';
import { Container } from 'react-bootstrap';
import ClientOrders from 'components/orders/ClientOrders';
import VendorOrders from 'components/orders/VendorOrders';

export default function Orders() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Layout>
        <Container className="py-5 text-center">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-2 text-muted">Loading...</p>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout footerVariant="dashboard">
      <Container className="py-5">
        <div className="mb-5">
          <Link to="/dashboard" className="d-flex align-items-center text-muted text-decoration-none small mb-2 hover-text-dark">
            <ArrowLeft size={16} className="me-2" /> Back to Dashboard
          </Link>
          <h1 className="h2 fw-bold text-dark mb-1">
            {user?.role === 'vendor' ? 'Incoming Orders' : 'My Orders'}
          </h1>
          <p className="text-muted mt-1 mb-0">
            {user?.role === 'vendor' ? 'Manage and track your service requests' : 'Track the status of your purchases'}
          </p>
        </div>

        {user?.role === 'vendor' ? <VendorOrders /> : <ClientOrders />}
      </Container>
    </Layout>
  );
}