import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from 'components/layout/Layout';
import { Button } from 'components/ui/button';
import { useAuth } from 'contexts/AuthContext';
import { useVendorServices } from 'contexts/VendorServicesContext';
import { AddServiceModal } from 'components/vendor/AddServiceModal';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Eye,
  Star,
  Package,
  MoreVertical
} from 'lucide-react';
import { Container, Row, Col, Card, Badge, Dropdown, Modal } from 'react-bootstrap';

export default function MyServices() {
  const { user } = useAuth();
  const { vendorServices, deleteService, categories } = useVendorServices();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);

  const handleEditClick = (service) => {
    setEditingService(service);
    setIsAddModalOpen(true);
  };

  const handleModalClose = (open) => {
    setIsAddModalOpen(open);
    if (!open) {
      setEditingService(null);
    }
  };

  const handleDeleteClick = (serviceId) => {
    setServiceToDelete(serviceId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (serviceToDelete) {
      deleteService(serviceToDelete);
      toast.success('Service deleted successfully');
      setServiceToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  const getCategoryName = (categoryId) => {
    return categories.find(c => c.id === categoryId)?.name || categoryId;
  };

  return (
    <Layout>
      <Container className="py-5">
        {/* Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-5">
          <div>
            <Link
              to="/dashboard"
              className="d-flex align-items-center text-muted text-decoration-none small mb-2 hover-text-dark"
            >
              <ArrowLeft size={16} className="me-2" />
              Back to Dashboard
            </Link>
            <h1 className="h2 fw-bold text-dark mb-1">
              My Services
            </h1>
            <p className="text-muted mb-0">
              Manage and organize your service listings
            </p>
          </div>
          <Button variant="default" onClick={() => setIsAddModalOpen(true)}>
            <Plus size={16} className="me-2" />
            Add New Service
          </Button>
        </div>

        {/* Services Grid */}
        {vendorServices.length > 0 ? (
          <Row className="g-4">
            {vendorServices.map((service) => (
              <Col md={6} lg={4} key={service.id}>
                <Card className="h-100 shadow-sm border-0 border-top border-primary border-4 rounded-4 overflow-hidden card-transition">
                  <div className="position-relative">
                    <div className="ratio ratio-16x9 bg-light d-flex align-items-center justify-content-center overflow-hidden">
                      <div className="display-3 opacity-25">
                        {service.tags[0] === 'SEO' ? '🔍' :
                          service.tags[0] === 'Social Media' ? '📱' :
                            service.tags[0] === 'Content' ? '✍️' :
                              service.tags[0] === 'PPC' ? '📈' :
                                service.tags[0] === 'Video' ? '🎬' :
                                  service.tags[0] === 'Branding' ? '🎨' :
                                    service.tags[0] === 'Email' ? '📧' : '📊'}
                      </div>
                    </div>
                    <div className="position-absolute top-0 end-0 p-3">
                      <Dropdown>
                        <Dropdown.Toggle as="button" className="btn btn-white btn-sm shadow-sm rounded-circle p-0 d-flex align-items-center justify-content-center" style={{ width: 32, height: 32 }}>
                          <MoreVertical size={16} />
                        </Dropdown.Toggle>
                        <Dropdown.Menu align="end" className="shadow border-0 rounded-3 mt-2">
                          <Dropdown.Item as={Link} to={`/services/${service.id}`} className="py-2 px-3 small">
                            <Eye size={14} className="me-2 text-primary" /> View Service
                          </Dropdown.Item>
                          <Dropdown.Item onClick={() => handleEditClick(service)} className="py-2 px-3 small">
                            <Edit size={14} className="me-2 text-info" /> Edit Service
                          </Dropdown.Item>
                          <Dropdown.Divider />
                          <Dropdown.Item onClick={() => handleDeleteClick(service.id)} className="py-2 px-3 small text-danger">
                            <Trash2 size={14} className="me-2" /> Delete Service
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </div>
                  </div>

                  <Card.Body className="p-4">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <Badge bg="primary" className="bg-opacity-10 text-primary fw-normal px-2 py-1" style={{ fontSize: '0.7rem' }}>
                        {getCategoryName(service.category)}
                      </Badge>
                      <div className="d-flex align-items-center gap-1 small text-muted ms-auto">
                        <Star size={12} className="text-warning fill-warning" />
                        <span className="fw-bold text-dark">{service.rating}</span>
                        <span>({service.reviewCount})</span>
                      </div>
                    </div>

                    <Card.Title className="h6 fw-bold text-dark mb-2 text-truncate-2">
                      {service.title}
                    </Card.Title>

                    <Card.Text className="small text-muted mb-4 text-truncate-2">
                      {service.description}
                    </Card.Text>

                    <div className="d-flex align-items-center justify-content-between pt-3 border-top">
                      <div className="d-flex align-items-baseline gap-1">
                        <span className="h5 fw-bold text-dark mb-0">${service.price}</span>
                        <span className="small text-muted">
                          /{service.priceType === 'monthly' ? 'mo' : service.priceType === 'hourly' ? 'hr' : 'project'}
                        </span>
                      </div>
                      <Link to={`/services/${service.id}`}>
                        <Button variant="outline-primary" size="sm" className="rounded-pill px-3">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <div className="text-center py-5 bg-light rounded-4 border border-dashed">
            <div className="p-4 bg-white rounded-circle shadow-sm d-inline-block mb-4">
              <Package size={48} className="text-muted" />
            </div>
            <h2 className="h4 fw-bold text-dark mb-2">No services yet</h2>
            <p className="text-muted mb-5 mx-auto" style={{ maxWidth: 400 }}>
              Start selling by creating your first service listing. Showcase your skills and attract clients to your portfolio.
            </p>
            <Button variant="default" className="px-5 shadow-sm" onClick={() => setIsAddModalOpen(true)}>
              <Plus size={16} className="me-2" />
              Create Your First Service
            </Button>
          </div>
        )}

        {/* Add/Edit Service Modal */}
        <AddServiceModal
          open={isAddModalOpen}
          onOpenChange={handleModalClose}
          editService={editingService}
        />

        {/* Delete Confirmation Modal */}
        <Modal show={deleteDialogOpen} onHide={() => setDeleteDialogOpen(false)} centered>
          <Modal.Header closeButton className="border-0">
            <Modal.Title className="h5 fw-bold">Delete Service</Modal.Title>
          </Modal.Header>
          <Modal.Body className="py-0">
            <p className="text-secondary">
              Are you sure you want to delete this service? This action cannot be undone and will remove the listing from the marketplace.
            </p>
          </Modal.Body>
          <Modal.Footer className="border-0 pb-4 pt-3">
            <Button variant="outline-secondary" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete} className="px-4">
              Delete
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
      <style>{`
        .text-truncate-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
        .card-transition {
            transition: all 0.3s ease;
        }
        .card-transition:hover {
            transform: translateY(-5px);
            box-shadow: 0 1rem 3rem rgba(0,0,0,.1) !important;
        }
        .hover-text-dark:hover { color: #212529 !important; }
        .btn-white { background-color: #fff; color: #212529; border: 1px solid #f8f9fa; }
      `}</style>
    </Layout>
  );
}
