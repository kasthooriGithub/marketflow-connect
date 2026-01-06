import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Heart, 
  MessageSquare, 
  Settings,
  Plus,
  Package,
  TrendingUp,
  Users,
  DollarSign
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();

  const clientStats = [
    { label: 'Active Orders', value: '3', icon: ShoppingBag },
    { label: 'Saved Services', value: '12', icon: Heart },
    { label: 'Messages', value: '5', icon: MessageSquare },
  ];

  const vendorStats = [
    { label: 'Active Services', value: '8', icon: Package },
    { label: 'Total Orders', value: '47', icon: ShoppingBag },
    { label: 'Revenue', value: '$12,450', icon: DollarSign },
    { label: 'Profile Views', value: '1,234', icon: TrendingUp },
  ];

  const stats = user?.role === 'vendor' ? vendorStats : clientStats;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-muted-foreground">
              {user?.role === 'vendor' 
                ? 'Manage your services and track your performance' 
                : 'Manage your orders and discover new services'}
            </p>
          </div>
          {user?.role === 'vendor' && (
            <Button variant="gradient" className="mt-4 md:mt-0">
              <Plus className="w-4 h-4 mr-2" />
              Add New Service
            </Button>
          )}
        </div>

        {/* Stats Grid */}
        <div className={`grid gap-6 mb-8 ${user?.role === 'vendor' ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
          {stats.map((stat) => (
            <div key={stat.label} className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="font-display text-lg font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">New order received</p>
                  <p className="text-xs text-muted-foreground">SEO Audit Package • 2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">New message</p>
                  <p className="text-xs text-muted-foreground">From SearchPro Digital • 5 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Order completed</p>
                  <p className="text-xs text-muted-foreground">Social Media Package • Yesterday</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="font-display text-lg font-semibold mb-4">Quick Links</h2>
            <div className="grid grid-cols-2 gap-3">
              <Link to="/services" className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <LayoutDashboard className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Browse Services</span>
              </Link>
              <Link to="/dashboard" className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <ShoppingBag className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">My Orders</span>
              </Link>
              <Link to="/dashboard" className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <MessageSquare className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Messages</span>
              </Link>
              <Link to="/dashboard" className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <Settings className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Settings</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
