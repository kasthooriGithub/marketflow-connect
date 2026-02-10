import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Form, Spinner } from 'react-bootstrap';
import { db } from 'lib/firebase';
import { collection, query, orderBy, onSnapshot, where, getDocs } from 'firebase/firestore';
import { DollarSign, TrendingUp, Calendar, Filter, Download } from 'lucide-react';
import { paymentService } from 'services/paymentService';
import { toast } from 'sonner';
import { AdminLayout } from 'components/layout/AdminLayout';

export default function AdminRevenue() {
    const [earnings, setEarnings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, this_month, last_30_days

    // Stats
    const [stats, setStats] = useState({
        totalRevenue: 0,
        monthlyRevenue: 0,
        totalTransactions: 0,
        avgCommission: 0
    });

    useEffect(() => {
        fetchData();
    }, [filter]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // For MVP, we fetch all earnings and filter client-side if needed for complex analysis, 
            // but here we use the service to get the base list.
            // Ideally, the service could handle date filtering to reduce reads, 
            // but for "Total Revenue" we need all-time history regardless of view filter.
            // So let's fetch all (considering MVP scale) and calculate stats.
            const data = await paymentService.getEarnings();

            calculateStats(data);
            applyFilter(data);
        } catch (error) {
            console.error("Error loading revenue data:", error);
            toast.error("Failed to load revenue data");
            setLoading(false);
        }
    };

    const calculateStats = (data) => {
        const totalRev = data.reduce((sum, item) => sum + (item.admin_share || 0), 0);
        const totalTx = data.length;
        const avgComm = totalTx > 0 ? totalRev / totalTx : 0;

        // Monthly Revenue (Current Month)
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const monthlyRev = data.reduce((sum, item) => {
            const date = item.created_at?.toDate ? item.created_at.toDate() : new Date(item.created_at);
            if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
                return sum + (item.admin_share || 0);
            }
            return sum;
        }, 0);

        setStats({
            totalRevenue: totalRev,
            monthlyRevenue: monthlyRev,
            totalTransactions: totalTx,
            avgCommission: avgComm
        });
    };

    const applyFilter = (data) => {
        let filtered = [...data];
        const now = new Date();

        if (filter === 'this_month') {
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();
            filtered = filtered.filter(item => {
                const date = item.created_at?.toDate ? item.created_at.toDate() : new Date(item.created_at);
                return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
            });
        } else if (filter === 'last_7_days') {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(now.getDate() - 7);
            filtered = filtered.filter(item => {
                const date = item.created_at?.toDate ? item.created_at.toDate() : new Date(item.created_at);
                return date >= sevenDaysAgo;
            });
        }

        setEarnings(filtered);
        setLoading(false);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <AdminLayout title="Revenue Dashboard">
            <div className="py-4">
                <div className="d-flex justify-content-end align-items-center mb-4">
                    <Button variant="outline-primary" size="sm" onClick={() => window.print()} className="d-print-none">
                        <Download size={16} className="me-2" /> Export Report
                    </Button>
                </div>

                {/* Stats Cards */}
                <Row className="g-4 mb-4">
                    <Col md={6} lg={3}>
                        <Card className="border-0 shadow-sm rounded-4 h-100">
                            <Card.Body>
                                <div className="d-flex align-items-center justify-content-between mb-3">
                                    <div className="bg-success bg-opacity-10 p-2 rounded-3">
                                        <DollarSign className="text-success" size={24} />
                                    </div>
                                    <span className="badge bg-success bg-opacity-10 text-success">+20%</span>
                                </div>
                                <h3 className="fw-bold text-dark mb-1">{formatCurrency(stats.totalRevenue)}</h3>
                                <p className="text-muted small mb-0">Total Revenue (All Time)</p>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={6} lg={3}>
                        <Card className="border-0 shadow-sm rounded-4 h-100">
                            <Card.Body>
                                <div className="d-flex align-items-center justify-content-between mb-3">
                                    <div className="bg-primary bg-opacity-10 p-2 rounded-3">
                                        <TrendingUp className="text-primary" size={24} />
                                    </div>
                                    <span className="badge bg-primary bg-opacity-10 text-primary">This Month</span>
                                </div>
                                <h3 className="fw-bold text-dark mb-1">{formatCurrency(stats.monthlyRevenue)}</h3>
                                <p className="text-muted small mb-0">Revenue (Current Month)</p>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={6} lg={3}>
                        <Card className="border-0 shadow-sm rounded-4 h-100">
                            <Card.Body>
                                <div className="d-flex align-items-center justify-content-between mb-3">
                                    <div className="bg-info bg-opacity-10 p-2 rounded-3">
                                        <Calendar className="text-info" size={24} />
                                    </div>
                                </div>
                                <h3 className="fw-bold text-dark mb-1">{stats.totalTransactions}</h3>
                                <p className="text-muted small mb-0">Total Transactions</p>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={6} lg={3}>
                        <Card className="border-0 shadow-sm rounded-4 h-100">
                            <Card.Body>
                                <div className="d-flex align-items-center justify-content-between mb-3">
                                    <div className="bg-warning bg-opacity-10 p-2 rounded-3">
                                        <Filter className="text-warning" size={24} />
                                    </div>
                                </div>
                                <h3 className="fw-bold text-dark mb-1">{formatCurrency(stats.avgCommission)}</h3>
                                <p className="text-muted small mb-0">Avg. Commission</p>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Filters and Table */}
                <Card className="border-0 shadow-sm rounded-4">
                    <Card.Header className="bg-white border-bottom py-3 px-4 d-flex align-items-center justify-content-between">
                        <h5 className="fw-bold text-dark mb-0">Transaction History</h5>
                        <div className="d-flex gap-2">
                            <Form.Select
                                size="sm"
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                style={{ width: '150px' }}
                                className="border-0 bg-light fw-medium"
                            >
                                <option value="all">All Time</option>
                                <option value="this_month">This Month</option>
                                <option value="last_7_days">Last 7 Days</option>
                            </Form.Select>
                        </div>
                    </Card.Header>
                    <Card.Body className="p-0">
                        {loading ? (
                            <div className="text-center py-5">
                                <Spinner animation="border" variant="primary" />
                                <p className="mt-2 text-muted">Loading transactions...</p>
                            </div>
                        ) : earnings.length === 0 ? (
                            <div className="text-center py-5">
                                <p className="text-muted mb-0">No transactions found for this period.</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <Table hover className="align-middle mb-0">
                                    <thead className="bg-light">
                                        <tr>
                                            <th className="ps-4 py-3 small text-muted text-uppercase fw-bold">Date</th>
                                            <th className="py-3 small text-muted text-uppercase fw-bold">Order ID</th>
                                            <th className="py-3 small text-muted text-uppercase fw-bold">Vendor ID</th>
                                            <th className="py-3 small text-muted text-uppercase fw-bold text-end">Total</th>
                                            <th className="py-3 small text-muted text-uppercase fw-bold text-end">Admin (20%)</th>
                                            <th className="py-3 small text-muted text-uppercase fw-bold text-end">Vendor (80%)</th>
                                            <th className="pe-4 py-3 small text-muted text-uppercase fw-bold text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {earnings.map((item) => (
                                            <tr key={item.id}>
                                                <td className="ps-4 py-3 small text-nowrap">
                                                    {formatDate(item.created_at)}
                                                </td>
                                                <td className="py-3 small font-monospace text-muted">
                                                    {item.order_id?.substring(0, 8)}...
                                                </td>
                                                <td className="py-3 small font-monospace text-muted">
                                                    {item.vendor_id?.substring(0, 8)}...
                                                </td>
                                                <td className="py-3 text-end fw-medium">
                                                    {formatCurrency(item.total_amount)}
                                                </td>
                                                <td className="py-3 text-end fw-bold text-success">
                                                    + {formatCurrency(item.admin_share)}
                                                </td>
                                                <td className="py-3 text-end text-muted">
                                                    {formatCurrency(item.vendor_share)}
                                                </td>
                                                <td className="pe-4 py-3 text-center">
                                                    <Badge bg={item.status === 'available' ? 'success' : 'secondary'} className="rounded-pill fw-normal px-3">
                                                        {item.status}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        )}
                    </Card.Body>
                </Card>
            </div>
        </AdminLayout>
    );
}
