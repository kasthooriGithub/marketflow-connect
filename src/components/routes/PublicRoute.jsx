import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from 'contexts/AuthContext';

export function PublicRoute({ children }) {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (isAuthenticated) {
        // Redirect to dashboard (which handles role-based routing) 
        // or preserve the intended destination if it's not a public route
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
}
