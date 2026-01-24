import { Link } from 'react-router-dom';
import { Star, Heart } from 'lucide-react';
import { Container, Row, Col } from 'react-bootstrap';

const featuredServices = [
    {
        id: 1,
        title: 'I will create professional SEO content for your website',
        seller: 'Sarah M.',
        sellerLevel: 'Top Rated',
        rating: 4.9,
        reviews: 234,
        price: 150,
        image: 'https://via.placeholder.com/300x200/00B67A/FFFFFF?text=SEO+Content'
    },
    {
        id: 2,
        title: 'I will design a modern logo and brand identity',
        seller: 'Alex K.',
        sellerLevel: 'Level 2',
        rating: 5.0,
        reviews: 189,
        price: 200,
        image: 'https://via.placeholder.com/300x200/4ECDC4/FFFFFF?text=Logo+Design'
    },
    {
        id: 3,
        title: 'I will manage your social media accounts professionally',
        seller: 'Mike R.',
        sellerLevel: 'Top Rated',
        rating: 4.8,
        reviews: 312,
        price: 300,
        image: 'https://via.placeholder.com/300x200/FF6B6B/FFFFFF?text=Social+Media'
    },
    {
        id: 4,
        title: 'I will create engaging video content for your brand',
        seller: 'Emma L.',
        sellerLevel: 'Level 2',
        rating: 4.9,
        reviews: 156,
        price: 250,
        image: 'https://via.placeholder.com/300x200/FFD93D/FFFFFF?text=Video+Content'
    },
];

export default function FeaturedServices() {
    return (
        <section className="section-padding" style={{ background: '#F7F7F7' }}>
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
                                    <div className="position-relative">
                                        <img
                                            src={service.image}
                                            alt={service.title}
                                            className="gig-card-image"
                                        />
                                        <button
                                            className="btn btn-sm position-absolute top-0 end-0 m-2 bg-white rounded-circle p-2"
                                            style={{ width: 36, height: 36 }}
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
                                                {service.seller.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="fw-semibold small" style={{ color: '#404145' }}>{service.seller}</div>
                                                <div className="trust-badge" style={{ fontSize: '0.65rem' }}>
                                                    {service.sellerLevel}
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
                                                    {service.rating}
                                                </span>
                                                <span className="text-muted small">({service.reviews})</span>
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
