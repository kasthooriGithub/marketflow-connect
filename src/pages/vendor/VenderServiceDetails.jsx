import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from 'lib/firebase';
import { doc, onSnapshot, collection, query, where } from 'firebase/firestore';
import { Layout } from 'components/layout/Layout';
import { Button } from 'components/ui/button';
import { AddServiceModal } from 'components/vendor/AddServiceModal';
import { toast } from 'sonner';
import { 
  ArrowLeft, Edit, Star, BarChart3, Globe, PackageCheck, 
  Zap, FileText, ShoppingBag, ListFilter, Calendar, 
  DollarSign, Inbox, MessageSquare, Eye
} from 'lucide-react';
import { Container, Row, Col, Card, Badge, Table, Tabs, Tab } from 'react-bootstrap';

// Status constants for better maintainability
const ORDER_STATUS = {
  ACTIVE: ['pending', 'active', 'processing', 'in_progress'],
  COMPLETED: ['completed', 'delivered'],
  CANCELLED: ['cancelled', 'refunded', 'rejected']
};

export default function VendorServiceDetails() {
  const { serviceId } = useParams(); 
  const navigate = useNavigate();
  
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [orders, setOrders] = useState([]);

  // Categorize orders based on status
  const { activeOrders, completedOrders, cancelledOrders } = useMemo(() => {
    if (!orders.length) return { activeOrders: [], completedOrders: [], cancelledOrders: [] };
    
    return {
      activeOrders: orders.filter(o => ORDER_STATUS.ACTIVE.includes(o.status?.toLowerCase())),
      completedOrders: orders.filter(o => ORDER_STATUS.COMPLETED.includes(o.status?.toLowerCase())),
      cancelledOrders: orders.filter(o => ORDER_STATUS.CANCELLED.includes(o.status?.toLowerCase()))
    };
  }, [orders]);

  // Calculate performance metrics
  const performanceMetrics = useMemo(() => ({
    views: service?.views || 0,
    netEarnings: completedOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0),
    pendingRevenue: activeOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0),
    totalRevenue: completedOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0) +
                  activeOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0)
  }), [service, activeOrders, completedOrders]);

  // Fetch client name from Firestore
  const fetchClientName = useCallback(async (clientId) => {
    if (!clientId) return "Client";
    
    try {
      // Try fetching from clients collection first
      const clientRef = doc(db, 'clients', clientId);
      const clientSnap = await getDoc(clientRef);
      
      if (clientSnap.exists()) {
        return clientSnap.data().display_name || "Client";
      }
      
      // Fallback to users collection
      const userRef = doc(db, 'users', clientId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        return userSnap.data().full_name || "Client";
      }
    } catch (error) {
      console.error('Error fetching client name:', error);
    }
    
    return "Client";
  }, []);

  // Fetch service and orders data
  useEffect(() => {
    if (!serviceId) {
      navigate('/my-services');
      return;
    }

    let unsubscribeOrders = null;

    const unsubscribeService = onSnapshot(
      doc(db, 'services', serviceId),
      async (docSnap) => {
        if (!docSnap.exists()) {
          toast.error("Service not found");
          navigate('/my-services');
          return;
        }

        const serviceData = { 
          id: docSnap.id, 
          ...docSnap.data(),
          category: docSnap.data().category?.toUpperCase() || 'SERVICE'
        };
        
        setService(serviceData);

        // Setup orders query
        const ordersQuery = query(
          collection(db, 'orders'), 
          where('service_id', '==', serviceId)
        );

        unsubscribeOrders = onSnapshot(ordersQuery, async (snapshot) => {
          const orderPromises = snapshot.docs.map(async (orderDoc) => {
            const orderData = { id: orderDoc.id, ...orderDoc.data() };
            
            // Fetch client name
            const clientName = await fetchClientName(orderData.client_id);
            
            return {
              ...orderData,
              clientName,
              formattedDate: orderData.created_at?.toDate 
                ? orderData.created_at.toDate().toLocaleDateString()
                : 'Recent'
            };
          });

          const ordersData = await Promise.all(orderPromises);
          setOrders(ordersData);
          setLoading(false);
        });
      },
      (error) => {
        console.error('Error fetching service:', error);
        toast.error('Failed to load service details');
        setLoading(false);
      }
    );

    // Cleanup function
    return () => {
      unsubscribeService?.();
      unsubscribeOrders?.();
    };
  }, [serviceId, navigate, fetchClientName]);

  const handleViewLive = () => {
    navigate(`/services/${serviceId}`, { 
      state: { fromVendor: true } 
    });
  };

  const handleBackToServices = () => {
    navigate('/my-services');
  };

  if (loading) return <DetailSkeleton />;
  if (!service) return null;

  return (
    <Layout>
      <div className="bg-soft-gray min-vh-100 py-4">
        <Container>
          {/* Header Section */}
          <ServiceHeader 
            onBack={handleBackToServices}
            onViewLive={handleViewLive}
            onEdit={() => setIsEditModalOpen(true)}
          />

          <Row className="g-4">
            {/* Left Column - Service Details & Orders */}
            <Col lg={8}>
              <ServiceOverviewCard 
                service={service}
                activeOrders={activeOrders.length}
                completedOrders={completedOrders.length}
                netEarnings={performanceMetrics.netEarnings}
              />

              <OrderManagementCard 
                activeOrders={activeOrders}
                completedOrders={completedOrders}
                cancelledOrders={cancelledOrders}
              />
            </Col>

            {/* Right Column - Performance Stats */}
            <Col lg={4}>
              <PerformanceStatsCard 
                views={performanceMetrics.views}
                netEarnings={performanceMetrics.netEarnings}
                pendingRevenue={performanceMetrics.pendingRevenue}
                totalRevenue={performanceMetrics.totalRevenue}
              />
            </Col>
          </Row>

          {/* Edit Service Modal */}
          <AddServiceModal 
            open={isEditModalOpen} 
            onOpenChange={setIsEditModalOpen} 
            editService={service} 
          />
        </Container>
      </div>

      <style jsx>{`
        .bg-soft-gray { background-color: #f8fafc; }
        .bg-navy { background-color: #0f172a !important; }
        .x-small { font-size: 0.65rem; }
        .avatar-sm { 
          width: 32px; 
          height: 32px; 
          font-size: 0.8rem; 
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .modern-tabs .nav-link { 
          border: none !important; 
          color: #94a3b8; 
          padding: 12px 20px; 
          font-weight: 600; 
          font-size: 0.85rem; 
          transition: all 0.2s ease;
        }
        .modern-tabs .nav-link.active { 
          color: #3b82f6 !important; 
          background: rgba(59, 130, 246, 0.08) !important; 
          border-radius: 12px;
        }
        .modern-tabs .nav-link:hover:not(.active) {
          color: #64748b;
        }
        .custom-table thead th { 
          border: none; 
          font-size: 0.6rem; 
          color: #94a3b8 !important; 
          text-transform: uppercase; 
          font-weight: 600;
          letter-spacing: 0.5px;
        }
        .custom-table tbody tr {
          transition: background-color 0.2s ease;
        }
        .custom-table tbody tr:hover {
          background-color: rgba(59, 130, 246, 0.03);
        }
        .fit-content { width: fit-content; }
        .stat-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08) !important;
        }
        .sticky-sidebar {
          position: sticky;
          top: 24px;
        }
      `}</style>
    </Layout>
  );
}

// Header Component
const ServiceHeader = ({ onBack, onViewLive, onEdit }) => (
  <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
    <Button 
      variant="white" 
      onClick={onBack}
      className="shadow-sm border rounded-3 text-muted px-3 py-2 d-flex align-items-center fit-content"
    >
      <ArrowLeft size={16} className="me-2" /> Back to Services
    </Button>
    
    <div className="d-flex gap-2 flex-wrap">
      <Button 
        variant="white" 
        className="shadow-sm border rounded-3 px-3 py-2 d-flex align-items-center text-dark fw-semibold"
        onClick={onViewLive}
      >
        <Eye size={16} className="me-2 text-primary" /> View Live
      </Button>

      <Button 
        variant="dark" 
        className="shadow-sm border-0 rounded-3 px-4 py-2 d-flex align-items-center bg-navy"
        onClick={onEdit}
      >
        <Edit size={16} className="me-2" /> Edit Details
      </Button>
    </div>
  </div>
);

// Service Overview Card Component
const ServiceOverviewCard = ({ service, activeOrders, completedOrders, netEarnings }) => (
  <Card className="border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
    <Card.Body className="p-4 p-md-5">
      {/* Service Header */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <Badge 
          bg="primary" 
          className="bg-opacity-10 text-primary border-0 px-3 py-1 rounded-pill x-small fw-bold"
        >
          {service.category}
        </Badge>
        <div className="text-warning d-flex align-items-center">
          <Star size={14} className="fill-warning me-1" /> 
          <span className="fw-bold small">5.0</span>
        </div>
      </div>
      
      {/* Service Title */}
      <h1 className="fw-bold text-dark mb-4 fs-2">{service.title}</h1>
      
      {/* Stats Cards */}
      <Row className="g-3">
        <StatCard 
          icon={<Zap size={18} className="text-primary"/>} 
          label="Unit Price" 
          value={`$${service.price}`} 
        />
        <StatCard 
          icon={<ShoppingBag size={18} className="text-warning"/>} 
          label="Active Orders" 
          value={activeOrders} 
        />
        <StatCard 
          icon={<PackageCheck size={18} className="text-success"/>} 
          label="Completed" 
          value={completedOrders} 
        />
        <StatCard 
          icon={<DollarSign size={18} className="text-info"/>} 
          label="Revenue" 
          value={`$${netEarnings}`} 
        />
      </Row>

      {/* Description Section */}
      <div className="mt-5 pt-4 border-top">
        <div className="d-flex align-items-center text-muted mb-2">
          <FileText size={14} className="me-2" /> 
          <span className="fw-bold x-small text-uppercase">Service Description</span>
        </div>
        <p className="text-secondary mb-0 small">
          {service.description || "No description provided."}
        </p>
      </div>
    </Card.Body>
  </Card>
);

// Stat Card Component
const StatCard = ({ icon, label, value }) => (
  <Col xs={6} md={3}>
    <div className="p-3 rounded-4 bg-white border h-100 shadow-sm stat-card">
      <div className="mb-2 text-primary">{icon}</div>
      <div className="x-small text-muted fw-bold text-uppercase mb-1">{label}</div>
      <div className="h5 fw-bold m-0 text-dark">{value}</div>
    </div>
  </Col>
);

// Order Management Card Component
const OrderManagementCard = ({ activeOrders, completedOrders, cancelledOrders }) => (
  <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
    <Card.Body className="p-4">
      <h5 className="fw-bold mb-4 d-flex align-items-center">
        <ListFilter size={20} className="me-2 text-primary" /> Order Management
      </h5>
      
      <Tabs defaultActiveKey="active" className="modern-tabs border-0 mb-4">
        <Tab eventKey="active" title={`Active (${activeOrders.length})`}>
          <OrderListTable orders={activeOrders} statusType="active" />
        </Tab>
        <Tab eventKey="completed" title={`Completed (${completedOrders.length})`}>
          <OrderListTable orders={completedOrders} statusType="completed" />
        </Tab>
        <Tab eventKey="cancelled" title={`Cancelled (${cancelledOrders.length})`}>
          <OrderListTable orders={cancelledOrders} statusType="cancelled" />
        </Tab>
      </Tabs>
    </Card.Body>
  </Card>
);

// Order List Table Component
const OrderListTable = ({ orders, statusType }) => {
  if (orders.length === 0) {
    return (
      <div className="text-center py-5 border rounded-4 bg-white mt-2">
        <Inbox size={48} className="text-muted mb-3 opacity-20" />
        <h6 className="text-secondary fw-bold mb-2">No {statusType} orders found</h6>
        <p className="text-muted small mb-0">Orders will appear here once customers place them</p>
      </div>
    );
  }

  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'success';
      case 'cancelled': return 'danger';
      case 'pending': return 'warning';
      default: return 'secondary';
    }
  };

  return (
    <div className="table-responsive">
      <Table hover borderless className="align-middle mt-2 custom-table">
        <thead className="bg-light">
          <tr>
            <th>Order Details</th>
            <th>Customer</th>
            <th>Amount</th>
            <th className="text-end">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id}>
              <td>
                <div className="fw-bold text-dark">
                  #{order.id.slice(0, 8).toUpperCase()}
                </div>
                <div className="text-muted x-small d-flex align-items-center mt-1">
                  <Calendar size={12} className="me-1" /> 
                  {order.formattedDate}
                </div>
              </td>
              <td>
                <div className="d-flex align-items-center">
                  <div className="avatar-sm me-2 text-primary bg-primary bg-opacity-10 rounded-circle fw-bold">
                    {order.clientName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="fw-bold text-dark">{order.clientName}</div>
                    <Badge 
                      bg={getStatusBadgeColor(order.status)} 
                      className="border fw-normal x-small"
                    >
                      {order.status?.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </td>
              <td className="fw-bold text-dark">${order.total_amount || 0}</td>
              <td className="text-end">
                <Button 
                  variant="outline-primary" 
                  size="sm" 
                  className="rounded-pill px-3 shadow-none"
                  onClick={() => navigate(`/messages/${order.client_id}`)}
                >
                  <MessageSquare size={14} className="me-1" /> Chat
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

// Performance Stats Card Component
const PerformanceStatsCard = ({ views, netEarnings, pendingRevenue, totalRevenue }) => (
  <Card className="border-0 shadow-sm rounded-4 sticky-sidebar">
    <Card.Body className="p-4">
      <h5 className="fw-bold mb-4 d-flex align-items-center">
        <BarChart3 size={20} className="me-2 text-primary" /> Performance
      </h5>
      
      <DetailRow 
        label="Listing Views" 
        value={views.toLocaleString()} 
        icon={<Globe size={14} />} 
      />
      <DetailRow 
        label="Net Earnings" 
        value={`$${netEarnings}`} 
        isGreen 
      />
      <DetailRow 
        label="Pending Revenue" 
        value={`$${pendingRevenue}`} 
      />
      <DetailRow 
        label="Total Revenue" 
        value={`$${totalRevenue}`} 
        className="border-top pt-3 mt-3 fw-bold"
      />
    </Card.Body>
  </Card>
);

// Detail Row Component
const DetailRow = ({ label, value, isGreen, icon, className = '' }) => (
  <div className={`d-flex justify-content-between align-items-center mb-3 ${className}`}>
    <div className="text-muted small d-flex align-items-center">
      {icon && <span className="me-2 opacity-50">{icon}</span>}
      {label}
    </div>
    <span className={`fw-bold small ${isGreen ? 'text-success' : 'text-dark'}`}>
      {value}
    </span>
  </div>
);

// Loading Skeleton Component
const DetailSkeleton = () => (
  <div className="min-vh-100 d-flex align-items-center justify-content-center bg-white">
    <div className="text-center">
      <div className="spinner-border text-primary mb-3" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="text-muted small">Loading service details...</p>
    </div>
  </div>
);