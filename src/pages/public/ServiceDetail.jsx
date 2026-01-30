import { useState, useEffect } from 'react';
import { useParams, Link, Navigate, useNavigate } from 'react-router-dom';
import {
  Star, Clock, Check, ArrowLeft, MessageSquare, Shield,
  BadgeCheck, RefreshCw, Zap, Award,
  TrendingUp, Play, ChevronRight
} from 'lucide-react';
import { Layout } from 'components/layout/Layout';
import { Button } from 'components/ui/button';
import { Badge } from 'components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'components/ui/tabs';
import { db } from 'lib/firebase';
import { doc, getDoc, serverTimestamp, setDoc, addDoc, collection } from 'firebase/firestore';
import { useAuth } from 'contexts/AuthContext';
import { useCart } from 'contexts/CartContext';
import { useMessaging } from 'contexts/MessagingContext';
import { orderService } from 'services/orderService';
import { toast } from 'sonner';
import { Card, Container, Row, Col, Modal } from 'react-bootstrap';

export default function ServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { addToCart } = useCart();
  const { chatService } = useMessaging();

  const [service, setService] = useState(null);
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTier, setSelectedTier] = useState('standard');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true);
        const serviceDoc = await getDoc(doc(db, 'services', id));

        if (serviceDoc.exists()) {
          const serviceData = { id: serviceDoc.id, ...serviceDoc.data() };
          setService(serviceData);

          // Fetch vendor details from users collection
          if (serviceData.vendor_id) {
            const vendorDoc = await getDoc(doc(db, 'users', serviceData.vendor_id));
            if (vendorDoc.exists()) {
              setVendor({ id: vendorDoc.id, ...vendorDoc.data() });
            }
          }
        } else {
          toast.error('Service not found');
        }
      } catch (error) {
        console.error('Error fetching service:', error);
        toast.error('Failed to load service');
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <Container className="py-5">
          <div className="text-center">
            <div className="spinner-border" role="status" />
            <p className="mt-3 text-muted">Loading service details...</p>
          </div>
        </Container>
      </Layout>
    );
  }

  if (!service) {
    return (
      <Layout>
        <Container className="py-5">
          <div className="text-center">
            <h2 className="fw-bold">Service not found</h2>
            <p className="text-muted">The service you are looking for does not exist.</p>
            <Button variant="primary" onClick={() => navigate('/services')}>
              Back to Services
            </Button>
          </div>
        </Container>
      </Layout>
    );
  }

  const generateTiers = () => {
    const basePrice = Number(service.price || 99);

    return [
      {
        id: 'basic',
        name: 'Basic',
        price: Math.max(10, Math.round(basePrice * 0.8)),
        deliveryTime: service.deliveryTime || '3-5 days',
        revisions: 1,
        features: [
          'Keyword research',
          'Plagiarism-free content',
          'SEO optimization',
        ],
        subtitle: 'Great for starting out',
      },
      {
        id: 'standard',
        name: 'Standard',
        price: basePrice,
        deliveryTime: service.deliveryTime || '3-5 days',
        revisions: 3,
        features: [
          'Keyword research',
          'Plagiarism-free content',
          'SEO optimization',
        ],
        subtitle: 'Most popular choice for professionals',
        popular: true,
      },
      {
        id: 'premium',
        name: 'Premium',
        price: Math.round(basePrice * 1.4),
        deliveryTime: service.deliveryTime || '3-5 days',
        revisions: 5,
        features: [
          'Keyword research',
          'Plagiarism-free content',
          'SEO optimization',
        ],
        subtitle: 'Best for high-impact results',
      },
    ];
  };

  const tiers = generateTiers();
  const currentTier = tiers.find(t => t.id === selectedTier) || tiers[1];

  // Role-based view control (UI layout unchanged)
  const isVendorUser = user?.role === 'vendor';
  const isServiceOwner = !!(user?.uid && service?.vendor_id && user.uid === service.vendor_id);
  const isVendorView = isVendorUser || isServiceOwner;

  const handleAddToCart = () => {
    if (isVendorView) return;
    if (!service) return;
    const modifiedService = { ...service, price: currentTier.price };
    addToCart(modifiedService, 'one-time', undefined);
    toast.success(`${currentTier.name} package added to cart!`);
  };

  const handleConfirmOrder = async () => {
    if (isVendorView) {
      toast.error("Vendors can't place orders from this page.");
      return;
    }
    if (!service || !user) return;
    setIsPlacingOrder(true);

    try {
      const orderData = {
        client_id: user.uid,
        vendor_id: service.vendor_id,
        service_id: service.id,
        service_name: service.title,
        total_amount: currentTier.price
      };

      await orderService.createOrder(orderData);

      toast.success('Order placed successfully!');
      setShowConfirmModal(false);
      navigate('/orders');
    } catch (error) {
      console.error("Order creation failed:", error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleContactVendor = async () => {
    if (isVendorView) return;
    if (!service || !user) return;
    try {
      const conversationId = await chatService.getOrCreateConversation(
        user.uid,
        service.vendor_id,
        service.id,
        service.title
      );
      navigate(`/messages/${conversationId}`);
    } catch (error) {
      console.error("Failed to start conversation:", error);
      toast.error("Failed to contact seller. Please try again.");
    }
  };

  return (
    <Layout>
      <Container className="py-4">
        <div className="mb-4">
          <Link to="/services" className="text-decoration-none text-muted d-inline-flex align-items-center gap-2">
            <ArrowLeft size={16} />
            Back to Services
          </Link>
        </div>

        <Row className="g-4">
          <Col lg={8}>
            <div className="mb-4">
              <div className="d-flex align-items-center gap-2 text-muted small mb-2">
                <span>Services</span>
                <ChevronRight size={14} />
                <span>{service.id}</span>
                <ChevronRight size={14} />
                <span className="text-dark">{service.title}</span>
              </div>
              <h1 className="display-5 fw-bold mb-3">{service.title}</h1>

              <Card className="border-0 shadow-sm">
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center gap-3 flex-wrap">
                    <div className="d-flex align-items-center gap-2">
                      <div className="rounded-circle bg-light d-flex align-items-center justify-content-center" style={{ width: 44, height: 44 }}>
                        <span className="fw-bold">{(vendor?.full_name || vendor?.name || 'W')[0]}</span>
                      </div>
                      <div>
                        <div className="d-flex align-items-center gap-2">
                          <span className="fw-bold">{vendor?.full_name || vendor?.name || 'Woocurs'}</span>
                          <Badge variant="secondary" className="d-inline-flex align-items-center gap-1">
                            <BadgeCheck size={14} />
                            Verified Seller
                          </Badge>
                        </div>
                        <div className="text-muted small">Professional service provider</div>
                      </div>
                    </div>

                    <div className="ms-auto d-flex align-items-center gap-3 flex-wrap">
                      <div className="d-flex align-items-center gap-1">
                        <Star size={16} className="fill-warning" />
                        <span className="fw-bold">5</span>
                        <span className="text-muted">(0)</span>
                      </div>
                      <div className="text-muted small d-flex align-items-center gap-1">
                        <TrendingUp size={16} />
                        100+ orders
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </div>

            <Card className="border-0 shadow-sm mb-4">
              <Card.Body className="p-0">
                <div className="ratio ratio-16x9 bg-light d-flex align-items-center justify-content-center">
                  <div className="text-center text-muted">
                    <div className="rounded-circle bg-white shadow-sm d-inline-flex align-items-center justify-content-center mb-3" style={{ width: 64, height: 64 }}>
                      <Play />
                    </div>
                    <div>Preview Coming Soon</div>
                  </div>
                </div>
              </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm">
              <Card.Body className="p-4">
                <h3 className="h5 fw-bold mb-3">About this service</h3>
                <p className="text-muted mb-4">{service.longDescription || service.description}</p>

                <h4 className="h6 fw-bold mb-3">What you’ll get</h4>
                <div className="d-flex flex-column gap-2">
                  {(service.features || []).map((f, idx) => (
                    <div key={idx} className="d-flex align-items-start gap-2">
                      <Check size={18} className="text-success mt-1" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            <div className="position-sticky" style={{ top: 92 }}>
              <Card className="border-0 shadow-sm">
                <Card.Body className="p-4">
                  <Tabs value={selectedTier} onValueChange={setSelectedTier}>
                    <TabsList className="w-100 mb-4">
                      <TabsTrigger value="basic" className="flex-fill">Basic</TabsTrigger>
                      <TabsTrigger value="standard" className="flex-fill">Standard</TabsTrigger>
                      <TabsTrigger value="premium" className="flex-fill">Premium</TabsTrigger>
                    </TabsList>

                    {tiers.map((tier) => (
                      <TabsContent key={tier.id} value={tier.id}>
                        <div className="d-flex align-items-start justify-content-between mb-2">
                          <div>
                            <div className="h4 fw-bold mb-1">${tier.price}</div>
                            <div className="text-muted small">{tier.subtitle}</div>
                          </div>
                          {tier.popular && (
                            <Badge className="bg-primary">Popular</Badge>
                          )}
                        </div>

                        <div className="d-flex align-items-center justify-content-between text-muted small border-top border-bottom py-3 mb-3">
                          <div className="d-flex align-items-center gap-2">
                            <Clock size={16} />
                            {tier.deliveryTime}
                          </div>
                          <div className="d-flex align-items-center gap-2">
                            <RefreshCw size={16} />
                            {tier.revisions} Revisions
                          </div>
                        </div>

                        <div className="d-flex flex-column gap-2 mb-4">
                          {tier.features.map((f, i) => (
                            <div key={i} className="d-flex align-items-start gap-2">
                              <Check size={18} className="text-success mt-1" />
                              <span>{f}</span>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>

                  {!isVendorView && (
                    <div className="d-flex flex-column gap-2">
                      <Button variant="primary" size="lg" className="w-100" onClick={() => setShowConfirmModal(true)}>
                        Place Order (${currentTier.price})
                      </Button>
                      <Button variant="outline" size="lg" className="w-100" onClick={handleAddToCart}>
                        Add to Cart
                      </Button>
                      <Button variant="ghost" size="lg" className="w-100" onClick={handleContactVendor}>
                        Contact Seller
                      </Button>
                    </div>
                  )}

                </Card.Body>
              </Card>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Confirmation Modal */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered className="border-0">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">Confirm Order</Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-4">
          <p className="mb-0">Do you want to place an order for <strong>{service.title}</strong> – <strong>${currentTier.price}</strong>?</p>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0 gap-2">
          <Button variant="outline" onClick={() => setShowConfirmModal(false)} disabled={isPlacingOrder}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleConfirmOrder} disabled={isPlacingOrder}>
            {isPlacingOrder ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Placing Order...
              </>
            ) : 'Confirm'}
          </Button>
        </Modal.Footer>
      </Modal>

      <style>{`
        .fill-warning { fill: #ffc107; }
      `}</style>
    </Layout>
  );
}
