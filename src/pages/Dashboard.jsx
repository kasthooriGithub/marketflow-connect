import { useAuth } from 'contexts/AuthContext';
import { Layout } from 'components/layout/Layout';
import ClientDashboard from './client/ClientDashboard';
import VendorDashboard from './vendor/VendorDashboard';

export default function Dashboard() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Layout>
        <div className="min-vh-100 d-flex align-items-center justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Layout>
    );
  }

  if (user?.role === 'vendor') {
    return <VendorDashboard />;
  }

  return <ClientDashboard />;
}