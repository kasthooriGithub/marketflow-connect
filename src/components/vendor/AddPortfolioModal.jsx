import { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { toast } from 'sonner';
import { useAuth } from 'contexts/AuthContext'; 
import { db } from 'lib/firebase';
import { collection, getDocs, query, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore';

export function AddPortfolioModal({ open, onOpenChange, onSave, editItem }) {
  const { user } = useAuth(); // gets the logged-in user's UID
  const [formData, setFormData] = useState({ title: '', description: '', image: '', category: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dbCategories, setDbCategories] = useState([]);

  useEffect(() => {
    if (open) {
      // Reset form or set to editItem
      setFormData({
        title: editItem?.title || '',
        description: editItem?.description || '',
        image: editItem?.image_url || '',
        category: editItem?.category || ''
      });
      
      const fetchCats = async () => {
        const querySnapshot = await getDocs(collection(db, 'categories'));
        setDbCategories(querySnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name })));
      };
      fetchCats();
    }
  }, [open, editItem]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.uid) return toast.error("Log in required");
    setIsSubmitting(true);

    try {
      const portfolioData = {
        vendor_id: user.uid, // Dynamic ID
        title: formData.title,
        description: formData.description,
        category: formData.category,
        image_url: formData.image, // Saved as image_url
        updated_at: serverTimestamp(),
      };

      if (editItem) {
        await updateDoc(doc(db, 'portfolio', editItem.id), portfolioData);
      } else {
        await addDoc(collection(db, 'portfolio'), { ...portfolioData, created_at: serverTimestamp() });
      }
      onOpenChange(false);
      toast.success("Saved!");
    } catch (error) {
      toast.error("Save failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={open} onHide={() => onOpenChange(false)} centered>
      <Modal.Header closeButton><Modal.Title>Project Details</Modal.Title></Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body className="d-flex flex-column gap-3">
          <Form.Group>
            <Form.Label>Title</Form.Label>
            <Form.Control value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
          </Form.Group>
          <Form.Group>
            <Form.Label>Category</Form.Label>
            <Form.Select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required>
              <option value="">Select Category</option>
              {dbCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </Form.Select>
          </Form.Group>
          <Form.Group>
            <Form.Label>Description</Form.Label>
            <Form.Control as="textarea" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
          </Form.Group>
          <Form.Group>
            <Form.Label>Image URL</Form.Label>
            <Form.Control value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Project'}</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}