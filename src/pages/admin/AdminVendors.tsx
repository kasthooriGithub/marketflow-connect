import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, MoreVertical, Check, X, Eye } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const mockVendors = [
  { id: '1', name: 'SearchPro Digital', email: 'contact@searchpro.com', services: 12, rating: 4.9, status: 'verified', revenue: '$45,000' },
  { id: '2', name: 'Social Buzz Agency', email: 'hello@socialbuzz.com', services: 8, rating: 4.8, status: 'verified', revenue: '$32,500' },
  { id: '3', name: 'PPC Masters', email: 'info@ppcmasters.com', services: 5, rating: 4.7, status: 'pending', revenue: '$0' },
  { id: '4', name: 'ContentCraft Pro', email: 'team@contentcraft.com', services: 15, rating: 4.9, status: 'verified', revenue: '$28,000' },
  { id: '5', name: 'BrandForge Studio', email: 'hi@brandforge.co', services: 6, rating: 5.0, status: 'verified', revenue: '$52,000' },
];

export default function AdminVendors() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredVendors = mockVendors.filter(vendor =>
    vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vendor.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout title="Vendors">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search vendors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="gradient">Export Vendors</Button>
      </div>

      {/* Vendors Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Vendor</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Services</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Rating</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Revenue</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVendors.map((vendor) => (
                <tr key={vendor.id} className="border-t border-border">
                  <td className="p-4">
                    <div>
                      <p className="font-medium text-foreground">{vendor.name}</p>
                      <p className="text-sm text-muted-foreground">{vendor.email}</p>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">{vendor.services}</td>
                  <td className="p-4 text-sm font-medium text-foreground">⭐ {vendor.rating}</td>
                  <td className="p-4 text-sm font-medium text-foreground">{vendor.revenue}</td>
                  <td className="p-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      vendor.status === 'verified' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {vendor.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" />
                          View Profile
                        </DropdownMenuItem>
                        {vendor.status === 'pending' && (
                          <>
                            <DropdownMenuItem className="text-green-600">
                              <Check className="w-4 h-4 mr-2" />
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <X className="w-4 h-4 mr-2" />
                              Reject
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
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
