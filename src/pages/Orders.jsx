import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from 'components/layout/Layout';
import { Button } from 'components/ui/button';
import { useAuth } from 'contexts/AuthContext';
import { db } from 'lib/firebase'; // Adjust this path to your firebase config
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import {
  Package, Clock, CheckCircle, XCircle, AlertCircle, ArrowLeft, MessageSquare, Eye
} from 'lucide-react';
import { Container, Row, Col, Card, Badge } from 'react-bootstrap';

const statusConfig = {
  pending: { label: 'Pending', icon: Clock, bg: 'bg-warning', text: 'text-dark' },
  'in-progress': { label: 'In Progress', icon: AlertCircle, bg: 'bg-primary', text: 'text-white' },
  completed: { label: 'Completed', icon: CheckCircle, bg: 'bg-success', text: 'text-white' },
  cancelled: { label: 'Cancelled', icon: XCircle, bg: 'bg-danger', text: 'text-white' },
};

export default function Orders() {
  const { user } = useAuth();
  const [userOrders, setUserOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    setIsLoading(true);
    
    // Create query based on user role
    // If vendor: find orders where vendor_id matches
    // If client: find orders where client_id matches
    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef,
      where(user.role === 'vendor' ? 'vendor_id' : 'client_id', '==', user.uid),
      orderBy('created_at', 'desc')
    );

    // Real-time listener
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedOrders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Fallbacks for data that might be missing in DB
        serviceName: doc.data().service_name || 'Service Package',
        clientName: doc.data().client_name || 'Valued Client',
        vendorName: doc.data().vendor_name || 'Service Provider',
        amount: doc.data().amount || 0,
      }));
      
      setUserOrders(fetchedOrders);
      setIsLoading(false);
    }, (error) => {
      console.error("Firestore Orders Error:", error);
      setIsLoading(false);
    });

    return () => unsubscribe(); // Stop listening when page closes
  }, [user]);

  return (
    <Layout>
      <Container className="py-5">
        <div className="mb-5">
          <Link to="/dashboard" className="d-flex align-items-center text-muted text-decoration-none small mb-2 hover-text-dark">
            <ArrowLeft size={16} className="me-2" /> Back to Dashboard
          </Link>
          <h1 className="h2 fw-bold text-dark mb-1">
            {user?.role === 'vendor' ? 'Service Orders' : 'My Purchases'}
          </h1>
          <p className="text-muted mt-1 mb-0">
            {user?.role === 'vendor' ? 'Manage incoming requests' : 'Track your active services'}
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-2 text-muted">Syncing with database...</p>
          </div>
        ) : userOrders.length > 0 ? (
          <div className="d-flex flex-column gap-4">
            {userOrders.map((order) => {
              const status = statusConfig[order.status] || statusConfig.pending;
              const StatusIcon = status.icon;

              return (
                <Card key={order.id} className="border-0 shadow-sm hover-card rounded-4">
                  <Card.Body className="p-4">
                    <Row className="align-items-center g-4">
                      <Col lg={7}>
                        <div className="d-flex gap-4 align-items-center">
                          <div className="p-3 bg-light rounded-circle text-primary">
                            <Package size={28} />
                          </div>
                          <div className="flex-grow-1">
                            <div className="d-flex align-items-center gap-2 mb-1">
                              <h3 className="h5 fw-bold text-dark mb-0">{order.serviceName}</h3>
                              <Badge className={`${status.bg} ${status.text} border-0 rounded-pill px-3`}>
                                <StatusIcon size={12} className="me-1" /> {status.label}
                              </Badge>
                            </div>
                            <p className="text-muted small mb-2">
                              {user?.role === 'vendor' ? `Client: ${order.clientName}` : `Provider: ${order.vendorName}`}
                            </p>
                            <div className="d-flex gap-3 small text-muted">
                              <span>ID: {order.id.slice(-6).toUpperCase()}</span>
                              <span>•</span>
                              <span>{order.created_at?.toDate ? order.created_at.toDate().toLocaleDateString() : 'Just now'}</span>
                              <span>•</span>
                              <span className="fw-bold text-primary">${order.amount}</span>
                            </div>
                          </div>
                        </div>
                      </Col>
                      <Col lg={5} className="d-flex justify-content-lg-end gap-2">
                        <Button variant="outline-primary" size="sm" className="rounded-pill px-4" onClick={() => navigate(`/messages/${order.id}`)}>
                          <MessageSquare size={16} className="me-2" /> Chat
                        </Button>
                        <Button variant="primary" size="sm" className="rounded-pill px-4" onClick={() => navigate(`/orders/${order.id}`)}>
                          <Eye size={16} className="me-2" /> View Details
                        </Button>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-5 bg-white rounded-4 border">
            <Package size={60} className="text-muted opacity-25 mb-3" />
            <h3 className="fw-bold">No Orders Found</h3>
            <p className="text-muted mb-4">You don't have any active orders at the moment.</p>
            <Link to="/services"><Button variant="primary" className="rounded-pill px-5">Explore Services</Button></Link>
          </div>
        )}
      </Container>
      <style>{`
        .hover-card { transition: all 0.3s ease; border-left: 5px solid transparent !important; }
        .hover-card:hover { transform: translateX(10px); border-left: 5px solid #0d6efd !important; shadow: 0 10px 20px rgba(0,0,0,0.1); }
      `}</style>
    </Layout>
  );
}