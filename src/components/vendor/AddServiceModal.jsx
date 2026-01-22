import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Trash2 } from 'lucide-react';
import { Button } from 'components/ui/button';
import { Input } from 'components/ui/input';
import { Label } from 'components/ui/label';
import { Textarea } from 'components/ui/textarea';
import { Switch } from 'components/ui/switch';
import { Badge } from 'components/ui/badge';
import { useVendorServices } from 'contexts/VendorServicesContext';
import { toast } from 'sonner';
import { Modal, Form } from 'react-bootstrap';

const deliveryTimeOptions = [
  '1-2 days',
  '2-3 days',
  '3-5 days',
  '5-7 days',
  '7-10 days',
  '10-14 days',
  '2-3 weeks',
  'Ongoing',
];

const getInitialFormData = (service) => ({
  title: service?.title || '',
  description: service?.description || '',
  longDescription: service?.longDescription || '',
  category: service?.category || '',
  price: service?.price || 0,
  priceType: service?.priceType || 'one-time',
  deliveryTime: service?.deliveryTime || '3-5 days',
  features: service?.features?.length ? [...service.features] : [''],
  tags: service?.tags?.length ? [...service.tags] : [],
  available: true,
});

export function AddServiceModal({ open, onOpenChange, editService }) {
  const navigate = useNavigate();
  const { addService, updateService, categories } = useVendorServices();

  const [formData, setFormData] = useState(() => getInitialFormData(editService));
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = !!editService;

  useEffect(() => {
    if (open) {
      setFormData(getInitialFormData(editService));
      setTagInput('');
    }
  }, [open, editService]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData(prev => ({ ...prev, features: newFeatures }));
  };

  const addFeature = () => {
    setFormData(prev => ({ ...prev, features: [...prev.features, ''] }));
  };

  const removeFeature = (index) => {
    if (formData.features.length > 1) {
      const newFeatures = formData.features.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, features: newFeatures }));
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) { toast.error('Please enter a service title'); return; }
    if (!formData.description.trim()) { toast.error('Please enter a description'); return; }
    if (!formData.category) { toast.error('Please select a category'); return; }
    if (formData.price <= 0) { toast.error('Please enter a valid price'); return; }

    setIsSubmitting(true);

    try {
      const cleanedFeatures = formData.features.filter(f => f.trim());
      if (cleanedFeatures.length === 0) {
        toast.error('Please add at least one feature');
        setIsSubmitting(false);
        return;
      }

      const serviceData = {
        ...formData,
        features: cleanedFeatures,
        longDescription: formData.longDescription || formData.description,
      };

      if (isEditMode && editService) {
        updateService(editService.id, serviceData);
        toast.success('Service updated successfully!');
        onOpenChange(false);
      } else {
        const newService = addService(serviceData);
        toast.success('Service created successfully!');
        onOpenChange(false);
        navigate(`/services/${newService.id}`);
      }
    } catch (error) {
      toast.error(isEditMode ? 'Failed to update service.' : 'Failed to create service.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={open} onHide={() => onOpenChange(false)} size="lg" centered scrollable>
      <Modal.Header closeButton>
        <Modal.Title className="h5 fw-bold">
          {isEditMode ? 'Edit Service' : 'Add New Service'}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4">
        <p className="text-muted small mb-4">
          {isEditMode
            ? 'Update your service listing details'
            : 'Create a new service listing for your clients to purchase'}
        </p>

        <Form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
          <Form.Group>
            <Label htmlFor="title">Service Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Professional SEO Audit & Strategy"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              maxLength={100}
            />
          </Form.Group>

          <Form.Group>
            <Label htmlFor="category">Category *</Label>
            <Form.Select
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
            >
              <option value="" disabled>Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group>
            <Label htmlFor="description">Short Description *</Label>
            <Textarea
              id="description"
              placeholder="Brief overview of your service (max 200 characters)"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              maxLength={200}
              rows={2}
            />
            <Form.Text className="text-muted small d-block text-end">{formData.description.length}/200</Form.Text>
          </Form.Group>

          <Form.Group>
            <Label htmlFor="longDescription">Detailed Description</Label>
            <Textarea
              id="longDescription"
              placeholder="Provide a detailed description of what clients will receive..."
              value={formData.longDescription}
              onChange={(e) => handleInputChange('longDescription', e.target.value)}
              rows={4}
            />
          </Form.Group>

          <div className="row g-3">
            <div className="col-6">
              <Form.Group>
                <Label htmlFor="price">Price ($) *</Label>
                <Input
                  id="price"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="499"
                  value={formData.price || ''}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                />
              </Form.Group>
            </div>
            <div className="col-6">
              <Form.Group>
                <Label htmlFor="priceType">Pricing Type *</Label>
                <Form.Select
                  value={formData.priceType}
                  onChange={(e) => handleInputChange('priceType', e.target.value)}
                >
                  <option value="one-time">One-time</option>
                  <option value="monthly">Monthly</option>
                  <option value="hourly">Hourly</option>
                </Form.Select>
              </Form.Group>
            </div>
          </div>

          <Form.Group>
            <Label htmlFor="deliveryTime">Delivery Time</Label>
            <Form.Select
              value={formData.deliveryTime}
              onChange={(e) => handleInputChange('deliveryTime', e.target.value)}
            >
              {deliveryTimeOptions.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group>
            <Label>Features Included *</Label>
            <div className="d-flex flex-column gap-2">
              {formData.features.map((feature, index) => (
                <div key={index} className="d-flex gap-2">
                  <Input
                    placeholder={`Feature ${index + 1}`}
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                  />
                  {formData.features.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFeature(index)}
                      className="text-danger p-0"
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addFeature}
                className="w-100"
              >
                <Plus size={16} className="me-2" />
                Add Feature
              </Button>
            </div>
          </Form.Group>

          <Form.Group>
            <Label>Tags</Label>
            <div className="d-flex gap-2 mb-2">
              <Input
                placeholder="Add a tag"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" variant="outline" onClick={addTag}>
                Add
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="d-flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="d-inline-flex align-items-center gap-1">
                    {tag}
                    <span
                      role="button"
                      onClick={() => removeTag(tag)}
                      className="ms-1 hover-text-danger cursor-pointer"
                    >
                      <X size={12} />
                    </span>
                  </Badge>
                ))}
              </div>
            )}
          </Form.Group>

          <div className="d-flex align-items-center justify-content-between p-3 border rounded bg-light">
            <div>
              <Label htmlFor="available" className="mb-0">Service Available</Label>
              <p className="small text-muted mb-0">
                Make this service visible to clients
              </p>
            </div>
            <Switch
              id="available"
              checked={formData.available}
              onCheckedChange={(checked) => handleInputChange('available', checked)}
            />
          </div>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="button" onClick={handleSubmit} variant="primary" disabled={isSubmitting}>
          {isSubmitting
            ? (isEditMode ? 'Saving...' : 'Creating...')
            : (isEditMode ? 'Save Changes' : 'Create Service')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
