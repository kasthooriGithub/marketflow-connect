import { useState, useEffect, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, MapPin, Clock, CheckCircle, Filter, SortAsc } from 'lucide-react';
import { Layout } from 'components/layout/Layout';
import { Button } from 'components/ui/button';
import { db } from 'lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { Container, Row, Col, Card, Badge, Form } from 'react-bootstrap';

function ServiceVendorCard({ service }) {
  return (
    <Link
      to={`/services/${service.id}`}
      className="text-decoration-none"
    >
      <Card className="border shadow-sm hover-shadow-md transition-all p-4 mb-4 card-vendor">
        <Row className="align-items-start g-4">
          {/* Avatar / Icon Representing Service */}
          <Col xs="auto">
            <div className="bg-primary bg-opacity-10 d-flex align-items-center justify-content-center rounded-3 overflow-hidden shadow-sm border" style={{ width: 80, height: 80 }}>
              <span className="h1 mb-0">{service.category_icon || '💼'}</span>
            </div>
          </Col>

          {/* Info */}
          <Col>
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start gap-2 mb-2">
              <div className="min-w-0">
                <h3 className="h5 fw-bold text-dark mb-1 link-primary transition-colors">
                  {service.title}
                </h3>
                <p className="text-muted small mb-0 text-truncate">by {service.vendor_name}</p>
              </div>
              <div className="d-flex align-items-center gap-1 flex-shrink-0 bg-warning bg-opacity-10 px-2 py-1 rounded">
                <Star size={14} className="text-warning fill-warning" />
                <span className="fw-bold text-dark small">{service.average_rating || 5.0}</span>
                <span className="text-muted extra-small">({service.total_reviews || 0})</span>
              </div>
            </div>

            <p className="small text-secondary mb-3 text-truncate-2">{service.description}</p>

            {/* Meta info */}
            <div className="d-flex flex-wrap align-items-center gap-3 mb-3 extra-small text-muted">
              <span className="d-flex align-items-center gap-1">
                <Clock size={12} />
                {service.deliveryTime || 'Varies'}
              </span>
              <span className="d-flex align-items-center gap-1">
                <CheckCircle size={12} className="text-success" />
                Verified Service
              </span>
            </div>

            {/* Tags */}
            <div className="d-flex flex-wrap gap-2 mb-4">
              {service.tags?.slice(0, 4).map((tag) => (
                <Badge key={tag} bg="light" className="text-dark border fw-normal px-2 py-1" style={{ fontSize: '0.65rem' }}>
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Footer */}
            <div className="d-flex align-items-center justify-content-between pt-3 border-top mt-auto">
              <div>
                <span className="small text-muted">Starting at </span>
                <span className="h5 fw-bold text-dark mb-0">${service.price}</span>
              </div>
              <div className="small text-muted fw-medium text-capitalize">
                {service.priceType || 'project'}
              </div>
            </div>
          </Col>
        </Row>
      </Card>
    </Link>
  );
}

export default function CategoryVendors() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [priceFilter, setPriceFilter] = useState('all');
  const [category, setCategory] = useState(null);
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!categoryId) return;
      setIsLoading(true);
      try {
        // Fetch Category
        const categoryDoc = await getDoc(doc(db, 'categories', categoryId));
        if (categoryDoc.exists()) {
          const categoryData = { id: categoryDoc.id, ...categoryDoc.data() };
          setCategory(categoryData);

          // Fetch Services for this category
          const servicesRef = collection(db, 'services');
          const q = query(servicesRef, where('category', '==', categoryId), where('is_active', '==', true));
          const querySnapshot = await getDocs(q);
          const servicesData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            category_icon: categoryData.icon,
            ...doc.data()
          }));
          setServices(servicesData);
        }
      } catch (error) {
        console.error("Error fetching category data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [categoryId]);

  const filteredAndSortedServices = useMemo(() => {
    let result = [...services];

    // Search filter
    if (searchQuery) {
      const queryStr = searchQuery.toLowerCase();
      result = result.filter(s =>
        s.title?.toLowerCase().includes(queryStr) ||
        s.description?.toLowerCase().includes(queryStr) ||
        s.vendor_name?.toLowerCase().includes(queryStr) ||
        s.tags?.some(tag => tag.toLowerCase().includes(queryStr))
      );
    }

    // Price filter
    if (priceFilter !== 'all') {
      result = result.filter(s => {
        const price = Number(s.price);
        switch (priceFilter) {
          case 'under-500': return price < 500;
          case '500-1000': return price >= 500 && price <= 1000;
          case 'over-1000': return price > 1000;
          default: return true;
        }
      });
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'rating': return (b.average_rating || 0) - (a.average_rating || 0);
        case 'reviews': return (b.total_reviews || 0) - (a.total_reviews || 0);
        case 'price-low': return Number(a.price) - Number(b.price);
        case 'price-high': return Number(b.price) - Number(a.price);
        default: return 0;
      }
    });

    return result;
  }, [services, searchQuery, sortBy, priceFilter]);

  if (isLoading) {
    return (
      <Layout>
        <Container className="py-20 text-center">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-2 text-muted">Loading {categoryId} services...</p>
        </Container>
      </Layout>
    );
  }

  if (!category) {
    return (
      <Layout>
        <Container className="py-20 text-center">
          <h1 className="h3 fw-bold mb-4">Category not found</h1>
          <Button onClick={() => navigate('/services')}>Browse All Services</Button>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header */}
      <div className="bg-light bg-opacity-50 py-5 border-bottom">
        <Container>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mb-4 text-primary hover-bg-primary-light"
          >
            <ArrowLeft size={16} className="me-2" />
            Back
          </Button>

          <div className="d-flex align-items-center gap-4 mb-5">
            <span className="display-4">{category.icon}</span>
            <div>
              <h1 className="h2 fw-bold text-dark mb-1">
                {category.name} Experts
              </h1>
              <p className="text-muted mb-0">
                Compare and hire the best {category.name.toLowerCase()} professionals for your business
              </p>
            </div>
          </div>

          {/* Search and Filters */}
          <Row className="g-3">
            <Col lg={6}>
              <Form.Control
                placeholder="Search services, keywords or vendors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="py-2 px-3 shadow-none border-primary border-opacity-25"
              />
            </Col>
            <Col md={6} lg={3}>
              <div className="d-flex align-items-center bg-white border border-primary border-opacity-25 rounded px-2">
                <Filter size={16} className="text-primary me-2 ms-1" />
                <Form.Select
                  value={priceFilter}
                  onChange={(e) => setPriceFilter(e.target.value)}
                  className="border-0 shadow-none py-2 extra-small"
                >
                  <option value="all">All prices</option>
                  <option value="under-500">Under $500</option>
                  <option value="500-1000">$500 - $1000</option>
                  <option value="over-1000">Over $1000</option>
                </Form.Select>
              </div>
            </Col>
            <Col md={6} lg={3}>
              <div className="d-flex align-items-center bg-white border border-primary border-opacity-25 rounded px-2">
                <SortAsc size={16} className="text-primary me-2 ms-1" />
                <Form.Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border-0 shadow-none py-2 extra-small"
                >
                  <option value="rating">Highest Rated</option>
                  <option value="reviews">Most Reviews</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </Form.Select>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Services List */}
      <Container className="py-5">
        <p className="text-muted small mb-4 fw-medium">
          {filteredAndSortedServices.length} service{filteredAndSortedServices.length !== 1 ? 's' : ''} available
        </p>

        {filteredAndSortedServices.length > 0 ? (
          <div>
            {filteredAndSortedServices.map((service) => (
              <ServiceVendorCard key={service.id} service={service} />
            ))}
          </div>
        ) : (
          <div className="text-center py-5 bg-light rounded-4 border border-dashed">
            <div className="display-1 mb-4 opacity-50">🔍</div>
            <h3 className="h5 fw-bold text-dark mb-2">
              No services found
            </h3>
            <p className="text-muted small mb-4 mx-auto" style={{ maxWidth: 300 }}>
              Try adjusting your search or filter criteria to find what you're looking for.
            </p>
            <Button
              variant="outline-primary"
              className="rounded-pill px-4"
              onClick={() => { setSearchQuery(''); setPriceFilter('all'); }}
            >
              Clear All Filters
            </Button>
          </div>
        )}

        {/* Trust Banner */}
        <div className="mt-5 bg-primary bg-opacity-10 rounded-4 p-4 border border-primary border-opacity-10 shadow-sm">
          <div className="d-flex align-items-start gap-3">
            <div className="p-3 bg-white rounded-circle shadow-sm flex-shrink-0">
              <CheckCircle size={24} className="text-primary" />
            </div>
            <div>
              <h3 className="h6 fw-bold text-dark mb-1">Trust-First Marketplace</h3>
              <p className="small text-secondary mb-0">
                Message vendors directly before making any payment. Clarify scope, expectations,
                and pricing before committing. Only pay when you're ready to start your project.
              </p>
            </div>
          </div>
        </div>
      </Container>
      <style>{`
        .hover-shadow-md:hover { box-shadow: 0 .5rem 1rem rgba(0,0,0,.1) !important; }
        .card-vendor { transition: all 0.3s ease; }
        .link-primary { color: var(--bs-dark); text-decoration: none; }
        .card-vendor:hover .link-primary { color: var(--bs-primary); }
        .text-truncate-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
        .extra-small { font-size: 0.75rem; }
        .hover-bg-primary-light:hover { background-color: rgba(13, 110, 253, 0.05); }
        .border-dashed { border-style: dashed !important; }
        .fill-warning { fill: #ffc107; }
      `}</style>
    </Layout>
  );
}