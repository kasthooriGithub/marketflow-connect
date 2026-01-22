import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from 'contexts/AuthContext';
import { Layout } from 'components/layout/Layout';
import { Button } from 'components/ui/button';
import { Tab, Nav } from 'react-bootstrap';
import { services } from 'data/services';
import { ServiceCard } from 'components/services/ServiceCard';
import { AddServiceModal } from 'components/vendor/AddServiceModal';
import { AddPortfolioModal } from 'components/vendor/AddPortfolioModal';
import { useVendorServices } from 'contexts/VendorServicesContext';
import {
  MapPin,
  Calendar,
  Clock,
  Star,
  CheckCircle,
  Edit,
  Plus,
  Briefcase,
  MessageSquare,
  ExternalLink,
  Image as ImageIcon,
  Trash2
} from 'lucide-react';
import { Container, Row, Col, Card } from 'react-bootstrap';

function PortfolioSection({
  vendor,
  isOwner,
  onAddPortfolio
}) {
  return (
    <div className="d-flex flex-column gap-4">
      {isOwner && (
        <div className="d-flex justify-content-end">
          <Button variant="outline" size="sm" onClick={onAddPortfolio}>
            <Plus size={16} className="me-2" />
            Add Portfolio Item
          </Button>
        </div>
      )}

      <Row xs={1} md={2} className="g-4">
        {vendor.portfolio.map((item) => (
          <Col key={item.id}>
            <Card className="h-100 border shadow-sm overflow-hidden group">
              <div className="ratio ratio-16x9 bg-light position-relative">
                <img
                  src={item.image}
                  alt={item.title}
                  className="object-fit-cover w-100 h-100"
                />
                <div className="position-absolute top-50 start-50 translate-middle d-flex gap-2 opacity-0 hover-opacity-100 transition-opacity bg-dark bg-opacity-50 p-2 rounded">
                  <Button size="sm" variant="secondary">
                    <ExternalLink size={16} className="me-2" />
                    View
                  </Button>
                  {isOwner && (
                    <Button size="sm" variant="destructive">
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>
              </div>
              <Card.Body>
                <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill mb-2">
                  {item.category}
                </span>
                <Card.Title className="h6 fw-bold mb-1">{item.title}</Card.Title>
                <Card.Text className="small text-muted">{item.description}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {vendor.portfolio.length === 0 && (
        <div className="text-center py-5 bg-light rounded border border-dashed">
          <ImageIcon size={48} className="text-muted mb-3" />
          <h3 className="h6 fw-bold text-dark mb-2">No portfolio items yet</h3>
          <p className="text-secondary small mb-3">
            {isOwner ? 'Showcase your best work to attract clients' : 'This vendor hasn\'t added portfolio items yet'}
          </p>
          {isOwner && (
            <Button variant="outline" onClick={onAddPortfolio}>
              <Plus size={16} className="me-2" />
              Add Your First Project
            </Button>
          )}
        </div>
      )}
      <style>{`
        .group:hover { box-shadow: 0 0.5rem 1.5rem rgba(0,0,0,0.1); }
        .group:hover .hover-opacity-100 { opacity: 1 !important; }
      `}</style>
    </div>
  );
}

function ReviewsSection({ vendor }) {
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: vendor.reviews.filter(r => Math.floor(r.rating) === rating).length,
    percentage: vendor.reviews.length > 0 ? (vendor.reviews.filter(r => Math.floor(r.rating) === rating).length / vendor.reviews.length) * 100 : 0
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

function ServicesSection({
  vendorId,
  isOwner,
  onAddService
}) {
  const { vendorServices } = useVendorServices();
  const staticVendorServices = services.filter(s => s.vendorId === vendorId);
  const contextVendorServices = vendorServices.filter(s => s.vendorId === vendorId);
  const allVendorServices = [...staticVendorServices, ...contextVendorServices];

  return (
    <div className="d-flex flex-column gap-4">
      {isOwner && (
        <div className="d-flex justify-content-end">
          <Button variant="default" size="sm" onClick={onAddService}>
            <Plus size={16} className="me-2" />
            Add New Service
          </Button>
        </div>
      )}

      {allVendorServices.length > 0 ? (
        <Row xs={1} md={2} className="g-4">
          {allVendorServices.map((service) => (
            <Col key={service.id}>
              <div className="position-relative">
                <ServiceCard service={service} />
                {isOwner && (
                  <div className="position-absolute top-0 end-0 p-3 d-flex gap-2">
                    <Button size="icon" variant="secondary" className="bg-white shadow-sm">
                      <Edit size={16} />
                    </Button>
                    <Button size="icon" variant="destructive" className="shadow-sm">
                      <Trash2 size={16} />
                    </Button>
                  </div>
                )}
              </div>
            </Col>
          ))}
        </Row>
      ) : (
        <div className="text-center py-5 bg-light rounded border border-dashed">
          <Briefcase size={48} className="text-muted mb-3" />
          <h3 className="h6 fw-bold text-dark mb-2">No services listed</h3>
          <p className="text-secondary small mb-3">
            {isOwner ? 'Start selling by adding your first service' : 'This vendor hasn\'t listed any services yet'}
          </p>
          {isOwner && (
            <Button variant="default" onClick={onAddService}>
              <Plus size={16} className="me-2" />
              Add Your First Service
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default function VendorProfile() {
  const { user } = useAuth();
  const { currentVendor, loadingVendor } = useVendorServices();
  const [activeTab, setActiveTab] = useState('portfolio');
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false);
  const [portfolioItems, setPortfolioItems] = useState([]);

  const isOwner = true;

  const handleAddPortfolio = () => {
    setIsPortfolioModalOpen(true);
  };

  const handleAddService = () => {
    setIsServiceModalOpen(true);
  };

  const handleSavePortfolioItem = (item) => {
    setPortfolioItems(prev => [...prev, item]);
  };

  const displayVendor = currentVendor || {
    id: user?.id || 'unknown',
    name: user?.name || 'Your Name',
    email: user?.email || '',
    tagline: 'Your tagline goes here',
    description: 'Add a description to your profile',
    location: 'Location',
    memberSince: new Date().getFullYear().toString(),
    responseTime: '24 hours',
    completionRate: 0,
    totalProjects: 0,
    rating: 0,
    reviewCount: 0,
    skills: [],
    categories: [],
    startingPrice: 0,
    portfolio: [],
    reviews: []
  };

  if (loadingVendor) {
    return (
      <Layout>
        <div className="min-vh-100 d-flex align-items-center justify-content-center">
          <p>Loading profile...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-vh-100 bg-white pb-5">
        <div className="bg-primary position-relative" style={{ height: 250 }}>
          <div className="bg-gradient-to-r from-primary via-primary/80 to-accent w-100 h-100"></div>
          {isOwner && (
            <Button
              variant="secondary"
              size="sm"
              className="position-absolute bottom-0 end-0 m-4"
            >
              <Edit size={16} className="me-2" />
              Edit Cover
            </Button>
          )}
        </div>

        <Container>
          <div className="position-relative" style={{ marginTop: -80, marginBottom: 40 }}>
            <div className="d-flex flex-column flex-md-row gap-4">
              <div className="position-relative">
                <div className="rounded-4 bg-white p-1 shadow-lg d-inline-block">
                  <div className="rounded-4 bg-light d-flex align-items-center justify-content-center overflow-hidden" style={{ width: 128, height: 128 }}>
                    {displayVendor.avatar ? (
                      <img src={displayVendor.avatar} alt={displayVendor.name} className="w-100 h-100 object-fit-cover" />
                    ) : (
                      <span className="display-4 fw-bold text-primary">
                        {displayVendor.name.charAt(0)}
                      </span>
                    )}
                  </div>
                </div>
                {isOwner && (
                  <Button
                    size="icon"
                    variant="secondary"
                    className="position-absolute bottom-0 end-0 translate-middle-x rounded-circle shadow-sm"
                    style={{ width: 32, height: 32 }}
                  >
                    <Edit size={16} />
                  </Button>
                )}
              </div>

              <div className="flex-grow-1 pt-3">
                <div className="d-flex flex-column flex-md-row justify-content-between gap-3">
                  <div>
                    <h1 className="h2 fw-bold text-dark mb-1">{displayVendor.name}</h1>
                    <p className="text-secondary mb-2">{displayVendor.tagline}</p>

                    <div className="d-flex flex-wrap gap-3 small text-muted">
                      <span className="d-flex align-items-center gap-1">
                        <MapPin size={16} /> {displayVendor.location}
                      </span>
                      <span className="d-flex align-items-center gap-1">
                        <Calendar size={16} /> Member since {displayVendor.memberSince}
                      </span>
                      <span className="d-flex align-items-center gap-1">
                        <Clock size={16} /> Responds {displayVendor.responseTime}
                      </span>
                    </div>
                  </div>

                  <div className="d-flex gap-2">
                    {isOwner ? (
                      <Button variant="outline">
                        <Edit size={16} className="me-2" />
                        Edit Profile
                      </Button>
                    ) : (
                      <>
                        <Button variant="outline">
                          <MessageSquare size={16} className="me-2" />
                          Message
                        </Button>
                        <Button variant="default">
                          Hire Me
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Row className="g-3 mb-5">
            {[
              { label: 'reviews', value: displayVendor.reviewCount, icon: Star, color: 'text-warning' },
              { label: 'Completed projects', value: displayVendor.totalProjects },
              { label: 'Completion rate', value: `${displayVendor.completionRate}%`, icon: CheckCircle, color: 'text-success' },
              { label: 'Response time', value: displayVendor.responseTime }
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
                  <p className="text-secondary">{displayVendor.description}</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="h-100 shadow-sm border">
                <Card.Body className="p-4">
                  <h2 className="h5 fw-bold mb-3">Skills</h2>
                  <div className="d-flex flex-wrap gap-2">
                    {displayVendor.skills.map((skill) => (
                      <span key={skill} className="badge bg-primary bg-opacity-10 text-primary fw-normal px-3 py-2">
                        {skill}
                      </span>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'portfolio')}>
            <Nav variant="tabs" className="mb-4">
              <Nav.Item>
                <Nav.Link eventKey="portfolio" className="px-4 py-3">Portfolio</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="services" className="px-4 py-3">Services</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="reviews" className="px-4 py-3">Reviews</Nav.Link>
              </Nav.Item>
            </Nav>

            <Tab.Content>
              <Tab.Pane eventKey="portfolio">
                <PortfolioSection
                  vendor={{
                    ...displayVendor,
                    portfolio: [...displayVendor.portfolio, ...portfolioItems]
                  }}
                  isOwner={isOwner}
                  onAddPortfolio={handleAddPortfolio}
                />
              </Tab.Pane>
              <Tab.Pane eventKey="services">
                <ServicesSection
                  vendorId={displayVendor.id}
                  isOwner={isOwner}
                  onAddService={handleAddService}
                />
              </Tab.Pane>
              <Tab.Pane eventKey="reviews">
                <ReviewsSection vendor={displayVendor} />
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>

        </Container>
      </div>

      <AddServiceModal
        open={isServiceModalOpen}
        onOpenChange={setIsServiceModalOpen}
      />
      <AddPortfolioModal
        open={isPortfolioModalOpen}
        onOpenChange={setIsPortfolioModalOpen}
        onSave={handleSavePortfolioItem}
      />
    </Layout>
  );
}
