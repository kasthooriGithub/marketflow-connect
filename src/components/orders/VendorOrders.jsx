import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from 'components/ui/button';
import { useAuth } from 'contexts/AuthContext';
import { orderService } from 'services/orderService';
import { chatService } from 'services/chatService';
import { toast } from 'sonner';
import {
    Package, Clock, CheckCircle, XCircle, AlertCircle, MessageSquare, Play, Check, Upload
} from 'lucide-react';
import { Row, Col, Card, Badge, Modal, Form } from 'react-bootstrap';
import { db } from 'lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

const statusConfig = {
    new: { label: 'New Request', icon: AlertCircle, bg: 'bg-info', text: 'text-white' },
    'proposal_sent': { label: 'Proposal Sent', icon: MessageSquare, bg: 'bg-secondary', text: 'text-white' },
    'awaiting_payment': { label: 'Awaiting Payment', icon: Clock, bg: 'bg-warning', text: 'text-dark' },
    'in_progress': { label: 'In Progress', icon: Play, bg: 'bg-primary', text: 'text-white' },
    delivered: { label: 'Delivered', icon: Package, bg: 'bg-info', text: 'text-white' },
    completed: { label: 'Completed', icon: CheckCircle, bg: 'bg-success', text: 'text-white' },
    cancelled: { label: 'Cancelled', icon: XCircle, bg: 'bg-danger', text: 'text-white' },
    'awaiting_remaining_payment': { label: 'Awaiting Final Payment', icon: Clock, bg: 'bg-warning', text: 'text-dark' }
};

export default function VendorOrders() {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);
    const [chatLoadingId, setChatLoadingId] = useState(null);

    // Delivery Modal State
    const [showDeliveryModal, setShowDeliveryModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [deliveryMessage, setDeliveryMessage] = useState('');
    const [deliveryFileUrl, setDeliveryFileUrl] = useState('');
    const [isDelivering, setIsDelivering] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        if (!user?.uid) return;

        setIsLoading(true);
        const unsubscribe = orderService.subscribeToVendorOrders(user.uid, async (fetchedOrders) => {
            setOrders(fetchedOrders);
            setIsLoading(false);

            // Backfill logic for missing service names
            fetchedOrders.forEach(async (order) => {
                if (!order.service_name && order.service_id) {
                    try {
                        const serviceSnap = await getDoc(doc(db, 'services', order.service_id));
                        if (serviceSnap.exists()) {
                            const serviceName = serviceSnap.data().title;
                            // Update order document
                            await orderService.updateOrder(order.id, { service_name: serviceName });
                        }
                    } catch (err) {
                        console.error("Backfill failed:", err);
                    }
                }
            });
        });

        return () => unsubscribe();
    }, [user]);

    const handleStatusUpdate = async (orderId, newStatus) => {
        if (updatingId) return; // Prevent double submit
        setUpdatingId(orderId);

        try {
            await orderService.updateOrderStatus(orderId, newStatus);
            toast.success(`Order updated to ${statusConfig[newStatus]?.label || newStatus}`);
        } catch (error) {
            console.error("Failed to update status:", error);
            toast.error("Failed to update status");
        } finally {
            setUpdatingId(null);
        }
    };

    const handleOpenDeliveryModal = (order) => {
        setSelectedOrder(order);
        setDeliveryMessage("I have completed the work. Please review the attached files.");
        setDeliveryFileUrl("");
        setShowDeliveryModal(true);
    };

    const handleDeliverOrder = async (e) => {
        e.preventDefault();
        if (!selectedOrder) return;

        setIsDelivering(true);
        try {
            await orderService.deliverOrder(selectedOrder.id, {
                message: deliveryMessage,
                file_url: deliveryFileUrl,
                fileUrl: deliveryFileUrl // Just in case, pass both for compatibility if needed elsewhere
            });
            setShowDeliveryModal(false);
            toast.success("Work delivered successfully!");
        } catch (error) {
            console.error("Delivery failed:", error);
            toast.error("Failed to deliver work");
        } finally {
            setIsDelivering(false);
        }
    };

    const handleChat = async (order) => {
        if (!user?.uid || chatLoadingId) return;
        setChatLoadingId(order.id);

        try {
            const conversationId = await chatService.getOrCreateConversationForOrder(
                order.id,
                order.client_id,
                user.uid,
                order.service_id,
                order.service_name || 'Service'
            );
            navigate(`/vendor/messages/${conversationId}`);
        } catch (error) {
            console.error("[Chat Debug] Failed to open chat:", error);
            toast.error("Could not open chat");
        } finally {
            setChatLoadingId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status"></div>
                <p className="mt-2 text-muted">Loading incoming orders...</p>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="text-center py-5 bg-white rounded-4 border">
                <Package size={60} className="text-muted opacity-25 mb-3" />
                <h3 className="fw-bold">No Orders Yet</h3>
                <p className="text-muted mb-4">You haven't received any orders yet.</p>
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
                                <Col lg={6}>
                                    <div className="d-flex gap-4 align-items-center">
                                        <div className="p-3 bg-light rounded-circle text-primary">
                                            <Package size={28} />
                                        </div>
                                        <div className="flex-grow-1">
                                            <div className="d-flex align-items-center gap-2 mb-1">
                                                <Link to={`/services/${order.service_id}`} className="text-decoration-none hover-underline">
                                                    <h3 className="h5 fw-bold text-dark mb-0">{order.service_name || 'Loading service...'}</h3>
                                                </Link>
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

                                <Col lg={6} className="d-flex justify-content-lg-end gap-2 align-items-center">
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        className="rounded-pill"
                                        onClick={() => handleChat(order)}
                                        disabled={chatLoadingId === order.id}
                                    >
                                        <MessageSquare size={16} className="me-2" />
                                        {chatLoadingId === order.id ? 'Opening...' : 'Chat'}
                                    </Button>

                                    {/* Action Buttons based on Status */}
                                    {order.status === 'new' && !order.proposal_id ? (
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            className="rounded-pill"
                                            onClick={() => handleChat(order)} // Go to chat to send proposal
                                        >
                                            Send Proposal
                                        </Button>
                                    ) : (order.status === 'proposal_sent' || order.proposal_id) && order.status !== 'in_progress' && order.status !== 'completed' && order.status !== 'cancelled' ? (
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="rounded-pill"
                                            disabled
                                            style={{ opacity: 0.8, cursor: 'default' }}
                                        >
                                            <CheckCircle size={16} className="me-2" />
                                            Proposal Sent
                                        </Button>
                                    ) : null}

                                    {order.status === 'in_progress' && (
                                        <Button
                                            variant={order.paid_advance ? "success" : "secondary"}
                                            size="sm"
                                            className="rounded-pill text-white"
                                            disabled={!order.paid_advance}
                                            onClick={() => handleOpenDeliveryModal(order)}
                                            title={!order.paid_advance ? "Waiting for client's advance payment" : ""}
                                        >
                                            <Package size={16} className="me-2" />
                                            {!order.paid_advance ? 'Awaiting Advance Payment' : 'Deliver Work'}
                                        </Button>
                                    )}
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                );
            })}

            {/* Delivery Modal */}
            <Modal show={showDeliveryModal} onHide={() => setShowDeliveryModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Deliver Work</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleDeliverOrder}>
                    <Modal.Body>
                        <p className="text-muted small mb-3">
                            Confirm that you have completed the work for this order. This will notify the client to review and accept delivery.
                        </p>

                        <Form.Group className="mb-3">
                            <Form.Label>Delivery Message</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={deliveryMessage}
                                onChange={(e) => setDeliveryMessage(e.target.value)}
                                placeholder="Describe the work delivered..."
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>File URL (Optional)</Form.Label>
                            <div className="input-group">
                                <span className="input-group-text"><Upload size={16} /></span>
                                <Form.Control
                                    type="url"
                                    value={deliveryFileUrl}
                                    onChange={(e) => setDeliveryFileUrl(e.target.value)}
                                    placeholder="https://drive.google.com/..."
                                />
                            </div>
                            <Form.Text className="text-muted">
                                Provide a link to the completed files (Google Drive, Dropbox, etc.)
                            </Form.Text>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button type="button" variant="ghost" onClick={() => setShowDeliveryModal(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isDelivering}>
                            {isDelivering ? 'Delivering...' : 'Confirm Delivery'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            <style>{`
        .hover-card { transition: all 0.3s ease; border-left: 5px solid transparent !important; }
        .hover-card:hover { transform: translateX(10px); border-left: 5px solid #0d6efd !important; }
        .hover-underline:hover { text-decoration: underline !important; }
      `}</style>
        </div>
    );
}
