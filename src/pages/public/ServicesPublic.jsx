import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Layout } from 'components/layout/Layout';
import { ServiceCard } from 'components/common/ServiceCard';
import { Button } from 'components/ui/button';
import { Input } from 'components/ui/input';
import { db } from 'lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Container, Row, Col } from 'react-bootstrap';

export default function Services() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const selectedCategoryId = searchParams.get('category') || 'all';

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch categories from Firestore
        const categoriesSnapshot = await getDocs(collection(db, 'categories'));
        const categoriesData = categoriesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCategories(categoriesData);

        // Fetch services from Firestore
        let servicesQuery = query(
          collection(db, 'services'),
          where('is_active', '==', true)
        );

        // If a specific category is selected, filter by category doc ID
        if (selectedCategoryId !== 'all') {
          servicesQuery = query(
            collection(db, 'services'),
            where('is_active', '==', true),
            where('category', '==', selectedCategoryId)
          );
        }

        const querySnapshot = await getDocs(servicesQuery);
        const servicesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setServices(servicesData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedCategoryId]);

  const filteredServices = services.filter(service => {
    const matchesSearch = searchQuery === '' ||
      service.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.vendor_name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleCategoryChange = (categoryId) => {
    if (categoryId === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', categoryId);
    }
    setSearchParams(searchParams);
  };

  return (
    <Layout>
      <div className="bg-light py-5 mb-5">
        <Container>
          <div className="text-center mb-5">
            <h1 className="display-5 fw-bold text-dark mb-3">
              Browse Marketing Services
            </h1>
            <p className="text-secondary lead mx-auto" style={{ maxWidth: '600px' }}>
              Find the perfect marketing partner from our curated marketplace
            </p>
          </div>

          <div className="mx-auto mb-5" style={{ maxWidth: '600px' }}>
            <div className="position-relative">
              <div className="position-absolute top-50 start-0 translate-middle-y ps-3">
                <Search size={20} className="text-secondary" />
              </div>
              <Input
                type="text"
                placeholder="Search services, vendors, or categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ps-5 py-3 fs-5"
              />
            </div>
          </div>

          <div className="d-flex flex-wrap justify-content-center gap-2">
            <Button
              variant={selectedCategoryId === 'all' ? 'gradient' : 'secondary'}
              size="sm"
              onClick={() => handleCategoryChange('all')}
            >
              All Services
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategoryId === category.id ? 'gradient' : 'secondary'}
                size="sm"
                onClick={() => handleCategoryChange(category.id)}
              >
                {category.icon} {category.name}
              </Button>
            ))}
          </div>
        </Container>
      </div>

      <Container className="mb-5">
        {isLoading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-2 text-muted">Loading services...</p>
          </div>
        ) : filteredServices.length > 0 ? (
          <>
            <p className="text-muted mb-4">
              Showing {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''}
            </p>
            <Row className="g-4">
              {filteredServices.map((service) => (
                <Col md={6} lg={4} xl={3} key={service.id}>
                  <ServiceCard service={service} />
                </Col>
              ))}
            </Row>
          </>
        ) : (
          <div className="text-center py-5">
            <div className="display-1 mb-3">🔍</div>
            <h3 className="h4 fw-bold text-dark mb-2">
              No services found
            </h3>
            <p className="text-secondary mb-4">
              Try adjusting your search or filter criteria
            </p>
            <Button variant="outline" onClick={() => { setSearchQuery(''); handleCategoryChange('all'); }}>
              Clear Filters
            </Button>
          </div>
        )}
      </Container>
    </Layout>
  );
}
