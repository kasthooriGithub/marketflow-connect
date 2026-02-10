import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from 'components/ui/button';
import { useAuth } from 'contexts/AuthContext';
import { orderService } from 'services/orderService';
import { chatService } from 'services/chatService';
import {
    Package, Clock, CheckCircle, XCircle, AlertCircle, MessageSquare, Eye, X, Star, CreditCard
} from 'lucide-react';
import { Row, Col, Card, Badge, Modal } from 'react-bootstrap';
import { toast } from 'sonner';
import { ReviewModal } from 'components/client/ReviewModal';
import { db } from 'lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

const statusConfig = {
    new: { label: 'Request Sent', icon: AlertCircle, bg: 'bg-info', text: 'text-white' },
    'proposal_sent': { label: 'Proposal Received', icon: MessageSquare, bg: 'bg-primary', text: 'text-white' },
    'awaiting_payment': { label: 'Awaiting Payment', icon: CreditCard, bg: 'bg-warning', text: 'text-dark' },
    'in_progress': { label: 'In Progress', icon: Clock, bg: 'bg-primary', text: 'text-white' },
    delivered: { label: 'Delivered', icon: Package, bg: 'bg-info', text: 'text-white' },
    'awaiting_remaining_payment': { label: 'Payment Due', icon: CreditCard, bg: 'bg-warning', text: 'text-dark' },
    completed: { label: 'Completed', icon: CheckCircle, bg: 'bg-success', text: 'text-white' },
    cancelled: { label: 'Cancelled', icon: XCircle, bg: 'bg-danger', text: 'text-white' },
};

export default function ClientOrders() {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [isCompleting, setIsCompleting] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [orderToReview, setOrderToReview] = useState(null);
    const [activeStatus, setActiveStatus] = useState('all');
    const navigate = useNavigate();

    const statusFilters = [
        { id: 'all', label: 'All' },
        { id: 'new', label: 'Requests' },
        { id: 'awaiting_payment', label: 'To Pay' },
        { id: 'in_progress', label: 'Active' },
        { id: 'delivered', label: 'Review' },
        { id: 'awaiting_remaining_payment', label: 'To Pay' },
        { id: 'completed', label: 'History' },
    ];

    const statusCounts = orders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        // Grouping logic for filter tabs if they don't match 1:1 with status
        if (order.status === 'proposal_sent') acc['new'] = (acc['new'] || 0) + 1; // Count proposals in Requests

        acc['all'] = (acc['all'] || 0) + 1;
        return acc;
    }, { all: 0, new: 0, awaiting_payment: 0, in_progress: 0, delivered: 0, completed: 0 });

    const filteredOrders = activeStatus === 'all'
        ? orders
        : orders.filter(order => {
            if (activeStatus === 'new') return order.status === 'new' || order.status === 'proposal_sent';
            return order.status === activeStatus;
        });

    useEffect(() => {
        if (!user?.uid) return;

        setIsLoading(true);
        const unsubscribe = orderService.subscribeToClientOrders(user.uid, async (fetchedOrders) => {
            setOrders(fetchedOrders);
            setIsLoading(false);

            // Backfill logic for missing service names
            fetchedOrders.forEach(async (order) => {
                if (!order.service_name && order.service_id) {
                    try {
                        const serviceSnap = await getDoc(doc(db, 'services', order.service_id));
                        if (serviceSnap.exists()) {
                            await orderService.updateOrder(order.id, { service_name: serviceSnap.data().title });
                        }
                    } catch (err) {
                        console.error("Backfill failed:", err);
                    }
                }
            });
        });

        return () => unsubscribe();
    }, [user]);

    const handleChat = async (order) => {
        if (!user?.uid || isChatLoading) return;
        setIsChatLoading(true);

        try {
            const conversationId = await chatService.getOrCreateConversationForOrder(
                order.id,
                user.uid,
                order.vendor_id,
                order.service_id,
                order.service_name
            );
            navigate(`/client/messages/${conversationId}`);
        } catch (error) {
            console.error("[Chat Debug] Chat navigation failed:", error);
            toast.error("Failed to start chat.");
        } finally {
            setIsChatLoading(false);
        }
    };

    const handleCancelClick = (order) => {
        setSelectedOrder(order);
        setShowCancelModal(true);
    };

    const handleConfirmCancel = async () => {
        if (!selectedOrder) return;
        setIsCancelling(true);
        try {
            await orderService.updateOrderStatus(selectedOrder.id, 'cancelled');
            toast.success("Order cancelled");
            setShowCancelModal(false);
        } catch (error) {
            console.error("Failed to cancel order:", error);
            toast.error("Failed to cancel order");
        } finally {
            setIsCancelling(false);
            setSelectedOrder(null);
        }
    };

    const handleAcceptDelivery = async (order) => {
        if (isCompleting) return;
        setIsCompleting(true);
        try {
            await orderService.acceptDelivery(order.id);
            toast.success("Delivery accepted. Please make the final payment.");
        } catch (error) {
            console.error("Failed to accept delivery:", error);
            toast.error("Failed to accept delivery");
        } finally {
            setIsCompleting(false);
        }
    };

    const handleReviewClick = (order) => {
        setOrderToReview(order);
        setShowReviewModal(true);
    };

    if (isLoading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status"></div>
                <p className="mt-2 text-muted">Loading your orders...</p>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="text-center py-5 bg-white rounded-4 border">
                <Package size={60} className="text-muted opacity-25 mb-3" />
                <h3 className="fw-bold">No Orders Found</h3>
                <p className="text-muted mb-4">You haven't placed any orders yet.</p>
                <Button onClick={() => navigate('/services')} variant="primary" className="rounded-pill px-5">
                    Browse Services
                </Button>
            </div>
        );
    }

    return (
        <div className="d-flex flex-column gap-4">
            {/* Status Filter Tabs */}
            <div className="bg-white p-2 rounded-4 border shadow-sm sticky-top" style={{ top: '20px', zIndex: 10 }}>
                <div className="d-flex flex-wrap gap-2">
                    {statusFilters.map((filter) => (
                        <button
                            key={filter.id}
                            onClick={() => setActiveStatus(filter.id)}
                            className={`btn rounded-pill px-3 py-2 d-flex align-items-center gap-2 border-0 transition-all ${activeStatus === filter.id
                                ? 'btn-primary shadow-sm text-white'
                                : 'btn-light text-muted hover-bg-light'
                                }`}
                            style={{ fontSize: '0.9rem', fontWeight: '500' }}
                        >
                            {filter.label}
                            <Badge
                                bg={activeStatus === filter.id ? 'white' : 'secondary'}
                                text={activeStatus === filter.id ? 'primary' : 'white'}
                                className="rounded-pill px-2"
                                style={{ fontSize: '0.75rem' }}
                            >
                                {statusCounts[filter.id] || 0}
                            </Badge>
                        </button>
                    ))}
                </div>
            </div>

            {filteredOrders.length === 0 ? (
                <div className="text-center py-5 bg-white rounded-4 border">
                    <Package size={60} className="text-muted opacity-25 mb-3" />
                    <h3 className="fw-bold">No {statusFilters.find(f => f.id === activeStatus)?.label} found</h3>
                    <p className="text-muted mb-4">No orders matching this status.</p>
                </div>
            ) : (
                filteredOrders.map((order) => {
                    const status = statusConfig[order.status] || statusConfig.completed; // Default fallback
                    const StatusIcon = status.icon;

                    return (
                        <Card key={order.id} className="border-0 shadow-sm hover-card rounded-4">
                            <Card.Body className="p-4">
                                <Row className="align-items-center g-4">
                                    <Col lg={7}>
                                        <div className="d-flex gap-4 align-items-center">
                                            <div className="p-3 bg-light rounded-circle text-primary">
                                                <Package size={28} />
                                            </div>
                                            <div className="flex-grow-1">
                                                <div className="d-flex align-items-center gap-2 mb-1">
                                                    <Link to={`/services/${order.service_id}`} className="text-decoration-none hover-underline">
                                                        <h3 className="h5 fw-bold text-dark mb-0">{order.service_name || 'Loading service...'}</h3>
                                                    </Link>
                                                    <Badge className={`${status.bg} ${status.text} border-0 rounded-pill px-3 py-1 shadow-sm`}>
                                                        <StatusIcon size={12} className="me-1" /> {status.label}
                                                    </Badge>
                                                </div>
                                                <div className="d-flex gap-3 small text-muted mt-2">
                                                    <span>ID: {order.id.slice(-6).toUpperCase()}</span>
                                                    <span>•</span>
                                                    <span>{order.created_at?.toDate ? order.created_at.toDate().toLocaleDateString() : 'Processing...'}</span>
                                                    <span>•</span>
                                                    <span className="fw-bold text-primary">${order.total_amount}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Col>
                                    <Col lg={5} className="d-flex justify-content-lg-end gap-2 flex-wrap">

                                        {/* AWAITING PAYMENT Actions */}
                                        {order.status === 'awaiting_payment' && (
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                className="rounded-pill px-4 shadow-sm"
                                                onClick={() => navigate(`/client/payment/${order.id}`)}
                                            >
                                                <CreditCard size={16} className="me-2" /> Pay Now
                                            </Button>
                                        )}

                                        {/* PROPOSAL SENT Actions */}
                                        {order.status === 'proposal_sent' && (
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                className="rounded-pill px-4 shadow-sm"
                                                onClick={() => handleChat(order)}
                                            >
                                                <Eye size={16} className="me-2" /> View Proposal
                                            </Button>
                                        )}

                                        {/* NEW / PENDING Actions */}
                                        {(order.status === 'new' || order.status === 'pending') && (
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                className="rounded-pill px-4"
                                                onClick={() => handleCancelClick(order)}
                                            >
                                                <X size={16} className="me-2" /> Cancel Request
                                            </Button>
                                        )}

                                        {/* DELIVERED Actions - Step 1: Accept Work */}
                                        {order.status === 'delivered' && (
                                            <Button
                                                variant="success"
                                                size="sm"
                                                className="rounded-pill px-4 shadow-sm text-white"
                                                onClick={() => handleAcceptDelivery(order)}
                                                disabled={isCompleting}
                                            >
                                                <CheckCircle size={16} className="me-2" />
                                                {isCompleting ? 'Processing...' : 'Accept Delivery'}
                                            </Button>
                                        )}

                                        {/* AWAITING PAYMENT Actions (Remaining) - Step 2: Pay */}
                                        {order.status === 'awaiting_remaining_payment' && (
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                className="rounded-pill px-4 shadow-sm"
                                                onClick={() => {
                                                    console.log("Navigating to remaining payment:", order.id);
                                                    navigate(`/client/payment/${order.id}?stage=remaining`);
                                                }}
                                            >
                                                <CreditCard size={16} className="me-2" /> Pay Remaining ${order.remaining_amount || Math.round((order.total_amount || 0) * 0.70)}
                                            </Button>
                                        )}
                                        {/* COMPLETED Actions */}
                                        {order.status === 'completed' && (
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                className="rounded-pill px-4 shadow-sm"
                                                onClick={() => handleReviewClick(order)}
                                            >
                                                <Star size={16} className="me-2" /> Leave Review
                                            </Button>
                                        )}

                                        {/* Chat is available for most statuses except cancelled (optional) */}
                                        {order.status !== 'cancelled' && (
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                className="rounded-pill px-4"
                                                onClick={() => handleChat(order)}
                                                disabled={isChatLoading}
                                            >
                                                <MessageSquare size={16} className="me-2" /> {isChatLoading ? 'Opening...' : 'Chat'}
                                            </Button>
                                        )}
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    );
                }))}

            {/* Cancel Confirmation Modal */}
            <Modal show={showCancelModal} onHide={() => !isCancelling && setShowCancelModal(false)} centered>
                <Modal.Header closeButton className="border-0">
                    <Modal.Title className="fw-bold">Cancel Order</Modal.Title>
                </Modal.Header>
                <Modal.Body className="py-3">
                    Are you sure you want to cancel this order? This action cannot be undone.
                </Modal.Body>
                <Modal.Footer className="border-0 gap-2">
                    <Button variant="outline" onClick={() => setShowCancelModal(false)} disabled={isCancelling}>
                        No, Keep Order
                    </Button>
                    <Button variant="danger" onClick={handleConfirmCancel} disabled={isCancelling}>
                        {isCancelling ? 'Cancelling...' : 'Yes, Cancel Order'}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Review Modal */}
            <ReviewModal
                open={showReviewModal}
                onOpenChange={setShowReviewModal}
                order={orderToReview}
                user={user}
            />

            <style>{`
        .hover-card { transition: all 0.3s ease; border-left: 5px solid transparent !important; }
        .hover-card:hover { transform: translateX(10px); border-left: 5px solid #0d6efd !important; }
        .hover-underline:hover { text-decoration: underline !important; }
      `}</style>
        </div>
    );
}
