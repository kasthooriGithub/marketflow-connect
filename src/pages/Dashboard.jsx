import { Navigate } from 'react-router-dom';
import { useAuth } from 'contexts/AuthContext';
import { Layout } from 'components/layout/Layout';

export default function Dashboard() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Layout footerVariant="dashboard">
        <div className="min-vh-100 d-flex align-items-center justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Layout>
    );
  }

  if (user?.role === 'vendor') {
    return <Navigate to="/vendor/dashboard" replace />;
  }

  return <Navigate to="/client/dashboard" replace />;
}