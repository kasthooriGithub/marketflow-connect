import SearchBar from './SearchBar';
import { Container } from 'react-bootstrap';
import { CheckCircle } from 'lucide-react';

export default function Hero() {
  return (
    <section
      className="position-relative"
      style={{
        background: "linear-gradient(180deg, #F7F9FC 0%, #FFFFFF 60%)",
        paddingTop: "5rem",
        paddingBottom: "5rem",
      }}
    >

      <Container>
        <div className="text-center mx-auto" style={{ maxWidth: '900px' }}>
          {/* Main Headline */}
          <h1
            className="fw-bold mb-4"
            style={{
              fontSize: "clamp(2.75rem, 5vw, 4rem)",
              lineHeight: "1.1",
              color: "#404145",
              letterSpacing: "-0.03em",
            }}
          >
            Scale Your Business with{" "}
            <br className="d-none d-md-block" />
            <span
              style={{
                display: "inline-block",
                background: "linear-gradient(135deg, #00B67A 0%, #0A2540 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Vetted Marketing
            </span>{" "}
            Experts
          </h1>


          {/* Subheadline */}
          <p className="mb-5" style={{
            fontSize: '1.25rem',
            color: '#62646A',
            lineHeight: '1.6',
            maxWidth: '750px',
            margin: '0 auto 2.5rem'
          }}>
            Join 50,000+ businesses sourcing top-tier SEO, Social, and Creative talent. Connect with expert freelancers ready to help you grow.
          </p>

          {/* Search Bar */}
          <div className="mb-5">
            <SearchBar />
          </div>

          {/* Trust Indicators */}
          <div className="d-flex flex-wrap justify-content-center align-items-center gap-4 pt-4 mt-2">
            <div className="d-flex align-items-center gap-2">
              <CheckCircle size={18} style={{ color: '#00B67A' }} />
              <span style={{ color: '#62646A', fontSize: '0.95rem', fontWeight: 500 }}>
                Verified experts
              </span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <CheckCircle size={18} style={{ color: '#00B67A' }} />
              <span style={{ color: '#62646A', fontSize: '0.95rem', fontWeight: 500 }}>
                Secure payments
              </span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <CheckCircle size={18} style={{ color: '#00B67A' }} />
              <span style={{ color: '#62646A', fontSize: '0.95rem', fontWeight: 500 }}>
                24/7 support
              </span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
