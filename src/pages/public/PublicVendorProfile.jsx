import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Star, ShieldCheck, ArrowLeft, Award, Briefcase, MessageSquare, Eye, Globe, Calendar, ExternalLink } from 'lucide-react';
import { Layout } from 'components/layout/Layout';
import { Button } from 'components/ui/button';
import { Badge } from 'components/ui/badge';
import { Container, Row, Col, Card, Spinner, Tab, Nav } from 'react-bootstrap';
import { db } from 'lib/firebase';
import { doc, getDoc, updateDoc, increment, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore'; 
import { useAuth } from 'contexts/AuthContext';
import { useMessaging } from 'contexts/MessagingContext';
import { toast } from 'sonner';

export default function PublicVendorProfile() {
    const { vendorId } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const { startConversation } = useMessaging();
    
    const [vendor, setVendor] = useState(null);
    const [portfolioItems, setPortfolioItems] = useState([]); // Portfolio டேட்டாவிற்கான State
    const [loading, setLoading] = useState(true);
    const [portfolioLoading, setPortfolioLoading] = useState(false);
    const [contacting, setContacting] = useState(false);
    const hasIncremented = useRef(false);

    // 1. Vendor தகவல்களை எடுத்தல்
    useEffect(() => {
        const fetchAndTrackVendor = async () => {
            if (!vendorId) return;
            try {
                setLoading(true);
                const docRef = doc(db, 'vendors', vendorId);
                const docSnap = await getDoc(docRef);
                
                if (docSnap.exists()) {
                    const vendorData = docSnap.data();
                    setVendor({ id: docSnap.id, ...vendorData });

                    if (!hasIncremented.current) {
                        await updateDoc(docRef, {
                            profile_views: increment(1),
                            last_viewed_at: serverTimestamp()
                        });
                        hasIncremented.current = true;
                    }
                }
            } catch (err) {
                console.error("Error fetching vendor:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAndTrackVendor();
    }, [vendorId]);

    // 2. Portfolio தகவல்களை Firestore-ல் இருந்து எடுத்தல்
    const fetchPortfolio = async () => {
        // ஒருமுறை டேட்டா எடுத்திருந்தால் மீண்டும் எடுக்கத் தேவையில்லை
        if (portfolioItems.length > 0) return;

        try {
            setPortfolioLoading(true);
            const portfolioRef = collection(db, 'portfolio');
            // vendor_id மேட்ச் ஆகும் போர்ட்ஃபோலியோக்களை மட்டும் எடுக்கிறது
            const q = query(portfolioRef, where('vendor_id', '==', vendorId));
            const querySnapshot = await getDocs(q);
            
            const items = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setPortfolioItems(items);
        } catch (err) {
            console.error("Portfolio Error:", err);
            toast.error("Failed to load portfolio");
        } finally {
            setPortfolioLoading(false);
        }
    };

    // 3. Contact Vendor செயல்பாடு
    const handleContactVendor = async () => {
        if (!isAuthenticated) {
            toast.error("Please login to contact this vendor");
            navigate('/login');
            return;
        }

        if (user?.uid === vendorId) {
            toast.error("You cannot message yourself");
            return;
        }

        setContacting(true);
        try {
            const conversationId = await startConversation(vendor.id, {
                name: vendor.vendor_name || vendor.agency_name,
                photoURL: vendor.profile_image || ''
            });
            
            if (conversationId) {
                navigate(`/messages/${conversationId}`);
            }
        } catch (error) {
            console.error("Contact Error:", error);
            toast.error("Could not start conversation");
        } finally {
            setContacting(false);
        }
    };

    if (loading) return <div className="text-center py-5 mt-5"><Spinner animation="border" variant="primary" /></div>;
    if (!vendor) return <Layout><Container className="text-center py-5"><h4>Vendor Not Found</h4></Container></Layout>;

    return (
        <Layout>
            <div className="bg-light min-vh-100 pb-5">
                <div className="bg-primary shadow-sm" style={{ height: '180px', background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)' }}>
                    <Container className="h-100 position-relative">
                        <Button variant="light" size="sm" className="position-absolute top-0 start-0 m-4 rounded-pill shadow-sm fw-medium" onClick={() => navigate(-1)}>
                            <ArrowLeft size={16} className="me-1" /> Back
                        </Button>
                    </Container>
                </div>

                <Container>
                    <Row className="gx-4">
                        {/* Sidebar */}
                        <Col lg={4} className="mt-n5">
                            <Card className="border-0 shadow-sm p-4 text-center mb-4" style={{ borderRadius: '1.2rem', marginTop: '-60px' }}>
                                <div className="mx-auto bg-white p-1 rounded-circle shadow-sm mb-3" style={{ width: '120px', height: '120px' }}>
                                    {vendor.profile_image ? (
                                        <img src={vendor.profile_image} alt="profile" className="w-100 h-100 rounded-circle object-fit-cover" />
                                    ) : (
                                        <div className="w-100 h-100 rounded-circle bg-primary d-flex align-items-center justify-content-center text-white display-5 fw-bold">
                                            {(vendor.vendor_name || vendor.agency_name || 'V').charAt(0)}
                                        </div>
                                    )}
                                </div>
                                
                                <h4 className="fw-bold mb-1">{vendor.vendor_name || vendor.agency_name} <ShieldCheck className="text-primary ms-1 d-inline" size={20} /></h4>
                                
                                <div className="d-flex justify-content-center gap-2 mb-4">
                                    <Badge bg="light" className="text-dark border fw-normal rounded-pill px-3 py-2"><Eye size={14} className="me-1 text-primary" /> {vendor.profile_views || 0} Views</Badge>
                                    <Badge bg="light" className="text-dark border fw-normal rounded-pill px-3 py-2"><Star size={14} className="me-1 text-warning" /> {vendor.rating || '5.0'}</Badge>
                                </div>

                                <div className="d-grid gap-2 mb-4">
                                    <Button className="rounded-3 py-2 fw-bold shadow-sm" onClick={handleContactVendor} disabled={contacting}>
                                        {contacting ? <Spinner size="sm" /> : <MessageSquare size={18} className="me-2" />} 
                                        Contact Vendor
                                    </Button>
                                </div>

                                <div className="text-start border-top pt-4 mt-2">
                                    <h6 className="fw-bold small text-uppercase text-muted mb-3">Professional Info</h6>
                                    <div className="d-flex align-items-center mb-3">
                                        <MapPin size={18} className="text-primary me-3" />
                                        <div>
                                            <div className="small text-muted">Location</div>
                                            <div className="fw-medium">{vendor.location || 'Not Specified'}</div>
                                        </div>
                                    </div>
                                    <div className="d-flex align-items-center mb-3">
                                        <Calendar size={18} className="text-primary me-3" />
                                        <div>
                                            <div className="small text-muted">Member Since</div>
                                            <div className="fw-medium">Jan 2026</div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </Col>

                        {/* Main Content */}
                        <Col lg={8} className="mt-4">
                            <Tab.Container defaultActiveKey="about">
                                <Nav variant="pills" className="bg-white p-2 rounded-3 shadow-sm mb-4 border">
                                    <Nav.Item className="flex-fill text-center">
                                        <Nav.Link eventKey="about" className="rounded-3 py-2 fw-medium">About Profile</Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item className="flex-fill text-center">
                                        <Nav.Link eventKey="portfolio" onClick={fetchPortfolio} className="rounded-3 py-2 fw-medium">Work Portfolio</Nav.Link>
                                    </Nav.Item>
                                </Nav>

                                <Tab.Content>
                                    <Tab.Pane eventKey="about">
                                        <Card className="border-0 shadow-sm p-4 rounded-4 mb-4">
                                            <h5 className="fw-bold mb-3 d-flex align-items-center"><Award className="text-primary me-2" size={22} /> Professional Bio</h5>
                                            <p className="text-secondary" style={{ lineHeight: '1.8' }}>{vendor.bio || "No bio available."}</p>
                                        </Card>
                                    </Tab.Pane>

                                    <Tab.Pane eventKey="portfolio">
                                        {portfolioLoading ? (
                                            <div className="text-center py-5"><Spinner animation="border" size="sm" color="primary" /></div>
                                        ) : portfolioItems.length > 0 ? (
                                            <Row className="g-3">
                                                {portfolioItems.map((item) => (
                                                    <Col md={6} key={item.id}>
                                                        <Card className="border-0 shadow-sm h-100 overflow-hidden rounded-4">
                                                            <div className="position-relative">
                                                                <img src={item.image_url} className="w-100" style={{ height: '200px', objectFit: 'cover' }} alt={item.title} />
                                                                <Badge bg="dark" className="position-absolute top-0 end-0 m-2 bg-opacity-75">{item.category}</Badge>
                                                            </div>
                                                            <Card.Body>
                                                                <h6 className="fw-bold mb-1">{item.title}</h6>
                                                                <p className="small text-muted mb-0 text-truncate-2">{item.description}</p>
                                                            </Card.Body>
                                                        </Card>
                                                    </Col>
                                                ))}
                                            </Row>
                                        ) : (
                                            <Card className="border-0 shadow-sm p-5 text-center rounded-4">
                                                <Briefcase size={40} className="text-muted mb-3 mx-auto" />
                                                <h6>No Portfolio Items Yet</h6>
                                                <p className="text-muted small">This vendor hasn't uploaded any past work samples yet.</p>
                                            </Card>
                                        )}
                                    </Tab.Pane>
                                </Tab.Content>
                            </Tab.Container>
                        </Col>
                    </Row>
                </Container>
            </div>
        </Layout>
    );
}