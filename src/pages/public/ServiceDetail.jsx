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
import { paymentService } from 'services/paymentService';
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

    console.log("[Detail Debug] Rendering ID:", id, "Path:", window.location.pathname);
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
    if (!service || !user) {
      toast.error("You must be logged in to place an order.");
      return;
    }

    if (isPlacingOrder) return;
    setIsPlacingOrder(true);

    try {
      const orderData = {
        client_id: user.uid,
        vendor_id: service.vendor_id,
        service_id: service.id,
        service_name: service.title,
        total_amount: currentTier.price,
        package_name: currentTier.name,
        delivery_time: currentTier.deliveryTime,
        revisions: currentTier.revisions,
        status: 'new', // CHANGED: Start as 'new', wait for vendor proposal
        requirements: 'Waiting for requirements...', // Can be updated later
        created_at: serverTimestamp()
      };

      // 1. Create Order
      const newOrder = await orderService.createOrder(orderData);

      // 2. Notify Vendor (Optional system message could go here)
      // For now, we rely on the vendor seeing the 'new' order in their dashboard

      // 3. Close Modal & Reset
      setShowConfirmModal(false);
      setIsPlacingOrder(false);
      setSelectedTier('standard');

      toast.success('Order request placed! Waiting for vendor confirmation.');

      // 4. Navigate to Orders Page
      setTimeout(() => {
        navigate('/client/orders');
      }, 500);

    } catch (error) {
      console.error("Order creation failed:", error);
      toast.error(`Error: ${error.message || "Could not place order"}`);
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
              <nav aria-label="breadcrumb" className="mb-3">
                <ol className="breadcrumb mb-0 small fw-medium">
                  <li className="breadcrumb-item">
                    <Link to="/services" className="text-decoration-none text-muted">Services</Link>
                  </li>
                  <li className="breadcrumb-item active text-dark" aria-current="page">
                    {service.title}
                  </li>
                </ol>
              </nav>
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
              <Card className="border-0 shadow-lg rounded-4 overflow-hidden pricing-card">
                <Card.Body className="p-0">
                  <Tabs
                    value={selectedTier}
                    onValueChange={setSelectedTier}
                    className="pricing-tabs"
                  >
                    <TabsList className="d-flex w-100 bg-light p-1 rounded-0 border-bottom">
                      {tiers.map((tier) => (
                        <TabsTrigger
                          key={tier.id}
                          value={tier.id}
                          className="flex-fill py-3 fw-bold border-0 transition-all rounded-0"
                        >
                          {tier.name}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    <div className="p-4">
                      {tiers.map((tier) => (
                        <TabsContent key={tier.id} value={tier.id}>
                          <div className="d-flex align-items-baseline justify-content-between mb-3">
                            <div>
                              <div className="h2 fw-bold mb-0 text-primary">${tier.price}</div>
                              <div className="text-muted small mt-1 fw-medium">{tier.subtitle}</div>
                            </div>
                            {tier.popular && (
                              <Badge className="bg-primary-soft text-primary border-0 px-3 py-1 rounded-pill small fw-bold">
                                Best Value
                              </Badge>
                            )}
                          </div>

                          <div className="bg-light rounded-3 p-3 mb-4 d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center gap-2 text-dark small fw-semibold">
                              <Clock size={16} className="text-primary" />
                              {tier.deliveryTime} Delivery
                            </div>
                            <div className="d-flex align-items-center gap-2 text-dark small fw-semibold">
                              <RefreshCw size={16} className="text-primary" />
                              {tier.revisions} Revisions
                            </div>
                          </div>

                          <div className="features-list mb-4">
                            <h6 className="text-uppercase x-small fw-bold text-muted mb-3 tracking-wider">What's Included</h6>
                            <div className="d-flex flex-column gap-3">
                              {tier.features.map((f, i) => (
                                <div key={i} className="d-flex align-items-start gap-3">
                                  <div className="bg-success-soft rounded-circle p-1 mt-0.5">
                                    <Check size={14} className="text-success" />
                                  </div>
                                  <span className="text-dark small">{f}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </TabsContent>
                      ))}

                      {!isVendorView && (
                        <div className="d-flex flex-column gap-3 mt-2">
                          <Button
                            variant="default"
                            size="lg"
                            className="w-100 py-3 fw-bold shadow-sm"
                            onClick={() => setShowConfirmModal(true)}
                          >
                            Place Order (${currentTier.price})
                          </Button>
                          <div className="d-flex gap-2">
                            <Button
                              variant="outline"
                              size="lg"
                              className="flex-grow-1 py-2.5 fw-semibold border-2"
                              onClick={handleAddToCart}
                            >
                              Add to Cart
                            </Button>
                            <Button
                              variant="ghost"
                              size="lg"
                              className="flex-grow-1 py-2.5 fw-semibold border"
                              onClick={handleContactVendor}
                            >
                              <MessageSquare size={18} className="me-2" />
                              Contact
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </Tabs>
                </Card.Body>
                <div className="bg-light py-3 border-top text-center">
                  <span className="text-muted x-small fw-medium d-flex align-items-center justify-content-center gap-2">
                    <Shield size={14} />
                    Secure Payment Guarantee
                  </span>
                </div>
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
          <p className="mb-0">Do you want to submit a request for <strong>{service.title}</strong>?</p>
          <p className="small text-muted mt-2">The vendor will review your request and send a proposal with final details.</p>
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
        .bg-primary-soft { background-color: rgba(13, 110, 253, 0.1); }
        .bg-success-soft { background-color: rgba(25, 135, 84, 0.1); }
        .tracking-wider { letter-spacing: 0.05em; }
        .x-small { font-size: 0.75rem; }
        
        .pricing-card {
           transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .pricing-tabs [data-state="active"] {
          background-color: #fff !important;
          color: #0d6efd !important;
          border-bottom: 3px solid #0d6efd !important;
          box-shadow: none !important;
        }
        
        .pricing-tabs [data-state="inactive"] {
          color: #6c757d !important;
          background-color: transparent !important;
        }
        
        .transition-all { transition: all 0.2s ease-in-out; }
      `}</style>
    </Layout>
  );
}
