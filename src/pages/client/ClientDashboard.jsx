import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from 'contexts/AuthContext';
import { Layout } from 'components/layout/Layout';
import {
    LayoutDashboard,
    ShoppingBag,
    Heart,
    MessageSquare,
    Settings,
    TrendingUp,
} from 'lucide-react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import {
    collection,
    query,
    where,
    getCountFromServer,
    getDocs,
    orderBy,
    limit
} from 'firebase/firestore';
import { db } from 'lib/firebase';
import { getSavedServicesCount } from 'services/savedServiceService';

export default function ClientDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    const quickLinks = [
        { to: '/services', label: 'Browse Services', icon: LayoutDashboard },
        { to: '/orders', label: 'My Orders', icon: ShoppingBag },
        { to: '/messages', label: 'Messages', icon: MessageSquare },
        { to: '/settings', label: 'Settings', icon: Settings },
    ];

    const iconColors = {
        warning: 'warning',
        primary: 'primary',
        success: 'success'
    };

    const iconBgColors = {
        warning: 'bg-warning bg-opacity-25',
        primary: 'bg-primary bg-opacity-25',
        success: 'bg-success bg-opacity-25'
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user?.uid) return;

            try {
                setLoading(true);
                const uid = user.uid;

                // Client stats: Active Orders, Saved Services, Messages
                const activeOrdersQuery = query(
                    collection(db, 'orders'),
                    where('client_id', '==', uid),
                    where('status', 'in', ['pending', 'in_progress'])
                );
                const activeOrdersSnapshot = await getCountFromServer(activeOrdersQuery);
                const activeOrders = activeOrdersSnapshot.data().count;

                const savedServices = await getSavedServicesCount(uid);

                const messagesQuery = query(
                    collection(db, 'conversations'),
                    where('participants', 'array-contains', uid),
                    where('last_message_read', '==', false)
                );
                const messagesSnapshot = await getCountFromServer(messagesQuery);
                const unreadMessages = messagesSnapshot.data().count;

                setStats([
                    { label: 'Active Orders', value: activeOrders.toString(), icon: ShoppingBag },
                    { label: 'Saved Services', value: savedServices.toString(), icon: Heart },
                    { label: 'Unread Messages', value: unreadMessages.toString(), icon: MessageSquare },
                ]);

                // Recent activity for client
                const recentOrdersQuery = query(
                    collection(db, 'orders'),
                    where('client_id', '==', uid),
                    orderBy('created_at', 'desc'),
                    limit(3)
                );
                const recentOrdersSnapshot = await getDocs(recentOrdersQuery);
                const activities = recentOrdersSnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        type: 'order',
                        title: data.status === 'completed' ? 'Order completed' : 'Order updated',
                        description: `${data.service_name || 'Service'} • ${formatTimeAgo(data.created_at)}`,
                        icon: data.status === 'completed' ? TrendingUp : ShoppingBag,
                        iconColor: data.status === 'completed' ? 'success' : 'primary'
                    };
                });
                setRecentActivity(activities);

            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user]);

    const formatTimeAgo = (timestamp) => {
        if (!timestamp) return 'Recently';

        const now = new Date();
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) {
            return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
        } else if (diffHours < 24) {
            return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
        } else if (diffDays < 7) {
            return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
        } else {
            return date.toLocaleDateString();
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="py-5">
                    <Container>
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    </Container>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="py-5">
                <Container>
                    <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4">
                        <div>
                            <h1 className="h3 fw-bold text-dark mb-2">
                                Welcome back, {user?.full_name || user?.name}!
                            </h1>
                            <p className="text-secondary">
                                Manage your orders and discover new services
                            </p>
                        </div>
                    </div>

                    <Row className="mb-4 g-3">
                        {stats.map((stat) => (
                            <Col md={4} key={stat.label}>
                                <Card className="h-100 border p-3">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div>
                                            <p className="small text-muted mb-1">{stat.label}</p>
                                            <p className="h4 fw-bold text-dark mb-0">{stat.value}</p>
                                        </div>
                                        <div className="p-3 rounded bg-primary bg-opacity-10 d-flex align-items-center justify-content-center">
                                            <stat.icon size={24} className="text-primary" />
                                        </div>
                                    </div>
                                </Card>
                            </Col>
                        ))}
                    </Row>

                    <Row className="g-4">
                        <Col md={6}>
                            <Card className="h-100 border">
                                <Card.Body className="p-4">
                                    <h2 className="h5 fw-bold mb-4">Recent Activity</h2>
                                    {recentActivity.length > 0 ? (
                                        <div className="d-flex flex-column gap-3">
                                            {recentActivity.map((activity) => (
                                                <div key={activity.id} className="d-flex align-items-center gap-3 p-3 rounded bg-light">
                                                    <div className={`rounded-circle p-2 d-flex align-items-center justify-content-center ${iconBgColors[activity.iconColor]}`} style={{ width: 40, height: 40 }}>
                                                        <activity.icon size={20} className={`text-${iconColors[activity.iconColor]}`} />
                                                    </div>
                                                    <div className="flex-grow-1">
                                                        <p className="small fw-bold text-dark mb-0">{activity.title}</p>
                                                        <p className="small text-muted mb-0">{activity.description}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-4">
                                            <p className="text-muted mb-0">No recent activity</p>
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col md={6}>
                            <Card className="h-100 border">
                                <Card.Body className="p-4">
                                    <h2 className="h5 fw-bold mb-4">Quick Links</h2>
                                    <Row className="g-3">
                                        {quickLinks.map((link) => (
                                            <Col xs={6} key={link.to}>
                                                <Link
                                                    to={link.to}
                                                    className="d-flex align-items-center gap-3 p-3 rounded bg-light text-decoration-none hover-bg-gray transition-colors h-100"
                                                >
                                                    <link.icon size={20} className="text-primary" />
                                                    <span className="small fw-medium text-dark">{link.label}</span>
                                                </Link>
                                            </Col>
                                        ))}
                                    </Row>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
            <style>{`
        .hover-bg-gray:hover { background-color: #e9ecef !important; }
      `}</style>
        </Layout>
    );
}
