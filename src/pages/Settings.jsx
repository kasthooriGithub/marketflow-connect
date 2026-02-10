import { Navigate } from 'react-router-dom';
import { useAuth } from 'contexts/AuthContext';
import { Layout } from 'components/layout/Layout';

export default function Settings() {
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

  const targetPath = user?.role === 'vendor' ? '/vendor/settings' : '/client/settings';
  return <Navigate to={targetPath} replace />;
}
