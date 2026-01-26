import { AdminLayout } from 'components/layout/AdminLayout';
import { Users, Building2, Package, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { Row, Col, Card, Table, Badge } from 'react-bootstrap';

const stats = [
  { label: 'Total Users', value: '12,453', change: '+12%', trend: 'up', icon: Users, color: 'primary' },
  { label: 'Active Vendors', value: '2,487', change: '+8%', trend: 'up', icon: Building2, color: 'success' },
  { label: 'Total Services', value: '8,234', change: '+15%', trend: 'up', icon: Package, color: 'info' },
  { label: 'Revenue (MTD)', value: '$45,678', change: '-3%', trend: 'down', icon: DollarSign, color: 'warning' },
];

const recentOrders = [
  { id: '1', service: 'SEO Audit Package', client: 'John Smith', vendor: 'SearchPro Digital', amount: '$499', status: 'Completed' },
  { id: '2', service: 'Social Media Management', client: 'Jane Doe', vendor: 'Social Buzz', amount: '$899', status: 'In Progress' },
  { id: '3', service: 'Brand Identity Design', client: 'Acme Corp', vendor: 'BrandForge', amount: '$1,999', status: 'Pending' },
  { id: '4', service: 'Google Ads Setup', client: 'Tech Startup', vendor: 'PPC Masters', amount: '$799', status: 'Completed' },
];

export default function AdminDashboard() {
  return (
    <AdminLayout title="Dashboard">
      {/* Stats Grid */}
      <Row className="g-4 mb-5">
        {stats.map((stat) => (
          <Col key={stat.label} sm={6} lg={3}>
            <Card className="border-0 shadow-sm rounded-4 h-100 p-2">
              <Card.Body>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div className={`p-3 bg-${stat.color} bg-opacity-10 rounded-4 text-${stat.color}`}>
                    <stat.icon size={24} />
                  </div>
                  <div className={`d-flex align-items-center gap-1 extra-small fw-bold px-2 py-1 rounded-pill ${stat.trend === 'up' ? 'bg-success bg-opacity-10 text-success' : 'bg-danger bg-opacity-10 text-danger'}`}>
                    {stat.trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {stat.change}
                  </div>
                </div>
                <h4 className="h2 fw-bold text-dark mb-1 font-display">{stat.value}</h4>
                <p className="text-muted small fw-medium mb-0">{stat.label}</p>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Recent Orders */}
      <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
        <Card.Header className="bg-white py-4 px-4 border-bottom-0">
          <h2 className="h5 fw-bold text-dark mb-0">Recent Orders</h2>
        </Card.Header>
        <div className="table-responsive">
          <Table hover className="align-middle mb-0">
            <thead className="bg-light bg-opacity-50">
              <tr>
                <th className="px-4 py-3 text-muted small fw-bold text-uppercase tracking-wider border-0">Service</th>
                <th className="px-4 py-3 text-muted small fw-bold text-uppercase tracking-wider border-0">Client</th>
                <th className="px-4 py-3 text-muted small fw-bold text-uppercase tracking-wider border-0">Vendor</th>
                <th className="px-4 py-3 text-muted small fw-bold text-uppercase tracking-wider border-0">Amount</th>
                <th className="px-4 py-3 text-muted small fw-bold text-uppercase tracking-wider border-0">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id}>
                  <td className="px-4 py-3 fw-medium text-dark">{order.service}</td>
                  <td className="px-4 py-3 text-secondary">{order.client}</td>
                  <td className="px-4 py-3 text-secondary">{order.vendor}</td>
                  <td className="px-4 py-3 fw-bold text-dark">{order.amount}</td>
                  <td className="px-4 py-3">
                    <Badge
                      bg={
                        order.status === 'Completed' ? 'success' :
                          order.status === 'In Progress' ? 'primary' :
                            'warning'
                      }
                      className={`px-3 py-2 rounded-pill fw-medium ${order.status === 'Pending' ? 'text-dark' : ''}`}
                      style={{ fontSize: '0.7rem' }}
                    >
                      {order.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card>
      <style>{`
        .extra-small { font-size: 0.75rem; }
        .font-display { font-family: 'Outfit', 'Inter', sans-serif; }
        .table > :not(caption) > * > * {
            border-bottom-width: 1px;
            border-color: rgba(0,0,0,0.05);
        }
      `}</style>
    </AdminLayout>
  );
}
