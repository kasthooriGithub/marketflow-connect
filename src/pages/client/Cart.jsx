import { Layout } from 'components/layout/Layout';
import { useCart } from 'contexts/CartContext';
import { Button } from 'components/ui/button';
import { Minus, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from 'contexts/AuthContext';
import { Container, Card, Row, Col } from 'react-bootstrap';

export default function Cart() {
  const { items, removeFromCart, updateQuantity, getTotal, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
      return;
    }
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <Layout>
        <Container className="py-5 text-center">
          <div className="mx-auto" style={{ maxWidth: '400px' }}>
            <ShoppingCart size={64} className="text-muted mb-4" />
            <h1 className="h3 fw-bold mb-2">Your cart is empty</h1>
            <p className="text-secondary mb-4">
              Browse our services and add items to your cart
            </p>
            <Link to="/services">
              <Button variant="default">Browse Services</Button>
            </Link>
          </div>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container className="py-5">
        <h1 className="h3 fw-bold mb-5">Shopping Cart</h1>

        <Row className="g-5">
          <Col lg={8}>
            <div className="d-flex flex-column gap-3 mb-4">
              {items.map(item => (
                <Card key={item.service.id} className="border shadow-sm">
                  <Card.Body className="p-3">
                    <div className="d-flex gap-3">
                      <img
                        src={item.service.image}
                        alt={item.service.title}
                        className="rounded object-fit-cover"
                        style={{ width: 96, height: 96 }}
                      />
                      <div className="flex-grow-1">
                        <h3 className="h6 fw-bold mb-1">{item.service.title}</h3>
                        <p className="small text-muted mb-2">
                          by {item.service.vendorName}
                        </p>
                        <div className="d-flex align-items-center gap-2 small">
                          <span className="badge bg-primary bg-opacity-10 text-primary fw-normal">
                            {item.paymentType === 'subscription'
                              ? `${item.subscriptionPeriod} subscription`
                              : 'One-time purchase'}
                          </span>
                        </div>
                      </div>
                      <div className="text-end d-flex flex-column justify-content-between">
                        <p className="h5 fw-bold mb-0">
                          ${item.paymentType === 'subscription' && item.subscriptionPeriod === 'yearly'
                            ? (item.service.price * 12 * 0.8).toFixed(2)
                            : item.service.price.toFixed(2)}
                          {item.paymentType === 'subscription' && (
                            <span className="small fw-normal text-muted ms-1">
                              /{item.subscriptionPeriod === 'yearly' ? 'year' : 'month'}
                            </span>
                          )}
                        </p>
                        <div className="d-flex align-items-center justify-content-end gap-2 mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="px-2"
                            onClick={() => updateQuantity(item.service.id, item.quantity - 1)}
                          >
                            <Minus size={14} />
                          </Button>
                          <span className="text-center" style={{ width: 24 }}>{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            className="px-2"
                            onClick={() => updateQuantity(item.service.id, item.quantity + 1)}
                          >
                            <Plus size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="px-2 text-danger"
                            onClick={() => removeFromCart(item.service.id)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </div>

            <Button variant="ghost" onClick={clearCart} className="text-danger ps-0">
              Clear Cart
            </Button>
          </Col>

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
                        <span>{item.service.title} × {item.quantity}</span>
                        <span>
                          ${(item.paymentType === 'subscription' && item.subscriptionPeriod === 'yearly'
                            ? item.service.price * 12 * 0.8 * item.quantity
                            : item.service.price * item.quantity
                          ).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="border-top pt-3">
                    <div className="d-flex justify-content-between h5 fw-bold mb-0">
                      <span>Total</span>
                      <span>${getTotal().toFixed(2)}</span>
                    </div>
                  </div>
                  <Button variant="default" className="w-100 mt-2" onClick={handleCheckout}>
                    Proceed to Checkout
                  </Button>
                </Card.Body>
              </Card>
            </div>
          </Col>
        </Row>
      </Container>
    </Layout>
  );
}
