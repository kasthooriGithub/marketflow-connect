import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Layout } from 'components/layout/Layout';

export const PublicPageTemplate = ({ title, description, children }) => {
    return (
        <Layout>
            <div className="bg-light py-5">
                <Container>
                    <Row className="justify-content-center text-center">
                        <Col lg={8}>
                            <h1 className="fw-bold mb-3">{title}</h1>
                            {description && <p className="lead text-muted">{description}</p>}
                        </Col>
                    </Row>
                </Container>
            </div>
            <div className="py-5">
                <Container>
                    {children || (
                        <div className="text-center py-5">
                            <p className="text-muted">Content for {title} is coming soon.</p>
                        </div>
                    )}
                </Container>
            </div>
        </Layout>
    );
};
