import { useState, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, MapPin, Clock, CheckCircle, Filter, SortAsc } from 'lucide-react';
import { Layout } from 'components/layout/Layout';
import { Button } from 'components/ui/button';
import { categories } from 'data/services';
import { getVendorsByCategory } from 'data/vendors';
import { Container, Row, Col, Card, Badge, Form } from 'react-bootstrap';

function VendorCard({ vendor }) {
  return (
    <Link
      to={`/vendors/${vendor.id}`}
      className="text-decoration-none"
    >
      <Card className="border shadow-sm hover-shadow-md transition-all p-4 mb-4 card-vendor">
        <Row className="align-items-start g-4">
          {/* Avatar */}
          <Col xs="auto">
            <div className="bg-primary bg-opacity-10 d-flex align-items-center justify-content-center rounded-3 overflow-hidden shadow-sm border" style={{ width: 80, height: 80 }}>
              {vendor.avatar ? (
                <img src={vendor.avatar} alt={vendor.name} className="w-100 h-100 object-fit-cover" />
              ) : (
                <span className="h2 fw-bold text-primary mb-0">{vendor.name.charAt(0)}</span>
              )}
            </div>
          </Col>

          {/* Info */}
          <Col>
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start gap-2 mb-2">
              <div className="min-w-0">
                <h3 className="h5 fw-bold text-dark mb-1 link-primary transition-colors">
                  {vendor.name}
                </h3>
                <p className="text-muted small mb-0 text-truncate">{vendor.tagline}</p>
              </div>
              <div className="d-flex align-items-center gap-1 flex-shrink-0 bg-warning bg-opacity-10 px-2 py-1 rounded">
                <Star size={14} className="text-warning fill-warning" />
                <span className="fw-bold text-dark small">{vendor.rating}</span>
                <span className="text-muted extra-small">({vendor.reviewCount})</span>
              </div>
            </div>

            <p className="small text-secondary mb-3 text-truncate-2">{vendor.description}</p>

            {/* Meta info */}
            <div className="d-flex flex-wrap align-items-center gap-3 mb-3 extra-small text-muted">
              <span className="d-flex align-items-center gap-1">
                <MapPin size={12} />
                {vendor.location}
              </span>
              <span className="d-flex align-items-center gap-1">
                <Clock size={12} />
                {vendor.responseTime}
              </span>
              <span className="d-flex align-items-center gap-1">
                <CheckCircle size={12} className="text-success" />
                {vendor.completionRate}% completion
              </span>
            </div>

            {/* Skills */}
            <div className="d-flex flex-wrap gap-2 mb-4">
              {vendor.skills.slice(0, 4).map((skill) => (
                <Badge key={skill} bg="light" className="text-dark border fw-normal px-2 py-1" style={{ fontSize: '0.65rem' }}>
                  {skill}
                </Badge>
              ))}
              {vendor.skills.length > 4 && (
                <Badge bg="white" className="text-muted border-dashed border-2 fw-normal px-2 py-1" style={{ fontSize: '0.65rem' }}>
                  +{vendor.skills.length - 4} more
                </Badge>
              )}
            </div>

            {/* Footer */}
            <div className="d-flex align-items-center justify-content-between pt-3 border-top mt-auto">
              <div>
                <span className="small text-muted">Starting at </span>
                <span className="h5 fw-bold text-dark mb-0">${vendor.startingPrice}</span>
              </div>
              <div className="small text-muted fw-medium">
                {vendor.totalProjects} projects completed
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

  const category = categories.find(c => c.id === categoryId);
  const vendors = categoryId ? getVendorsByCategory(categoryId) : [];

  const filteredAndSortedVendors = useMemo(() => {
    let result = [...vendors];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(v =>
        v.name.toLowerCase().includes(query) ||
        v.tagline.toLowerCase().includes(query) ||
        v.skills.some(s => s.toLowerCase().includes(query))
      );
    }

    // Price filter
    if (priceFilter !== 'all') {
      result = result.filter(v => {
        switch (priceFilter) {
          case 'under-500': return v.startingPrice < 500;
          case '500-1000': return v.startingPrice >= 500 && v.startingPrice <= 1000;
          case 'over-1000': return v.startingPrice > 1000;
          default: return true;
        }
      });
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'rating': return b.rating - a.rating;
        case 'reviews': return b.reviewCount - a.reviewCount;
        case 'price-low': return a.startingPrice - b.startingPrice;
        case 'price-high': return b.startingPrice - a.startingPrice;
        case 'projects': return b.totalProjects - a.totalProjects;
        default: return 0;
      }
    });

    return result;
  }, [vendors, searchQuery, sortBy, priceFilter]);

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
                Compare and hire the best {category.name.toLowerCase()} vendors for your business
              </p>
            </div>
          </div>

          {/* Search and Filters */}
          <Row className="g-3">
            <Col lg={6}>
              <Form.Control
                placeholder="Search vendors by name or skill..."
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
                  <option value="projects">Most Projects</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </Form.Select>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Vendors List */}
      <Container className="py-5">
        <p className="text-muted small mb-4 fw-medium">
          {filteredAndSortedVendors.length} vendor{filteredAndSortedVendors.length !== 1 ? 's' : ''} available
        </p>

        {filteredAndSortedVendors.length > 0 ? (
          <div>
            {filteredAndSortedVendors.map((vendor) => (
              <VendorCard key={vendor.id} vendor={vendor} />
            ))}
          </div>
        ) : (
          <div className="text-center py-5 bg-light rounded-4 border border-dashed">
            <div className="display-1 mb-4 opacity-50">🔍</div>
            <h3 className="h5 fw-bold text-dark mb-2">
              No vendors found
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
      `}</style>
    </Layout>
  );
}
