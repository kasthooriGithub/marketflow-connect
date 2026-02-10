import { useState, useEffect } from 'react';
import { useAuth } from 'contexts/AuthContext';
import { Layout } from 'components/layout/Layout';
import { ServiceCard } from 'components/common/ServiceCard';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import { Heart } from 'lucide-react';
import { getSavedServices } from 'services/savedServiceService';
import { serviceService } from 'services/serviceService';

export default function SavedServices() {
    const { user } = useAuth();
    const [savedServices, setSavedServices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.uid) return;

        const fetchSavedServicesData = async () => {
            setLoading(true);
            try {
                // 1. Fetch saved service records from user's subcollection
                const savedItems = await getSavedServices(user.uid);

                if (savedItems.length === 0) {
                    setSavedServices([]);
                    return;
                }

                // 2. Fetch full service details for each saved item
                const servicePromises = savedItems.map(item =>
                    serviceService.getServiceById(item.service_id)
                );

                const servicesData = await Promise.all(servicePromises);

                // Filter out nulls and set state
                setSavedServices(servicesData.filter(s => s !== null));
            } catch (error) {
                console.error('Error in SavedServices page:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSavedServicesData();
    }, [user?.uid]);

    return (
        <Layout footerVariant="dashboard">
            <div className="py-5 bg-light min-vh-100">
                <Container>
                    <div className="mb-5">
                        <div className="d-flex align-items-center gap-3 mb-2">
                            <div className="p-2 bg-danger bg-opacity-10 rounded text-danger">
                                <Heart size={24} fill="currentColor" />
                            </div>
                            <h1 className="h2 fw-bold text-dark mb-0">Saved Services</h1>
                        </div>
                        <p className="text-muted">Manage the services you've saved for later.</p>
                    </div>

                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-3 text-muted">Loading your saved services...</p>
                        </div>
                    ) : savedServices.length > 0 ? (
                        <Row className="g-4">
                            {savedServices.map((service) => (
                                <Col md={6} lg={4} xl={3} key={service.id}>
                                    <ServiceCard service={service} />
                                </Col>
                            ))}
                        </Row>
                    ) : (
                        <div className="text-center py-5 bg-white rounded-4 shadow-sm border">
                            <div className="display-1 mb-4 opacity-25">❤️</div>
                            <h3 className="h4 fw-bold text-dark mb-2">No saved services yet</h3>
                            <p className="text-secondary mb-0">
                                Browse our marketplace and save services you're interested in.
                            </p>
                        </div>
                    )}
                </Container>
            </div>
        </Layout>
    );
}
