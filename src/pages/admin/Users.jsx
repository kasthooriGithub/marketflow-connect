import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase'; 
import { 
  collection, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where 
} from 'firebase/firestore';
import { AdminLayout } from 'components/layout/AdminLayout';
import { Button } from 'components/ui/button';
import { Search, MoreVertical, Mail, Ban, Trash2, CheckCircle } from 'lucide-react';
import { Card, Table, Form, InputGroup, Dropdown, Badge } from 'react-bootstrap';
import { toast } from 'sonner';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // 1. Firebase Sync - Ungal screenshot-il ulla field names-ukku etrapadi maatriyullaen
  useEffect(() => {
    const q = query(collection(db, "users"), where("role", "==", "client"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersList);
      setLoading(false);
    }, (error) => {
      console.error("Firebase Error:", error);
      toast.error("Failed to load users");
    });

    return () => unsubscribe();
  }, []);

  // 2. Status Update Logic - Firebase-il "status" field-ai update seiyum
  const handleToggleStatus = async (user) => {
    try {
      const currentStatus = user.status || 'active';
      const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
      const userRef = doc(db, "users", user.id);
      
      await updateDoc(userRef, { 
        status: newStatus 
      });
      
      toast.success(`User status changed to ${newStatus}`);
    } catch (error) {
      toast.error("Firebase update failed");
    }
  };

  // 3. Export CSV Functionality
  const handleExport = () => {
    if (users.length === 0) return toast.error("No data to export");
    
    const headers = "Name,Email,Status,Joined Date\n";
    const rows = users.map(u => {
      // created_at field-ai format seigirom
      const date = u.created_at?.toDate ? u.created_at.toDate().toLocaleDateString('en-GB') : 'N/A';
      return `${u.full_name || u.display_name || u.name},${u.email},${u.status || 'active'},${date}`;
    }).join("\n");
    
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MarketFlow_Users.csv`;
    a.click();
    toast.success("Users list exported!");
  };

  const filteredUsers = users.filter(user =>
    (user.full_name || user.display_name || user.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout title="Users">
      {/* Search & Export Section */}
      <div className="d-flex flex-column flex-sm-row gap-3 mb-4">
        <div className="flex-grow-1">
          <InputGroup className="shadow-sm rounded-3">
            <InputGroup.Text className="bg-white border-end-0 ps-3">
              <Search size={18} className="text-muted" />
            </InputGroup.Text>
            <Form.Control
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-start-0 shadow-none py-2"
            />
          </InputGroup>
        </div>
        <Button onClick={handleExport} variant="outline-primary" className="px-4 shadow-sm fw-bold bg-white text-primary">
          Export List
        </Button>
      </div>

      <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="table-responsive">
          <Table hover className="align-middle mb-0">
            <thead className="bg-light">
              <tr>
                <th className="px-4 py-3 border-0 small fw-bold">USER DETAILS</th>
                <th className="px-4 py-3 border-0 small fw-bold">STATUS</th>
                <th className="px-4 py-3 border-0 small fw-bold">JOINED DATE</th>
                <th className="px-4 py-3 border-0 small fw-bold text-end">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {!loading && filteredUsers.map((user) => {
                // Formatting Date based on your Firebase field 'created_at'
                const displayDate = user.created_at?.toDate 
                  ? user.created_at.toDate().toLocaleDateString('en-GB') 
                  : "No Date";

                return (
                  <tr key={user.id}>
                    <td className="px-4 py-3">
                      <div className="d-flex flex-column">
                        <span className="fw-bold">{user.full_name || user.display_name || user.name || 'N/A'}</span>
                        <span className="text-muted small">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        bg={user.status === 'active' ? 'success' : 'danger'}
                        className="px-3 py-2 rounded-pill fw-medium text-capitalize"
                        style={{ fontSize: '0.75rem', minWidth: '80px' }}
                      >
                        {user.status || 'active'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-secondary small fw-medium">
                      {displayDate}
                    </td>
                    <td className="px-4 py-3 text-end">
                      <Dropdown align="end">
                        <Dropdown.Toggle as="div" className="btn btn-ghost btn-icon p-0 cursor-pointer">
                          <MoreVertical size={18} className="text-muted" />
                        </Dropdown.Toggle>
                        <Dropdown.Menu className="shadow-sm border-0 rounded-3">
                          <Dropdown.Item href={`mailto:${user.email}`} className="py-2">
                            <Mail size={16} className="me-2" /> Send Message
                          </Dropdown.Item>
                          <Dropdown.Item onClick={() => handleToggleStatus(user)} className="py-2">
                            {user.status === 'active' ? (
                              <><Ban size={16} className="text-warning me-2" /> Suspend User</>
                            ) : (
                              <><CheckCircle size={16} className="text-success me-2" /> Activate User</>
                            )}
                          </Dropdown.Item>
                          <Dropdown.Divider />
                          <Dropdown.Item onClick={() => deleteDoc(doc(db, "users", user.id))} className="py-2 text-danger">
                            <Trash2 size={16} className="me-2" /> Delete Account
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      </Card>
      
      <style>{`
        .table > :not(caption) > * > * { border-bottom-width: 1px; border-color: rgba(0,0,0,0.05); }
        .cursor-pointer { cursor: pointer; }
      `}</style>
    </AdminLayout>
  );
}