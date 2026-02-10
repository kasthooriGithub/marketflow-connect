import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Row, Col, Card, Button, ListGroup, Form, Spinner, Alert } from 'react-bootstrap';
import { Layout } from 'components/layout/Layout';
import { CreditCard, ShieldCheck, ArrowLeft, Smartphone, Wallet, CheckCircle } from 'lucide-react';
import { db } from 'lib/firebase';
import { doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from 'contexts/AuthContext';
import { paymentService } from 'services/paymentService';
import { orderService } from 'services/orderService';
import { notificationService } from 'services/notificationService';
import { activityService } from 'services/activityService';
import { toast } from 'sonner';

export default function PaymentProcess() {
    const { orderId } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [order, setOrder] = useState(null);
    const [payment, setPayment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [successState, setSuccessState] = useState(false);
    const [method, setMethod] = useState('mock_card');
    const [paymentRefId, setPaymentRefId] = useState('');
    const [paymentStage, setPaymentStage] = useState('advance'); // 'advance' or 'remaining'
    const [amountToPay, setAmountToPay] = useState(0);

    // Form States
    const [cardData, setCardData] = useState({ name: 'Test User', number: '4242424242424242', expiry: '12/30', cvv: '123' });
    const [upiId, setUpiId] = useState('test@upi');
    const [walletId, setWalletId] = useState('0771234567');

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            console.log("PaymentProcess mounted for Order:", orderId);
            try {
                const orderSnap = await getDoc(doc(db, 'orders', orderId));
                if (orderSnap.exists()) {
                    const orderData = orderSnap.data();

                    // Security: Verify user owns this order
                    if (orderData.client_id !== user.uid) {
                        toast.error("Unauthorized access to this order.");
                        navigate('/client/orders');
                        return;
                    }

                    // Calculate amounts from total_amount
                    const totalAmount = orderData.total_amount || 0;
                    const advanceAmount = Math.round(totalAmount * 0.30);
                    const remainingAmount = totalAmount - advanceAmount;

                    // Detect stage from URL query param or order status
                    const stageFromUrl = searchParams.get('stage');
                    let currentStage = 'advance';
                    let currentAmount = advanceAmount;

                    if (stageFromUrl === 'remaining' || orderData.paid_advance) {
                        currentStage = 'remaining';
                        currentAmount = remainingAmount;
                    }

                    if (orderData.payment_stage === 'PAID_FULL' || orderData.paid_remaining) {
                        console.log("Redirecting: Order already paid", orderData);
                        toast.info("This order is fully paid.");
                        navigate('/client/orders');
                        return;
                    }

                    setOrder({ id: orderSnap.id, ...orderData });
                    setPaymentStage(currentStage);
                    setAmountToPay(currentAmount);

                    // Fetch payment record for current stage
                    let payRecord = await paymentService.getPaymentByOrderId(orderId, currentStage);

                    // If no payment record exists for this stage, create one
                    if (!payRecord) {
                        try {
                            payRecord = await paymentService.createPayment({
                                order_id: orderId,
                                client_id: orderData.client_id,
                                vendor_id: orderData.vendor_id,
                                service_id: orderData.service_id,
                                amount: currentAmount,
                                stage: currentStage,
                                currency: 'USD',
                                status: 'pending'
                            });
                        } catch (createError) {
                            console.error("[Payment Debug] Failed to auto-create payment record:", createError);
                        }
                    }
                    setPayment(payRecord);
                } else {
                    toast.error("Order not found");
                    navigate('/client/dashboard');
                }
            } catch (error) {
                console.error("Error fetching payment data:", error);
                toast.error("Failed to load order details");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [orderId, navigate, user, searchParams]);

    const handlePayment = async () => {
        setProcessing(true);
        try {
            // Simulate processing time
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Generate Mock Reference ID
            const refId = `REF-${Math.floor(Math.random() * 1000000000)}`;
            setPaymentRefId(refId);

            // Prepare metadata
            const metadata = {
                currency: 'USD',
                paymentType: 'mock',
                reference: refId,
                status: 'success',
                method_used: method,
                user_email: user.email,
                simulated_at: new Date().toISOString()
            };

            // Atomic Update: Payment + Earnings + Order (with stage support)
            if (payment) {
                await paymentService.processSuccessfulPayment(
                    { ...order },
                    payment.id,
                    metadata,
                    paymentStage // Pass payment stage
                );
            } else {
                throw new Error("Payment record not found.");
            }

            setSuccessState(true);
            toast.success(`${paymentStage === 'advance' ? 'Advance' : 'Remaining'} Payment Successful!`);
        } catch (error) {
            console.error("Critical Failure in Payment Flow:", error);

            // Notification: Payment Failed (Self)
            if (user?.uid) {
                await notificationService.createNotification(
                    user.uid,
                    'payment_failed',
                    'Payment Failed',
                    `Your ${paymentStage} payment failed. Please try again.`,
                    { order_id: orderId, link: `/client/payment/${orderId}` }
                );

                await activityService.createActivity(
                    user.uid,
                    'payment_failed',
                    'Payment Failed',
                    `Payment failed for Order #${orderId.slice(-6).toUpperCase()}`,
                    { order_id: orderId }
                );
            }

            toast.error("Failed to process payment. Please contact support.");
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <Layout footerVariant="dashboard">
                <Container className="py-5 text-center">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3 text-muted">Loading payment details...</p>
                </Container>
            </Layout>
        );
    }

    if (successState) {
        return (
            <Layout footerVariant="dashboard">
                <Container className="py-5">
                    <Row className="justify-content-center">
                        <Col md={6}>
                            <Card className="border-0 shadow-sm text-center p-5">
                                <div className="mb-4 text-success">
                                    <CheckCircle size={64} />
                                </div>
                                <h2 className="h4 fw-bold mb-3">Payment Successful!</h2>
                                <p className="text-muted mb-4">
                                    {order?.paid_advance && !order?.paid_remaining ? (
                                        <>
                                            Thank you! Your remaining payment of <strong>${payment?.amount}</strong> has been received.
                                            <br />
                                            <span className="text-success">Order completed!</span>
                                        </>
                                    ) : (
                                        <>
                                            Thank you! Your advance payment of <strong>${payment?.amount}</strong> (30%) has been received.
                                            <br />
                                            <span className="text-info">Vendor can now start work.</span>
                                        </>
                                    )}
                                </p>
                                <div className="bg-light p-3 rounded mb-4">
                                    <p className="mb-1 small text-muted">Transaction Reference</p>
                                    <p className="mb-0 fw-bold font-monospace">{paymentRefId}</p>
                                </div>
                                <Button
                                    variant="primary"
                                    size="lg"
                                    className="w-100"
                                    onClick={() => navigate('/orders')}
                                >
                                    Go to My Orders
                                </Button>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </Layout>
        );
    }

    return (
        <Layout footerVariant="dashboard">
            <div className="py-5 bg-light min-vh-100">
                <Container>
                    <Button
                        variant="link"
                        className="text-decoration-none text-muted p-0 mb-4 d-flex align-items-center gap-2"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft size={16} /> Cancel Payment
                    </Button>

                    <Row className="g-4">
                        <Col lg={8}>
                            <Card className="border-0 shadow-sm mb-4">
                                <Card.Body className="p-4">
                                    <h2 className="h5 fw-bold mb-4">Select Payment Method</h2>

                                    <Alert variant="info" className="d-flex align-items-center gap-2 border-0 bg-info bg-opacity-10 text-info mb-4">
                                        <ShieldCheck size={18} />
                                        <span className="small fw-semibold">This is a Secure Mock Payment Gateway used for testing.</span>
                                    </Alert>

                                    <Form>
                                        <div className="d-flex flex-column gap-3 mb-4">
                                            {/* Mock Card */}
                                            <div
                                                onClick={() => setMethod('mock_card')}
                                                className={`p-3 border rounded cursor-pointer transition-all d-flex align-items-center justify-content-between ${method === 'mock_card' ? 'border-primary bg-primary bg-opacity-10' : 'bg-white'}`}
                                            >
                                                <div className="d-flex align-items-center gap-3">
                                                    <Form.Check
                                                        type="radio"
                                                        readOnly
                                                        checked={method === 'mock_card'}
                                                        className="mb-0"
                                                    />
                                                    <span className="fw-bold">Credit / Debit Card</span>
                                                </div>
                                                <CreditCard size={20} className={method === 'mock_card' ? 'text-primary' : 'text-muted'} />
                                            </div>

                                            {/* Mock UPI */}
                                            <div
                                                onClick={() => setMethod('mock_upi')}
                                                className={`p-3 border rounded cursor-pointer transition-all d-flex align-items-center justify-content-between ${method === 'mock_upi' ? 'border-primary bg-primary bg-opacity-10' : 'bg-white'}`}
                                            >
                                                <div className="d-flex align-items-center gap-3">
                                                    <Form.Check
                                                        type="radio"
                                                        readOnly
                                                        checked={method === 'mock_upi'}
                                                        className="mb-0"
                                                    />
                                                    <span className="fw-bold">UPI Payment</span>
                                                </div>
                                                <Smartphone size={20} className={method === 'mock_upi' ? 'text-primary' : 'text-muted'} />
                                            </div>

                                            {/* Mock Wallet */}
                                            <div
                                                onClick={() => setMethod('mock_wallet')}
                                                className={`p-3 border rounded cursor-pointer transition-all d-flex align-items-center justify-content-between ${method === 'mock_wallet' ? 'border-primary bg-primary bg-opacity-10' : 'bg-white'}`}
                                            >
                                                <div className="d-flex align-items-center gap-3">
                                                    <Form.Check
                                                        type="radio"
                                                        readOnly
                                                        checked={method === 'mock_wallet'}
                                                        className="mb-0"
                                                    />
                                                    <span className="fw-bold">Digital Wallet</span>
                                                </div>
                                                <Wallet size={20} className={method === 'mock_wallet' ? 'text-primary' : 'text-muted'} />
                                            </div>
                                        </div>

                                        {/* Dynamic Forms */}
                                        <div className="bg-white p-4 border rounded-3 animate-in fade-in duration-300">
                                            {method === 'mock_card' && (
                                                <>
                                                    <h6 className="fw-bold mb-3">Card Details (Simulated)</h6>
                                                    <Row className="g-3">
                                                        <Col md={12}>
                                                            <Form.Label className="small text-muted">Cardholder Name</Form.Label>
                                                            <Form.Control type="text" value={cardData.name} onChange={e => setCardData({ ...cardData, name: e.target.value })} />
                                                        </Col>
                                                        <Col md={12}>
                                                            <Form.Label className="small text-muted">Card Number</Form.Label>
                                                            <Form.Control type="text" value={cardData.number} onChange={e => setCardData({ ...cardData, number: e.target.value })} />
                                                        </Col>
                                                        <Col md={6}>
                                                            <Form.Label className="small text-muted">Expiry</Form.Label>
                                                            <Form.Control type="text" value={cardData.expiry} onChange={e => setCardData({ ...cardData, expiry: e.target.value })} />
                                                        </Col>
                                                        <Col md={6}>
                                                            <Form.Label className="small text-muted">CVV</Form.Label>
                                                            <Form.Control type="password" value={cardData.cvv} onChange={e => setCardData({ ...cardData, cvv: e.target.value })} />
                                                        </Col>
                                                    </Row>
                                                </>
                                            )}

                                            {method === 'mock_upi' && (
                                                <>
                                                    <h6 className="fw-bold mb-3">UPI Payment (Simulated)</h6>
                                                    <Form.Group>
                                                        <Form.Label className="small text-muted">Enter UPI ID</Form.Label>
                                                        <Form.Control type="text" value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="username@bank" />
                                                        <Form.Text className="text-muted">You will receive a simulated request on your device.</Form.Text>
                                                    </Form.Group>
                                                </>
                                            )}

                                            {method === 'mock_wallet' && (
                                                <>
                                                    <h6 className="fw-bold mb-3">Wallet Payment (Simulated)</h6>
                                                    <div className="d-flex align-items-center justify-content-between p-3 bg-light rounded mb-3">
                                                        <span>Available Balance</span>
                                                        <span className="fw-bold text-success">$50,000.00</span>
                                                    </div>
                                                    <Form.Group>
                                                        <Form.Label className="small text-muted">Wallet Mobile Number</Form.Label>
                                                        <Form.Control type="text" value={walletId} onChange={e => setWalletId(e.target.value)} />
                                                    </Form.Group>
                                                </>
                                            )}
                                        </div>
                                    </Form>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col lg={4}>
                            <Card className="border-0 shadow-sm sticky-top" style={{ top: '2rem' }}>
                                <Card.Body className="p-4">
                                    <h2 className="h5 fw-bold mb-4">Order Summary</h2>
                                    <ListGroup variant="flush" className="mb-4">
                                        <ListGroup.Item className="px-0 py-2 border-0 d-flex justify-content-between">
                                            <span className="text-muted">Service</span>
                                            <span className="fw-bold text-end text-truncate" style={{ maxWidth: '150px' }}>{order?.service_name}</span>
                                        </ListGroup.Item>

                                        {/* Payment Breakdown */}
                                        <ListGroup.Item className="px-0 py-2 border-0 d-flex justify-content-between">
                                            <span className="text-muted small">Total Amount</span>
                                            <span className="text-muted small">${order?.total_amount}</span>
                                        </ListGroup.Item>
                                        <ListGroup.Item className="px-0 py-2 border-0 d-flex justify-content-between">
                                            <span className="text-muted small">Already Paid</span>
                                            <span className="text-success small fw-semibold">
                                                ${paymentStage === 'remaining'
                                                    ? Math.round((order?.total_amount || 0) * 0.30)
                                                    : 0}
                                            </span>
                                        </ListGroup.Item>
                                        <ListGroup.Item className="px-0 py-2 border-0 d-flex justify-content-between">
                                            <span className="text-primary small fw-semibold">
                                                {paymentStage === 'advance' ? 'Paying Now (30% Advance)' : 'Paying Now (70% Remaining)'}
                                            </span>
                                            <span className="text-primary small fw-bold">${amountToPay}</span>
                                        </ListGroup.Item>
                                        <ListGroup.Item className="px-0 py-2 border-0 d-flex justify-content-between">
                                            <span className="text-muted small">Balance After Payment</span>
                                            <span className="text-muted small">
                                                ${paymentStage === 'advance'
                                                    ? (order?.total_amount || 0) - amountToPay
                                                    : 0}
                                            </span>
                                        </ListGroup.Item>

                                        <ListGroup.Item className="px-0 py-2 border-0 d-flex justify-content-between">
                                            <span className="text-muted">Taxes & Fees</span>
                                            <span className="fw-bold">$0.00</span>
                                        </ListGroup.Item>
                                        <ListGroup.Item className="px-0 py-3 mt-2 border-top border-bottom-0 d-flex justify-content-between align-items-center">
                                            <span className="h6 fw-bold mb-0">Total Pay Now</span>
                                            <span className="h4 fw-bold mb-0 text-primary">${amountToPay}</span>
                                        </ListGroup.Item>
                                    </ListGroup>

                                    <Button
                                        variant="primary"
                                        size="lg"
                                        className="w-100 py-3 fw-bold"
                                        onClick={handlePayment}
                                        disabled={processing}
                                    >
                                        {processing ? (
                                            <>
                                                <Spinner animation="border" size="sm" className="me-2" />
                                                Processing...
                                            </>
                                        ) : `Pay $${amountToPay}`}
                                    </Button>

                                    <div className="text-center mt-3">
                                        <p className="small text-muted mb-0">
                                            <ShieldCheck size={14} className="me-1" />
                                            100% Satisfaction Guarantee
                                        </p>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>

            <style>{`
                .cursor-pointer { cursor: pointer; }
                .transition-all { transition: all 0.2s ease-in-out; }
            `}</style>
        </Layout>
    );
}
