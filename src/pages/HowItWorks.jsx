import { Link } from 'react-router-dom';
import { Search, FileCheck, Handshake, Rocket } from 'lucide-react';
import { Layout } from 'components/layout/Layout';
import { Button } from 'components/ui/button';
import { Container, Row, Col, Card, Accordion } from 'react-bootstrap';

const steps = [
  {
    icon: Search,
    title: 'Browse & Discover',
    description: 'Explore our marketplace of vetted digital marketing services. Filter by category, price, or rating to find your perfect match.',
  },
  {
    icon: FileCheck,
    title: 'Compare & Choose',
    description: 'Review detailed service descriptions, vendor portfolios, and client reviews. Make an informed decision with full transparency.',
  },
  {
    icon: Handshake,
    title: 'Connect & Collaborate',
    description: 'Message vendors directly, discuss your requirements, and agree on scope. Our secure platform protects both parties.',
  },
  {
    icon: Rocket,
    title: 'Launch & Grow',
    description: 'Start your project and track progress in real-time. Pay only when you\'re satisfied with the results.',
  },
];

const faqs = [
  {
    question: 'How do I get started on MarketFlow?',
    answer: 'Simply create a free account, browse our marketplace, and connect with vendors that match your needs. You can message vendors before making any commitment.',
  },
  {
    question: 'How are vendors vetted?',
    answer: 'All vendors go through a rigorous application process including portfolio review, identity verification, and background checks. We also monitor ongoing performance and client satisfaction.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards, PayPal, and bank transfers. Payments are held in escrow until you approve the delivered work.',
  },
  {
    question: 'What if I\'m not satisfied with the service?',
    answer: 'We offer a money-back guarantee. If a vendor fails to deliver as promised, you can request a full refund. Our support team will mediate any disputes.',
  },
  {
    question: 'How do I become a vendor?',
    answer: 'Sign up as a vendor and complete your profile with portfolio samples, certifications, and service offerings. Our team will review your application within 48 hours.',
  },
  {
    question: 'Are there any fees for clients?',
    answer: 'Browsing and messaging vendors is completely free. We only charge a small service fee (5%) when you make a purchase, which helps us maintain the platform.',
  },
];

export default function HowItWorks() {
  return (
    <Layout>
      {/* Hero */}
      <section className="py-5 bg-primary bg-opacity-10 border-bottom">
        <Container className="py-5 text-center">
          <h1 className="display-4 fw-bold text-dark mb-4">
            How MarketFlow Works
          </h1>
          <p className="lead text-muted max-w-2xl mx-auto mb-5">
            Your journey to better marketing starts here. Simple, transparent, and effective workflows to grow your brand.
          </p>
          <Link to="/services">
            <Button variant="default" className="px-5 py-3 shadow-lg">
              Start Exploring
            </Button>
          </Link>
        </Container>
      </section>

      {/* Steps */}
      <section className="py-5">
        <Container className="py-5">
          <div className="max-w-4xl mx-auto position-relative">
            {/* Timeline Line */}
            <div className="d-none d-md-block position-absolute start-0 h-100 border-start border-2 border-primary border-opacity-25 ms-4 translate-middle-x" style={{ zIndex: 0, top: '40px' }}></div>

            {steps.map((step, index) => (
              <div key={step.title} className="d-flex gap-4 mb-5 position-relative" style={{ zIndex: 1 }}>
                {/* Icon */}
                <div className="flex-shrink-0 d-flex align-items-center justify-content-center bg-primary rounded-4 shadow-lg mb-auto" style={{ width: 64, height: 64 }}>
                  <step.icon size={28} className="text-white" />
                </div>

                {/* Content */}
                <div className="pt-2">
                  <div className="badge bg-primary bg-opacity-10 text-primary mb-2 px-3 py-2 rounded-pill">Step {index + 1}</div>
                  <h3 className="h4 fw-bold text-dark mb-2">{step.title}</h3>
                  <p className="text-secondary max-w-md">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* For Clients & Vendors */}
      <section className="py-5 bg-light">
        <Container className="py-5">
          <Row className="g-4 max-w-5xl mx-auto">
            {/* For Clients */}
            <Col md={6}>
              <Card className="h-100 border-0 shadow-sm rounded-4 p-4 p-lg-5">
                <Card.Body>
                  <div className="h1 mb-4">🎯</div>
                  <h3 className="h3 fw-bold text-dark mb-4">For Clients</h3>
                  <ul className="list-unstyled mb-5">
                    {[
                      'Access to vetted marketing experts',
                      'Secure payments with escrow protection',
                      'Money-back guarantee on all services',
                      '24/7 customer support'
                    ].map(item => (
                      <li key={item} className="d-flex align-items-center gap-2 mb-3 text-secondary">
                        <div className="p-1 bg-success bg-opacity-10 rounded-circle text-success d-flex align-items-center justify-content-center" style={{ width: 24, height: 24 }}>
                          <span style={{ fontSize: '0.8rem' }}>✓</span>
                        </div>
                        <span className="small fw-medium">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/signup">
                    <Button variant="default" className="w-100 py-3 shadow-none">Find a Vendor</Button>
                  </Link>
                </Card.Body>
              </Card>
            </Col>

            {/* For Vendors */}
            <Col md={6}>
              <Card className="h-100 border-0 shadow-sm rounded-4 p-4 p-lg-5">
                <Card.Body>
                  <div className="h1 mb-4">💼</div>
                  <h3 className="h3 fw-bold text-dark mb-4">For Vendors</h3>
                  <ul className="list-unstyled mb-5">
                    {[
                      'Access to thousands of potential clients',
                      'Build your reputation with reviews',
                      'Low platform fees (only 10%)',
                      'Dedicated vendor success team'
                    ].map(item => (
                      <li key={item} className="d-flex align-items-center gap-2 mb-3 text-secondary">
                        <div className="p-1 bg-primary bg-opacity-10 rounded-circle text-primary d-flex align-items-center justify-content-center" style={{ width: 24, height: 24 }}>
                          <span style={{ fontSize: '0.8rem' }}>✓</span>
                        </div>
                        <span className="small fw-medium">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/signup">
                    <Button variant="outline-primary" className="w-100 py-3 shadow-none">Become a Vendor</Button>
                  </Link>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* FAQ */}
      <section className="py-5">
        <Container className="py-5">
          <div className="max-w-3xl mx-auto">
            <h2 className="display-6 fw-bold text-dark text-center mb-5">
              Frequently Asked Questions
            </h2>

            <Accordion className="d-flex flex-column gap-3">
              {faqs.map((faq, index) => (
                <Accordion.Item
                  key={index}
                  eventKey={index.toString()}
                  className="border rounded-4 overflow-hidden shadow-sm"
                >
                  <Accordion.Header className="bg-white px-2 fw-bold">
                    <span className="fw-bold text-dark">{faq.question}</span>
                  </Accordion.Header>
                  <Accordion.Body className="text-secondary small">
                    {faq.answer}
                  </Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>

            <div className="text-center mt-5 pt-4">
              <p className="text-muted small mb-3">Still have questions?</p>
              <Button variant="outline-primary" className="rounded-pill px-4">Contact Support</Button>
            </div>
          </div>
        </Container>
      </section>
      <style>{`
        .max-w-2xl { max-width: 650px; }
        .max-w-4xl { max-width: 800px; }
        .max-w-5xl { max-width: 1000px; }
        .max-w-3xl { max-width: 750px; }
        .max-w-md { max-width: 450px; }
        .accordion-button:not(.collapsed) {
            background-color: rgba(var(--bs-primary-rgb), 0.05);
            color: var(--bs-primary);
            box-shadow: none;
        }
        .accordion-button:focus {
            box-shadow: none;
            border-color: rgba(var(--bs-primary-rgb), 0.25);
        }
      `}</style>
    </Layout>
  );
}
