import { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { toast } from 'sonner';

const categoryOptions = [
  'SEO',
  'Social Media',
  'Content Marketing',
  'Web Design',
  'Branding',
  'Video Production',
  'Photography',
  'Copywriting',
  'PPC',
  'Email Marketing',
  'Other',
];

const getInitialFormData = (item) => ({
  title: item?.title || '',
  description: item?.description || '',
  image: item?.image || '',
  category: item?.category || '',
});

export function AddPortfolioModal({ open, onOpenChange, onSave, editItem }) {
  const [formData, setFormData] = useState(() => getInitialFormData(editItem));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = !!editItem;

  useEffect(() => {
    if (open) {
      setFormData(getInitialFormData(editItem));
    }
  }, [open, editItem]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Please enter a project title');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Please enter a description');
      return;
    }
    if (!formData.category) {
      toast.error('Please select a category');
      return;
    }

    setIsSubmitting(true);

    try {
      const portfolioItem = {
        id: editItem?.id || `portfolio-${Date.now()}`,
        title: formData.title.trim(),
        description: formData.description.trim(),
        image: formData.image.trim() || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800',
        category: formData.category,
      };

      onSave(portfolioItem);
      toast.success(isEditMode ? 'Portfolio item updated!' : 'Portfolio item added!');
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to save portfolio item.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={open} onHide={() => onOpenChange(false)} centered size="lg">
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="h5 fw-bold">
          {isEditMode ? 'Edit Portfolio Item' : 'Add Portfolio Item'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="pt-2">
        <p className="text-secondary small mb-4">
          {isEditMode
            ? 'Update your portfolio project details'
            : 'Showcase your best work to attract potential clients'}
        </p>

        <Form onSubmit={handleSubmit} className="d-flex flex-column gap-4">
          <Form.Group>
            <Form.Label className="small fw-semibold">Project Title *</Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g., E-commerce SEO Overhaul"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              maxLength={100}
              required
            />
          </Form.Group>

          <Form.Group>
            <Form.Label className="small fw-semibold">Category *</Form.Label>
            <Form.Select
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              required
            >
              <option value="">Select a category</option>
              {categoryOptions.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group>
            <Form.Label className="small fw-semibold">Description *</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Describe the project and results achieved..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              maxLength={300}
              required
            />
            <div className="d-flex justify-content-end mt-1">
              <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                {formData.description.length}/300
              </span>
            </div>
          </Form.Group>

          <Form.Group>
            <Form.Label className="small fw-semibold">Image URL</Form.Label>
            <Form.Control
              type="url"
              placeholder="https://example.com/project-image.jpg"
              value={formData.image}
              onChange={(e) => handleInputChange('image', e.target.value)}
            />
            <Form.Text className="text-muted" style={{ fontSize: '0.75rem' }}>
              Leave empty to use a placeholder image
            </Form.Text>
          </Form.Group>

          <div className="d-flex justify-content-end gap-2 mt-2">
            <Button
              variant="outline-secondary"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? (isEditMode ? 'Saving...' : 'Adding...')
                : (isEditMode ? 'Save Changes' : 'Add to Portfolio')}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
