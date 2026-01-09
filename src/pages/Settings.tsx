import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  User, 
  Bell, 
  Shield, 
  CreditCard,
  Palette,
  Save
} from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  
  const [notifications, setNotifications] = useState({
    email: true,
    orders: true,
    messages: true,
    marketing: false,
  });

  const handleSaveProfile = () => {
    toast.success('Profile updated successfully!');
  };

  const handleSaveNotifications = () => {
    toast.success('Notification preferences saved!');
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/dashboard" 
            className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="space-y-8">
          {/* Profile Section */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-display text-lg font-semibold">Profile Information</h2>
                <p className="text-sm text-muted-foreground">Update your personal details</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={handleSaveProfile}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-display text-lg font-semibold">Notifications</h2>
                <p className="text-sm text-muted-foreground">Manage how you receive updates</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-foreground">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive updates via email</p>
                </div>
                <Switch
                  checked={notifications.email}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, email: checked }))}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-foreground">Order Updates</p>
                  <p className="text-sm text-muted-foreground">Get notified about order status changes</p>
                </div>
                <Switch
                  checked={notifications.orders}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, orders: checked }))}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-foreground">Message Alerts</p>
                  <p className="text-sm text-muted-foreground">Receive notifications for new messages</p>
                </div>
                <Switch
                  checked={notifications.messages}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, messages: checked }))}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-foreground">Marketing Emails</p>
                  <p className="text-sm text-muted-foreground">Receive tips, updates, and offers</p>
                </div>
                <Switch
                  checked={notifications.marketing}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, marketing: checked }))}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={handleSaveNotifications}>
                <Save className="w-4 h-4 mr-2" />
                Save Preferences
              </Button>
            </div>
          </div>

          {/* Security Section */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-display text-lg font-semibold">Security</h2>
                <p className="text-sm text-muted-foreground">Manage your account security</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-foreground">Change Password</p>
                  <p className="text-sm text-muted-foreground">Update your account password</p>
                </div>
                <Button variant="outline" size="sm">
                  Change
                </Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-foreground">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                </div>
                <Button variant="outline" size="sm">
                  Enable
                </Button>
              </div>
            </div>
          </div>

          {/* Billing Section */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-display text-lg font-semibold">Billing & Payments</h2>
                <p className="text-sm text-muted-foreground">Manage your payment methods</p>
              </div>
            </div>

            <div className="text-center py-8 bg-muted/30 rounded-lg">
              <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">No payment methods added yet</p>
              <Button variant="outline">Add Payment Method</Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
