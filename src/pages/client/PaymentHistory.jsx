import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Badge, Spinner, Button } from 'react-bootstrap';
import { Layout } from 'components/layout/Layout';
import { useAuth } from 'contexts/AuthContext';
import { paymentService } from 'services/paymentService';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Calendar, CheckCircle, Clock, ArrowRight } from 'lucide-react';

export default function PaymentHistory() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!user?.uid) return;

        const fetchPayments = async () => {
            try {
                const data = await paymentService.getClientPayments(user.uid);
                setPayments(data);
            } catch (error) {
                setError("Failed to load payment history.");
            } finally {
                setLoading(false);
            }
        };
        fetchPayments();
    }, [user]);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'paid':
            case 'success':
                return <Badge bg="success" className="px-3 py-2"><CheckCircle size={14} className="me-1" /> Paid</Badge>;
            case 'pending': return <Badge bg="warning" text="dark" className="px-3 py-2"><Clock size={14} className="me-1" /> Pending</Badge>;
            case 'failed': return <Badge bg="danger" className="px-3 py-2">Failed</Badge>;
            default: return <Badge bg="secondary" className="px-3 py-2">{status}</Badge>;
        }
    };

    return (
        <Layout footerVariant="dashboard">
            <div className="py-5 bg-light min-vh-100">
                <Container>
                    <div className="mb-4">
                        <h1 className="h3 fw-bold mb-1">Payment History</h1>
                        <p className="text-muted">Track all your transactions and invoices.</p>
                    </div>

                    <Card className="border-0 shadow-sm overflow-hidden">
                        <Card.Body className="p-0">
                            {loading ? (
                                <div className="p-5 text-center">
                                    <Spinner animation="border" variant="primary" />
                                    <p className="mt-2 text-muted">Loading transactions...</p>
                                </div>
                            ) : error ? (
                                <div className="p-5 text-center text-danger">
                                    <p className="mb-0">{error}</p>
                                    <Button variant="link" onClick={() => window.location.reload()}>Retry</Button>
                                </div>
                            ) : payments.length > 0 ? (
                                <div className="table-responsive">
                                    <Table hover className="mb-0">
                                        <thead className="bg-light">
                                            <tr>
                                                <th className="px-4 py-3 border-0 small text-muted text-uppercase fw-bold">Date</th>
                                                <th className="px-4 py-3 border-0 small text-muted text-uppercase fw-bold">Order ID</th>
                                                <th className="px-4 py-3 border-0 small text-muted text-uppercase fw-bold">Amount</th>
                                                <th className="px-4 py-3 border-0 small text-muted text-uppercase fw-bold">Method</th>
                                                <th className="px-4 py-3 border-0 small text-muted text-uppercase fw-bold">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {payments.map((p) => {
                                                const isPending = p.status === 'pending';
                                                return (
                                                    <tr
                                                        key={p.id}
                                                        className={`align-middle ${isPending ? 'cursor-pointer' : ''}`}
                                                        onClick={() => isPending && navigate(`/client/payment/${p.order_id}`)}
                                                        style={isPending ? { cursor: 'pointer' } : {}}
                                                    >
                                                        <td className="px-4 py-3">
                                                            <div className="d-flex align-items-center gap-2">
                                                                <Calendar size={16} className="text-muted" />
                                                                <span>
                                                                    {p.created_at?.toDate
                                                                        ? p.created_at.toDate().toLocaleDateString()
                                                                        : p.created_at ? new Date(p.created_at).toLocaleDateString() : 'N/A'
                                                                    }
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span className="small font-monospace">{p.order_id}</span>
                                                        </td>
                                                        <td className="px-4 py-3 fw-bold text-dark">
                                                            ${p.amount}
                                                        </td>
                                                        <td className="px-4 py-3 text-capitalize">
                                                            <div className="d-flex align-items-center gap-2">
                                                                <CreditCard size={14} className="text-muted" />
                                                                {p.payment_method?.replace('_', ' ')}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="d-flex align-items-center justify-content-between">
                                                                {getStatusBadge(p.status)}
                                                                {isPending && <ArrowRight size={14} className="text-primary ms-2" />}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="p-5 text-center">
                                    <div className="display-4 text-muted mb-3 opacity-25">💸</div>
                                    <h3 className="h5 fw-bold text-dark">No payments found</h3>
                                    <p className="text-secondary small">You haven't made any payments yet.</p>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Container>
            </div>
            <style>{`
                .table-hover tbody tr.cursor-pointer:hover {
                    background-color: rgba(13, 110, 253, 0.05);
                    transition: all 0.2s ease;
                }
            `}</style>
        </Layout>
    );
}
