import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

export default function AdminSettings() {
  return (
    <AdminLayout title="Settings">
      <div className="max-w-2xl space-y-8">
        {/* General Settings */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="font-display text-lg font-semibold mb-4">General Settings</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">Site Name</Label>
              <Input id="siteName" defaultValue="MarketFlow" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="siteDescription">Site Description</Label>
              <Textarea id="siteDescription" defaultValue="The premier marketplace for digital marketing services" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input id="contactEmail" type="email" defaultValue="support@marketflow.com" />
            </div>
          </div>
        </div>

        {/* Commission Settings */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="font-display text-lg font-semibold mb-4">Commission Settings</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clientFee">Client Service Fee (%)</Label>
              <Input id="clientFee" type="number" defaultValue="5" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vendorCommission">Vendor Commission (%)</Label>
              <Input id="vendorCommission" type="number" defaultValue="10" />
            </div>
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="font-display text-lg font-semibold mb-4">Feature Toggles</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">New User Registration</p>
                <p className="text-sm text-muted-foreground">Allow new users to sign up</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Vendor Applications</p>
                <p className="text-sm text-muted-foreground">Accept new vendor applications</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Maintenance Mode</p>
                <p className="text-sm text-muted-foreground">Show maintenance page to users</p>
              </div>
              <Switch />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button variant="gradient">Save Changes</Button>
        </div>
      </div>
    </AdminLayout>
  );
}
