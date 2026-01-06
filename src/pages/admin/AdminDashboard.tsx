import { AdminLayout } from '@/components/admin/AdminLayout';
import { Users, Building2, Package, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

const stats = [
  { label: 'Total Users', value: '12,453', change: '+12%', trend: 'up', icon: Users },
  { label: 'Active Vendors', value: '2,487', change: '+8%', trend: 'up', icon: Building2 },
  { label: 'Total Services', value: '8,234', change: '+15%', trend: 'up', icon: Package },
  { label: 'Revenue (MTD)', value: '$45,678', change: '-3%', trend: 'down', icon: DollarSign },
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
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <stat.icon className="w-6 h-6 text-primary" />
              </div>
              <div className={`flex items-center gap-1 text-sm ${stat.trend === 'up' ? 'text-green-600' : 'text-red-500'}`}>
                {stat.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {stat.change}
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="font-display text-lg font-semibold">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Service</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Client</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Vendor</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Amount</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-t border-border">
                  <td className="p-4 text-sm font-medium text-foreground">{order.service}</td>
                  <td className="p-4 text-sm text-muted-foreground">{order.client}</td>
                  <td className="p-4 text-sm text-muted-foreground">{order.vendor}</td>
                  <td className="p-4 text-sm font-medium text-foreground">{order.amount}</td>
                  <td className="p-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      order.status === 'Completed' ? 'bg-green-100 text-green-700' :
                      order.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
