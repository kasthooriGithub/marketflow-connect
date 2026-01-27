import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart } from 'lucide-react';
import { Container, Row, Col } from 'react-bootstrap';
import { db } from 'lib/firebase';
import { collection, query, getDocs, limit } from 'firebase/firestore';

export default function FeaturedServices() {
    const [featuredServices, setFeaturedServices] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchFeatured = async () => {
            setIsLoading(true);
            try {
                const servicesRef = collection(db, 'services');
                const q = query(servicesRef, limit(4));
                const querySnapshot = await getDocs(q);
                const servicesData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setFeaturedServices(servicesData);
            } catch (error) {
                console.error("Error fetching featured services:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchFeatured();
    }, []);

    const getServiceIcon = (service) => {
        if (service.category_icon) return service.category_icon;

        const tag = service.tags?.[0];
        switch (tag) {
            case 'SEO': return '🔍';
            case 'Social Media': return '📱';
            case 'Content': return '✍️';
            case 'PPC': return '📈';
            case 'Video': return '🎬';
            case 'Branding': return '🎨';
            case 'Email': return '📧';
            case 'Analytics': return '📊';
            default: return '💼';
        }
    };

    if (isLoading) {
        return (
            <section id="features" className="section-padding" style={{ background: '#F7F7F7' }}>
                <Container className="text-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                </Container>
            </section>
        );
    }

    return (
        <section id="features" className="section-padding" style={{ background: '#F7F7F7' }}>
            <Container>
                <div className="d-flex justify-content-between align-items-end mb-5">
                    <div>
                        <h2 className="fw-bold mb-2" style={{ color: '#404145' }}>Featured Services</h2>
                        <p className="text-muted mb-0">Hand-picked by our team</p>
                    </div>
                    <Link to="/services" className="btn btn-outline-primary d-none d-md-block">
                        View All Services
                    </Link>
                </div>

                <Row className="g-4">
                    {featuredServices.map((service) => (
                        <Col md={6} lg={3} key={service.id}>
                            <Link to={`/services/${service.id}`} className="text-decoration-none">
                                <div className="gig-card card border-0 h-100">
                                    <div className="position-relative d-flex align-items-center justify-content-center bg-light overflow-hidden" style={{ height: '200px' }}>
                                        <span className="display-4">
                                            {getServiceIcon(service)}
                                        </span>
                                        <button
                                            className="btn btn-sm position-absolute top-0 end-0 m-2 bg-white rounded-circle p-2"
                                            style={{ width: 36, height: 36 }}
                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                        >
                                            <Heart size={16} />
                                        </button>
                                    </div>
                                    <div className="card-body p-3">
                                        <div className="d-flex align-items-center gap-2 mb-2">
                                            <div
                                                className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white fw-bold"
                                                style={{ width: 32, height: 32, fontSize: '0.75rem' }}
                                            >
                                                {(service.vendor_name || 'V').charAt(0)}
                                            </div>
                                            <div>
                                                <div className="fw-semibold small" style={{ color: '#404145' }}>{service.vendor_name || 'Verified Seller'}</div>
                                                <div className="trust-badge" style={{ fontSize: '0.65rem' }}>
                                                    Verified Seller
                                                </div>
                                            </div>
                                        </div>
                                        <h6 className="mb-3" style={{
                                            fontSize: '0.95rem',
                                            lineHeight: '1.4',
                                            color: '#404145',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical'
                                        }}>
                                            {service.title}
                                        </h6>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div className="d-flex align-items-center gap-1">
                                                <Star size={14} className="rating-star" fill="#FFB33E" />
                                                <span className="fw-bold small" style={{ color: '#404145' }}>
                                                    {service.average_rating || 5.0}
                                                </span>
                                                <span className="text-muted small">({service.total_reviews || 0})</span>
                                            </div>
                                            <div className="fw-bold" style={{ color: '#404145' }}>
                                                From ${service.price}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </Col>
                    ))}
                </Row>

                <div className="text-center mt-4 d-md-none">
                    <Link to="/services" className="btn btn-outline-primary w-100">
                        View All Services
                    </Link>
                </div>
            </Container>
        </section>
    );
}

