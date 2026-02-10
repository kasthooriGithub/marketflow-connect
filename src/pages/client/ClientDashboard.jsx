import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from 'contexts/AuthContext';
import { Layout } from 'components/layout/Layout';
import { ProposalDetailModal } from 'components/client/ProposalDetailModal';
import { RecentActivity } from 'components/common/RecentActivity';
import {
    LayoutDashboard,
    ShoppingBag,
    Heart,
    MessageSquare,
    Settings,
    TrendingUp,
    UserCircle,
    CreditCard,
    ArrowRight,
    Search,
    Star
} from 'lucide-react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import {
    collection,
    query,
    where,
    getCountFromServer,
    getDocs
} from 'firebase/firestore';
import { db } from 'lib/firebase';
import { getSavedServicesCount } from 'services/savedServiceService';
import { proposalService } from 'services/proposalService';

export default function ClientDashboard() {
    const { user } = useAuth();

    const [stats, setStats] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [proposals, setProposals] = useState([]);
    const [selectedProposal, setSelectedProposal] = useState(null);
    const [showProposalModal, setShowProposalModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [pendingPayments, setPendingPayments] = useState(0);
    const [activeOrders, setActiveOrders] = useState(0);

    const quickLinks = [
        { to: '/services', label: 'Browse Services', icon: LayoutDashboard, color: '#4e73df' },
        { to: '/orders', label: 'My Orders', icon: ShoppingBag, color: '#1cc88a' },
        { to: '/messages', label: 'Messages', icon: MessageSquare, color: '#36b9cc' },
        { to: '/client/saved-services', label: 'Saved Services', icon: Heart, color: '#e74a3b' },
        { to: '/client/payment-history', label: 'Payment History', icon: CreditCard, color: '#f6c23e' },
        { to: '/dashboard/review-platform', label: 'Rate Platform', icon: Star, color: '#FFB33E' },
        { to: '/settings', label: 'Settings', icon: Settings, color: '#858796' },
    ];

    const getOrderMeta = (status) => {
        const s = status?.toLowerCase();
        if (s === 'completed')
            return { title: 'Order Completed', icon: TrendingUp, color: 'success' };
        if (s === 'cancelled' || s === 'canceled')
            return { title: 'Order Cancelled', icon: ShoppingBag, color: 'warning' };
        if (s === 'pending' || s === 'in_progress')
            return { title: 'Order In Progress', icon: ShoppingBag, color: 'primary' };

        return { title: 'Order Update', icon: ShoppingBag, color: 'primary' };
    };

    const iconBg = {
        primary: 'bg-primary bg-opacity-10 text-primary',
        success: 'bg-success bg-opacity-10 text-success',
        warning: 'bg-warning bg-opacity-10 text-warning',
    };

    useEffect(() => {
        if (!user?.uid) return;

        const fetchDashboard = async () => {
            try {
                setLoading(true);
                const uid = user.uid;

                const activeOrdersQuery = query(
                    collection(db, 'orders'),
                    where('client_id', '==', uid),
                    where('status', 'in', ['pending', 'in_progress'])
                );
                const activeOrdersSnap = await getCountFromServer(activeOrdersQuery);
                const savedServices = await getSavedServicesCount(uid);

                const convoQuery = query(
                    collection(db, 'conversations'),
                    where('participants', 'array-contains', uid)
                );

                const convoSnap = await getDocs(convoQuery);
                let unreadCount = 0;
                convoSnap.docs.forEach(doc => {
                    const data = doc.data();
                    if (data.last_message && data.last_message_sender_id !== uid) unreadCount++;
                });

                const pendingPaymentsQuery = query(
                    collection(db, 'orders'),
                    where('client_id', '==', uid),
                    where('status', '==', 'pending_payment')
                );
                const pendingSnap = await getCountFromServer(pendingPaymentsQuery);
                setPendingPayments(pendingSnap.data().count);
                setActiveOrders(activeOrdersSnap.data().count);

                setStats([
                    { label: 'Active Orders', value: activeOrdersSnap.data().count, icon: ShoppingBag, color: 'primary' },
                    { label: 'Saved Services', value: savedServices, icon: Heart, color: 'danger' },
                    { label: 'Unread Messages', value: unreadCount, icon: MessageSquare, color: 'info' },
                ]);

                const ordersQuery = query(collection(db, 'orders'), where('client_id', '==', uid));
                const ordersSnap = await getDocs(ordersQuery);

                const activities = ordersSnap.docs.map(doc => {
                    const data = doc.data();
                    const meta = getOrderMeta(data.status);
                    let createdDate = data.created_at?.toDate ? data.created_at.toDate() : new Date();
                    return {
                        id: doc.id,
                        createdDate,
                        title: meta.title,
                        description: `${data.service_name || 'Service'} • ${createdDate.toLocaleDateString()}`,
                        icon: meta.icon,
                        color: meta.color,
                        status: data.status,
                        orderId: doc.id
                    };
                }).sort((a, b) => b.createdDate - a.createdDate);

                setRecentActivity(activities.slice(0, 5));
            } catch (err) {
                console.error('Dashboard Error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, [user]);

    useEffect(() => {
        if (!user?.uid) return;
        const unsub = proposalService.subscribeToClientProposals(user.uid, (data) => {
            setProposals(data.filter(p => p.status === 'pending' || p.status === 'changes_requested'));
        });
        return () => unsub();
    }, [user]);

    if (loading) {
        return (
            <Layout footerVariant="dashboard">
                <div className="py-5 text-center"><div className="spinner-border text-primary" /></div>
            </Layout>
        );
    }

    return (
        <Layout footerVariant="dashboard">
            <div className="py-5 bg-light min-vh-100">
                <Container>
                    {/* Welcome Message Section from File Reference */}
                    <div className="mb-5 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                        <div>
                            <h1 className="h3 fw-bold mb-1">
                                Welcome back, <span className="text-primary">{user?.full_name || user?.name || 'Client'}</span>!
                            </h1>
                            <p className="text-muted mb-0">Here's what's happening with your projects today.</p>
                        </div>
                        <div className="d-flex gap-2">
                            {pendingPayments > 0 && (
                                <Link to="/orders" className="btn btn-warning btn-sm d-flex align-items-center gap-2 px-3 rounded-pill shadow-sm">
                                    <CreditCard size={16} />
                                    <span>{pendingPayments} Pending Payment{pendingPayments > 1 ? 's' : ''}</span>
                                    <ArrowRight size={14} />
                                </Link>
                            )}
                            {activeOrders > 0 && (
                                <Link to="/orders" className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2 px-3 rounded-pill">
                                    <ShoppingBag size={16} />
                                    <span>{activeOrders} Active Order{activeOrders > 1 ? 's' : ''}</span>
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* KPI CARDS */}
                    <Row className="mb-4 g-3">
                        {stats.map(stat => (
                            <Col md={4} key={stat.label}>
                                <Card className="border-0 shadow-sm p-3 h-100">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <p className="small text-muted mb-1 fw-medium">{stat.label}</p>
                                            <p className="h3 fw-bold mb-0 text-dark">{stat.value}</p>
                                        </div>
                                        <div className={`p-3 rounded-circle bg-${stat.color || 'primary'} bg-opacity-10 text-${stat.color || 'primary'}`}>
                                            <stat.icon size={24} />
                                        </div>
                                    </div>
                                </Card>
                            </Col>
                        ))}
                    </Row>

                    <Row className="g-4 d-flex align-items-stretch">
                        {/* RECENT ACTIVITY */}
                        <Col md={6} className="d-flex">
                            <Card className="border-0 shadow-sm w-100 flex-fill">
                                <Card.Body className="p-4 d-flex flex-column">
                                    <h2 className="h6 fw-bold mb-3">Recent Activity</h2>
                                    <div className="recent-scroll flex-grow-1">
                                        <RecentActivity limit={5} />
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>

                        {/* QUICK ACTIONS */}
                        <Col md={6} className="d-flex">
                            <Card className="border-0 shadow-sm w-100 flex-fill">
                                <Card.Body className="p-4">
                                    <h2 className="h6 fw-bold mb-4">Quick Actions</h2>
                                    <div className="mb-3">
                                        <Link to="/services" className="d-flex align-items-center justify-content-between p-3 rounded-4 bg-primary text-white text-decoration-none hover-primary-dark transition-all shadow-sm mb-3">
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="p-2 bg-white bg-opacity-20 rounded-3">
                                                    <Search size={22} />
                                                </div>
                                                <div>
                                                    <p className="mb-0 fw-bold">Browse Services</p>
                                                    <p className="small mb-0 opacity-75">Find the perfect expert</p>
                                                </div>
                                            </div>
                                            <ArrowRight size={20} />
                                        </Link>
                                    </div>
                                    <Row className="g-3">
                                        {quickLinks.slice(1).map((link, index) => (
                                            <Col xs={6} key={index}>
                                                <Link to={link.to} className="d-flex align-items-center gap-2 p-3 rounded-3 border bg-white text-decoration-none hover-action transition-all h-100">
                                                    <link.icon size={18} style={{ color: link.color }} />
                                                    <span className="small fw-bold text-dark">{link.label}</span>
                                                </Link>
                                            </Col>
                                        ))}
                                    </Row>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    {/* PROPOSALS */}
                    {proposals.length > 0 && (
                        <Row className="mt-4">
                            <Col>
                                <Card className="border-0 shadow-sm border-top border-warning border-4">
                                    <Card.Body className="p-4">
                                        <h2 className="h6 fw-bold mb-3">Pending Proposals</h2>
                                        {proposals.map(p => (
                                            <div key={p.id} className="d-flex justify-content-between p-3 mb-2 bg-light rounded cursor-pointer border hover-bg-gray transition-all"
                                                onClick={() => { setSelectedProposal(p); setShowProposalModal(true); }}>
                                                <div>
                                                    <p className="fw-bold small mb-0">{p.title}</p>
                                                    <p className="small text-muted mb-0">${p.price} • {p.service_name}</p>
                                                </div>
                                                <span className="badge bg-warning text-dark align-self-center">Review</span>
                                            </div>
                                        ))}
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    )}
                </Container>
            </div>

            <ProposalDetailModal
                open={showProposalModal}
                onOpenChange={setShowProposalModal}
                proposal={selectedProposal}
            />

            <style>{`
                .recent-scroll {
                    max-height: 320px;
                    overflow-y: auto;
                    padding-right: 5px;
                }
                .recent-scroll::-webkit-scrollbar { width: 4px; }
                .recent-scroll::-webkit-scrollbar-thumb { background: #dee2e6; border-radius: 10px; }
                .cursor-pointer { cursor: pointer; }
                .hover-action:hover {
                    background-color: #f8f9fa !important;
                    border-color: #4e73df !important;
                    transform: translateX(4px);
                }
                .hover-primary-dark:hover {
                    background-color: #2e59d9 !important;
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(78, 115, 223, 0.3) !important;
                }
                .cursor-pointer { cursor: pointer; }
                .transition-all { transition: all 0.2s ease-in-out; }
                .rounded-4 { border-radius: 1rem !important; }
            `}</style>
        </Layout>
    );
}