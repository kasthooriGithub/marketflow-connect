import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from 'contexts/AuthContext';
import { activityService } from 'services/activityService';
import {
    Activity, MessageSquare, CheckCircle, AlertCircle, ShoppingBag, CreditCard, Clock, Package
} from 'lucide-react';

const iconMap = {
    'proposal_accepted': CheckCircle,
    'proposal_rejected': AlertCircle,
    'advance_paid': CreditCard,
    'remaining_paid': CreditCard,
    'work_delivered': Package,
    'delivery_accepted': CheckCircle,
    'order_completed': Activity,
    'default': Activity
};

const colorMap = {
    'proposal_accepted': 'success',
    'proposal_rejected': 'danger',
    'advance_paid': 'primary',
    'remaining_paid': 'success',
    'work_delivered': 'info',
    'delivery_accepted': 'success',
    'order_completed': 'primary',
    'default': 'secondary'
};

export function RecentActivity({ limit = 5 }) {
    const { user } = useAuth();
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.uid) return;

        const fetchActivities = async () => {
            try {
                const data = await activityService.getUserActivities(user.uid, limit);
                setActivities(data);
            } catch (error) {
                console.error("Failed to load activities:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchActivities();
    }, [user, limit]);

    if (loading) {
        return <div className="text-center py-4 text-muted small">Loading activity...</div>;
    }

    if (activities.length === 0) {
        return <div className="text-center py-4 text-muted small">No recent activity</div>;
    }

    return (
        <div className="activity-feed">
            {activities.map((act) => {
                const Icon = iconMap[act.type] || iconMap.default;
                const color = colorMap[act.type] || colorMap.default;
                const linkTo = act.order_id ? (user.role === 'vendor' ? '/vendor/orders' : '/orders') : '#';

                // Format timestamp
                const date = act.created_at?.toDate ? act.created_at.toDate() : new Date();
                const timeStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

                return (
                    <div key={act.id} className="d-flex gap-3 mb-3 pb-3 border-bottom last-no-border">
                        <div className={`p-2 rounded-circle bg-${color} bg-opacity-10 text-${color} h-100`}>
                            <Icon size={16} />
                        </div>
                        <div className="flex-grow-1">
                            <div className="d-flex justify-content-between align-items-start">
                                <h6 className="small fw-bold mb-1">{act.title}</h6>
                                <span className="tiny text-muted">{timeStr}</span>
                            </div>
                            <p className="small text-muted mb-0">{act.message}</p>
                            {act.order_id && (
                                <Link to={linkTo} className="tiny text-primary text-decoration-none mt-1 d-inline-block">
                                    View Order
                                </Link>
                            )}
                        </div>
                    </div>
                );
            })}
            <style>{`
                .last-no-border:last-child { border-bottom: 0 !important; padding-bottom: 0 !important; }
                .tiny { font-size: 0.75rem; }
            `}</style>
        </div>
    );
}
