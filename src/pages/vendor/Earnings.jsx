import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from 'components/layout/Layout';
import { Button } from 'components/ui/button';
import { Badge } from 'components/ui/badge';
import { useAuth } from 'contexts/AuthContext';
import {
  ArrowLeft,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  Calendar,
  Download,
  Wallet
} from 'lucide-react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import {
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from 'lib/firebase';

export default function Earnings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    pendingPayment: 0,
    thisMonth: 0,
    lastMonth: 0,
    availableForWithdrawal: 0,
  });

  useEffect(() => {
    if (!user?.uid) return;

    const fetchEarningsData = async () => {
      try {
        setLoading(true);

        const ordersRef = collection(db, 'orders');
        const q = query(
          ordersRef,
          where('vendor_id', '==', user.uid)
        );

        const querySnapshot = await getDocs(q);
        const fetchedTransactions = [];

        let total = 0;
        let pending = 0;
        let available = 0;
        let currentMonthSum = 0;
        let lastMonthSum = 0;

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const lastMonthDate = new Date();
        lastMonthDate.setMonth(now.getMonth() - 1);
        const prevMonth = lastMonthDate.getMonth();
        const prevMonthYear = lastMonthDate.getFullYear();

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const status = data.status || 'pending';

          // Cancelled orders-ai purakkanikkirom
          if (status === 'cancelled') return;

          const amount = Number(data.total_amount) || 0;
          const paymentStatus = data.payment_status || 'unpaid';
          const createdAt = data.created_at?.toDate() || new Date();

          fetchedTransactions.push({
            id: doc.id,
            service: data.service_name || 'Service Order',
            client: data.client_name || 'Customer',
            amount: amount,
            date: createdAt.toLocaleDateString(),
            status: status,
            paymentStatus: paymentStatus,
            rawDate: createdAt
          });

          // --- EARNINGS CALCULATION LOGIC ---

          // 1. Oru project complete aagivittaal athu ungal motha varumaanam (Total)
          if (status === 'completed') {
            total += amount;

            // Monthly breakdown
            if (createdAt.getMonth() === currentMonth && createdAt.getFullYear() === currentYear) {
              currentMonthSum += amount;
            }
            if (createdAt.getMonth() === prevMonth && createdAt.getFullYear() === prevMonthYear) {
              lastMonthSum += amount;
            }

            // 2. AVAILABLE: Project complete aagi, client-um 'paid' panniyirunthaal mattume withdraw seiya mudiyum
            if (paymentStatus === 'paid') {
              available += amount;
            } else {
              // Project complete aahi client innum pay pannala (paymentStatus: unpaid) endraal Pending-il serum
              pending += amount;
            }
          } else {
            // 3. Project innum 'completed' aagalai endraalum athu 'Pending' thaan
            pending += amount;
          }
        });

        // Sorting: Newest first
        fetchedTransactions.sort((a, b) => b.rawDate - a.rawDate);

        setTransactions(fetchedTransactions);
        setStats({
          totalEarnings: total,
          pendingPayment: pending,
          thisMonth: currentMonthSum,
          lastMonth: lastMonthSum,
          availableForWithdrawal: available, // Ippo ithu correct-aga client pay panna amount-ai mattum kaattum
        });

        setLoading(false);
      } catch (error) {
        console.error("Error:", error);
        setLoading(false);
      }
    };

    fetchEarningsData();
  }, [user]);

  const growthPercentage = stats.lastMonth > 0
    ? ((stats.thisMonth - stats.lastMonth) / stats.lastMonth * 100).toFixed(1)
    : stats.thisMonth > 0 ? '100' : '0';

  if (loading) {
    return (
      <Layout footerVariant="dashboard">
        <div className="vh-100 d-flex align-items-center justify-content-center">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout footerVariant="dashboard">
      <Container className="py-5">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-5">
          <div>
            <Link to="/dashboard" className="d-flex align-items-center text-muted text-decoration-none small mb-2 hover-text-dark">
              <ArrowLeft size={16} className="me-2" /> Back to Dashboard
            </Link>
            <h1 className="h2 fw-bold text-dark mb-1">Earnings</h1>
            <p className="text-muted mb-0">Track your revenue and manage withdrawals</p>
          </div>
          <Button variant="default" disabled={stats.availableForWithdrawal <= 0}>
            <Wallet size={16} className="me-2" /> Withdraw Funds
          </Button>
        </div>

        <Row className="g-4 mb-5">
          {/* Total Earnings Card */}
          <Col md={6} lg={3}>
            <Card className="h-100 shadow-sm border">
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <span className="text-muted small fw-medium">Total Earnings</span>
                  <div className="p-2 bg-primary bg-opacity-10 rounded text-primary">
                    <DollarSign size={20} />
                  </div>
                </div>
                <div className="h3 fw-bold text-dark mb-1">${stats.totalEarnings.toLocaleString()}</div>
                <div className="text-muted small">Completed Projects</div>
              </Card.Body>
            </Card>
          </Col>

          {/* Growth Card */}
          <Col md={6} lg={3}>
            <Card className="h-100 shadow-sm border">
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <span className="text-muted small fw-medium">This Month</span>
                  <div className="p-2 bg-success bg-opacity-10 rounded text-success">
                    <TrendingUp size={20} />
                  </div>
                </div>
                <div className="h3 fw-bold text-dark mb-1">${stats.thisMonth.toLocaleString()}</div>
                <div className="d-flex align-items-center gap-1">
                  <ArrowUpRight size={14} className="text-success" />
                  <span className="text-success small fw-medium">+{growthPercentage}%</span>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Pending Card (Unpaid + In Progress) */}
          <Col md={6} lg={3}>
            <Card className="h-100 shadow-sm border">
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <span className="text-muted small fw-medium">Pending</span>
                  <div className="p-2 bg-warning bg-opacity-10 rounded text-warning">
                    <Calendar size={20} />
                  </div>
                </div>
                <div className="h3 fw-bold text-dark mb-1">${stats.pendingPayment.toLocaleString()}</div>
                <div className="text-muted small font-italic">In Progress / Unpaid</div>
              </Card.Body>
            </Card>
          </Col>

          {/* Available for Withdrawal (Only PAID and COMPLETED) */}
          <Col md={6} lg={3}>
            <Card className="h-100 shadow-sm border border-primary border-opacity-25 bg-primary bg-opacity-10">
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <span className="text-primary small fw-semibold">Available</span>
                  <div className="p-2 bg-primary bg-opacity-20 rounded text-primary">
                    <Wallet size={20} />
                  </div>
                </div>
                <div className="h3 fw-bold text-dark mb-1">${stats.availableForWithdrawal.toLocaleString()}</div>
                <div className="text-primary small fw-medium">Ready to withdraw</div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Transactions */}
        <Card className="shadow-sm border">
          <Card.Header className="bg-white p-4 border-bottom d-flex justify-content-between align-items-center">
            <h2 className="h5 fw-bold mb-0">Recent Transactions</h2>
            <Button variant="outline" size="sm"><Download size={14} className="me-2" /> Export</Button>
          </Card.Header>

          <div className="list-group list-group-flush">
            {transactions.length > 0 ? (
              transactions.map((t) => (
                <div key={t.id} className="list-group-item p-4 hover-bg-light transition-colors">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-3">
                      <div className="p-2 bg-light rounded-circle shadow-sm">
                        <DollarSign size={20} className="text-primary" />
                      </div>
                      <div>
                        <div className="fw-semibold text-dark">{t.service}</div>
                        <div className="small text-muted">{t.client} | Status: <span className="text-capitalize">{t.status}</span></div>
                      </div>
                    </div>
                    <div className="text-end">
                      <div className="fw-bold text-dark">+${t.amount.toLocaleString()}</div>
                      <div className="small text-muted">{t.date}</div>
                      <span className={`badge ${t.paymentStatus === 'paid' ? 'bg-success' : 'bg-warning text-dark'} bg-opacity-10 text-uppercase rounded-pill mt-1`} style={{ fontSize: '0.65rem' }}>
                        {t.paymentStatus}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-5 text-center text-muted">No transactions found.</div>
            )}
          </div>
        </Card>
      </Container>
    </Layout>
  );
}