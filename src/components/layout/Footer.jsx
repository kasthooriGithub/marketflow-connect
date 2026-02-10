import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';

export function Footer() {
  return (
    <footer className="bg-dark text-white py-5">
      <Container>
        <Row className="gy-4">
          {/* Brand */}
          <Col md={3}>
            <Link to="/" className="d-flex align-items-center gap-2 mb-3 text-decoration-none text-white">
              <div className="bg-white text-dark rounded d-flex align-items-center justify-content-center fw-bold" style={{ width: 32, height: 32 }}>
                M
              </div>
              <span className="fw-bold fs-5">MarketFlow Connect</span>
            </Link>
            <p className="text-white-50 small">
              The premier marketplace for digital marketing services. Connect with top agencies and grow your business.
            </p>
          </Col>

          {/* Product */}
          <Col md={3}>
            <h5 className="fw-bold mb-3">Product</h5>
            <ul className="list-unstyled">
              <li className="mb-2"><Link to="/services" className="text-white-50 text-decoration-none hover-white">Browse Services</Link></li>
              <li className="mb-2"><Link to="/how-it-works" className="text-white-50 text-decoration-none hover-white">How It Works</Link></li>
              <li className="mb-2"><Link to="/pricing" className="text-white-50 text-decoration-none hover-white">Pricing</Link></li>
              <li className="mb-2"><Link to="/trust-safety" className="text-white-50 text-decoration-none hover-white">Trust & Safety</Link></li>
              <li className="mb-2"><Link to="/become-seller" className="text-white-50 text-decoration-none hover-white">Become a Seller</Link></li>
              <li className="mb-2"><Link to="/seller-resources" className="text-white-50 text-decoration-none hover-white">Seller Resources</Link></li>
            </ul>
          </Col>

          {/* Company */}
          <Col md={3}>
            <h5 className="fw-bold mb-3">Company</h5>
            <ul className="list-unstyled">
              <li className="mb-2"><Link to="/community" className="text-white-50 text-decoration-none hover-white">Community</Link></li>
              <li className="mb-2"><Link to="/success-stories" className="text-white-50 text-decoration-none hover-white">Success Stories</Link></li>
              <li className="mb-2"><Link to="/about" className="text-white-50 text-decoration-none hover-white">About Us</Link></li>
              <li className="mb-2"><Link to="/careers" className="text-white-50 text-decoration-none hover-white">Careers</Link></li>
              <li className="mb-2"><Link to="/press" className="text-white-50 text-decoration-none hover-white">Press</Link></li>
              <li className="mb-2"><Link to="/contact" className="text-white-50 text-decoration-none hover-white">Contact</Link></li>
            </ul>
          </Col>

          {/* Legal & Support */}
          <Col md={3}>
            <h5 className="fw-bold mb-3">Legal & Support</h5>
            <ul className="list-unstyled">
              <li className="mb-2"><Link to="/help-center" className="text-white-50 text-decoration-none hover-white">Help Center</Link></li>
              <li className="mb-2"><Link to="/faq" className="text-white-50 text-decoration-none hover-white">FAQ</Link></li>
              <li className="mb-2"><Link to="/terms" className="text-white-50 text-decoration-none hover-white">Terms of Service</Link></li>
              <li className="mb-2"><Link to="/privacy" className="text-white-50 text-decoration-none hover-white">Privacy Policy</Link></li>
            </ul>
          </Col>
        </Row>

        <div className="border-top border-secondary mt-4 pt-4 d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
          <p className="text-white-50 small mb-0">
            © 2026 MarketFlow Connect | Designed & Developed by Kasthoori
          </p>
          <div className="d-flex gap-3">
            <a href="#" className="text-white-50 hover-white">
              <svg className="bi" width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" /></svg>
            </a>
            <a href="#" className="text-white-50 hover-white">
              <svg className="bi" width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
            </a>
          </div>
        </div>
        <style>
          {`
            .hover-white:hover { color: #fff !important; }
          `}
        </style>
      </Container>
    </footer>
  );
}
