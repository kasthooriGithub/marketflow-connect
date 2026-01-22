import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, Users, Shield, Zap } from 'lucide-react';
import { Button } from 'components/ui/button';
import { Layout } from 'components/layout/Layout';
import { ServiceCard } from 'components/services/ServiceCard';
import { categories, getPopularServices } from 'data/services';
import { Container, Row, Col, Card } from 'react-bootstrap';

const stats = [
  { value: '2,500+', label: 'Active Vendors' },
  { value: '50K+', label: 'Services Sold' },
  { value: '98%', label: 'Satisfaction Rate' },
  { value: '$12M+', label: 'Paid to Vendors' },
];

const features = [
  {
    icon: Shield,
    title: 'Verified Vendors',
    description: 'Every vendor goes through a rigorous vetting process to ensure quality service delivery.',
    color: 'text-primary'
  },
  {
    icon: Zap,
    title: 'Fast Delivery',
    description: 'Get your marketing services delivered quickly with our streamlined project management.',
    color: 'text-warning'
  },
  {
    icon: Users,
    title: 'Expert Support',
    description: '24/7 support team ready to help you find the perfect service for your needs.',
    color: 'text-info'
  },
  {
    icon: TrendingUp,
    title: 'Growth Focused',
    description: 'Services designed to help your business scale and achieve measurable results.',
    color: 'text-success'
  }
];

export default function Index() {
  const popularServices = getPopularServices();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary-light to-white py-5 position-relative overflow-hidden">
        <div className="position-absolute top-0 end-0 p-5 opacity-10 d-none d-lg-block">
          <div className="bg-primary rounded-circle" style={{ width: 400, height: 400, filter: 'blur(100px)' }}></div>
        </div>

        <Container className="py-5 position-relative z-1">
          <div className="text-center mx-auto" style={{ maxWidth: '850px' }}>
            <div className="d-inline-flex align-items-center gap-2 px-4 py-2 rounded-pill bg-primary bg-opacity-10 text-primary mb-4 border border-primary border-opacity-10 animate-fade-in shadow-sm">
              <Zap size={16} className="fill-primary" />
              <span className="small fw-bold text-uppercase tracking-wider">The #1 Digital Marketing Marketplace</span>
            </div>

            <h1 className="display-3 fw-bold mb-4 text-dark font-display leading-tight">
              Grow Your Business with{' '}
              <span className="text-primary bg-primary bg-opacity-10 px-2 rounded">Expert Marketing</span>
            </h1>

            <p className="lead text-muted mb-5 px-lg-5 fs-5">
              Connect with top digital marketing agencies and freelancers. From SEO to social media, find the perfect service to scale your business to new heights.
            </p>

            <div className="d-flex flex-column flex-sm-row align-items-center justify-content-center gap-3 mb-5 mt-4">
              <Link to="/services">
                <Button variant="default" size="lg" className="px-5 py-3 shadow-lg rounded-pill">
                  Browse Services <ArrowRight className="ms-2" size={20} />
                </Button>
              </Link>
              <Link to="/signup">
                <Button variant="outline-primary" size="lg" className="px-5 py-3 rounded-pill bg-white">
                  Become a Vendor
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <Row className="mt-5 pt-5 g-4">
              {stats.map((stat) => (
                <Col xs={6} md={3} key={stat.label} className="text-center">
                  <Card className="border-0 bg-transparent h-100">
                    <Card.Body className="p-0">
                      <div className="h2 fw-bold text-dark mb-1 font-display">{stat.value}</div>
                      <div className="text-muted small fw-medium text-uppercase tracking-wider" style={{ fontSize: '0.65rem' }}>{stat.label}</div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </Container>
      </section>

      {/* Categories Section */}
      <section className="py-5 bg-white position-relative">
        <Container className="py-5">
          <div className="text-center mb-5">
            <h2 className="h2 fw-bold text-dark mb-3">Browse by Category</h2>
            <div className="bg-primary mx-auto mb-4" style={{ height: '4px', width: '50px' }}></div>
            <p className="text-muted lead fs-6">Find the perfect marketing service from our curated categories</p>
          </div>

          <Row className="g-4">
            {categories.map((category) => (
              <Col xs={6} md={3} key={category.id}>
                <Link
                  to={`/category/${category.id}`}
                  className="card h-100 text-decoration-none border-0 shadow-sm rounded-4 hover-lift transition-all card-category"
                >
                  <div className="card-body text-center p-4">
                    <div className="display-4 mb-3 category-icon-wrapper transition-all">{category.icon}</div>
                    <h5 className="card-title text-dark fw-bold mb-1">{category.name}</h5>
                    <p className="card-text text-primary small fw-medium">View Experts →</p>
                  </div>
                </Link>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Popular Services */}
      <section className="py-5 bg-light bg-opacity-50">
        <Container className="py-5">
          <div className="d-flex align-items-end justify-content-between mb-5 px-2">
            <div>
              <h2 className="h2 fw-bold text-dark mb-2">Popular Services</h2>
              <p className="text-muted mb-0">Top-rated services trusted by thousands of business owners</p>
            </div>
            <Link to="/services" className="d-none d-md-block">
              <Button variant="outline-primary" className="rounded-pill px-4">
                View All <ArrowRight className="ms-1" size={16} />
              </Button>
            </Link>
          </div>

          <Row className="g-4">
            {popularServices.map((service) => (
              <Col md={6} lg={3} key={service.id}>
                <ServiceCard service={service} />
              </Col>
            ))}
          </Row>

          <div className="mt-5 text-center d-md-none">
            <Link to="/services">
              <Button variant="outline-primary" className="w-100 py-3 rounded-pill">
                View All Services <ArrowRight className="ms-1" size={16} />
              </Button>
            </Link>
          </div>
        </Container>
      </section>

      {/* Features Section */}
      <section className="py-5 bg-dark text-white rounded-5 my-5 mx-3 mx-lg-5 overflow-hidden position-relative">
        <div className="position-absolute top-0 start-0 w-100 h-100 opacity-10 bg-grid-white"></div>
        <Container className="py-5 position-relative z-1">
          <div className="text-center mb-5">
            <h2 className="h2 fw-bold mb-3">Why Choose MarketFlow?</h2>
            <p className="text-white-50 lead fs-6">We make it easy to find, hire, and work with the best marketing professionals globally</p>
          </div>

          <Row className="g-4">
            {features.map((feature) => (
              <Col md={6} lg={3} key={feature.title}>
                <div className="text-center p-4 h-100 rounded-4 feature-item transition-all">
                  <div className={`d-inline-flex align-items-center justify-content-center bg-white bg-opacity-10 rounded-4 mb-4 shadow-lg`} style={{ width: 64, height: 64 }}>
                    <feature.icon className={`${feature.color}`} size={32} />
                  </div>
                  <h4 className="h5 fw-bold mb-3">{feature.title}</h4>
                  <p className="text-white-50 small mb-0 fw-light leading-relaxed">{feature.description}</p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-5 bg-white mb-5">
        <Container>
          <div className="bg-primary bg-gradient rounded-5 p-5 text-center position-relative overflow-hidden shadow-lg border border-primary border-4 border-opacity-10">
            <div className="position-absolute bottom-0 start-0 w-100 h-100 opacity-10 bg-pattern-white"></div>
            <div className="position-relative z-1 py-4">
              <h2 className="display-5 fw-bold text-white mb-4">Ready to Grow Your Business?</h2>
              <p className="mb-5 text-white opacity-75 fs-5 mx-auto" style={{ maxWidth: '650px' }}>
                Join over 50,000+ businesses who have already found their perfect marketing partner on MarketFlow Connect.
              </p>
              <div className="d-flex flex-column flex-sm-row justify-content-center gap-3">
                <Link to="/signup">
                  <Button size="lg" variant="default" className="bg-white text-primary border-white hover-bg-light fw-bold px-5 py-3 rounded-pill shadow-lg">
                    Get Started Free <ArrowRight className="ms-2" size={20} />
                  </Button>
                </Link>
                <Link to="/how-it-works">
                  <Button size="lg" variant="outline-primary" className="text-white border-white border-2 px-5 py-3 rounded-pill">
                    See How It Works
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <style>{`
        .bg-gradient-to-b.from-primary-light { background: linear-gradient(180deg, rgba(13, 110, 253, 0.05) 0%, rgba(255, 255, 255, 1) 100%); }
        .hover-lift:hover { transform: translateY(-5px); box-shadow: 0 1rem 3rem rgba(0,0,0,.1) !important; }
        .card-category:hover .category-icon-wrapper { transform: scale(1.1); }
        .leading-relaxed { line-height: 1.6; }
        .feature-item:hover { background: rgba(255,255,255,0.05); }
        .bg-grid-white { background-image: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px); background-size: 20px 20px; }
        .bg-pattern-white { background-image: repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.05) 75%, transparent 75%, transparent); background-size: 40px 40px; }
        .font-display { font-family: 'Outfit', 'Inter', sans-serif; }
      `}</style>
    </Layout>
  );
}
