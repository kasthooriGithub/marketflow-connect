import { Layout } from 'components/layout/Layout';
import { Container, Row, Col, Card, Accordion } from 'react-bootstrap';
import {
    Rocket, Briefcase, DollarSign, MessageSquare,
    ShieldCheck, Star, Users, CheckCircle
} from 'lucide-react';

export default function VendorGuide() {
    const steps = [
        {
            icon: Briefcase,
            title: 'Create Your Service',
            description: 'Define what you offer, set your pricing, and showcase your portfolio. Clear, detailed services attract more clients.'
        },
        {
            icon: MessageSquare,
            title: 'Communicate with Clients',
            description: 'Respond to inquiries promptly. Good communication builds trust and leads to successful orders.'
        },
        {
            icon: Rocket,
            title: 'Deliver High Quality Work',
            description: 'Complete orders on time and exceed expectations. Happy clients leave great reviews!'
        },
        {
            icon: DollarSign,
            title: 'Get Paid securely',
            description: 'Funds are held securely until the order is completed. Withdraw your earnings directly to your account.'
        }
    ];

    const faqs = [
        {
            question: "How do I get paid?",
            answer: "When you complete an order, the funds are released to your wallet. You can request a withdrawal at any time to your connected bank account or PayPal."
        },
        {
            question: "What fee does the platform charge?",
            answer: "We charge a standard commission fee on completed orders to cover platform maintenance, marketing, and payment processing. Check your earnings page for details."
        },
        {
            question: "How can I improve my ranking?",
            answer: "Deliver great work, maintain a high response rate, and get positive reviews. Verified vendors also get a boost in search results."
        },
        {
            question: "What if a client cancels?",
            answer: "If a client requests cancellation, try to resolve the issue first. If work has already been done, you can dispute the cancellation through our support center."
        }
    ];

    return (
        <Layout>
            <div className="bg-primary bg-opacity-10 py-5">
                <Container>
                    <div className="text-center max-w-2xl mx-auto">
                        <h1 className="fw-bold text-dark mb-3">Vendor Guide</h1>
                        <p className="lead text-muted mb-0">
                            Everything you need to know about selling and succeeding on MarketFlow.
                        </p>
                    </div>
                </Container>
            </div>

            <Container className="py-5">
                {/* Success Steps */}
                <section className="mb-5">
                    <h2 className="h4 fw-bold mb-4 text-center">Your Path to Success</h2>
                    <Row className="g-4">
                        {steps.map((step, index) => (
                            <Col md={6} lg={3} key={index}>
                                <Card className="h-100 border-0 shadow-sm text-center p-4">
                                    <div className="mx-auto bg-light rounded-circle d-flex align-items-center justify-content-center mb-3" style={{ width: 64, height: 64 }}>
                                        <step.icon size={32} className="text-primary" />
                                    </div>
                                    <h3 className="h5 fw-bold mb-2">{step.title}</h3>
                                    <p className="text-muted small mb-0">{step.description}</p>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </section>

                {/* Tips Section */}
                <section className="mb-5 bg-light rounded-4 p-5">
                    <Row className="align-items-center g-5">
                        <Col lg={6}>
                            <h2 className="h3 fw-bold mb-4">Pro Tips for Vendors</h2>
                            <ul className="d-flex flex-column gap-3 list-unstyled mb-0">
                                {[
                                    "Upload a professional profile picture",
                                    "Write a clear, compelling bio",
                                    "Use high-quality images for your service thumbnails",
                                    "Reply to messages within 1 hour when possible",
                                    "Ask satisfied clients for a review"
                                ].map((tip, i) => (
                                    <li key={i} className="d-flex align-items-center gap-3 bg-white p-3 rounded shadow-sm">
                                        <CheckCircle size={20} className="text-success flex-shrink-0" />
                                        <span className="fw-medium text-dark">{tip}</span>
                                    </li>
                                ))}
                            </ul>
                        </Col>
                        <Col lg={6}>
                            <div className="d-grid grid-cols-2 gap-3">
                                <Card className="border-0 shadow-sm p-3">
                                    <div className="d-flex align-items-center gap-3">
                                        <ShieldCheck size={28} className="text-primary" />
                                        <div>
                                            <h4 className="h6 fw-bold mb-0">Secure Payments</h4>
                                            <span className="small text-muted">Protected transactions</span>
                                        </div>
                                    </div>
                                </Card>
                                <Card className="border-0 shadow-sm p-3">
                                    <div className="d-flex align-items-center gap-3">
                                        <Users size={28} className="text-info" />
                                        <div>
                                            <h4 className="h6 fw-bold mb-0">Global Reach</h4>
                                            <span className="small text-muted">Access clients worldwide</span>
                                        </div>
                                    </div>
                                </Card>
                                <Card className="border-0 shadow-sm p-3">
                                    <div className="d-flex align-items-center gap-3">
                                        <Star size={28} className="text-warning" />
                                        <div>
                                            <h4 className="h6 fw-bold mb-0">Fair Reviews</h4>
                                            <span className="small text-muted">Build your reputation</span>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </Col>
                    </Row>
                </section>

                {/* FAQ */}
                <section className="max-w-3xl mx-auto">
                    <h2 className="h4 fw-bold mb-4 text-center">Frequently Asked Questions</h2>
                    <Accordion>
                        {faqs.map((faq, index) => (
                            <Accordion.Item eventKey={index.toString()} key={index}>
                                <Accordion.Header>{faq.question}</Accordion.Header>
                                <Accordion.Body className="text-muted">
                                    {faq.answer}
                                </Accordion.Body>
                            </Accordion.Item>
                        ))}
                    </Accordion>
                </section>
            </Container>
            <style>{`
        .max-w-2xl { max-width: 700px; }
        .max-w-3xl { max-width: 900px; }
      `}</style>
        </Layout>
    );
}
