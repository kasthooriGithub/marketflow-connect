import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from 'components/layout/Layout';
import { Button } from 'components/ui/button';
import { CheckCircle2, Package, ArrowRight } from 'lucide-react';
import { getOrderById } from 'data/orders';
import { Container, Card } from 'react-bootstrap';

export default function OrderConfirmation() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (orderId) {
      const foundOrder = getOrderById(orderId);
      setOrder(foundOrder);
    }
  }, [orderId]);

  if (!order) {
    return (
      <Layout>
        <Container className="py-5 text-center">
          <h1 className="h3 fw-bold mb-4">Order not found</h1>
          <Link to="/services">
            <Button variant="default">Browse Services</Button>
          </Link>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container className="py-5">
        <div className="mx-auto text-center mb-5" style={{ maxWidth: 672 }}>
          <div className="mb-4">
            <div className="d-inline-flex align-items-center justify-content-center rounded-circle bg-success bg-opacity-10 mb-4" style={{ width: 80, height: 80 }}>
              <CheckCircle2 size={40} className="text-success" />
            </div>
            <h1 className="display-6 fw-bold mb-2">Payment Successful!</h1>
            <p className="text-secondary">
              Thank you for your purchase. Your order has been confirmed.
            </p>
          </div>

          <Card className="mb-5 border shadow-sm text-start">
            <Card.Body className="p-4">
              <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom">
                <div>
                  <p className="small text-muted mb-1">Order Number</p>
                  <p className="font-monospace fw-bold mb-0">{order.id}</p>
                </div>
                <div className="text-end">
                  <p className="small text-muted mb-1">Date</p>
                  <p className="fw-medium mb-0">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="h6 fw-bold mb-3">Order Details</h3>
                <div className="d-flex flex-column gap-3">
                  {order.items.map(item => (
                    <div
                      key={item.service.id}
                      className="d-flex align-items-center gap-3 p-3 rounded bg-light"
                    >
                      <Package size={32} className="text-muted" />
                      <div className="flex-grow-1">
                        <p className="fw-medium mb-0">{item.service.title}</p>
                        <p className="small text-muted mb-0">
                          {item.paymentType === 'subscription'
                            ? `${item.subscriptionPeriod} subscription`
                            : 'One-time purchase'} × {item.quantity}
                        </p>
                      </div>
                      <p className="fw-bold mb-0">
                        ${(item.paymentType === 'subscription' && item.subscriptionPeriod === 'yearly'
                          ? item.service.price * 12 * 0.8 * item.quantity
                          : item.service.price * item.quantity
                        ).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-center pt-3 border-top">
                <span className="fw-bold">Total Paid</span>
                <span className="h4 fw-bold text-primary mb-0">
                  ${order.total.toFixed(2)}
                </span>
              </div>
            </Card.Body>
          </Card>

          <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
            <Link to="/dashboard">
              <Button variant="default">
                Go to Dashboard
                <ArrowRight size={16} className="ms-2" />
              </Button>
            </Link>
            <Link to="/services">
              <Button variant="outline">Continue Shopping</Button>
            </Link>
          </div>
        </div>
      </Container>
    </Layout>
  );
}
