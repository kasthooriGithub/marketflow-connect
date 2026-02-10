import { useState, useEffect, useRef } from 'react';
import { useAuth } from 'contexts/AuthContext';
import { db, storage } from 'lib/firebase';
import {
  doc,
  onSnapshot,
  updateDoc,
  collection,
  query,
  where
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Layout } from 'components/layout/Layout';
import { Button } from 'components/ui/button';
import { Tab, Nav, Container, Row, Col, Card, Spinner, Modal, Form, Badge } from 'react-bootstrap';
import { toast } from 'sonner';
import {
  MapPin, Calendar, Star, Edit2, Plus, ImageIcon, Camera, TrendingUp, Save, Loader2
} from 'lucide-react';

import { AddServiceModal } from 'components/vendor/AddServiceModal';
import { AddPortfolioModal } from 'components/vendor/AddPortfolioModal';

export default function VendorProfile() {
  const { user } = useAuth();
  const [vendor, setVendor] = useState(null);
  const [services, setServices] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);

  const [completedCount, setCompletedCount] = useState(0);
  const [avgRating, setAvgRating] = useState(0);

  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editData, setEditData] = useState({ agency_name: '', tagline: '', location: '', bio: '' });

  const profileInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const themeGradient = 'linear-gradient(135deg, #1e3a8a 0%, #312e81 100%)';

  useEffect(() => {
    if (!user?.uid) return;

    const docRef = doc(db, 'vendors', user.uid);
    const unsubVendor = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setVendor({ id: docSnap.id, ...data });
        setEditData({
          agency_name: data.agency_name || '',
          tagline: data.tagline || '',
          location: data.location || '',
          bio: data.bio || ''
        });
      }
      setLoading(false);
    });

    const servicesRef = collection(db, 'services');
    const servicesQuery = query(servicesRef, where('vendor_id', '==', user.uid));
    const unsubServices = onSnapshot(servicesQuery, (snapshot) => {
      const servicesList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setServices(servicesList);
    });

    const portfolioRef = collection(db, 'portfolio');
    const portfolioQuery = query(portfolioRef, where('vendor_id', '==', user.uid));
    const unsubPortfolio = onSnapshot(portfolioQuery, (snapshot) => {
      const portfolioList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPortfolio(portfolioList);
    });

    const ordersRef = collection(db, 'orders');
    const ordersQuery = query(ordersRef, where('vendor_id', '==', user.uid), where('status', '==', 'completed'));
    const unsubOrders = onSnapshot(ordersQuery, (snapshot) => {
      setCompletedCount(snapshot.size);
    });

    const reviewsRef = collection(db, 'reviews');
    const reviewsQuery = query(reviewsRef, where('vendor_id', '==', user.uid));
    const unsubReviews = onSnapshot(reviewsQuery, (snapshot) => {
      if (!snapshot.empty) {
        const total = snapshot.docs.reduce((acc, curr) => acc + (curr.data().rating || 0), 0);
        setAvgRating((total / snapshot.size).toFixed(1));
      }
    });

    return () => {
      unsubVendor();
      unsubServices();
      unsubPortfolio();
      unsubOrders();
      unsubReviews();
    };
  }, [user?.uid]);

  const handlePhotoUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file || !user?.uid) return;
    try {
      setIsUpdating(true);
      const toastId = toast.loading(`Uploading ${type}...`);
      const fileRef = ref(storage, `vendors/${user.uid}/${type}_${Date.now()}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      const vendorRef = doc(db, 'vendors', user.uid);
      await updateDoc(vendorRef, { [type === 'profile' ? 'profile_image' : 'cover_image']: url });
      toast.success(`${type} updated!`, { id: toastId });
    } catch (error) {
      toast.error("Upload failed!");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateDetails = async (e) => {
    e.preventDefault();
    try {
      setIsUpdating(true);
      const vendorRef = doc(db, 'vendors', user.uid);
      await updateDoc(vendorRef, editData);
      setShowEditModal(false);
      toast.success("Profile updated!");
    } catch (error) {
      toast.error("Update failed!");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) return <Layout footerVariant="dashboard"><div className="min-vh-100 d-flex align-items-center justify-content-center"><Spinner animation="border" variant="primary" /></div></Layout>;

  return (
    <Layout footerVariant="dashboard">
      <div className="min-vh-100 bg-light pb-5">
        <input type="file" hidden ref={profileInputRef} accept="image/*" onChange={(e) => handlePhotoUpload(e, 'profile')} />
        <input type="file" hidden ref={coverInputRef} accept="image/*" onChange={(e) => handlePhotoUpload(e, 'cover')} />

        {/* --- CHANGED COVER HEIGHT TO 160px --- */}
        <div className="position-relative shadow-sm" style={{ height: '160px', background: vendor?.cover_image ? `url(${vendor.cover_image}) center/cover no-repeat` : themeGradient }}>
          <Container className="h-100 position-relative">
            <Button variant="light" size="sm" onClick={() => coverInputRef.current.click()} disabled={isUpdating} className="position-absolute top-0 end-0 mt-3 me-2 rounded-pill shadow-sm border-0 fw-bold opacity-75">
              <Camera size={14} className="me-2" /> Change Cover
            </Button>
          </Container>
        </div>

        <Container>
          {/* --- ADJUSTED MARGIN-TOP TO -50px FOR SMALLER COVER --- */}
          <div className="position-relative" style={{ marginTop: '-50px', marginBottom: '30px' }}>
            <div className="d-flex flex-column flex-md-row align-items-end gap-4">
              <div className="position-relative">
                <div className="rounded-circle bg-white p-1 shadow-lg" style={{ width: '150px', height: '150px' }}>
                  <div className="rounded-circle overflow-hidden w-100 h-100 bg-light d-flex align-items-center justify-content-center border border-4 border-white">
                    {vendor.profile_image ? (
                      <img src={vendor.profile_image} alt="profile" className="w-100 h-100 object-fit-cover" />
                    ) : (
                      <span className="display-4 fw-bold text-primary">{vendor.agency_name?.charAt(0)}</span>
                    )}
                  </div>
                </div>
                <button onClick={() => profileInputRef.current.click()} disabled={isUpdating} className="position-absolute bottom-0 end-0 bg-white text-primary rounded-circle border-0 d-flex align-items-center justify-content-center shadow-sm" style={{ width: '38px', height: '38px', border: '1px solid #ddd' }}>
                  <Camera size={18} />
                </button>
              </div>

              <div className="flex-grow-1 pb-2">
                <div className="d-flex justify-content-between align-items-end">
                  <div>
                    <h1 className="fw-bold text-white mb-1" style={{ fontSize: '2.2rem', textShadow: '2px 2px 8px rgba(0,0,0,0.5)' }}>{vendor.agency_name || "Agency Name"}</h1>
                    <p className="text-black opacity-90 fw-medium mb-3" style={{ fontSize: '1.5rem', textShadow: '1px 1px 4px rgba(0,0,0,0.4)' }}>{vendor.tagline || "Expert Solutions"}</p>
                    <div className="d-flex flex-wrap gap-2">
                      <span className="badge bg-dark bg-opacity-25 text-black rounded-pill px-3 py-2 fw-normal d-flex align-items-center gap-1 border border-white border-opacity-25"><MapPin size={14} /> {vendor.location || "Online"}</span>
                      <span className="badge bg-dark bg-opacity-25 text-black rounded-pill px-3 py-2 fw-normal d-flex align-items-center gap-1 border border-white border-opacity-25"><Calendar size={14} /> Registered 2024</span>
                    </div>
                  </div>
                  <Button onClick={() => setShowEditModal(true)} variant="outline-primary" className="rounded-pill px-4 shadow-sm fw-bold bg-white mb-2"><Edit2 size={16} className="me-2" /> Edit Details</Button>
                </div>
              </div>
            </div>
          </div>

          <Row className="g-4">
            <Col lg={4}>
              <Card className="border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
                <div className="p-3 text-white d-flex align-items-center justify-content-center gap-2 fw-bold" style={{ background: themeGradient }}>
                  <TrendingUp size={18} /> Business Performance
                </div>
                <Card.Body className="p-4 bg-white">
                  <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                    <span className="text-muted fw-bold small uppercase">Client Rating</span>
                    <span className="fw-bold d-flex align-items-center gap-1 text-dark">
                      <Star size={16} className="text-warning fill-warning" /> {avgRating > 0 ? avgRating : '5.0'}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                    <span className="text-muted fw-bold small uppercase">Projects Done</span>
                    <span className="fw-bold text-primary">{completedCount}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted fw-bold small uppercase">Profile Views</span>
                    <span className="fw-bold text-success">{vendor.profile_views || '0'}</span>
                  </div>
                </Card.Body>
              </Card>

              <Card className="border-0 shadow-sm rounded-4 p-4 bg-white">
                <h6 className="fw-bold text-dark mb-3 border-bottom pb-2">Professional Bio</h6>
                <p className="text-secondary mb-0" style={{ lineHeight: '1.6', fontSize: '0.9rem' }}>{vendor.bio || "No bio available."}</p>
              </Card>
            </Col>

            <Col lg={8}>
              <Tab.Container defaultActiveKey="portfolio">
                <Card className="border-0 shadow-sm rounded-4 p-2 mb-4 bg-white">
                  <Nav variant="pills" className="custom-pills gap-2">
                    <Nav.Item><Nav.Link eventKey="portfolio" className="rounded-pill px-4 fw-bold">Portfolio</Nav.Link></Nav.Item>
                    <Nav.Item><Nav.Link eventKey="services" className="rounded-pill px-4 fw-bold">Services</Nav.Link></Nav.Item>
                  </Nav>
                </Card>

                <Tab.Content>
                  <Tab.Pane eventKey="portfolio">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="fw-bold text-dark mb-0">Project Gallery</h5>
                      <Button variant="primary" size="sm" className="rounded-pill px-3 shadow-sm" onClick={() => setIsPortfolioModalOpen(true)}><Plus size={18} className="me-1" /> Add Project</Button>
                    </div>

                    <Row className="g-3">
                      {portfolio.length > 0 ? (
                        portfolio.map((project) => (
                          <Col md={6} key={project.id}>
                            <Card className="border-0 shadow-sm rounded-4 overflow-hidden h-100">
                              {project.image_url && (
                                <div style={{ height: '180px', overflow: 'hidden' }}>
                                  <img src={project.image_url} alt={project.title} className="w-100 h-100 object-fit-cover" />
                                </div>
                              )}
                              <Card.Body className="p-3">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                  <h6 className="fw-bold mb-0 text-dark text-truncate" style={{ maxWidth: '75%' }}>{project.title}</h6>
                                  <Badge bg="light" className="text-primary rounded-pill border">{project.category}</Badge>
                                </div>
                                <p className="text-muted small mb-0 text-truncate-2">
                                  {project.description}
                                </p>
                              </Card.Body>
                            </Card>
                          </Col>
                        ))
                      ) : (
                        <Col xs={12}>
                          <Card className="border-0 shadow-sm rounded-4 p-5 text-center bg-white border-dashed">
                            <ImageIcon size={48} className="text-muted opacity-25 mb-3 mx-auto" />
                            <p className="text-muted fw-medium mb-0">No projects added yet.</p>
                          </Card>
                        </Col>
                      )}
                    </Row>
                  </Tab.Pane>

                  <Tab.Pane eventKey="services">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="fw-bold text-dark mb-0">My Services</h5>
                      <Button variant="primary" size="sm" className="rounded-pill px-3 shadow-sm" onClick={() => setIsServiceModalOpen(true)}>
                        <Plus size={18} className="me-1" /> Add Service
                      </Button>
                    </div>

                    <Row className="g-3">
                      {services.length > 0 ? (
                        services.map((service) => (
                          <Col md={6} key={service.id}>
                            <Card className="border-0 shadow-sm rounded-4 overflow-hidden h-100 service-card">
                              {service.image_url && (
                                <div style={{ height: '160px', overflow: 'hidden' }}>
                                  <img src={service.image_url} alt={service.name} className="w-100 h-100 object-fit-cover" />
                                </div>
                              )}
                              <Card.Body className="p-3">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                  <h6 className="fw-bold mb-0 text-truncate text-dark" style={{ maxWidth: '70%' }}>
                                    {service.title || service.name}
                                  </h6>
                                  <Badge bg="dark" className="rounded-pill">${service.price}</Badge>
                                </div>
                                <p className="text-muted small mb-0 text-truncate-2">
                                  {service.description}
                                </p>
                              </Card.Body>
                            </Card>
                          </Col>
                        ))
                      ) : (
                        <Col xs={12}>
                          <Card className="border-0 shadow-sm rounded-4 p-5 text-center bg-white border-dashed">
                            <p className="text-muted mb-0">You haven't listed any services yet.</p>
                          </Card>
                        </Col>
                      )}
                    </Row>
                  </Tab.Pane>
                </Tab.Content>
              </Tab.Container>
            </Col>
          </Row>
        </Container>
      </div>

      <Modal show={showEditModal} onHide={() => !isUpdating && setShowEditModal(false)} centered>
        <Modal.Header closeButton><Modal.Title className="fw-bold">Edit Profile</Modal.Title></Modal.Header>
        <Form onSubmit={handleUpdateDetails}>
          <Modal.Body>
            <Form.Group className="mb-3"><Form.Label className="small fw-bold">Agency Name</Form.Label><Form.Control type="text" value={editData.agency_name} onChange={(e) => setEditData({ ...editData, agency_name: e.target.value })} required /></Form.Group>
            <Form.Group className="mb-3"><Form.Label className="small fw-bold">Tagline</Form.Label><Form.Control type="text" value={editData.tagline} onChange={(e) => setEditData({ ...editData, tagline: e.target.value })} /></Form.Group>
            <Form.Group className="mb-3"><Form.Label className="small fw-bold">Location</Form.Label><Form.Control type="text" value={editData.location} onChange={(e) => setEditData({ ...editData, location: e.target.value })} /></Form.Group>
            <Form.Group className="mb-3"><Form.Label className="small fw-bold">Bio</Form.Label><Form.Control as="textarea" rows={3} value={editData.bio} onChange={(e) => setEditData({ ...editData, bio: e.target.value })} /></Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="light" className="rounded-pill" onClick={() => setShowEditModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit" className="rounded-pill px-4" disabled={isUpdating}>{isUpdating ? <Loader2 className="animate-spin" size={18} /> : <><Save size={16} className="me-2" /> Save Changes</>}</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <style>{`
        .border-dashed { border: 2px dashed #eee !important; }
        .custom-pills .nav-link { color: #555; }
        .custom-pills .nav-link.active { background: #1e3a8a !important; color: white !important; }
        .fill-warning { fill: #ffc107; }
        .text-truncate-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .service-card { transition: 0.3s; }
        .service-card:hover { transform: translateY(-3px); }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      <AddServiceModal open={isServiceModalOpen} onOpenChange={setIsServiceModalOpen} />
      <AddPortfolioModal open={isPortfolioModalOpen} onOpenChange={setIsPortfolioModalOpen} />
    </Layout>
  );
}