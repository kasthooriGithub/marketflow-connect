import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { db } from 'lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function CategoryGrid() {
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            setIsLoading(true);
            try {
                const categoriesRef = collection(db, 'categories');
                const querySnapshot = await getDocs(categoriesRef);
                const categoriesData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setCategories(categoriesData);
            } catch (error) {
                console.error("Error fetching categories:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCategories();
    }, []);

    if (isLoading) {
        return (
            <section className="section-padding bg-white">
                <Container className="text-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                </Container>
            </section>
        );
    }

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
                                            backgroundColor: category.bgColor || '#F8F9FA',
                                            transition: 'transform 0.3s ease'
                                        }}
                                    >
                                        <span style={{ fontSize: '2rem' }}>{category.icon}</span>
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

