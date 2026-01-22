import { useState } from 'react';
import { Layout } from 'components/layout/Layout';
import { useCart } from 'contexts/CartContext';
import { useAuth } from 'contexts/AuthContext';
import { Button } from 'components/ui/button';
import { Input } from 'components/ui/input';
import { Label } from 'components/ui/label';
import { CreditCard, Building2, Wallet, Check, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createOrder } from 'data/orders';
import { toast } from 'sonner';
import { Container, Card, Form, Row, Col } from 'react-bootstrap';

export default function Checkout() {
  const { items, getTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      navigate('/login');
      return;
    }

    setIsProcessing(true);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Create order
    const order = createOrder(
      user.id,
      items,
      getTotal(),
      paymentMethod
    );

    // Clear cart and redirect
    clearCart();
    setIsProcessing(false);

    toast.success('Payment successful!');
    navigate(`/order-confirmation/${order.id}`);
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
                {/* Payment Method Selection */}
                <Card className="border shadow-sm">
                  <Card.Header className="bg-white py-3">
                    <Card.Title className="h5 mb-0">Payment Method</Card.Title>
                  </Card.Header>
                  <Card.Body className="p-4">
                    <Form.Group className="d-flex flex-column gap-3">
                      <div
                        className={`d-flex align-items-center p-3 border rounded cursor-pointer transition-colors ${paymentMethod === 'card' ? 'border-primary bg-primary bg-opacity-10' : 'hover-bg-light'}`}
                        onClick={() => setPaymentMethod('card')}
                      >
                        <Form.Check
                          type="radio"
                          name="paymentMethod"
                          id="card"
                          checked={paymentMethod === 'card'}
                          onChange={() => setPaymentMethod('card')}
                          className="me-3"
                        />
                        <Label htmlFor="card" className="d-flex align-items-center gap-3 cursor-pointer flex-grow-1 m-0">
                          <CreditCard size={20} />
                          <div>
                            <p className="fw-medium mb-0">Credit / Debit Card</p>
                            <p className="small text-muted mb-0">Pay with Visa, Mastercard, or Amex</p>
                          </div>
                        </Label>
                      </div>

                      <div
                        className={`d-flex align-items-center p-3 border rounded cursor-pointer transition-colors ${paymentMethod === 'bank' ? 'border-primary bg-primary bg-opacity-10' : 'hover-bg-light'}`}
                        onClick={() => setPaymentMethod('bank')}
                      >
                        <Form.Check
                          type="radio"
                          name="paymentMethod"
                          id="bank"
                          checked={paymentMethod === 'bank'}
                          onChange={() => setPaymentMethod('bank')}
                          className="me-3"
                        />
                        <Label htmlFor="bank" className="d-flex align-items-center gap-3 cursor-pointer flex-grow-1 m-0">
                          <Building2 size={20} />
                          <div>
                            <p className="fw-medium mb-0">Bank Transfer</p>
                            <p className="small text-muted mb-0">Direct bank payment</p>
                          </div>
                        </Label>
                      </div>

                      <div
                        className={`d-flex align-items-center p-3 border rounded cursor-pointer transition-colors ${paymentMethod === 'wallet' ? 'border-primary bg-primary bg-opacity-10' : 'hover-bg-light'}`}
                        onClick={() => setPaymentMethod('wallet')}
                      >
                        <Form.Check
                          type="radio"
                          name="paymentMethod"
                          id="wallet"
                          checked={paymentMethod === 'wallet'}
                          onChange={() => setPaymentMethod('wallet')}
                          className="me-3"
                        />
                        <Label htmlFor="wallet" className="d-flex align-items-center gap-3 cursor-pointer flex-grow-1 m-0">
                          <Wallet size={20} />
                          <div>
                            <p className="fw-medium mb-0">Digital Wallet</p>
                            <p className="small text-muted mb-0">PayPal, Apple Pay, Google Pay</p>
                          </div>
                        </Label>
                      </div>
                    </Form.Group>
                  </Card.Body>
                </Card>

                {/* Card Details (shown only for card payment) */}
                {paymentMethod === 'card' && (
                  <Card className="border shadow-sm">
                    <Card.Header className="bg-white py-3">
                      <Card.Title className="h5 mb-0">Card Details</Card.Title>
                    </Card.Header>
                    <Card.Body className="p-4 d-flex flex-column gap-3">
                      <Form.Group>
                        <Label htmlFor="cardName">Name on Card</Label>
                        <Input
                          id="cardName"
                          placeholder="John Doe"
                          value={cardDetails.name}
                          onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                          required
                        />
                      </Form.Group>
                      <Form.Group>
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input
                          id="cardNumber"
                          placeholder="4242 4242 4242 4242"
                          value={cardDetails.number}
                          onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                          required
                        />
                      </Form.Group>
                      <Row className="g-3">
                        <Col md={6}>
                          <Form.Group>
                            <Label htmlFor="expiry">Expiry Date</Label>
                            <Input
                              id="expiry"
                              placeholder="MM/YY"
                              value={cardDetails.expiry}
                              onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                              required
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group>
                            <Label htmlFor="cvc">CVC</Label>
                            <Input
                              id="cvc"
                              placeholder="123"
                              value={cardDetails.cvc}
                              onChange={(e) => setCardDetails({ ...cardDetails, cvc: e.target.value })}
                              required
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      <Form.Text className="text-muted small">
                        This is a demo. No real payment will be processed.
                      </Form.Text>
                    </Card.Body>
                  </Card>
                )}

                {/* Bank Transfer Info */}
                {paymentMethod === 'bank' && (
                  <Card className="border shadow-sm">
                    <Card.Header className="bg-white py-3">
                      <Card.Title className="h5 mb-0">Bank Transfer Details</Card.Title>
                    </Card.Header>
                    <Card.Body className="p-4">
                      <p className="text-secondary mb-4">
                        After placing your order, you'll receive bank transfer instructions via email.
                      </p>
                      <div className="bg-light p-3 rounded small">
                        <p className="mb-1"><strong>Bank:</strong> Demo Bank</p>
                        <p className="mb-1"><strong>Account:</strong> 1234567890</p>
                        <p className="mb-0"><strong>Routing:</strong> 012345678</p>
                      </div>
                    </Card.Body>
                  </Card>
                )}

                {/* Digital Wallet */}
                {paymentMethod === 'wallet' && (
                  <Card className="border shadow-sm">
                    <Card.Header className="bg-white py-3">
                      <Card.Title className="h5 mb-0">Digital Wallet</Card.Title>
                    </Card.Header>
                    <Card.Body className="p-4">
                      <div className="row g-3">
                        {['PayPal', 'Apple Pay', 'Google Pay'].map(wallet => (
                          <div className="col-4" key={wallet}>
                            <Button type="button" variant="outline" className="w-100 py-3 h-auto">
                              {wallet}
                            </Button>
                          </div>
                        ))}
                      </div>
                      <p className="small text-muted mt-3 mb-0">
                        This is a demo. Click any wallet to simulate payment.
                      </p>
                    </Card.Body>
                  </Card>
                )}
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
                          Processing...
                        </>
                      ) : (
                        <>
                          <Check className="me-2" size={16} />
                          Pay ${getTotal().toFixed(2)}
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
