import { useState, useEffect, useRef } from 'react';
import { useAuth } from 'contexts/AuthContext';
import { notificationService } from 'services/notificationService';
import { Bell, CheckCircle, Package, CreditCard, MessageSquare, AlertCircle, ShoppingBag, AlertTriangle } from 'lucide-react';
import { Dropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const iconMap = {
    'new_order': ShoppingBag,
    'new_request': ShoppingBag,
    'proposal_sent': MessageSquare,
    'proposal_accepted': CheckCircle,
    'proposal_rejected': AlertCircle,
    'proposal_changes': AlertCircle,
    'advance_paid': CreditCard,
    'remaining_paid': CreditCard,
    'payment_received': CreditCard,
    'payment_failed': AlertTriangle,
    'payment_pending': CreditCard,
    'work_delivered': Package,
    'delivery_accepted': CheckCircle,
    'message': MessageSquare,
    'default': Bell
};

const colorMap = {
    'new_order': 'primary',
    'proposal_accepted': 'success',
    'proposal_rejected': 'danger',
    'advance_paid': 'success',
    'work_delivered': 'info',
    'payment_failed': 'danger',
    'payment_pending': 'warning',
    'default': 'primary'
};

export function NotificationBell() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!user?.uid) return;

        console.log("Subscribing to notifications for:", user.uid);
        const unsubscribe = notificationService.subscribeToNotifications(user.uid, (data) => {
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.read).length);
        });

        return () => unsubscribe();
    }, [user]);

    const handleNotificationClick = async (notification) => {
        if (!notification.read) {
            await notificationService.markAsRead(notification.id);
        }

        // 1. Explicit Link (Highest Priority)
        if (notification.link) {
            navigate(notification.link);
            return;
        }

        const role = user?.role;
        const prefix = role === 'vendor' ? '/vendor' : '/client';

        // 2. Routing Logic by Type
        switch (notification.type) {
            // --- MESSAGES & PROPOSALS ---
            case 'message':
            case 'proposal_received':
            case 'proposal_accepted': // (Also relevant to orders, but conversation focus is often better)
            case 'proposal_rejected':
            case 'request_changes':
                if (notification.conversation_id) {
                    // Navigate to message and (future) focus on specific message/proposal
                    const focusParam = notification.proposal_id ? `?focus=proposal_${notification.proposal_id}` :
                        notification.message_id ? `?focus=msg_${notification.message_id}` : '';
                    navigate(`${prefix}/messages/${notification.conversation_id}${focusParam}`);
                } else {
                    navigate(`${prefix}/messages`);
                }
                break;

            // --- PAYMENTS ---
            case 'payment_received':
            case 'advance_paid':
            case 'remaining_paid':
            case 'payment_failed':
            case 'payment_pending':
                if (role === 'vendor') {
                    // Vendors go to their Earnings/Transactions page
                    navigate('/vendor/earnings'); // or /vendor/payments if it exists
                } else {
                    // Clients go to Payment History or specific Order Payment page
                    if (notification.order_id) {
                        navigate(`/client/payment/${notification.order_id}`);
                    } else {
                        navigate('/client/payments'); // fallback
                    }
                }
                break;

            // --- ORDERS & DELIVERY ---
            case 'new_order':
            case 'new_request':
            case 'order_status_updated':
            case 'work_delivered':
            case 'delivery_accepted':
                if (notification.order_id) {
                    // Go to specific order details (using modal or page)
                    // Currently assuming /orders is the list, might need specific route if separate page exists
                    // But for now, routing to the main orders list is safer unless we have /orders/:id implemented
                    navigate(`${prefix}/orders`);
                    // TODO: If we have deep linking for orders (e.g. /vendor/orders?orderId=xyz), use that.
                } else {
                    navigate(`${prefix}/orders`);
                }
                break;

            default:
                // Fallback: Try order_id or conversation_id generic guessing
                if (notification.order_id) navigate(`${prefix}/orders`);
                else if (notification.conversation_id) navigate(`${prefix}/messages/${notification.conversation_id}`);
                else navigate(role === 'vendor' ? '/vendor/dashboard' : '/dashboard');
                break;
        }
    };

    const handleMarkAllRead = async () => {
        // Batch mark as read not implemented in service yet, ideally loop or add method.
        // For now, simple implementation:
        notifications.filter(n => !n.read).forEach(n => notificationService.markAsRead(n.id));
    };

    return (
        <Dropdown align="end">
            <Dropdown.Toggle as="div" className="position-relative cursor-pointer text-secondary hover-primary me-3" style={{ cursor: 'pointer' }}>
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.6rem', padding: '0.25em 0.4em' }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </Dropdown.Toggle>

            <Dropdown.Menu className="shadow-lg border-0 rounded-4 p-0" style={{ width: '320px', maxHeight: '500px', overflowY: 'auto' }}>
                <div className="p-3 border-bottom d-flex justify-content-between align-items-center bg-white sticky-top">
                    <h6 className="mb-0 fw-bold">Notifications</h6>
                    {unreadCount > 0 && (
                        <span className="tiny text-primary cursor-pointer" onClick={handleMarkAllRead} style={{ cursor: 'pointer', fontSize: '0.75rem' }}>
                            Mark all read
                        </span>
                    )}
                </div>

                {notifications.length === 0 ? (
                    <div className="p-4 text-center text-muted small">
                        No notifications yet
                    </div>
                ) : (
                    <div className="list-group list-group-flush">
                        {notifications.map(notif => {
                            const Icon = iconMap[notif.type] || iconMap.default;
                            const color = colorMap[notif.type] || 'primary';
                            const timeStr = notif.created_at?.toDate ? notif.created_at.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now';

                            return (
                                <div
                                    key={notif.id}
                                    className={`list-group-item list-group-item-action p-3 border-bottom ${!notif.read ? 'bg-light' : ''}`}
                                    onClick={() => handleNotificationClick(notif)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className="d-flex gap-3">
                                        <div className={`p-2 rounded-circle bg-${color} bg-opacity-10 text-${color} align-self-start`}>
                                            <Icon size={16} />
                                        </div>
                                        <div>
                                            <p className="small fw-bold mb-1 text-dark">{notif.title}</p>
                                            <p className="tiny text-muted mb-1" style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>{notif.message}</p>
                                            <span className="tiny text-muted opacity-75" style={{ fontSize: '0.7rem' }}>{timeStr}</span>
                                        </div>
                                        {!notif.read && (
                                            <div className="ms-auto align-self-center">
                                                <div className="bg-primary rounded-circle" style={{ width: 8, height: 8 }}></div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </Dropdown.Menu>
        </Dropdown>
    );
}
