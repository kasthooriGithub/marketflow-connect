import { useState } from 'react';
import { AdminLayout } from 'components/layout/AdminLayout';
import { Button } from 'components/ui/button';
import { Search, MoreVertical, Eye, Edit, Trash2 } from 'lucide-react';
import { services as mockServices } from 'data/services';
import { Card, Table, Form, InputGroup, Dropdown, Badge } from 'react-bootstrap';

export default function AdminServices() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredServices = mockServices.filter(service =>
    service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.vendorName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout title="Services">
      {/* Header Actions */}
      <div className="d-flex flex-column flex-sm-row gap-3 mb-4">
        <div className="flex-grow-1">
          <InputGroup className="shadow-sm rounded-3">
            <InputGroup.Text className="bg-white border-end-0 ps-3">
              <Search size={18} className="text-muted" />
            </InputGroup.Text>
            <Form.Control
              placeholder="Search services by title or vendor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-start-0 shadow-none py-2"
            />
          </InputGroup>
        </div>
        <Button variant="default" className="px-4 shadow-sm fw-bold">Add New Service</Button>
      </div>

      {/* Services Table */}
      <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="table-responsive">
          <Table hover className="align-middle mb-0">
            <thead className="bg-light bg-opacity-50">
              <tr>
                <th className="px-4 py-3 text-muted small fw-bold text-uppercase tracking-wider border-0">Service</th>
                <th className="px-4 py-3 text-muted small fw-bold text-uppercase tracking-wider border-0">Vendor</th>
                <th className="px-4 py-3 text-muted small fw-bold text-uppercase tracking-wider border-0">Category</th>
                <th className="px-4 py-3 text-muted small fw-bold text-uppercase tracking-wider border-0">Price</th>
                <th className="px-4 py-3 text-muted small fw-bold text-uppercase tracking-wider border-0">Rating</th>
                <th className="px-4 py-3 text-muted small fw-bold text-uppercase tracking-wider border-0 text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredServices.map((service) => (
                <tr key={service.id}>
                  <td className="px-4 py-3">
                    <div className="fw-medium text-dark text-truncate" style={{ maxWidth: '250px' }}>{service.title}</div>
                  </td>
                  <td className="px-4 py-3 text-secondary small">{service.vendorName}</td>
                  <td className="px-4 py-3">
                    <Badge bg="light" className="text-muted border fw-normal text-capitalize px-2 py-1">
                      {service.category.replace('-', ' ')}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 fw-bold text-dark">${service.price}</td>
                  <td className="px-4 py-3">
                    <div className="d-flex align-items-center gap-1 text-warning">
                      <span className="fw-bold text-dark small">{service.rating}</span>
                      <span className="text-warning">★</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-end">
                    <Dropdown align="end">
                      <Dropdown.Toggle as="div" className="btn btn-ghost btn-icon p-0 cursor-pointer">
                        <MoreVertical size={18} className="text-muted" />
                      </Dropdown.Toggle>
                      <Dropdown.Menu className="shadow-sm border-0 rounded-3">
                        <Dropdown.Item className="d-flex align-items-center gap-2 py-2">
                          <Eye size={16} /> View Details
                        </Dropdown.Item>
                        <Dropdown.Item className="d-flex align-items-center gap-2 py-2">
                          <Edit size={16} /> Edit Service
                        </Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item className="d-flex align-items-center gap-2 py-2 text-danger">
                          <Trash2 size={16} /> Delete
                        </Dropdown.Item>
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
