import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from 'contexts/AuthContext';
import { Layout } from 'components/layout/Layout';
import { Button } from 'components/ui/button';
import { AddServiceModal } from 'components/vendor/AddServiceModal';
import { RecentActivity } from 'components/common/RecentActivity';
import {
    ShoppingBag, MessageSquare, Settings, Plus, Package,
    TrendingUp, Users, DollarSign, Briefcase,
    ArrowUpRight, Clock, Percent, Wallet, ChevronRight,
    CheckCircle, AlertCircle, Star
} from 'lucide-react';
import { Container, Row, Col, Card, Badge, Table, Spinner } from 'react-bootstrap';
import {
    collection, query, where, getCountFromServer,
    getDocs, doc, getDoc, orderBy, limit
} from 'firebase/firestore';
import { db } from 'lib/firebase';

export default function VendorDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    const [financials, setFinancials] = useState({
        gross: 0,
        net: 0,
        adminFee: 0,
        pending: 0
    });

    const [stats, setStats] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);

    // UPDATED: Platform Fee changed to 20%
    const ADMIN_FEE_PERCENTAGE = 20;

    const quickLinks = [
        { to: '/my-services', label: 'My Services', icon: Briefcase, color: '#4f46e5' },
        { to: '/orders', label: 'Orders', icon: ShoppingBag, color: '#0ea5e9' },
        { to: '/messages', label: 'Messages', icon: MessageSquare, color: '#10b981' },
        { to: '/earnings', label: 'Earnings', icon: DollarSign, color: '#f59e0b' },
        // NEW: Review Platform Button Added
        { to: '/dashboard/review-platform', label: 'Review Platform', icon: Star, color: '#f43f5e' },
        { to: '/settings', label: 'Settings', icon: Settings, color: '#6366f1' },
        { to: '/vendor/profile', label: 'My Profile', icon: Users, color: '#ec4899' },
    ];

    useEffect(() => {
        if (!user?.uid) return;

        const fetchDashboardData = async () => {
            try {
                setLoading(true);

                const ordersRef = collection(db, 'orders');
                const q = query(ordersRef, where('vendor_id', '==', user.uid));
                const querySnapshot = await getDocs(q);

                let grossRevenue = 0;
                let pendingRevenue = 0;
                let allOrders = [];

                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    const amount = Number(data.total_amount) || 0;

                    if (data.status === 'completed') {
                        grossRevenue += amount;
                    } else if (data.status !== 'cancelled') {
                        pendingRevenue += amount;
                    }

                    allOrders.push({ id: doc.id, ...data });
                });

                const adminFee = (grossRevenue * ADMIN_FEE_PERCENTAGE) / 100;
                const netEarnings = grossRevenue - adminFee;

                setFinancials({
                    gross: grossRevenue,
                    net: netEarnings,
                    adminFee: adminFee,
                    pending: pendingRevenue
                });

                const servicesQ = query(collection(db, 'services'), where('vendor_id', '==', user.uid));
                const servicesSnap = await getCountFromServer(servicesQ);

                setStats([
                    { label: 'Net Earnings', value: `$${netEarnings.toLocaleString()}`, sub: 'After 20% fee', icon: Wallet, color: 'success' },
                    { label: 'Pending Clear', value: `$${pendingRevenue.toLocaleString()}`, sub: 'Active orders', icon: Clock, color: 'warning' },
                    { label: 'Active Services', value: servicesSnap.data().count.toString(), sub: 'Live listings', icon: Package, color: 'primary' },
                    { label: 'Total Sales', value: allOrders.length.toString(), sub: 'Lifetime orders', icon: ShoppingBag, color: 'info' },
                ]);

                const sortedOrders = allOrders
                    .sort((a, b) => (b.created_at?.seconds || 0) - (a.created_at?.seconds || 0))
                    .slice(0, 5);

                setRecentOrders(sortedOrders);
                setLoading(false);

            } catch (error) {
                console.error("Dashboard Fetch Error:", error);
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user]);

    const handleWithdraw = () => {
        if (financials.net > 0) {
            alert(`Payout request for $${financials.net.toLocaleString()} has been sent!`);
        } else {
            alert("No earnings available for withdrawal.");
        }
    };

    if (loading) {
        return (
            <Layout footerVariant="dashboard">
                <div className="d-flex justify-content-center align-items-center min-vh-100">
                    <Spinner animation="border" variant="primary" />
                </div>
            </Layout>
        );
    }

    return (
        <Layout footerVariant="dashboard">
            <div className="py-4 bg-light min-vh-100">
                <Container>
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-4 gap-3">
                        <div>
                            <h2 className="fw-bold text-dark mb-1">Welcome back, {user?.full_name || 'Vendor'}! 👋</h2>
                            <p className="text-muted mb-0">Monitor your marketplace performance and earnings.</p>
                        </div>
                        <Button onClick={() => setIsAddServiceOpen(true)} className="rounded-3 shadow-sm border-0 px-4 py-2 bg-primary">
                            <Plus size={18} className="me-2" /> Add New Service
                        </Button>
                    </div>

                    <Row className="g-3 mb-4">
                        {stats.map((stat, i) => (
                            <Col md={3} sm={6} key={i}>
                                <Card className="border-0 shadow-sm rounded-4 h-100 transition-hover">
                                    <Card.Body className="p-4">
                                        <div className={`p-2 rounded-3 bg-${stat.color} bg-opacity-10 text-${stat.color} d-inline-block mb-3`}>
                                            <stat.icon size={22} />
                                        </div>
                                        <p className="text-muted small fw-medium mb-1">{stat.label}</p>
                                        <h3 className="fw-bold mb-1 text-dark">{stat.value}</h3>
                                        <span className="tiny text-muted d-block">{stat.sub}</span>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>

                    <Row className="g-4">
                        <Col lg={8}>
                            <Card className="border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
                                <Card.Header className="bg-white border-0 py-4 px-4 d-flex justify-content-between align-items-center">
                                    <h5 className="fw-bold mb-0">Recent Activity</h5>
                                    <Button variant="link" onClick={() => navigate('/vendor/orders')} className="text-decoration-none p-0 small text-primary">
                                        View All Orders <ChevronRight size={14} />
                                    </Button>
                                </Card.Header>
                                <Card.Body className="p-4">
                                    <RecentActivity limit={5} />
                                </Card.Body>
                            </Card>

                            <Card className="border-0 shadow-sm rounded-4 p-4">
                                <h5 className="fw-bold mb-4">Account Standing</h5>
                                <Row className="text-center g-3">
                                    <Col xs={4}>
                                        <div className="p-3 bg-light rounded-4 border">
                                            <div className="text-success mb-2"><CheckCircle size={24} /></div>
                                            <h6 className="mb-1 fw-bold">99%</h6>
                                            <p className="tiny text-muted mb-0">Success</p>
                                        </div>
                                    </Col>
                                    <Col xs={4}>
                                        <div className="p-3 bg-light rounded-4 border">
                                            <div className="text-primary mb-2"><Star size={24} /></div>
                                            <h6 className="mb-1 fw-bold">4.8/5</h6>
                                            <p className="tiny text-muted mb-0">Rating</p>
                                        </div>
                                    </Col>
                                    <Col xs={4}>
                                        <div className="p-3 bg-light rounded-4 border">
                                            <div className="text-warning mb-2"><AlertCircle size={24} /></div>
                                            <h6 className="mb-1 fw-bold">1 hr</h6>
                                            <p className="tiny text-muted mb-0">Response</p>
                                        </div>
                                    </Col>
                                </Row>
                            </Card>
                        </Col>

                        <Col lg={4}>
                            <Card className="border-0 bg-dark text-white rounded-4 shadow-sm mb-4">
                                <Card.Body className="p-4">
                                    <div className="d-flex justify-content-between mb-4">
                                        <div className="p-2 bg-white bg-opacity-10 rounded-3">
                                            <Wallet size={24} />
                                        </div>
                                        <div className="text-end">
                                            <div className="d-flex align-items-center text-info tiny fw-bold mb-1">
                                                <Percent size={12} className="me-1" /> 20% Platform Fee
                                            </div>
                                            <p className="tiny text-white-50 mb-0">Net Balance</p>
                                        </div>
                                    </div>
                                    <p className="small text-white-50 mb-1">Available for Payout</p>
                                    <h2 className="fw-bold mb-4 text-white">${financials.net.toLocaleString()}</h2>
                                    <Button
                                        onClick={handleWithdraw}
                                        variant="light"
                                        className="w-100 rounded-3 py-2 fw-bold text-dark"
                                        disabled={financials.net <= 0}
                                    >
                                        Withdraw Funds
                                    </Button>
                                    <p className="tiny text-center mt-3 text-white-50 mb-0">
                                        Gross Revenue: ${financials.gross.toLocaleString()}
                                    </p>
                                </Card.Body>
                            </Card>

                            <Card className="border-0 shadow-sm rounded-4">
                                <Card.Body className="p-4">
                                    <h5 className="fw-bold mb-4 text-dark">Quick Actions</h5>
                                    <Row className="g-3">
                                        {quickLinks.map((link) => (
                                            <Col xs={6} key={link.to}>
                                                <Link to={link.to} className="quick-link-card text-decoration-none d-flex flex-column align-items-center p-3 rounded-4 justify-content-center text-center h-100 border bg-white">
                                                    <div className="icon-box-small mb-2" style={{ backgroundColor: `${link.color}15`, color: link.color }}>
                                                        <link.icon size={20} />
                                                    </div>
                                                    <span className="tiny fw-bold text-dark">{link.label}</span>
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

            <AddServiceModal open={isAddServiceOpen} onOpenChange={setIsAddServiceOpen} />

            <style>{`
                .tiny { font-size: 0.72rem; }
                .custom-table th { font-weight: 600; text-transform: uppercase; font-size: 0.65rem; letter-spacing: 0.8px; padding-top: 15px; padding-bottom: 15px; }
                .icon-box-small { width: 42px; height: 42px; display: flex; align-items: center; justify-content: center; border-radius: 10px; }
                .quick-link-card { transition: all 0.2s ease; min-height: 90px; }
                .quick-link-card:hover { border-color: #4f46e5 !important; transform: translateY(-3px); box-shadow: 0 5px 15px rgba(0,0,0,0.05); }
                .transition-hover { transition: all 0.3s ease; }
                .transition-hover:hover { transform: translateY(-5px); }
                .custom-table tbody tr:hover { background-color: #f8f9fa; }
            `}</style>
        </Layout>
    );
}