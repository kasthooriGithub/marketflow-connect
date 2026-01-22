import { Link } from 'react-router-dom';
import { Check, Star } from 'lucide-react';
import { Layout } from 'components/layout/Layout';
import { Button } from 'components/ui/button';
import { Container, Row, Col, Card, Badge } from 'react-bootstrap';

const plans = [
  {
    name: 'Starter',
    description: 'Perfect for small businesses getting started',
    price: 0,
    priceLabel: 'Free forever',
    features: [
      'Browse all services',
      'Message up to 5 vendors/month',
      'Basic project management',
      'Community support',
    ],
    cta: 'Get Started',
    variant: 'outline-primary',
  },
  {
    name: 'Professional',
    description: 'For growing businesses with bigger needs',
    price: 49,
    priceLabel: '/month',
    features: [
      'Everything in Starter',
      'Unlimited vendor messages',
      'Priority support',
      'Advanced analytics',
      'Custom contracts',
      'Dedicated account manager',
    ],
    cta: 'Start Free Trial',
    variant: 'primary',
    popular: true,
  },
  {
    name: 'Enterprise',
    description: 'Custom solutions for large organizations',
    price: null,
    priceLabel: 'Custom pricing',
    features: [
      'Everything in Professional',
      'Custom integrations',
      'SLA guarantees',
      'White-label options',
      'Bulk discounts',
      'Dedicated success team',
    ],
    cta: 'Contact Sales',
    variant: 'outline-primary',
  },
];

const vendorPlans = [
  {
    name: 'Basic Vendor',
    commission: '15%',
    features: ['Up to 5 active listings', 'Basic analytics', 'Standard support'],
  },
  {
    name: 'Pro Vendor',
    commission: '10%',
    features: ['Unlimited listings', 'Advanced analytics', 'Priority placement', 'Featured badge'],
    popular: true,
  },
  {
    name: 'Agency',
    commission: '8%',
    features: ['Everything in Pro', 'Team accounts', 'API access', 'Custom branding'],
  },
];

export default function Pricing() {
  return (
    <Layout>
      {/* Hero */}
      <section className="py-5 bg-primary bg-opacity-10 border-bottom">
        <Container className="py-5 text-center">
          <Badge bg="primary" className="bg-opacity-10 text-primary mb-3 px-3 py-2 rounded-pill fw-normal">Pricing Plans</Badge>
          <h1 className="display-4 fw-bold text-dark mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="lead text-muted max-w-2xl mx-auto mb-0">
            Choose the plan that fits your needs. No hidden fees, no surprises. Scale your marketing as your business grows.
          </p>
        </Container>
      </section>

      {/* Client Plans */}
      <section className="py-5">
        <Container className="py-5">
          <div className="text-center mb-5">
            <h2 className="h2 fw-bold text-dark">For Clients</h2>
            <div className="bg-primary mx-auto mb-4" style={{ height: '4px', width: '60px' }}></div>
          </div>

          <Row className="g-4 justify-content-center max-w-6xl mx-auto align-items-center">
            {plans.map((plan) => (
              <Col lg={4} key={plan.name}>
                <Card
                  className={`h-100 border-0 shadow-sm rounded-4 position-relative card-pricing ${plan.popular ? 'border-primary border-4 shadow-lg active-plan' : ''
                    }`}
                >
                  {plan.popular && (
                    <Badge bg="accent" className="position-absolute top-0 start-50 translate-middle rounded-pill px-4 py-2" style={{ backgroundColor: '#ffc107', color: '#000' }}>
                      Most Popular
                    </Badge>
                  )}

                  <Card.Body className="p-4 p-lg-5 d-flex flex-column">
                    <div className="mb-4">
                      <h3 className="h4 fw-bold text-dark mb-2">{plan.name}</h3>
                      <p className="small text-muted mb-0">{plan.description}</p>
                    </div>

                    <div className="mb-4">
                      {plan.price !== null ? (
                        <div className="d-flex align-items-baseline gap-1">
                          <span className="display-5 fw-bold text-dark">${plan.price}</span>
                          <span className="text-muted small">{plan.priceLabel}</span>
                        </div>
                      ) : (
                        <div className="h3 fw-bold text-dark mb-1">{plan.priceLabel}</div>
                      )}
                    </div>

                    <ul className="list-unstyled mb-5 flex-grow-1">
                      {plan.features.map((feature) => (
                        <li key={feature} className="d-flex align-items-start gap-3 mb-3 small">
                          <div className="p-1 bg-success bg-opacity-10 rounded-circle text-success d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 20, height: 20 }}>
                            <Check size={12} strokeWidth={3} />
                          </div>
                          <span className="text-secondary">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Link to="/signup">
                      <Button variant={plan.variant} className={`w-100 py-3 fw-bold rounded-pill shadow-sm transition-all ${plan.popular ? 'shadow-lg' : ''}`}>
                        {plan.cta}
                      </Button>
                    </Link>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Vendor Plans */}
      <section className="py-5 bg-light">
        <Container className="py-5">
          <div className="text-center mb-5">
            <h2 className="h2 fw-bold text-dark mb-3">For Vendors</h2>
            <p className="text-muted small mb-0 max-w-xl mx-auto">
              Low commission rates that let you keep more of what you earn. Showcase your skills to a global audience.
            </p>
          </div>

          <Row className="g-4 justify-content-center max-w-5xl mx-auto">
            {vendorPlans.map((plan) => (
              <Col md={6} lg={4} key={plan.name}>
                <Card
                  className={`h-100 border-0 shadow-sm rounded-4 p-4 card-vendor-pricing ${plan.popular ? 'border-top border-primary border-4 shadow-md' : ''
                    }`}
                >
                  <Card.Body className="d-flex flex-column">
                    {plan.popular && (
                      <Badge bg="primary" className="bg-opacity-10 text-primary mb-3 align-self-start py-2 px-3 fw-normal">Recommended</Badge>
                    )}
                    <h3 className="h5 fw-bold text-dark mb-3">{plan.name}</h3>
                    <div className="display-6 fw-bold text-primary mb-1">{plan.commission}</div>
                    <p className="small text-muted mb-4 fw-medium">commission per sale</p>

                    <ul className="list-unstyled mb-0 mt-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="d-flex align-items-center gap-2 mb-2 extra-small text-secondary">
                          <Check size={14} className="text-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          <div className="text-center mt-5 pt-4">
            <Link to="/signup">
              <Button variant="default" className="px-5 py-3 rounded-pill shadow">Start Selling Today</Button>
            </Link>
          </div>
        </Container>
      </section>

      {/* Trust Section */}
      <section className="py-5">
        <Container className="py-5 text-center">
          <h2 className="h4 fw-bold text-dark mb-4 px-4 px-md-0">
            Trusted by 2,500+ Agencies & 50,000+ Clients Worldwide
          </h2>
          <div className="d-flex align-items-center justify-content-center gap-1 text-warning mb-3">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={24} className="fill-warning" />
            ))}
          </div>
          <p className="text-muted h6 mb-0">4.9/5 from 10,000+ verified customer reviews</p>
        </Container>
      </section>
      <style>{`
        .max-w-2xl { max-width: 650px; }
        .max-w-xl { max-width: 550px; }
        .max-w-6xl { max-width: 1100px; }
        .max-w-5xl { max-width: 900px; }
        .extra-small { font-size: 0.8rem; }
        .card-pricing { transition: transform 0.3s ease; }
        .active-plan { transform: scale(1.05); z-index: 2; }
        @media (max-width: 991.98px) {
            .active-plan { transform: scale(1); margin: 20px 0; }
        }
        .card-vendor-pricing { transition: all 0.3s ease; }
        .card-vendor-pricing:hover { transform: translateY(-5px); box-shadow: 0 1rem 3rem rgba(0,0,0,.1) !important; }
        .fill-warning { fill: #ffc107; }
      `}</style>
    </Layout>
  );
}
