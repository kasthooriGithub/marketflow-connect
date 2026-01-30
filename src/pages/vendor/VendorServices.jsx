import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from 'components/layout/Layout';
import { Button } from 'components/ui/button';
import { useAuth } from 'contexts/AuthContext';
import { AddServiceModal } from 'components/vendor/AddServiceModal';
import { db } from 'lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { ArrowLeft, Plus, Eye, Star, Package } from 'lucide-react';
import { Container, Row, Col, Card, Badge } from 'react-bootstrap';

export default function MyServices() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;
    
    // Real-time listener for services belonging to this vendor
    const q = query(collection(db, 'services'), where('vendor_id', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setServices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [user]);

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="spinner-border text-primary" role="status"></div>
    </div>
  );

  return (
    <Layout>
      <div className="bg-light min-vh-100 py-5">
        <Container>
          {/* Header Section */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-5 gap-3">
            <div>
              <Link to="/dashboard" className="text-decoration-none text-primary fw-bold small d-flex align-items-center mb-2">
                <ArrowLeft size={16} className="me-2" /> DASHBOARD
              </Link>
              <h1 className="display-6 fw-bold text-dark mb-1">My Service Catalog</h1>
              <p className="text-muted mb-0">You have {services.length} active listings online</p>
            </div>
            <Button 
              className="rounded-pill px-4 py-2 shadow-sm d-flex align-items-center" 
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus size={20} className="me-2" /> New Service
            </Button>
          </div>

          {services.length > 0 ? (
            <Row className="g-4">
              {services.map((service) => (
                <Col md={6} lg={4} key={service.id}>
                  <Card className="h-100 border-0 shadow-sm hover-card rounded-4 overflow-hidden bg-white">
                    {/* Top Decorative Banner */}
                    <div className="service-banner d-flex align-items-center justify-content-center">
                       <div className="banner-overlay"></div>
                       <Package size={40} className="text-white position-relative z-1" />
                    </div>

                    <Card.Body className="p-4">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <Badge bg="primary" className="bg-opacity-10 text-primary fw-semibold px-2 py-1">
                          {service.tags?.[0] || 'Digital'}
                        </Badge>
                        <div className="d-flex align-items-center gap-1">
                          <Star size={14} className="text-warning fill-warning" />
                          <span className="fw-bold small">{service.total_reviews || 0}</span>
                        </div>
                      </div>

                      <Card.Title className="h5 fw-bold text-dark mb-2 text-truncate">
                        {service.title}
                      </Card.Title>

                      <div className="d-flex align-items-center gap-2 mb-4">
                        <span className="h4 fw-bold text-primary mb-0">${service.price}</span>
                        <span className="text-muted small text-uppercase">/ {service.priceType}</span>
                      </div>

                      {/* Details Button - Navigates to VendorServiceDetails */}
                      <div className="d-flex gap-2">
                        <Button 
                          variant="outline-dark" 
                          className="w-100 rounded-3 d-flex align-items-center justify-content-center py-2"
                          onClick={() => navigate(`/vendor/services/${service.id}`)}
                        >
                          <Eye size={18} className="me-2" /> View Details
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            /* Empty State */
            <div className="text-center py-5 bg-white rounded-4 shadow-sm border">
              <Package size={60} className="text-muted opacity-25 mb-3" />
              <h3>No services found</h3>
              <p className="text-muted mb-4">Let's create your first professional listing!</p>
              <Button onClick={() => setIsAddModalOpen(true)} className="rounded-pill px-5">Get Started</Button>
            </div>
          )}

          {/* Add Service Modal */}
          <AddServiceModal
            open={isAddModalOpen}
            onOpenChange={(val) => setIsAddModalOpen(val)}
          />

        </Container>
      </div>

      <style>{`
        .service-banner { 
          height: 120px; 
          background: linear-gradient(135deg, #5f79a5 0%, #356ec9 100%); 
          position: relative;
        }
        .banner-overlay {
          position: absolute;
          width: 100%;
          height: 100%;
          background: url('https://www.transparenttextures.com/patterns/cubes.png');
          opacity: 0.1;
        }
        .hover-card { 
          transition: all 0.3s ease; 
          border: 1px solid rgba(87, 92, 122, 0.05) !important;
        }
        .hover-card:hover { 
          transform: translateY(-8px); 
          box-shadow: 0 15px 30px rgba(198, 160, 160, 0.1) !important;
        }
        .text-truncate { 
          overflow: hidden; 
          text-overflow: ellipsis; 
          white-space: nowrap; 
        }
      `}</style>
    </Layout>
  );
}