import { Link } from 'react-router-dom';
import { Layout } from 'components/layout/Layout';
import { Button } from 'components/ui/button';
import { useAuth } from 'contexts/AuthContext';
import { orderService } from 'services/orderService';
import { useEffect, useState } from 'react';
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft,
  MessageSquare,
  Eye
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
    async function fetchOrders() {
      if (!user) return;
      setIsLoading(true);
      try {
        let fetchedOrders = [];
        if (user.role === 'vendor') {
          fetchedOrders = await orderService.getOrdersByVendor(user.id);
        } else {
          fetchedOrders = await orderService.getOrdersByClient(user.id);
        }

        const mapped = fetchedOrders.map(o => ({
          ...o,
          serviceName: 'Service', // Placeholder
          clientName: 'Client', // Placeholder
          vendorName: 'Vendor', // Placeholder
          expectedDelivery: 'TBD'
        }));
        setUserOrders(mapped);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrders();
  }, [user]);

  return (
    <Layout>
      <Container className="py-5">
        {/* Header */}
        <div className="mb-5">
          <Link
            to="/dashboard"
            className="d-flex align-items-center text-muted text-decoration-none small mb-2 hover-text-dark"
          >
            <ArrowLeft size={16} className="me-2" />
            Back to Dashboard
          </Link>
          <h1 className="h2 fw-bold text-dark mb-1">
            {user?.role === 'vendor' ? 'My Orders' : 'Order History'}
          </h1>
          <p className="text-muted mt-1 mb-0">
            {user?.role === 'vendor'
              ? 'Manage orders from your clients'
              : 'Track and manage your service orders'}
          </p>
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 text-muted">Loading orders...</p>
          </div>
        ) : userOrders.length > 0 ? (
          <div className="d-flex flex-column gap-4">
            {userOrders.map((order) => {
              const status = statusConfig[order.status] || statusConfig.pending;
              const StatusIcon = status.icon;

              return (
                <Card
                  key={order.id}
                  className="shadow-sm border hover-shadow-md transition-shadow"
                >
                  <Card.Body className="p-4">
                    <Row className="align-items-center g-4">
                      <Col lg={7}>
                        <div className="d-flex gap-4 align-items-start">
                          <div className="p-3 bg-primary bg-opacity-10 rounded text-primary flex-shrink-0">
                            <Package size={24} />
                          </div>
                          <div className="flex-grow-1 min-w-0">
                            <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                              <h3 className="h6 fw-bold text-dark mb-0 truncate">
                                {order.serviceName}
                              </h3>
                              <Badge
                                pill
                                className={`${status.bg} ${status.text} bg-opacity-10 text-opacity-100 fw-normal border px-3 py-2 d-flex align-items-center`}
                              >
                                <StatusIcon size={14} className="me-1" />
                                {status.label}
                              </Badge>
                            </div>
                            <p className="small text-muted mb-2">
                              {user?.role === 'vendor'
                                ? `Client: ${order.clientName}`
                                : `Vendor: ${order.vendorName}`}
                            </p>
                            <div className="d-flex flex-wrap align-items-center gap-3 small text-muted">
                              <span>Order #{order.id.slice(0, 8)}</span>
                              <span className="text-muted-light">•</span>
                              <span>{order.created_at?.toDate?.()?.toLocaleDateString() || order.created_at}</span>
                              <span className="text-muted-light">•</span>
                              <span className="fw-bold text-dark">
                                ${order.amount.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Col>

                      <Col lg={5} className="d-flex justify-content-lg-end gap-2">
                        <Link to="/messages" className="d-inline-block">
                          <Button variant="outline" size="sm">
                            <MessageSquare size={16} className="me-2" />
                            Message
                          </Button>
                        </Link>
                        <Link to={`/services/${order.serviceId}`} className="d-inline-block">
                          <Button variant="ghost" size="sm" className="text-primary hover-bg-primary-light">
                            <Eye size={16} className="me-2" />
                            View Service
                          </Button>
                        </Link>
                      </Col>

                      {order.status === 'in-progress' && (
                        <Col xs={12}>
                          <div className="mt-2 pt-3 border-top d-flex justify-content-between align-items-center small">
                            <span className="text-muted">Expected delivery:</span>
                            <span className="fw-bold text-dark">
                              {order.expectedDelivery || 'TBD'}
                            </span>
                          </div>
                        </Col>
                      )}
                    </Row>
                  </Card.Body>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-5 bg-light rounded-4 border border-dashed">
            <div className="p-4 bg-white rounded-circle shadow-sm d-inline-block mb-4">
              <Package size={48} className="text-muted" />
            </div>
            <h2 className="h4 fw-bold text-dark mb-2">No orders yet</h2>
            <p className="text-muted mb-5 mx-auto" style={{ maxWidth: 400 }}>
              {user?.role === 'vendor'
                ? 'When clients purchase your services, their orders will appear here.'
                : 'Start exploring our marketplace to find the perfect services for your needs.'}
            </p>
            <Link to="/services">
              <Button variant="default" className="px-5">Browse Services</Button>
            </Link>
          </div>
        )}
      </Container>
      <style>{`
        .hover-shadow-md:hover { box-shadow: 0 .5rem 1rem rgba(0,0,0,.15) !important; }
        .hover-text-dark:hover { color: #212529 !important; }
        .hover-bg-primary-light:hover { background-color: rgba(13, 110, 253, 0.05); }
        .text-muted-light { opacity: 0.5; }
      `}</style>
    </Layout>
  );
}
