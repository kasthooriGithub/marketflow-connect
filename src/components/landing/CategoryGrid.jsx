import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { Megaphone, Share2, Palette, Video, Code, TrendingUp, Mail, FileText } from 'lucide-react';

const categories = [
    { id: 'seo', name: 'SEO', icon: TrendingUp, color: '#00B67A', bgColor: '#E6F7F1' },
    { id: 'social-media', name: 'Social Media', icon: Share2, color: '#FF6B6B', bgColor: '#FFE5E5' },
    { id: 'branding', name: 'Logo & Branding', icon: Palette, color: '#4ECDC4', bgColor: '#E0F7F5' },
    { id: 'video', name: 'Video Editing', icon: Video, color: '#FFD93D', bgColor: '#FFF8E1' },
    { id: 'web', name: 'Web Development', icon: Code, color: '#6C5CE7', bgColor: '#EDE7F6' },
    { id: 'content', name: 'Content Writing', icon: FileText, color: '#A8E6CF', bgColor: '#F1F8F4' },
    { id: 'email', name: 'Email Marketing', icon: Mail, color: '#FF8B94', bgColor: '#FFE9EB' },
    { id: 'advertising', name: 'Advertising', icon: Megaphone, color: '#95E1D3', bgColor: '#E8F6F3' },
];

export default function CategoryGrid() {
    return (
        <section id="categories" className="section-padding" style={{ background: '#FAFAFA' }}>
            <Container>
                <div className="text-center mb-5">
                    <h2 className="fw-bold mb-3" style={{ color: '#404145', fontSize: '2.5rem' }}>
                        Explore by Category
                    </h2>
                    <p className="text-muted fs-5">Find the perfect service for your needs</p>
                </div>

                <Row className="g-4">
                    {categories.map((category) => (
                        <Col xs={6} md={4} lg={3} key={category.id}>
                            <Link
                                to={`/category/${category.id}`}
                                className="text-decoration-none d-block"
                            >
                                <div
                                    className="card h-100 text-center p-4 border-0"
                                    style={{
                                        borderRadius: '12px',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        cursor: 'pointer',
                                        background: 'white'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-8px)';
                                        e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.1)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                                    }}
                                >
                                    <div
                                        className="d-inline-flex align-items-center justify-content-center rounded-3 mb-3 mx-auto"
                                        style={{
                                            width: 72,
                                            height: 72,
                                            backgroundColor: category.bgColor,
                                            transition: 'transform 0.3s ease'
                                        }}
                                    >
                                        <category.icon size={36} style={{ color: category.color }} />
                                    </div>
                                    <h5 className="fw-bold mb-0" style={{ fontSize: '1.05rem', color: '#404145' }}>
                                        {category.name}
                                    </h5>
                                </div>
                            </Link>
                        </Col>
                    ))}
                </Row>
            </Container>
        </section>
    );
}
