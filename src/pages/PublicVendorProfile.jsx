import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  Clock,
  Star,
  CheckCircle,
  MessageSquare,
  ArrowLeft,
  ExternalLink,
  Briefcase
} from 'lucide-react';
import { Layout } from 'components/layout/Layout';
import { Button } from 'components/ui/button';
import { Badge } from 'components/ui/badge';
import { ServiceCard } from 'components/services/ServiceCard';
import { getVendorById } from 'data/vendors';
import { services } from 'data/services';
import { useAuth } from 'contexts/AuthContext';
import { useMessaging } from 'contexts/MessagingContext';
import { toast } from 'sonner';
import { Container, Row, Col, Card, Tab, Nav } from 'react-bootstrap';

function PortfolioSection({ vendor }) {
  return (
    <Row xs={1} md={2} className="g-4">
      {vendor.portfolio.map((item) => (
        <Col key={item.id}>
          <Card className="h-100 overflow-hidden border shadow-sm group">
            <div className="ratio ratio-16x9 bg-light position-relative">
              <img
                src={item.image}
                alt={item.title}
                className="object-fit-cover w-100 h-100"
              />
              <div className="position-absolute top-50 start-50 translate-middle opacity-0 hover-opacity-100 transition-opacity bg-dark bg-opacity-50 p-2 rounded">
                <Button size="sm" variant="secondary">
                  <ExternalLink size={16} className="me-2" />
                  View Project
                </Button>
              </div>
            </div>
            <Card.Body>
              <Badge variant="secondary" className="mb-2">{item.category}</Badge>
              <Card.Title className="h6 fw-bold mb-1">{item.title}</Card.Title>
              <Card.Text className="small text-muted">{item.description}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      ))}

      {vendor.portfolio.length === 0 && (
        <Col xs={12}>
          <div className="text-center py-5 bg-light rounded border border-dashed">
            <Briefcase size={48} className="text-muted mb-3" />
            <h3 className="h6 fw-bold text-dark mb-2">No portfolio items yet</h3>
            <p className="text-secondary small">
              This vendor hasn't added portfolio items yet
            </p>
          </div>
        </Col>
      )}
      <style>{`
        .group:hover .hover-opacity-100 { opacity: 1 !important; }
      `}</style>
    </Row>
  );
}

function ReviewsSection({ vendor }) {
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: vendor.reviews.filter(r => Math.floor(r.rating) === rating).length,
    percentage: vendor.reviews.length > 0
      ? (vendor.reviews.filter(r => Math.floor(r.rating) === rating).length / vendor.reviews.length) * 100
      : 0
  }));

  return (
    <div className="d-flex flex-column gap-4">
      <Card className="border">
        <Card.Body className="p-4">
          <div className="d-flex flex-column flex-md-row gap-4">
            <div className="text-center text-md-start">
              <div className="display-4 fw-bold">{vendor.rating}</div>
              <div className="d-flex justify-content-center justify-content-md-start gap-1 mt-2 text-warning">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    className={i < Math.floor(vendor.rating) ? 'fill-warning' : 'text-muted'}
                  />
                ))}
              </div>
              <p className="small text-muted mt-1">{vendor.reviewCount} reviews</p>
            </div>

            <div className="flex-grow-1 d-flex flex-column gap-2">
              {ratingDistribution.map(({ rating, count, percentage }) => (
                <div key={rating} className="d-flex align-items-center gap-3">
                  <span className="small text-muted" style={{ width: 24 }}>{rating}</span>
                  <Star size={16} className="text-warning fill-warning" />
                  <div className="flex-grow-1 bg-light rounded-pill" style={{ height: 8 }}>
                    <div
                      className="bg-warning rounded-pill h-100"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="small text-muted" style={{ width: 30 }}>{count}</span>
                </div>
              ))}
            </div>
          </div>
        </Card.Body>
      </Card>

      <div className="d-flex flex-column gap-3">
        {vendor.reviews.map((review) => (
          <Card key={review.id} className="border">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div className="d-flex align-items-center gap-3">
                  <div className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
                    <span className="text-primary fw-bold">
                      {review.clientName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h6 className="fw-bold mb-0">{review.clientName}</h6>
                    <p className="small text-muted mb-0">{review.serviceName}</p>
                  </div>
                </div>
                <div className="d-flex gap-1 text-warning">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < review.rating ? 'fill-warning' : 'text-muted'}
                    />
                  ))}
                </div>
              </div>
              <p className="text-secondary mb-2">{review.comment}</p>
              <p className="small text-muted mb-0">
                {new Date(review.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </Card.Body>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ServicesSection({ vendorId }) {
  const vendorServices = services.filter(s => s.vendorId === vendorId);

  return (
    <div className="d-flex flex-column gap-4">
      {vendorServices.length > 0 ? (
        <Row xs={1} md={2} className="g-4">
          {vendorServices.map((service) => (
            <Col key={service.id}>
              <ServiceCard service={service} />
            </Col>
          ))}
        </Row>
      ) : (
        <div className="text-center py-5 bg-light rounded border border-dashed">
          <Briefcase size={48} className="text-muted mb-3" />
          <h3 className="h6 fw-bold text-dark mb-2">No services listed</h3>
          <p className="text-secondary small">
            This vendor hasn't listed any services yet
          </p>
        </div>
      )}
    </div>
  );
}

export default function PublicVendorProfile() {
  const { vendorId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { startConversation, setActiveConversation } = useMessaging();
  const [activeTab, setActiveTab] = useState('portfolio');

  const vendor = vendorId ? getVendorById(vendorId) : null;

  if (!vendor) {
    return (
      <Layout>
        <Container className="py-5 text-center">
          <h1 className="h3 fw-bold mb-4">Vendor not found</h1>
          <Button onClick={() => navigate('/services')}>Browse Services</Button>
        </Container>
      </Layout>
    );
  }

  const handleContactVendor = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to message vendors');
      navigate('/login');
      return;
    }

    const vendorServices = services.filter(s => s.vendorId === vendor.id);
    const serviceName = vendorServices.length > 0 ? vendorServices[0].title : 'General Inquiry';
    const serviceId = vendorServices.length > 0 ? vendorServices[0].id : 'general';

    try {
      const conversation = await startConversation(
        vendor.id,
        vendor.name,
        serviceId,
        serviceName
      );

      if (conversation) {
        setActiveConversation(conversation);
        navigate('/messages');
        toast.success(`Started conversation with ${vendor.name}`);
      }
    } catch (error) {
      console.error("Failed to start conversation", error);
      toast.error("Could not start conversation");
    }
  };

  const vendorServices = services.filter(s => s.vendorId === vendor.id);

  return (
    <Layout>
      <div className="min-vh-100 bg-white pb-5">
        <div className="bg-primary position-relative" style={{ height: 250 }}>
          <div className="bg-gradient-to-r from-primary via-primary/80 to-accent w-100 h-100"></div>
          <Button
            variant="light"
            size="sm"
            className="position-absolute top-0 start-0 m-4 text-primary"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={16} className="me-2" />
            Back
          </Button>
        </div>

        <Container>
          <div className="position-relative" style={{ marginTop: -80, marginBottom: 40 }}>
            <div className="d-flex flex-column flex-md-row gap-4">
              <div className="position-relative">
                <div className="rounded-4 bg-white p-1 shadow-lg d-inline-block">
                  <div className="rounded-4 bg-light d-flex align-items-center justify-content-center overflow-hidden" style={{ width: 128, height: 128 }}>
                    {vendor.avatar ? (
                      <img src={vendor.avatar} alt={vendor.name} className="w-100 h-100 object-fit-cover" />
                    ) : (
                      <span className="display-4 fw-bold text-primary">
                        {vendor.name.charAt(0)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex-grow-1 pt-3">
                <div className="d-flex flex-column flex-md-row justify-content-between gap-3">
                  <div>
                    <h1 className="h2 fw-bold text-dark mb-1">{vendor.name}</h1>
                    <p className="text-secondary mb-2">{vendor.tagline}</p>

                    <div className="d-flex flex-wrap gap-3 small text-muted">
                      <span className="d-flex align-items-center gap-1">
                        <MapPin size={16} /> {vendor.location}
                      </span>
                      <span className="d-flex align-items-center gap-1">
                        <Calendar size={16} /> Member since {vendor.memberSince}
                      </span>
                      <span className="d-flex align-items-center gap-1">
                        <Clock size={16} /> Responds {vendor.responseTime}
                      </span>
                    </div>
                  </div>

                  <div className="d-flex gap-2">
                    <Button variant="outline" onClick={handleContactVendor}>
                      <MessageSquare size={16} className="me-2" />
                      Message
                    </Button>
                    {vendorServices.length > 0 && (
                      <Link to={`/services/${vendorServices[0].id}`}>
                        <Button variant="default">View Services</Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Row className="g-3 mb-5">
            {[
              { label: 'reviews', value: vendor.reviewCount, icon: Star, color: 'text-warning' },
              { label: 'Completed projects', value: vendor.totalProjects },
              { label: 'Completion rate', value: `${vendor.completionRate}%`, icon: CheckCircle, color: 'text-success' },
              { label: 'Starting price', value: `$${vendor.startingPrice}` }
            ].map((stat, idx) => (
              <Col xs={6} md={3} key={idx}>
                <Card className="text-center h-100 shadow-sm border">
                  <Card.Body className="p-3">
                    <div className="d-flex justify-content-center align-items-center gap-1 mb-1">
                      {stat.icon && <stat.icon size={20} className={stat.color} />}
                      <span className="h4 fw-bold text-dark mb-0">{stat.value}</span>
                    </div>
                    <p className="small text-muted mb-0">{stat.label}</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          <Row className="g-4 mb-5">
            <Col md={8}>
              <Card className="h-100 shadow-sm border">
                <Card.Body className="p-4">
                  <h2 className="h5 fw-bold mb-3">About</h2>
                  <p className="text-secondary">{vendor.description}</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="h-100 shadow-sm border">
                <Card.Body className="p-4 relative">
                  <h2 className="h5 fw-bold mb-3">Skills</h2>
                  <div className="d-flex flex-wrap gap-2">
                    {vendor.skills.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <div className="mb-5 bg-primary bg-opacity-10 rounded p-4 border border-primary border-opacity-25">
            <div className="d-flex align-items-start gap-4">
              <div className="d-flex align-items-center justify-content-center flex-shrink-0 bg-primary bg-opacity-10 rounded-circle" style={{ width: 48, height: 48 }}>
                <MessageSquare size={24} className="text-primary" />
              </div>
              <div>
                <h3 className="h6 fw-bold mb-1">Message Before You Pay</h3>
                <p className="small text-secondary mb-2">
                  Discuss your project requirements, clarify scope, and get to know {vendor.name} before committing.
                  Only proceed to checkout when you're confident about the engagement.
                </p>
                <Button variant="link" className="p-0 text-decoration-none" onClick={handleContactVendor}>
                  Start a conversation →
                </Button>
              </div>
            </div>
          </div>

          <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'portfolio')}>
            <Nav variant="tabs" className="mb-4">
              <Nav.Item>
                <Nav.Link eventKey="portfolio" className="px-4 py-3">Portfolio ({vendor.portfolio.length})</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="services" className="px-4 py-3">Services ({vendorServices.length})</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="reviews" className="px-4 py-3">Reviews ({vendor.reviewCount})</Nav.Link>
              </Nav.Item>
            </Nav>

            <Tab.Content>
              <Tab.Pane eventKey="portfolio">
                <PortfolioSection vendor={vendor} />
              </Tab.Pane>
              <Tab.Pane eventKey="services">
                <ServicesSection vendorId={vendor.id} />
              </Tab.Pane>
              <Tab.Pane eventKey="reviews">
                <ReviewsSection vendor={vendor} />
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </Container>
      </div>
    </Layout>
  );
}
