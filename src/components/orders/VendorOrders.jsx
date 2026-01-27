import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'components/ui/button';
import { useAuth } from 'contexts/AuthContext';
import { orderService } from 'services/orderService';
import { toast } from 'sonner';
import {
    Package, Clock, CheckCircle, XCircle, AlertCircle, MessageSquare, Play, Check
} from 'lucide-react';
import { Row, Col, Card, Badge, Dropdown } from 'react-bootstrap';

const statusConfig = {
    pending: { label: 'Pending', icon: Clock, bg: 'bg-warning', text: 'text-dark' },
    'in_progress': { label: 'In Progress', icon: AlertCircle, bg: 'bg-primary', text: 'text-white' },
    completed: { label: 'Completed', icon: CheckCircle, bg: 'bg-success', text: 'text-white' },
    cancelled: { label: 'Cancelled', icon: XCircle, bg: 'bg-danger', text: 'text-white' },
};

export default function VendorOrders() {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user?.uid) return;

        setIsLoading(true);
        const unsubscribe = orderService.subscribeToVendorOrders(user.uid, (fetchedOrders) => {
            setOrders(fetchedOrders);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const handleStatusUpdate = async (orderId, newStatus) => {
        if (updatingId) return; // Prevent double submit
        setUpdatingId(orderId);

        try {
            await orderService.updateOrderStatus(orderId, newStatus);
            toast.success(`Order updated to ${statusConfig[newStatus].label}`);
        } catch (error) {
            console.error("Failed to update status:", error);
            toast.error("Failed to update status");
        } finally {
            setUpdatingId(null);
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

                                <Col lg={6} className="d-flex justify-content-lg-end gap-2 align-items-center">
                                    <Button variant="outline-primary" size="sm" className="rounded-pill" onClick={() => navigate(`/messages/${order.client_id}`)}>
                                        <MessageSquare size={16} className="me-2" /> Chat
                                    </Button>

                                    {/* Status Management Actions */}
                                    {order.status === 'pending' && (
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            className="rounded-pill"
                                            disabled={updatingId === order.id}
                                            onClick={() => handleStatusUpdate(order.id, 'in_progress')}
                                        >
                                            <Play size={16} className="me-2" /> Start Order
                                        </Button>
                                    )}

                                    {order.status === 'in_progress' && (
                                        <Button
                                            variant="success"
                                            size="sm"
                                            className="rounded-pill text-white"
                                            disabled={updatingId === order.id}
                                            onClick={() => handleStatusUpdate(order.id, 'completed')}
                                        >
                                            <Check size={16} className="me-2" /> Mark Complete
                                        </Button>
                                    )}
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                );
            })}
            <style>{`
        .hover-card { transition: all 0.3s ease; border-left: 5px solid transparent !important; }
        .hover-card:hover { transform: translateX(10px); border-left: 5px solid #0d6efd !important; }
      `}</style>
        </div>
    );
}
