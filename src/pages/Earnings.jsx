import { Link } from 'react-router-dom';
import { Layout } from 'components/layout/Layout';
import { Button } from 'components/ui/button';
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

export default function Earnings() {
  const { user } = useAuth();

  const earningsData = {
    totalEarnings: 12450,
    pendingPayment: 1250,
    thisMonth: 3200,
    lastMonth: 2800,
    availableForWithdrawal: 8500,
  };

  const transactions = [
    { id: '1', service: 'SEO Audit Package', client: 'TechStart Inc.', amount: 499, date: '2024-01-20', status: 'completed' },
    { id: '2', service: 'Social Media Management', client: 'Fashion Brand Co.', amount: 899, date: '2024-01-18', status: 'completed' },
    { id: '3', service: 'Content Writing Package', client: 'Health Blog Pro', amount: 150, date: '2024-01-15', status: 'pending' },
    { id: '4', service: 'Google Ads Setup', client: 'E-commerce Store', amount: 799, date: '2024-01-12', status: 'completed' },
    { id: '5', service: 'Brand Identity Design', client: 'Startup XYZ', amount: 1999, date: '2024-01-10', status: 'completed' },
  ];

  const growthPercentage = ((earningsData.thisMonth - earningsData.lastMonth) / earningsData.lastMonth * 100).toFixed(1);

  return (
    <Layout>
      <Container className="py-5">
        {/* Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-5">
          <div>
            <Link
              to="/dashboard"
              className="d-flex align-items-center text-muted text-decoration-none small mb-2 hover-text-dark"
            >
              <ArrowLeft size={16} className="me-2" />
              Back to Dashboard
            </Link>
            <h1 className="h2 fw-bold text-dark mb-1">
              Earnings
            </h1>
            <p className="text-muted mb-0">
              Track your revenue and manage withdrawals
            </p>
          </div>
          <Button variant="default">
            <Wallet size={16} className="me-2" />
            Withdraw Funds
          </Button>
        </div>

        {/* Stats Grid */}
        <Row className="g-4 mb-5">
          <Col md={6} lg={3}>
            <Card className="h-100 shadow-sm border">
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <span className="text-muted small fw-medium">Total Earnings</span>
                  <div className="p-2 bg-primary bg-opacity-10 rounded text-primary">
                    <DollarSign size={20} />
                  </div>
                </div>
                <div className="h3 fw-bold text-dark mb-1">${earningsData.totalEarnings.toLocaleString()}</div>
                <div className="text-muted small">All time</div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} lg={3}>
            <Card className="h-100 shadow-sm border">
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <span className="text-muted small fw-medium">This Month</span>
                  <div className="p-2 bg-success bg-opacity-10 rounded text-success">
                    <TrendingUp size={20} />
                  </div>
                </div>
                <div className="h3 fw-bold text-dark mb-1">${earningsData.thisMonth.toLocaleString()}</div>
                <div className="d-flex align-items-center gap-1">
                  <ArrowUpRight size={14} className="text-success" />
                  <span className="text-success small fw-medium">+{growthPercentage}%</span>
                  <span className="text-muted small ms-1">vs last month</span>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} lg={3}>
            <Card className="h-100 shadow-sm border">
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <span className="text-muted small fw-medium">Pending</span>
                  <div className="p-2 bg-warning bg-opacity-10 rounded text-warning">
                    <Calendar size={20} />
                  </div>
                </div>
                <div className="h3 fw-bold text-dark mb-1">${earningsData.pendingPayment.toLocaleString()}</div>
                <div className="text-muted small font-italic">Awaiting clearance</div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} lg={3}>
            <Card className="h-100 shadow-sm border border-primary border-opacity-25 bg-primary bg-opacity-10">
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <span className="text-primary small fw-semibold">Available</span>
                  <div className="p-2 bg-primary bg-opacity-20 rounded text-primary">
                    <Wallet size={20} />
                  </div>
                </div>
                <div className="h3 fw-bold text-dark mb-1">${earningsData.availableForWithdrawal.toLocaleString()}</div>
                <div className="text-primary small fw-medium">Ready to withdraw</div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Transactions */}
        <Card className="shadow-sm border">
          <Card.Header className="bg-white p-4 border-bottom d-flex justify-content-between align-items-center">
            <h2 className="h5 fw-bold mb-0">Recent Transactions</h2>
            <Button variant="outline" size="sm">
              <Download size={14} className="me-2" />
              Export
            </Button>
          </Card.Header>

          <div className="list-group list-group-flush">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="list-group-item p-4 hover-bg-light transition-colors">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center gap-3">
                    <div className="p-2 bg-light rounded-circle shadow-sm">
                      <DollarSign size={20} className="text-primary" />
                    </div>
                    <div>
                      <div className="fw-semibold text-dark">{transaction.service}</div>
                      <div className="small text-muted">{transaction.client}</div>
                    </div>
                  </div>
                  <div className="text-end">
                    <div className="fw-bold text-dark font-display">+${transaction.amount}</div>
                    <div className="small text-muted">{transaction.date}</div>
                    <span className={`badge ${transaction.status === 'completed' ? 'bg-success' : 'bg-warning text-dark'} bg-opacity-10 text-uppercase rounded-pill mt-1`} style={{ fontSize: '0.65rem' }}>
                      {transaction.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Card.Footer className="bg-white p-3 text-center">
            <Button variant="link" className="text-decoration-none fw-medium">View All Transactions</Button>
          </Card.Footer>
        </Card>
      </Container>
      <style>{`
        .hover-bg-light:hover { background-color: #f8f9fa !important; }
        .hover-text-dark:hover { color: #212529 !important; }
      `}</style>
    </Layout>
  );
}
