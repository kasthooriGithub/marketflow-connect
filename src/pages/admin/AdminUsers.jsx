import { useState } from 'react';
import { AdminLayout } from 'components/layout/AdminLayout';
import { Button } from 'components/ui/button';
import { Search, MoreVertical, Mail, Ban, Trash2 } from 'lucide-react';
import { Card, Table, Form, InputGroup, Dropdown, Badge } from 'react-bootstrap';

const mockUsers = [
  { id: '1', name: 'John Smith', email: 'john@example.com', role: 'client', status: 'active', joined: '2024-01-15' },
  { id: '2', name: 'Jane Doe', email: 'jane@example.com', role: 'client', status: 'active', joined: '2024-02-20' },
  { id: '3', name: 'Bob Wilson', email: 'bob@example.com', role: 'client', status: 'inactive', joined: '2023-11-10' },
  { id: '4', name: 'Alice Brown', email: 'alice@example.com', role: 'client', status: 'active', joined: '2024-03-05' },
  { id: '5', name: 'Charlie Davis', email: 'charlie@example.com', role: 'client', status: 'suspended', joined: '2023-09-22' },
];

export default function AdminUsers() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = mockUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout title="Users">
      {/* Header Actions */}
      <div className="d-flex flex-column flex-sm-row gap-3 mb-4">
        <div className="flex-grow-1">
          <InputGroup className="shadow-sm rounded-3">
            <InputGroup.Text className="bg-white border-end-0 ps-3">
              <Search size={18} className="text-muted" />
            </InputGroup.Text>
            <Form.Control
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-start-0 shadow-none py-2"
            />
          </InputGroup>
        </div>
        <Button variant="outline-primary" className="px-4 shadow-sm fw-bold bg-white">Export Users List</Button>
      </div>

      {/* Users Table */}
      <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="table-responsive">
          <Table hover className="align-middle mb-0">
            <thead className="bg-light bg-opacity-50">
              <tr>
                <th className="px-4 py-3 text-muted small fw-bold text-uppercase tracking-wider border-0">User Details</th>
                <th className="px-4 py-3 text-muted small fw-bold text-uppercase tracking-wider border-0">Role</th>
                <th className="px-4 py-3 text-muted small fw-bold text-uppercase tracking-wider border-0">Status</th>
                <th className="px-4 py-3 text-muted small fw-bold text-uppercase tracking-wider border-0">Joined Date</th>
                <th className="px-4 py-3 text-muted small fw-bold text-uppercase tracking-wider border-0 text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-4 py-3">
                    <div className="d-flex flex-column">
                      <span className="fw-bold text-dark">{user.name}</span>
                      <span className="text-muted small">{user.email}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-secondary small">
                    <Badge bg="light" className="text-primary border fw-medium text-capitalize px-3 py-1">
                      {user.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      bg={
                        user.status === 'active' ? 'success' :
                          user.status === 'inactive' ? 'secondary' :
                            'danger'
                      }
                      className="px-3 py-2 rounded-pill fw-medium"
                      style={{ fontSize: '0.7rem' }}
                    >
                      {user.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-secondary small fw-medium">{user.joined}</td>
                  <td className="px-4 py-3 text-end">
                    <Dropdown align="end">
                      <Dropdown.Toggle as="div" className="btn btn-ghost btn-icon p-0 cursor-pointer">
                        <MoreVertical size={18} className="text-muted" />
                      </Dropdown.Toggle>
                      <Dropdown.Menu className="shadow-sm border-0 rounded-3">
                        <Dropdown.Item className="d-flex align-items-center gap-2 py-2">
                          <Mail size={16} /> Send Message
                        </Dropdown.Item>
                        <Dropdown.Item className="d-flex align-items-center gap-2 py-2">
                          <Ban size={16} /> Suspend User
                        </Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item className="d-flex align-items-center gap-2 py-2 text-danger">
                          <Trash2 size={16} /> Delete Account
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
