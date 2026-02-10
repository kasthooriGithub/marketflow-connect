import { useState } from 'react';
import { Layout } from 'components/layout/Layout';
import { useCart } from 'contexts/CartContext';
import { useAuth } from 'contexts/AuthContext';
import { Button } from 'components/ui/button';
import { Input } from 'components/ui/input';
import { Label } from 'components/ui/label';
import { Check, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { orderService } from 'services/orderService';
import { toast } from 'sonner';
import { Container, Card, Form, Row, Col } from 'react-bootstrap';

export default function Checkout() {
  const { items, getTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      navigate('/login');
      return;
    }

    setIsProcessing(true);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    // Create orders for all items in cart
    try {
      const orderPromises = items.map(async item => {
        const orderData = {
          client_id: user.uid,
          vendor_id: item.service.vendor_id || item.service.vendorId,
          service_id: item.service.id,
          service_name: item.service.title,
          total_amount: (item.paymentType === 'subscription' && item.subscriptionPeriod === 'yearly'
            ? item.service.price * 12 * 0.8
            : item.service.price) * item.quantity,
          status: 'pending_payment',
          payment_status: 'unpaid'
        };
        return await orderService.createOrder(orderData);
      });

      const newOrders = await Promise.all(orderPromises);

      // Clear cart
      clearCart();
      setIsProcessing(false);

      toast.success('Orders placed! Redirecting to payment...');

      // Redirect to the first order created for payment
      if (newOrders.length > 0) {
        navigate(`/client/payment/${newOrders[0].id}`);
      } else {
        navigate('/client/orders');
      }
    } catch (error) {
      console.error("Order creation failed:", error);
      toast.error("Failed to place orders. Please try again.");
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <Layout>
      <Container className="py-5">
        <h1 className="h3 fw-bold mb-5">Checkout</h1>

        <Form onSubmit={handleSubmit}>
          <Row className="g-5">
            <Col lg={8}>
              <div className="d-flex flex-column gap-4">
                {/* Order Confirmation Notice */}
                <Card className="border shadow-sm">
                  <Card.Header className="bg-white py-3">
                    <Card.Title className="h5 mb-0">Complete Your Order</Card.Title>
                  </Card.Header>
                  <Card.Body className="p-4 text-center">
                    <Check className="text-success mb-3 mx-auto" size={48} />
                    <p className="lead mb-4">Please review your items. In the next step, you will be directed to our secure payment page to complete your purchase.</p>
                    <div className="bg-light p-3 rounded mb-2 small text-start">
                      <p className="mb-0 text-muted"><Check size={14} className="me-2" /> Secure payment processing</p>
                      <p className="mb-0 text-muted"><Check size={14} className="me-2" /> Direct communication with vendors</p>
                      <p className="mb-0 text-muted"><Check size={14} className="me-2" /> Satisfaction guaranteed</p>
                    </div>
                  </Card.Body>
                </Card>

              </div>
            </Col>

            {/* Order Summary */}
            <Col lg={4}>
              <div className="sticky-top" style={{ top: 100 }}>
                <Card className="border shadow-sm">
                  <Card.Header className="bg-white py-3">
                    <Card.Title className="h5 mb-0">Order Summary</Card.Title>
                  </Card.Header>
                  <Card.Body className="p-4 d-flex flex-column gap-3">
                    <div className="d-flex flex-column gap-2">
                      {items.map(item => (
                        <div key={item.service.id} className="d-flex justify-content-between small">
                          <div>
                            <p className="fw-medium mb-0">{item.service.title}</p>
                            <p className="text-muted small mb-0">
                              {item.paymentType === 'subscription'
                                ? `${item.subscriptionPeriod} subscription × ${item.quantity}`
                                : `One-time × ${item.quantity}`}
                            </p>
                          </div>
                          <span className="fw-medium">
                            ${(item.paymentType === 'subscription' && item.subscriptionPeriod === 'yearly'
                              ? item.service.price * 12 * 0.8 * item.quantity
                              : item.service.price * item.quantity
                            ).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="border-top pt-3">
                      <div className="d-flex justify-content-between small mb-2">
                        <span>Subtotal</span>
                        <span>${getTotal().toFixed(2)}</span>
                      </div>
                      <div className="d-flex justify-content-between small">
                        <span>Processing Fee</span>
                        <span>$0.00</span>
                      </div>
                    </div>

                    <div className="border-top pt-3">
                      <div className="d-flex justify-content-between h5 fw-bold mb-0">
                        <span>Total</span>
                        <span>${getTotal().toFixed(2)}</span>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      className="w-100 mt-2"
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="me-2 animate-spin" size={16} />
                          Creating Order...
                        </>
                      ) : (
                        <>
                          <Check className="me-2" size={16} />
                          Confirm & Pay ${getTotal().toFixed(2)}
                        </>
                      )}
                    </Button>

                    <p className="text-center text-muted small mb-0">
                      By completing this purchase you agree to our Terms of Service
                    </p>
                  </Card.Body>
                </Card>
              </div>
            </Col>
          </Row>
        </Form>
      </Container>
      <style>{`
        .hover-bg-light:hover { background-color: #f8f9fa; }
        .cursor-pointer { cursor: pointer; }
      `}</style>
    </Layout>
  );
}
