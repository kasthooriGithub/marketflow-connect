import { useEffect, useState } from 'react';
import { AdminLayout } from 'components/layout/AdminLayout';
import { Button } from 'components/ui/button';
import { Search, MoreVertical, Eye, Edit, Trash2, Plus, Download } from 'lucide-react';
import { Card, Table, Form, InputGroup, Dropdown, Badge, Spinner, Modal } from 'react-bootstrap';
// Firebase Imports
import { 
  collection, 
  onSnapshot, 
  doc, 
  deleteDoc, 
  addDoc, 
  updateDoc,
  serverTimestamp,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from 'lib/firebase';

export default function AdminServices() {
  const [searchQuery, setSearchQuery] = useState('');
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [currentService, setCurrentService] = useState(null);
  const [formData, setFormData] = useState({ 
    title: '', 
    vendor_name: '', 
    category: '', 
    price: '',
    vendor_email: '' 
  });

  // --- 1. Real-time Data Fetching ---
  useEffect(() => {
    // Categories fetch pannuthal (Dropdown and Label mapping)
    const unsubCats = onSnapshot(collection(db, 'categories'), (snap) => {
      const catsList = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setCategories(catsList);
    });

    // Services fetch pannuthal
    const unsubServices = onSnapshot(collection(db, 'services'), async (snapshot) => {
      const servicesList = await Promise.all(snapshot.docs.map(async (serviceDoc) => {
        const data = serviceDoc.data();
        const sId = serviceDoc.id;

        // Rating calculation
        let avgRating = data.rating || 0;
        if (!data.rating) {
          const q = query(collection(db, 'reviews'), where('service_id', '==', sId));
          const rSnap = await getDocs(q);
          if (!rSnap.empty) {
            const total = rSnap.docs.reduce((acc, r) => acc + (r.data().rating || 0), 0);
            avgRating = (total / rSnap.size).toFixed(1);
          }
        }

        return { id: sId, ...data, rating: avgRating };
      }));
      setServices(servicesList);
      setLoading(false);
    });

    return () => { unsubCats(); unsubServices(); };
  }, []);

  // --- Helper: Get Category Name from ID ---
  const getCategoryName = (categoryId) => {
    // Intha logic ID-ai (e.g. 60ob...) Name-aaga (e.g. Graphic Design) maattrum
    const found = categories.find(c => c.id === categoryId);
    return found ? found.name : categoryId; 
  };

  // --- 2. Action Handlers ---
  const handleOpenModal = (service = null) => {
    if (service) {
      setCurrentService(service);
      setFormData({ 
        title: service.title || '', 
        vendor_name: service.vendor_name || '', 
        category: service.category || '', 
        price: service.price || '',
        vendor_email: service.vendor_email || ''
      });
    } else {
      setCurrentService(null);
      setFormData({ 
        title: '', 
        vendor_name: '', 
        category: categories[0]?.id || '', 
        price: '', 
        vendor_email: '' 
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        updated_at: serverTimestamp()
      };

      if (currentService) {
        await updateDoc(doc(db, 'services', currentService.id), payload);
      } else {
        await addDoc(collection(db, 'services'), {
          ...payload,
          total_orders: 0,
          total_reviews: 0,
          created_at: serverTimestamp()
        });
      }
      setShowModal(false);
    } catch (err) { alert("Error: " + err.message); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure?")) {
      await deleteDoc(doc(db, 'services', id));
    }
  };

  const filteredServices = services.filter(s =>
    (s.title?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (s.vendor_name?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout title="Services Management">
      <div className="d-flex flex-column flex-sm-row gap-3 mb-4">
        <InputGroup className="shadow-sm rounded-3 flex-grow-1">
          <InputGroup.Text className="bg-white border-end-0 ps-3">
            <Search size={18} className="text-muted" />
          </InputGroup.Text>
          <Form.Control
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-start-0 shadow-none py-2"
          />
        </InputGroup>
        <div className="d-flex gap-2">
          <Button onClick={() => handleOpenModal()} className="d-flex align-items-center gap-2 fw-bold px-4">
            <Plus size={18}/> Add New Service
          </Button>
        </div>
      </div>

      <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="table-responsive">
          <Table hover className="align-middle mb-0">
            <thead className="bg-light">
              <tr>
                <th className="px-4 py-3 text-muted small fw-bold text-uppercase border-0">Service</th>
                <th className="px-4 py-3 text-muted small fw-bold text-uppercase border-0">Vendor</th>
                <th className="px-4 py-3 text-muted small fw-bold text-uppercase border-0">Category</th>
                <th className="px-4 py-3 text-muted small fw-bold text-uppercase border-0">Price</th>
                <th className="px-4 py-3 text-muted small fw-bold text-uppercase border-0">Rating</th>
                <th className="px-4 py-3 text-muted small fw-bold text-uppercase border-0 text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="text-center py-5"><Spinner animation="border" size="sm" /></td></tr>
              ) : filteredServices.map((service) => (
                <tr key={service.id}>
                  <td className="px-4 py-3 fw-medium text-dark">{service.title}</td>
                  <td className="px-4 py-3 text-secondary small">{service.vendor_name}</td>
                  <td className="px-4 py-3">
                    <Badge bg="light" className="text-muted border px-3 py-2 fw-normal">
                      {/* Mapping ID to Name here */}
                      {getCategoryName(service.category)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 fw-bold text-dark">${service.price}</td>
                  <td className="px-4 py-3"><span className="text-warning">★</span> {service.rating}</td>
                  <td className="px-4 py-3 text-end">
                    <Dropdown align="end">
                      <Dropdown.Toggle as="div" className="btn btn-ghost p-0 cursor-pointer">
                        <MoreVertical size={18} className="text-muted" />
                      </Dropdown.Toggle>
                      <Dropdown.Menu className="shadow border-0 rounded-3">
                        <Dropdown.Item onClick={() => handleOpenModal(service)}><Edit size={16} className="me-2"/> Edit</Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item onClick={() => handleDelete(service.id)} className="text-danger"><Trash2 size={16} className="me-2"/> Delete</Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton className="border-0"><Modal.Title className="fw-bold">{currentService ? 'Edit Service' : 'Add New Service'}</Modal.Title></Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Title</Form.Label>
              <Form.Control required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Category</Form.Label>
              <Form.Select 
                required 
                value={formData.category} 
                onChange={e => setFormData({...formData, category: e.target.value})}
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <div className="row">
              <div className="col-6">
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold">Vendor Name</Form.Label>
                  <Form.Control required value={formData.vendor_name} onChange={e => setFormData({...formData, vendor_name: e.target.value})} />
                </Form.Group>
              </div>
              <div className="col-6">
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold">Price ($)</Form.Label>
                  <Form.Control type="number" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                </Form.Group>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer className="border-0">
            <Button variant="light" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <style>{`.btn-ghost:hover { background: #f8f9fa; border-radius: 50%; } .cursor-pointer { cursor: pointer; }`}</style>
    </AdminLayout>
  );
}