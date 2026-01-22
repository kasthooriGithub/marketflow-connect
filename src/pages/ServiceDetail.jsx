import { useState } from 'react';
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
import { getServiceById } from 'data/services';
import { getVendorById, vendors } from 'data/vendors';
import { useAuth } from 'contexts/AuthContext';
import { useCart } from 'contexts/CartContext';
import { useMessaging } from 'contexts/MessagingContext';
import { toast } from 'sonner';
import { Container, Row, Col, Card, Tab } from 'react-bootstrap';

export default function ServiceDetail() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { startConversation, setActiveConversation } = useMessaging();
  const navigate = useNavigate();
  const [selectedTier, setSelectedTier] = useState('standard');
  const [activeTab, setActiveTab] = useState('description');

  const service = getServiceById(id || '');
  const vendor = service ? getVendorById(service.vendorId) || vendors.find(v => v.name === service.vendorName) : null;

  const generateTiers = () => {
    if (!service) return [];
    const basePrice = service.price;
    return [
      {
        id: 'basic',
        name: 'Basic',
        price: Math.round(basePrice * 0.6),
        description: 'Essential package for getting started',
        deliveryTime: service.deliveryTime === 'Ongoing' ? '7 days' : service.deliveryTime,
        revisions: 1,
        features: service.features.slice(0, 3),
      },
      {
        id: 'standard',
        name: 'Standard',
        price: basePrice,
        description: 'Most popular choice for professionals',
        deliveryTime: service.deliveryTime === 'Ongoing' ? '5 days' : service.deliveryTime.replace(/\d+/, (match) => String(Math.max(1, parseInt(match) - 2))),
        revisions: 3,
        features: service.features.slice(0, 5),
        popular: true,
      },
      {
        id: 'premium',
        name: 'Premium',
        price: Math.round(basePrice * 1.8),
        description: 'Complete solution with priority support',
        deliveryTime: service.deliveryTime === 'Ongoing' ? '3 days' : service.deliveryTime.replace(/\d+/, (match) => String(Math.max(1, parseInt(match) - 4))),
        revisions: -1, // Unlimited
        features: service.features,
      },
    ];
  };

  const tiers = generateTiers();
  const currentTier = tiers.find(t => t.id === selectedTier) || tiers[1];

  const handleAddToCart = () => {
    if (!service) return;
    const modifiedService = { ...service, price: currentTier.price };
    addToCart(modifiedService, 'one-time', undefined);
    toast.success(`${currentTier.name} package added to cart!`);
  };

  const handleBuyNow = () => {
    if (!service) return;
    const modifiedService = { ...service, price: currentTier.price };
    addToCart(modifiedService, 'one-time', undefined);
    navigate('/cart');
  };

  const handleContactVendor = async () => {
    if (!service) return;
    try {
      const conversation = await startConversation(
        service.vendorId,
        service.vendorName,
        service.id,
        service.title
      );
      if (conversation) {
        setActiveConversation(conversation);
        navigate('/messages');
        toast.success('Conversation started!');
      }
    } catch (error) {
      console.error("Failed to start conversation:", error);
      toast.error("Failed to start conversation. Please try again.");
    }
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: { pathname: `/services/${id}` } }} />;
  }

  if (!service) {
    return (
      <Layout>
        <Container className="py-5 text-center">
          <h1 className="h3 fw-bold mb-4">Service not found</h1>
          <Link to="/services">
            <Button>Back to Services</Button>
          </Link>
        </Container>
      </Layout>
    );
  }

  const vendorReviews = vendor?.reviews || [
    { id: 'r1', clientName: 'Happy Customer', rating: 5, comment: 'Excellent service! Would highly recommend.', serviceName: service.title, date: '2024-01-15' },
    { id: 'r2', clientName: 'Satisfied Client', rating: 4, comment: 'Great work and professional communication.', serviceName: service.title, date: '2024-01-10' },
  ];

  const ratingDistribution = [
    { stars: 5, percentage: 78 },
    { stars: 4, percentage: 15 },
    { stars: 3, percentage: 5 },
    { stars: 2, percentage: 1 },
    { stars: 1, percentage: 1 },
  ];

  return (
    <Layout>
      {/* Breadcrumb */}
      <div className="bg-light border-bottom py-3">
        <Container>
          <div className="d-flex align-items-center gap-2 small text-muted">
            <Link to="/services" className="text-decoration-none text-muted">
              Services
            </Link>
            <ChevronRight size={14} />
            <Link to={`/category/${service.category}`} className="text-decoration-none text-muted text-capitalize">
              {service.category.replace('-', ' ')}
            </Link>
            <ChevronRight size={14} />
            <span className="text-dark text-truncate" style={{ maxWidth: '200px' }}>{service.title}</span>
          </div>
        </Container>
      </div>

      <Container className="py-5">
        <Row className="g-5">
          {/* Main Content - Left Side */}
          <Col lg={8}>
            {/* Service Title */}
            <h1 className="display-6 fw-bold text-dark mb-4">
              {service.title}
            </h1>

            {/* Vendor Info Bar */}
            <Card className="mb-4 border">
              <Card.Body className="p-3 d-flex flex-wrap align-items-center gap-3">
                <Link to={`/vendors/${vendor?.id || service.vendorId}`} className="d-flex align-items-center gap-3 text-dark text-decoration-none">
                  <div className="bg-light rounded-circle d-flex align-items-center justify-content-center" style={{ width: 48, height: 48 }}>
                    <span className="fw-bold">{service.vendorName.charAt(0)}</span>
                  </div>
                  <div>
                    <div className="d-flex align-items-center gap-2">
                      <span className="fw-bold">{service.vendorName}</span>
                      <BadgeCheck size={16} className="text-primary" />
                    </div>
                    <p className="small text-muted mb-0">
                      {vendor?.tagline || 'Verified Seller'}
                    </p>
                  </div>
                </Link>

                <div className="vr d-none d-sm-block mx-2"></div>

                <div className="d-flex align-items-center gap-1">
                  <Star size={20} className="text-warning fill-warning" />
                  <span className="fw-bold">{service.rating}</span>
                  <span className="text-muted">({service.reviewCount})</span>
                </div>

                <div className="vr d-none d-sm-block mx-2"></div>

                <div className="d-flex align-items-center gap-3 small text-muted">
                  <div className="d-flex align-items-center gap-1">
                    <TrendingUp size={16} />
                    <span>{vendor?.totalProjects || 100}+ orders</span>
                  </div>
                </div>
              </Card.Body>
            </Card>

            {/* Service Media Preview */}
            <div className="ratio ratio-16x9 rounded overflow-hidden bg-light mb-4 border d-flex align-items-center justify-content-center">
              <div className="text-center position-absolute top-50 start-50 translate-middle">
                <div className="rounded-circle bg-white shadow-sm p-3 mb-3 d-inline-flex align-items-center justify-content-center" style={{ width: 80, height: 80 }}>
                  <Play size={32} className="text-primary ms-1" />
                </div>
                <div className="fs-1">
                  {service.tags[0] === 'SEO' ? '🔍' :
                    service.tags[0] === 'Social Media' ? '📱' :
                      service.tags[0] === 'Content' ? '✍️' :
                        service.tags[0] === 'PPC' ? '📈' :
                          service.tags[0] === 'Video' ? '🎬' :
                            service.tags[0] === 'Branding' ? '🎨' :
                              service.tags[0] === 'Email' ? '📧' : '📊'}
                </div>
              </div>
            </div>

            {/* Tabbed Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
              <TabsList>
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="reviews">Reviews ({service.reviewCount})</TabsTrigger>
              </TabsList>

              <TabsContent value="description">
                <div className="mb-5">
                  <h2 className="h4 fw-bold mb-3">About This Service</h2>
                  <p className="text-secondary lh-lg mb-4">
                    {service.longDescription}
                  </p>

                  <h2 className="h4 fw-bold mb-3">What's Included</h2>
                  <Row xs={1} sm={2} className="g-3 mb-4">
                    {service.features.map((feature, index) => (
                      <Col key={index}>
                        <div className="d-flex align-items-start gap-3 p-3 rounded bg-light">
                          <Check size={16} className="text-primary mt-1 flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      </Col>
                    ))}
                  </Row>

                  <h2 className="h4 fw-bold mb-3">Tags</h2>
                  <div className="d-flex flex-wrap gap-2">
                    {service.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="px-3 py-2 fw-normal fs-6">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="reviews">
                <Row className="mb-5 align-items-center">
                  <Col md={6} className="text-center text-md-start mb-4 mb-md-0">
                    <div className="display-4 fw-bold">{service.rating}</div>
                    <div className="d-flex justify-content-center justify-content-md-start gap-1 my-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={20}
                          className={star <= Math.round(service.rating) ? 'text-warning fill-warning' : 'text-muted'}
                        />
                      ))}
                    </div>
                    <p className="text-muted">{service.reviewCount} reviews</p>
                  </Col>
                  <Col md={6}>
                    {ratingDistribution.map(({ stars, percentage }) => (
                      <div key={stars} className="d-flex align-items-center gap-2 mb-2">
                        <span className="small text-muted" style={{ width: 50 }}>{stars} Stars</span>
                        <div className="progress flex-grow-1" style={{ height: 8 }}>
                          <div
                            className="progress-bar"
                            role="progressbar"
                            style={{ width: `${percentage}%` }}
                            aria-valuenow={percentage}
                            aria-valuemin="0"
                            aria-valuemax="100"
                          ></div>
                        </div>
                        <span className="small text-muted" style={{ width: 30 }}>{percentage}%</span>
                      </div>
                    ))}
                  </Col>
                </Row>
                <div className="d-flex flex-column gap-3">
                  {vendorReviews.map((review) => (
                    <Card key={review.id} className="border">
                      <Card.Body>
                        <div className="d-flex gap-3">
                          <div className="bg-light rounded-circle d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
                            <span>{review.clientName.charAt(0)}</span>
                          </div>
                          <div>
                            <div className="d-flex align-items-center gap-2">
                              <span className="fw-bold">{review.clientName}</span>
                              <div className="d-flex gap-0">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    size={14}
                                    className={star <= review.rating ? 'text-warning fill-warning' : 'text-muted'}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="small text-muted mb-1">{review.date}</p>
                            <p className="mb-0 text-secondary">{review.comment}</p>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

          </Col>

          {/* Right Side - Pricing */}
          <Col lg={4}>
            <div className="sticky-top" style={{ top: '100px' }}>
              <Card className="border shadow-sm overflow-hidden">
                <div className="d-flex border-bottom bg-light">
                  {tiers.map((tier) => (
                    <button
                      key={tier.id}
                      onClick={() => setSelectedTier(tier.id)}
                      className={`flex-fill border-0 py-3 px-2 bg-transparent fw-bold ${selectedTier === tier.id ? 'text-primary border-bottom border-primary border-3' : 'text-muted'}`}
                    >
                      {tier.name}
                    </button>
                  ))}
                </div>
                <Card.Body className="p-4">
                  <div className="d-flex align-items-baseline gap-2 mb-3">
                    <h3 className="fw-bold mb-0">${currentTier.price}</h3>
                  </div>
                  <p className="text-muted small mb-4">{currentTier.description}</p>

                  <div className="d-flex align-items-center justify-content-between small text-muted mb-4 pb-3 border-bottom">
                    <div className="d-flex align-items-center gap-2">
                      <Clock size={16} />
                      {currentTier.deliveryTime}
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <RefreshCw size={16} />
                      {currentTier.revisions === -1 ? 'Unlimited' : `${currentTier.revisions} Revisions`}
                    </div>
                  </div>

                  <div className="d-flex flex-column gap-2 mb-4">
                    {service.features.map((feature, index) => {
                      const isIncluded = index < currentTier.features.length;
                      return (
                        <div key={index} className={`d-flex align-items-center gap-2 small ${!isIncluded ? 'opacity-50 text-decoration-line-through' : ''}`}>
                          <Check size={16} className={isIncluded ? 'text-primary' : 'text-muted'} />
                          <span>{feature}</span>
                        </div>
                      )
                    })}
                  </div>

                  <div className="d-flex flex-column gap-2">
                    <Button variant="primary" size="lg" className="w-100" onClick={handleBuyNow}>
                      Continue (${currentTier.price})
                    </Button>
                    <Button variant="outline" size="lg" className="w-100" onClick={handleAddToCart}>
                      Add to Cart
                    </Button>
                    <Button variant="ghost" size="lg" className="w-100" onClick={handleContactVendor}>
                      Contact Seller
                    </Button>
                  </div>

                </Card.Body>
              </Card>
            </div>
          </Col>
        </Row>
      </Container>
      <style>{`
        .fill-warning { fill: #ffc107; }
      `}</style>
    </Layout>
  );
}
