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
        <section id="categories" className="py-5" style={{ background: '#FAFAFA' }}>
            <Container className="py-4">
                <div className="text-center mb-5">
                    <h2 className="fw-bold mb-3" style={{ color: '#404145', fontSize: '2.5rem', letterSpacing: '-0.02em' }}>
                        Browse by category
                    </h2>
                    <p className="text-muted fs-5 mx-auto" style={{ maxWidth: '600px' }}>
                        Find specialized experts for every marketing need
                    </p>
                </div>

                <Row className="g-4">
                    {categories.map((category) => (
                        <Col xs={6} md={4} lg={3} key={category.id}>
                            <Link
                                to={`/category/${category.id}`}
                                className="text-decoration-none d-block h-100"
                            >
                                <div
                                    className="card h-100 text-center p-4 border-0 shadow-sm"
                                    style={{
                                        borderRadius: '16px',
                                        transition: 'all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)',
                                        cursor: 'pointer',
                                        background: 'white',
                                        border: '1px solid transparent'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-10px)';
                                        e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.08)';
                                        e.currentTarget.style.borderColor = '#00B67A';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.04)';
                                        e.currentTarget.style.borderColor = 'transparent';
                                    }}
                                >
                                    <div
                                        className="d-inline-flex align-items-center justify-content-center rounded-4 mb-3 mx-auto"
                                        style={{
                                            width: 80,
                                            height: 80,
                                            backgroundColor: category.bgColor || '#F0F2F5',
                                            transition: 'transform 0.3s ease',
                                            fontSize: '2.25rem'
                                        }}
                                    >
                                        <span role="img" aria-label={category.name}>{category.icon}</span>
                                    </div>
                                    <h5 className="fw-bold mb-1" style={{ fontSize: '1.1rem', color: '#404145' }}>
                                        {category.name}
                                    </h5>
                                    <p className="small text-muted mb-0">Explore experts</p>
                                </div>
                            </Link>
                        </Col>
                    ))}
                </Row>
            </Container>
        </section>
    );
}

