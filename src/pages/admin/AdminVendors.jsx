import { useState } from 'react';
import { AdminLayout } from 'components/admin/AdminLayout';
import { Button } from 'components/ui/button';
import { Search, MoreVertical, Check, X, Eye } from 'lucide-react';
import { Card, Table, Form, InputGroup, Dropdown, Badge } from 'react-bootstrap';

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
      <div className="d-flex flex-column flex-sm-row gap-3 mb-4">
        <div className="flex-grow-1">
          <InputGroup className="shadow-sm rounded-3">
            <InputGroup.Text className="bg-white border-end-0 ps-3">
              <Search size={18} className="text-muted" />
            </InputGroup.Text>
            <Form.Control
              placeholder="Search vendors by name or agency..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-start-0 shadow-none py-2"
            />
          </InputGroup>
        </div>
        <Button variant="outline-primary" className="px-4 shadow-sm fw-bold bg-white">Export Vendor List</Button>
      </div>

      {/* Vendors Table */}
      <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="table-responsive">
          <Table hover className="align-middle mb-0">
            <thead className="bg-light bg-opacity-50">
              <tr>
                <th className="px-4 py-3 text-muted small fw-bold text-uppercase tracking-wider border-0">Agency Details</th>
                <th className="px-4 py-3 text-muted small fw-bold text-uppercase tracking-wider border-0">Services</th>
                <th className="px-4 py-3 text-muted small fw-bold text-uppercase tracking-wider border-0">Rating</th>
                <th className="px-4 py-3 text-muted small fw-bold text-uppercase tracking-wider border-0">Revenue</th>
                <th className="px-4 py-3 text-muted small fw-bold text-uppercase tracking-wider border-0">Status</th>
                <th className="px-4 py-3 text-muted small fw-bold text-uppercase tracking-wider border-0 text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVendors.map((vendor) => (
                <tr key={vendor.id}>
                  <td className="px-4 py-3">
                    <div className="d-flex flex-column">
                      <span className="fw-bold text-dark">{vendor.name}</span>
                      <span className="text-muted small">{vendor.email}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-secondary small fw-medium">{vendor.services}</td>
                  <td className="px-4 py-3">
                    <div className="d-flex align-items-center gap-1 text-warning">
                      <span className="fw-bold text-dark small">{vendor.rating}</span>
                      <span className="text-warning">★</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 fw-bold text-dark">{vendor.revenue}</td>
                  <td className="px-4 py-3">
                    <Badge
                      bg={vendor.status === 'verified' ? 'success' : 'warning'}
                      className={`px-3 py-2 rounded-pill fw-medium ${vendor.status === 'pending' ? 'text-dark' : ''}`}
                      style={{ fontSize: '0.7rem' }}
                    >
                      {vendor.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-end">
                    <Dropdown align="end">
                      <Dropdown.Toggle as="div" className="btn btn-ghost btn-icon p-0 cursor-pointer">
                        <MoreVertical size={18} className="text-muted" />
                      </Dropdown.Toggle>
                      <Dropdown.Menu className="shadow-sm border-0 rounded-3">
                        <Dropdown.Item className="d-flex align-items-center gap-2 py-2">
                          <Eye size={16} /> View Profile
                        </Dropdown.Item>
                        {vendor.status === 'pending' && (
                          <>
                            <Dropdown.Divider />
                            <Dropdown.Item className="d-flex align-items-center gap-2 py-2 text-success fw-bold">
                              <Check size={16} /> Approve Agency
                            </Dropdown.Item>
                            <Dropdown.Item className="d-flex align-items-center gap-2 py-2 text-danger">
                              <X size={16} /> Reject Application
                            </Dropdown.Item>
                          </>
                        )}
                      </Dropdown.Menu>
                    </Dropdown>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card>
      <style>{`
        .table > :not(caption) > * > * {
            border-bottom-width: 1px;
            border-color: rgba(0,0,0,0.05);
        }
        .btn-ghost:hover { background-color: rgba(0,0,0,0.05); }
        .cursor-pointer { cursor: pointer; }
      `}</style>
    </AdminLayout>
  );
}
