import SearchBar from './SearchBar';
import { Container } from 'react-bootstrap';
import { CheckCircle } from 'lucide-react';

export default function Hero() {
    return (
        <section
  className="position-relative"
  style={{
    background: "linear-gradient(180deg, #F7F9FC 0%, #FFFFFF 60%)",
    paddingTop: "4rem",
    paddingBottom: "4rem",
  }}
>

            <Container>
                <div className="text-center mx-auto" style={{ maxWidth: '900px' }}>
                    {/* Main Headline */}
                    <h1
  className="fw-bold mb-4"
  style={{
    fontSize: "clamp(2.5rem, 5vw, 3.75rem)",
    lineHeight: "1.15",
    color: "#404145",
    letterSpacing: "-0.02em",
  }}
>
  Find the perfect{" "}
  <span
    style={{
      display: "inline-block",
      background: "linear-gradient(135deg, #00B67A 0%, #0A2540 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
    }}
  >
    marketing
  </span>
  <br />
  <span
    style={{
      display: "inline-block",
      background: "linear-gradient(135deg, #00B67A 0%, #0A2540 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
    }}
  >
    service
  </span>{" "}
  for your business
</h1>


                    {/* Subheadline */}
                    <p className="mb-5" style={{
                        fontSize: '1.25rem',
                        color: '#62646A',
                        lineHeight: '1.6',
                        maxWidth: '700px',
                        margin: '0 auto 2.5rem'
                    }}>
                        Connect with expert freelancers and agencies ready to help you grow
                    </p>

                    {/* Search Bar */}
                    <div className="mb-5">
                        <SearchBar />
                    </div>

                    {/* Trust Indicators */}
                    <div className="d-flex flex-wrap justify-content-center align-items-center gap-4 pt-3">
                        <div className="d-flex align-items-center gap-2">
                            <CheckCircle size={18} style={{ color: '#00B67A' }} />
                            <span style={{ color: '#62646A', fontSize: '0.95rem' }}>
                                Verified experts
                            </span>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                            <CheckCircle size={18} style={{ color: '#00B67A' }} />
                            <span style={{ color: '#62646A', fontSize: '0.95rem' }}>
                                Secure payments
                            </span>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                            <CheckCircle size={18} style={{ color: '#00B67A' }} />
                            <span style={{ color: '#62646A', fontSize: '0.95rem' }}>
                                24/7 support
                            </span>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="d-flex flex-wrap justify-content-center gap-5 mt-5 pt-4" style={{ borderTop: '1px solid #E4E5E7' }}>
                        <div className="text-center pt-4">
                            <div className="h2 fw-bold mb-1" style={{ color: '#404145' }}>2,500+</div>
                            <div className="small" style={{ color: '#95979D' }}>Verified Experts</div>
                        </div>
                        <div className="text-center pt-4">
                            <div className="h2 fw-bold mb-1" style={{ color: '#404145' }}>50K+</div>
                            <div className="small" style={{ color: '#95979D' }}>Projects Completed</div>
                        </div>
                        <div className="text-center pt-4">
                            <div className="h2 fw-bold mb-1" style={{ color: '#404145' }}>4.9/5</div>
                            <div className="small" style={{ color: '#95979D' }}>Average Rating</div>
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    );
}
