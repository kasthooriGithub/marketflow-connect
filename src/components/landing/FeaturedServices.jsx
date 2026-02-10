import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, CheckCircle } from 'lucide-react';
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
        <section id="features" className="py-5" style={{ background: '#FFFFFF' }}>
            <Container className="py-5">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-5 gap-3">
                    <div>
                        <h2 className="fw-bold mb-2" style={{ color: '#404145', fontSize: '2.5rem', letterSpacing: '-0.02em' }}>
                            Hand-picked experts
                        </h2>
                        <p className="text-muted mb-0 fs-5">Premium services selected for reliability and quality</p>
                    </div>
                    <Link to="/services" className="fw-bold text-decoration-none d-flex align-items-center gap-1" style={{ color: '#00B67A' }}>
                        View all services <span style={{ fontSize: '1.2rem' }}>→</span>
                    </Link>
                </div>

                <Row className="g-4">
                    {featuredServices.map((service) => (
                        <Col md={6} lg={3} key={service.id}>
                            <Link to={`/services/${service.id}`} className="text-decoration-none">
                                <div
                                    className="service-card card border-0 h-100 overflow-hidden shadow-sm"
                                    style={{
                                        borderRadius: '16px',
                                        transition: 'all 0.3s ease',
                                        border: '1px solid #F0F2F5'
                                    }}
                                >
                                    <div className="position-relative d-flex align-items-center justify-content-center bg-light overflow-hidden rotate-hover" style={{ height: '220px' }}>
                                        <div
                                            className="display-2 transition-transform"
                                            style={{ filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.05))' }}
                                        >
                                            {getServiceIcon(service)}
                                        </div>
                                        <div className="position-absolute top-0 start-0 m-3">
                                            <span
                                                className="badge px-3 py-2 rounded-pill shadow-sm"
                                                style={{ background: 'rgba(255,255,255,0.9)', color: '#0A2540', fontSize: '0.7rem', fontWeight: 700 }}
                                            >
                                                POPULAR
                                            </span>
                                        </div>
                                        <button
                                            className="btn btn-sm position-absolute top-0 end-0 m-3 bg-white rounded-circle p-0 shadow-sm d-flex align-items-center justify-content-center"
                                            style={{ width: 36, height: 36, border: 'none' }}
                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                        >
                                            <Heart size={18} className="text-muted" />
                                        </button>
                                    </div>
                                    <div className="card-body p-4">
                                        <div className="d-flex align-items-center gap-2 mb-3">
                                            <div
                                                className="rounded-circle bg-dark d-flex align-items-center justify-content-center text-white fw-bold shadow-sm"
                                                style={{ width: 36, height: 36, fontSize: '0.85rem' }}
                                            >
                                                {(service.vendor_name || 'V').charAt(0)}
                                            </div>
                                            <div>
                                                <div className="fw-bold small d-flex align-items-center gap-1" style={{ color: '#404145' }}>
                                                    {service.vendor_name || 'Verified Seller'}
                                                    <CheckCircle size={14} style={{ color: '#00B67A' }} fill="#00B67A" className="text-white" />
                                                </div>
                                                <div className="text-muted" style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                                    Top Rated
                                                </div>
                                            </div>
                                        </div>
                                        <h6 className="mb-3 lh-base fw-bold" style={{
                                            fontSize: '1rem',
                                            color: '#404145',
                                            height: '3rem',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical'
                                        }}>
                                            {service.title}
                                        </h6>
                                        <div className="d-flex justify-content-between align-items-center pt-3 border-top">
                                            <div className="d-flex align-items-center gap-1 font-monospace">
                                                <Star size={14} fill="#FFB33E" stroke="#FFB33E" />
                                                <span className="fw-bold small" style={{ color: '#404145' }}>
                                                    {service.average_rating || 5.0}
                                                </span>
                                                <span className="text-muted small">({service.total_reviews || 0})</span>
                                            </div>
                                            <div className="text-end">
                                                <div className="text-muted extra-small fw-bold">STARTING AT</div>
                                                <div className="fw-bold h5 mb-0" style={{ color: '#404145' }}>
                                                    ${service.price}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </Col>
                    ))}
                </Row>

                <div className="text-center mt-5 d-md-none">
                    <Link to="/services" className="btn btn-dark w-100 py-3 rounded-3 shadow-sm">
                        View All Services
                    </Link>
                </div>
            </Container>

            <style>{`
                .service-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 25px 50px rgba(0,0,0,0.12) !important;
                    border-color: #00B67A !important;
                }
                .rotate-hover:hover .transition-transform {
                    transform: scale(1.1) rotate(5deg);
                }
                .extra-small {
                   font-size: 0.65rem;
                }
            `}</style>
        </section>
    );
}

