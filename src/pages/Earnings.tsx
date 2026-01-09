import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ArrowLeft, 
  DollarSign, 
  TrendingUp, 
  ArrowUpRight,
  Calendar,
  Download,
  Wallet
} from 'lucide-react';

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
              Earnings
            </h1>
            <p className="text-muted-foreground mt-1">
              Track your revenue and manage withdrawals
            </p>
          </div>
          <Button variant="hero">
            <Wallet className="w-4 h-4 mr-2" />
            Withdraw Funds
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total Earnings</span>
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <p className="text-3xl font-bold text-foreground">${earningsData.totalEarnings.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground mt-1">All time</p>
          </div>

          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">This Month</span>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-foreground">${earningsData.thisMonth.toLocaleString()}</p>
            <div className="flex items-center gap-1 mt-1">
              <ArrowUpRight className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-500">+{growthPercentage}%</span>
              <span className="text-sm text-muted-foreground">vs last month</span>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Pending</span>
              <Calendar className="w-5 h-5 text-yellow-500" />
            </div>
            <p className="text-3xl font-bold text-foreground">${earningsData.pendingPayment.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground mt-1">Awaiting clearance</p>
          </div>

          <div className="bg-card rounded-xl border border-border p-6 bg-gradient-to-br from-primary/5 to-accent/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Available</span>
              <Wallet className="w-5 h-5 text-accent" />
            </div>
            <p className="text-3xl font-bold text-foreground">${earningsData.availableForWithdrawal.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground mt-1">Ready to withdraw</p>
          </div>
        </div>

        {/* Transactions */}
        <div className="bg-card rounded-xl border border-border">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Recent Transactions</h2>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>

          <div className="divide-y divide-border">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="p-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{transaction.service}</p>
                      <p className="text-sm text-muted-foreground">{transaction.client}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">+${transaction.amount}</p>
                    <p className="text-sm text-muted-foreground">{transaction.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-border text-center">
            <Button variant="ghost" size="sm">View All Transactions</Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
