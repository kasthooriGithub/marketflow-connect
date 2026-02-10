import { Navigate, useParams } from 'react-router-dom';
import { useAuth } from 'contexts/AuthContext';
import { Layout } from 'components/layout/Layout';

export default function Messages() {
  const { user, isLoading } = useAuth();
  const { conversationId } = useParams();

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

  const targetPath = user?.role === 'vendor' ? '/vendor/messages' : '/client/messages';
  const url = conversationId ? `${targetPath}/${conversationId}` : targetPath;

  return <Navigate to={url} replace />;
}
