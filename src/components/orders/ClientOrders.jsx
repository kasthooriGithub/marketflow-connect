import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'components/ui/button';
import { useAuth } from 'contexts/AuthContext';
import { orderService } from 'services/orderService';
import { chatService } from 'services/chatService';
import {
    Package, Clock, CheckCircle, XCircle, AlertCircle, MessageSquare, Eye, X
} from 'lucide-react';
import { Row, Col, Card, Badge, Modal } from 'react-bootstrap';
import { toast } from 'sonner';

const statusConfig = {
    pending: { label: 'Pending', icon: Clock, bg: 'bg-warning', text: 'text-dark' },
    'in_progress': { label: 'In Progress', icon: AlertCircle, bg: 'bg-primary', text: 'text-white' },
    completed: { label: 'Completed', icon: CheckCircle, bg: 'bg-success', text: 'text-white' },
    cancelled: { label: 'Cancelled', icon: XCircle, bg: 'bg-danger', text: 'text-white' },
};

export default function ClientOrders() {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user?.uid) return;

        setIsLoading(true);
        const unsubscribe = orderService.subscribeToClientOrders(user.uid, (fetchedOrders) => {
            setOrders(fetchedOrders);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const handleChat = async (order) => {
        if (!user?.uid) return;
        setIsChatLoading(true);
        try {
            const conversationId = await chatService.getOrCreateConversation(
                user.uid,
                order.vendor_id,
                order.service_id,
                order.service_name
            );
            navigate(`/messages/${conversationId}`);
        } catch (error) {
            console.error("Failed to start chat:", error);
            toast.error("Failed to start chat. Please try again.");
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
            toast.success("Order cancelled successfully");
            setShowCancelModal(false);
        } catch (error) {
            console.error("Failed to cancel order:", error);
            toast.error("Failed to cancel order. Please try again.");
        } finally {
            setIsCancelling(false);
            setSelectedOrder(null);
        }
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
            {orders.map((order) => {
                const status = statusConfig[order.status] || statusConfig.pending;
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
                                                <h3 className="h5 fw-bold text-dark mb-0">{order.service_name}</h3>
                                                <Badge className={`${status.bg} ${status.text} border-0 rounded-pill px-3`}>
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
                                    {order.status === 'pending' && (
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            className="rounded-pill px-4"
                                            onClick={() => handleCancelClick(order)}
                                        >
                                            <X size={16} className="me-2" /> Cancel Order
                                        </Button>
                                    )}
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        className="rounded-pill px-4"
                                        onClick={() => handleChat(order)}
                                        disabled={isChatLoading}
                                    >
                                        <MessageSquare size={16} className="me-2" /> {isChatLoading ? 'Opening...' : 'Chat'}
                                    </Button>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                );
            })}

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

            <style>{`
        .hover-card { transition: all 0.3s ease; border-left: 5px solid transparent !important; }
        .hover-card:hover { transform: translateX(10px); border-left: 5px solid #0d6efd !important; }
      `}</style>
        </div>
    );
}
