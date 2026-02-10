import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, onSnapshot, query, where, doc, getDoc, orderBy } from 'firebase/firestore';
import { AdminLayout } from 'components/layout/AdminLayout';
import { Users, Building2, Package, DollarSign, TrendingUp } from 'lucide-react';
import { Row, Col, Card, Table, Badge } from 'react-bootstrap';

export default function AdminDashboard() {
  const [counts, setCounts] = useState({ clients: 0, vendors: 0, services: 0, revenue: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Admin Commission Rate (e.g., 10%)
  const COMMISSION_RATE = 0.10;

  useEffect(() => {
    // 1. Total Clients Count
    const unsubClients = onSnapshot(query(collection(db, "users"), where("role", "==", "client")), (snap) => {
      setCounts(prev => ({ ...prev, clients: snap.size }));
    });

    // 2. Total Vendors Count
    const unsubVendors = onSnapshot(collection(db, "vendors"), (snap) => {
      setCounts(prev => ({ ...prev, vendors: snap.size }));
    });

    // 3. Total Services Count
    const unsubServices = onSnapshot(collection(db, "services"), (snap) => {
      setCounts(prev => ({ ...prev, services: snap.size }));
    });

    // 4. Total Revenue (from Earnings collection)
    const unsubRevenue = onSnapshot(collection(db, "earnings"), (snap) => {
      const totalRev = snap.docs.reduce((sum, doc) => sum + (doc.data().admin_share || 0), 0);
      setCounts(prev => ({ ...prev, revenue: totalRev }));
    });

    // 5. Recent Orders (Display Only)
    const unsubOrders = onSnapshot(query(collection(db, "orders"), orderBy("created_at", "desc")), async (snapshot) => {

      const ordersPromises = snapshot.docs.slice(0, 10).map(async (orderDoc) => {
        const data = orderDoc.data();
        const amount = Number(data.total_amount || 0);

        // Fetch Client Name from 'users' collection
        let clientName = "Unknown Client";
        if (data.client_id) {
          const clientDoc = await getDoc(doc(db, "users", data.client_id));
          if (clientDoc.exists()) clientName = clientDoc.data().full_name || clientDoc.data().name;
        }

        // Fetch Vendor Name
        let vendorName = "Unknown Vendor";
        if (data.vendor_id) {
          const vendorDoc = await getDoc(doc(db, "users", data.vendor_id));
          if (vendorDoc.exists()) {
            vendorName = vendorDoc.data().full_name || vendorDoc.data().name || vendorDoc.data().business_name;
          }
        }

        return {
          id: orderDoc.id,
          service: data.service_name || 'N/A',
          client: clientName,
          vendor: vendorName,
          amount: `$${amount}`,
          status: data.status || 'pending'
        };
      });

      const resolvedOrders = await Promise.all(ordersPromises);
      setRecentOrders(resolvedOrders); // Already limited to 10 via slice above
      setLoading(false);
    });

    return () => {
      unsubClients(); unsubVendors(); unsubServices(); unsubRevenue(); unsubOrders();
    };
  }, []);

  return (
    <AdminLayout title="Dashboard">
      <div className="p-0">
        <Row className="g-4 mb-5">
          <Col sm={6} lg={3}><StatCard label="Total Clients" value={counts.clients} icon={Users} color="primary" /></Col>
          <Col sm={6} lg={3}><StatCard label="Active Vendors" value={counts.vendors} icon={Building2} color="success" /></Col>
          <Col sm={6} lg={3}><StatCard label="Total Services" value={counts.services} icon={Package} color="info" /></Col>
          <Col sm={6} lg={3}><StatCard label="Total Revenue (20%)" value={`$${counts.revenue.toFixed(2)}`} icon={DollarSign} color="warning" /></Col>
        </Row>

        <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
          <Card.Header className="bg-white py-4 px-4 border-bottom-0">
            <h2 className="h5 fw-bold text-dark mb-0">Recent Orders</h2>
          </Card.Header>
          <div className="table-responsive">
            <Table hover className="align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="px-4 py-3 border-0">SERVICE</th>
                  <th className="px-4 py-3 border-0">CLIENT NAME</th>
                  <th className="px-4 py-3 border-0">VENDOR NAME</th>
                  <th className="px-4 py-3 border-0">AMOUNT</th>
                  <th className="px-4 py-3 border-0">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" className="text-center py-4">Loading names...</td></tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-4 py-3 fw-bold">{order.service}</td>
                      <td className="px-4 py-3 text-secondary">{order.client}</td>
                      <td className="px-4 py-3 text-secondary">{order.vendor}</td>
                      <td className="px-4 py-3 fw-bold text-dark">{order.amount}</td>
                      <td className="px-4 py-3">
                        <Badge bg={order.status === 'completed' ? 'success' : 'warning'} className="text-capitalize px-3 py-2 rounded-pill">
                          {order.status}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <Card className="border-0 shadow-sm rounded-4 p-2 h-100">
      <Card.Body>
        <div className={`p-3 bg-${color} bg-opacity-10 rounded-4 text-${color} d-inline-block mb-3`}>
          <Icon size={24} />
        </div>
        <h4 className="h2 fw-bold mb-1">{value}</h4>
        <p className="text-muted small fw-medium mb-0">{label}</p>
      </Card.Body>
    </Card>
  );
}