import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Layout } from 'components/layout/Layout';
import { ServiceCard } from 'components/common/ServiceCard';
import { Button } from 'components/ui/button';
import { Input } from 'components/ui/input';
import { services, categories } from 'data/services';
import { Container, Row, Col } from 'react-bootstrap';

export default function Services() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');

  const selectedCategory = searchParams.get('category') || 'all';

  const filteredServices = services.filter(service => {
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    const matchesSearch = searchQuery === '' ||
      service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.vendorName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
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
              variant={selectedCategory === 'all' ? 'gradient' : 'secondary'}
              size="sm"
              onClick={() => handleCategoryChange('all')}
            >
              All Services
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'gradient' : 'secondary'}
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
        {filteredServices.length > 0 ? (
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
