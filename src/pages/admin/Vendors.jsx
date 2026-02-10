import { useEffect, useState } from 'react';
import { AdminLayout } from 'components/layout/AdminLayout';
import { Button } from 'components/ui/button';
import { Search, MoreVertical, Check, X, Eye, ShieldCheck, Download } from 'lucide-react';
import { Card, Table, Form, InputGroup, Dropdown, Badge, Spinner } from 'react-bootstrap';
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  query, 
  where, 
  updateDoc 
} from 'firebase/firestore';
import { db } from 'lib/firebase';

export default function AdminVendors() {
  const [searchQuery, setSearchQuery] = useState('');
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- 1. Fetch Vendors with Metrics ---
  const fetchVendorsData = async () => {
    try {
      setLoading(true);
      const vendorSnap = await getDocs(collection(db, 'vendors'));
      
      const vendorList = await Promise.all(vendorSnap.docs.map(async (vendorDoc) => {
        const vendorData = vendorDoc.data();
        const vendorId = vendorDoc.id;

        let email = 'N/A';
        if (vendorData.uid) {
          const userSnap = await getDoc(doc(db, 'users', vendorData.uid));
          if (userSnap.exists()) email = userSnap.data().email;
        }

        const servicesQuery = query(collection(db, 'services'), where('vendor_id', '==', vendorId));
        const servicesSnap = await getDocs(servicesQuery);

        const reviewsQuery = query(collection(db, 'reviews'), where('vendor_id', '==', vendorId));
        const reviewsSnap = await getDocs(reviewsQuery);
        let avgRating = 0;
        if (!reviewsSnap.empty) {
          const totalRating = reviewsSnap.docs.reduce((acc, curr) => acc + (curr.data().rating || 0), 0);
          avgRating = (totalRating / reviewsSnap.size).toFixed(1);
        }

        const ordersQuery = query(
          collection(db, 'orders'), 
          where('vendor_id', '==', vendorId),
          where('status', '==', 'completed')
        );
        const ordersSnap = await getDocs(ordersQuery);
        const totalGross = ordersSnap.docs.reduce((acc, curr) => {
          const amt = Number(curr.data().total_amount);
          return acc + (isNaN(amt) ? 0 : amt);
        }, 0);

        return {
          id: vendorId,
          name: vendorData.agency_name || vendorData.vendor_name || 'Unnamed Agency',
          email,
          services: servicesSnap.size,
          rating: Number(avgRating),
          grossRevenue: totalGross,
          vendorEarnings: totalGross * 0.90,
          isVerified: vendorData.is_verified || false,
          isBlocked: vendorData.is_blocked || false,
        };
      }));

      setVendors(vendorList);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendorsData();
  }, []);

  // --- 2. CSV Export Logic ---
  const exportToCSV = () => {
    if (vendors.length === 0) return;

    // Define CSV headers
    const headers = ["Agency Name", "Email", "Services", "Rating", "Total Gross ($)", "Vendor Share (90%)", "Status"];
    
    // Map data to rows
    const rows = vendors.map(v => [
      `"${v.name}"`,
      v.email,
      v.services,
      v.rating,
      v.grossRevenue,
      v.vendorEarnings,
      v.isBlocked ? "Blocked" : (v.isVerified ? "Verified" : "Standard")
    ]);

    // Combine headers and rows
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Vendor_List_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- 3. Toggle Status Functions ---
  const toggleVerification = async (vendorId, currentStatus) => {
    try {
      await updateDoc(doc(db, 'vendors', vendorId), { is_verified: !currentStatus });
      fetchVendorsData();
    } catch (e) { alert("Error updating verification"); }
  };

  const toggleBlock = async (vendorId, currentStatus) => {
    try {
      const confirmMsg = currentStatus ? "Unblock this vendor?" : "Block this vendor? They won't be able to provide services.";
      if (window.confirm(confirmMsg)) {
        await updateDoc(doc(db, 'vendors', vendorId), { is_blocked: !currentStatus });
        fetchVendorsData();
      }
    } catch (e) { alert("Error updating block status"); }
  };

  const filteredVendors = vendors.filter(v => 
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    v.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout title="Vendors Dashboard">
      {/* Header Section with Search and Export */}
      <div className="d-flex justify-content-between align-items-center mb-4 gap-3">
        <InputGroup className="shadow-sm rounded-3 w-50">
          <InputGroup.Text className="bg-white border-end-0"><Search size={18}/></InputGroup.Text>
          <Form.Control 
            placeholder="Search vendors..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-start-0 shadow-none"
          />
        </InputGroup>

        <Button 
          variant="outline-primary" 
          className="d-flex align-items-center gap-2 shadow-sm rounded-3 px-4"
          onClick={exportToCSV}
        >
          <Download size={18} />
          Export List
        </Button>
      </div>

      <Card className="border-0 shadow-sm rounded-4">
        <div className="table-responsive">
          <Table hover className="align-middle mb-0">
            <thead className="bg-light">
              <tr>
                <th className="px-4 py-3 border-0 text-uppercase small fw-bold text-muted">Vendor Details</th>
                <th className="px-4 py-3 border-0 text-uppercase small fw-bold text-muted">Services</th>
                <th className="px-4 py-3 border-0 text-uppercase small fw-bold text-muted">Rating</th>
                <th className="px-4 py-3 border-0 text-uppercase small fw-bold text-muted">Net Earnings (90%)</th>
                <th className="px-4 py-3 border-0 text-uppercase small fw-bold text-muted">Verification</th>
                <th className="px-4 py-3 border-0 text-uppercase small fw-bold text-muted text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="text-center py-5"><Spinner animation="border" size="sm" variant="primary"/> <span className="ms-2">Loading vendors...</span></td></tr>
              ) : filteredVendors.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-5 text-muted">No vendors found.</td></tr>
              ) : (
                filteredVendors.map((vendor) => (
                  <tr key={vendor.id} className={vendor.isBlocked ? 'bg-light opacity-75' : ''}>
                    <td className="px-4 py-3">
                      <div className="fw-bold text-dark">{vendor.name}</div>
                      <div className="text-muted small">{vendor.email}</div>
                    </td>
                    <td className="px-4 py-3"><Badge bg="secondary" pill className="px-3">{vendor.services}</Badge></td>
                    <td className="px-4 py-3 text-warning">★ <span className="text-dark fw-medium">{vendor.rating}</span></td>
                    <td className="px-4 py-3">
                      <div className="fw-bold text-success">${(vendor.vendorEarnings || 0).toLocaleString()}</div>
                      <div className="text-muted" style={{fontSize: '0.7rem'}}>Gross: ${(vendor.grossRevenue || 0).toLocaleString()}</div>
                    </td>
                    <td className="px-4 py-3">
                      {vendor.isVerified ? (
                        <Badge bg="success" className="d-flex align-items-center gap-1 w-fit px-2 py-1"><ShieldCheck size={12}/> Verified</Badge>
                      ) : (
                        <Badge bg="warning" text="dark" className="px-2 py-1">Standard</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-end">
                      <Dropdown align="end">
                        <Dropdown.Toggle as="div" className="btn btn-link p-0 text-muted"><MoreVertical size={20}/></Dropdown.Toggle>
                        <Dropdown.Menu className="shadow border-0">
                          <Dropdown.Item onClick={() => toggleVerification(vendor.id, vendor.isVerified)}>
                            {vendor.isVerified ? "Remove Verified Badge" : "Verify Agency"}
                          </Dropdown.Item>
                          <Dropdown.Divider />
                          <Dropdown.Item 
                            className={vendor.isBlocked ? "text-success" : "text-danger"} 
                            onClick={() => toggleBlock(vendor.id, vendor.isBlocked)}
                          >
                            {vendor.isBlocked ? "Unblock Vendor" : "Block/Reject Vendor"}
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      </Card>
    </AdminLayout>
  );
}