import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { orders } from '@/data/orders';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  ArrowLeft,
  MessageSquare,
  Eye
} from 'lucide-react';

const statusConfig = {
  pending: { label: 'Pending', icon: Clock, color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' },
  'in-progress': { label: 'In Progress', icon: AlertCircle, color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
  completed: { label: 'Completed', icon: CheckCircle, color: 'bg-green-500/10 text-green-600 border-green-500/20' },
  cancelled: { label: 'Cancelled', icon: XCircle, color: 'bg-red-500/10 text-red-600 border-red-500/20' },
};

export default function Orders() {
  const { user } = useAuth();
  
  // Filter orders based on user role
  const userOrders = user?.role === 'vendor'
    ? orders.filter(o => o.vendorId === user.id || o.vendorName === user.name)
    : orders.filter(o => o.clientId === user?.id || o.clientName === user?.name);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link 
              to="/dashboard" 
              className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              {user?.role === 'vendor' ? 'My Orders' : 'Order History'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {user?.role === 'vendor' 
                ? 'Manage orders from your clients' 
                : 'Track and manage your service orders'}
            </p>
          </div>
        </div>

        {/* Orders List */}
        {userOrders.length > 0 ? (
          <div className="space-y-4">
            {userOrders.map((order) => {
              const status = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending;
              const StatusIcon = status.icon;

              return (
                <div 
                  key={order.id} 
                  className="bg-card rounded-xl border border-border p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Package className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-semibold text-foreground truncate">
                              {order.serviceName}
                            </h3>
                            <Badge variant="outline" className={status.color}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {status.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {user?.role === 'vendor' 
                              ? `Client: ${order.clientName}` 
                              : `Vendor: ${order.vendorName}`}
                          </p>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <span>Order #{order.id}</span>
                            <span>•</span>
                            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                            <span>•</span>
                            <span className="font-semibold text-foreground">
                              ${order.amount.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link to="/messages">
                        <Button variant="outline" size="sm">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Message
                        </Button>
                      </Link>
                      <Link to={`/services/${order.serviceId}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          View Service
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Order Details */}
                  {order.status === 'in-progress' && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Expected delivery:</span>
                        <span className="font-medium text-foreground">
                          {order.expectedDelivery || 'TBD'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-card rounded-xl border border-border">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-display text-xl font-semibold text-foreground mb-2">
              No orders yet
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {user?.role === 'vendor' 
                ? 'When clients purchase your services, their orders will appear here.' 
                : 'Start exploring our marketplace to find the perfect services for your needs.'}
            </p>
            <Link to="/services">
              <Button variant="hero">Browse Services</Button>
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
}
