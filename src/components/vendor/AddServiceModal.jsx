import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Trash2 } from 'lucide-react';
import { Button } from 'components/ui/button';
import { Input } from 'components/ui/input';
import { Label } from 'components/ui/label';
import { Textarea } from 'components/ui/textarea';
import { Switch } from 'components/ui/switch';
import { Badge } from 'components/ui/badge';
import { toast } from 'sonner';
import { Modal, Form, Spinner } from 'react-bootstrap';
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  getDocs,
  query
} from 'firebase/firestore';
import { db } from 'lib/firebase';
import { useAuth } from 'contexts/AuthContext';

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

// Default categories if Firestore collection doesn't exist
const DEFAULT_CATEGORIES = [
  { id: 'web-development', name: 'Web Development', icon: '💻' },
  { id: 'graphic-design', name: 'Graphic Design', icon: '🎨' },
  { id: 'digital-marketing', name: 'Digital Marketing', icon: '📈' },
  { id: 'content-writing', name: 'Content Writing', icon: '✍️' },
  { id: 'video-editing', name: 'Video Editing', icon: '🎬' },
  { id: 'seo', name: 'SEO Services', icon: '🔍' },
  { id: 'consulting', name: 'Consulting', icon: '💼' },
  { id: 'social-media', name: 'Social Media', icon: '📱' },
  { id: 'mobile-app', name: 'Mobile App', icon: '📱' },
  { id: 'ecommerce', name: 'E-commerce', icon: '🛒' },
];

const getInitialFormData = (service) => ({
  title: service?.title || '',
  description: service?.description || '',
  longDescription: service?.longDescription || '',
  category: service?.category || '',
  price: service?.price || 0,
  priceType: service?.priceType || 'one-time',
  deliveryTime: service?.deliveryTime || '3-5 days',
  features: service?.features?.length ? [...service.features] : ['Professional quality work', 'Fast delivery', 'Unlimited revisions'],
  tags: service?.tags?.length ? [...service.tags] : [],
  is_active: service?.is_active !== undefined ? service.is_active : true,
  featured: service?.featured || false,
});

export function AddServiceModal({ open, onOpenChange, editService }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState(() => getInitialFormData(editService));
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const isEditMode = !!editService;

  // Fetch categories from Firestore
  useEffect(() => {
    const fetchCategories = async () => {
      if (!open) return;

      setLoadingCategories(true);
      try {
        console.log('🔍 Fetching categories from Firestore...');

        // Try to fetch from Firestore
        const categoriesQuery = query(collection(db, 'categories'));
        const categoriesSnapshot = await getDocs(categoriesQuery);

        if (!categoriesSnapshot.empty) {
          const categoriesList = categoriesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          console.log('✅ Categories fetched from Firestore:', categoriesList);
          setCategories(categoriesList);
        } else {
          // If no categories in Firestore, use default ones
          console.log('ℹ️ No categories in Firestore, using defaults');
          setCategories(DEFAULT_CATEGORIES);

          // Optional: Create default categories in Firestore
          try {
            for (const category of DEFAULT_CATEGORIES) {
              await addDoc(collection(db, 'categories'), {
                name: category.name,
                icon: category.icon,
                description: `${category.name} services`,
                created_at: serverTimestamp(),
                updated_at: serverTimestamp(),
              });
            }
            console.log('✅ Default categories created in Firestore');
          } catch (createError) {
            console.log('⚠️ Could not create default categories:', createError.message);
          }
        }
      } catch (error) {
        console.error('❌ Error fetching categories:', error);
        console.log('⚠️ Using default categories due to error');
        setCategories(DEFAULT_CATEGORIES);
      } finally {
        setLoadingCategories(false);
      }
    };

    if (open) {
      fetchCategories();
      setFormData(getInitialFormData(editService));
      setTagInput('');
      setValidationErrors({});
    }
  }, [open, editService]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation error when user types
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: null }));
    }
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

  const validateForm = () => {
    const errors = {};

    if (!formData.title.trim()) {
      errors.title = 'Please enter a service title';
    }

    if (!formData.description.trim()) {
      errors.description = 'Please enter a description';
    }

    if (!formData.category) {
      errors.category = 'Please select a category';
    }

    if (formData.price <= 0) {
      errors.price = 'Please enter a valid price';
    }

    // Check if at least one feature has text
    const hasValidFeatures = formData.features.some(feature => feature.trim() !== '');
    if (!hasValidFeatures) {
      errors.features = 'Please add at least one feature';
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🎯 Form submit started');
    console.log('📊 Form data:', formData);
    console.log('👤 User:', user?.uid);

    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      console.log('❌ Validation errors:', errors);
      setValidationErrors(errors);

      // Show first error as toast
      const firstErrorKey = Object.keys(errors)[0];
      toast.error(errors[firstErrorKey]);
      return;
    }

    setIsSubmitting(true);
    console.log('✅ Form validation passed');

    try {
      const cleanedFeatures = formData.features.filter(f => f.trim());

      const selectedCategory = categories.find(cat => cat.id === formData.category);

      const serviceData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        longDescription: formData.longDescription?.trim() || formData.description.trim(),
        category: formData.category,
        category_slug: selectedCategory?.slug || '',
        price: Number(formData.price),
        priceType: formData.priceType,
        deliveryTime: formData.deliveryTime,
        features: cleanedFeatures,
        tags: formData.tags,
        is_active: formData.is_active,
        featured: formData.featured,
        vendor_id: user?.uid,
        vendor_name: user?.full_name || user?.name || 'Unknown Vendor',
        vendor_email: user?.email || 'unknown@email.com',
        vendor_photo_url: user?.photo_url || '',
        average_rating: 0,
        total_reviews: 0,
        total_orders: 0,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      };

      console.log('📦 Service data to save:', serviceData);

      if (isEditMode && editService) {
        console.log('✏️ Updating service:', editService.id);
        const serviceRef = doc(db, 'services', editService.id);
        await updateDoc(serviceRef, {
          ...serviceData,
          updated_at: serverTimestamp(),
        });

        console.log('✅ Service updated successfully');
        toast.success('Service updated successfully!');
        onOpenChange(false);
      } else {
        console.log('🆕 Creating new service...');

        // Check if services collection exists, if not it will be auto-created
        const docRef = await addDoc(collection(db, 'services'), serviceData);

        console.log('✅ Service created with ID:', docRef.id);
        toast.success('Service created successfully!');

        // Close modal first
        onOpenChange(false);

        // Navigate to the new service page after a delay
        setTimeout(() => {
          navigate(`/services/${docRef.id}`);
        }, 500);
      }
    } catch (error) {
      console.error('❌ Error saving service:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);

      // Show specific error messages
      if (error.code === 'permission-denied') {
        toast.error('Permission denied. Please check Firestore rules.');
      } else if (error.code === 'unavailable') {
        toast.error('Network error. Please check your internet connection.');
      } else if (error.code === 'not-found') {
        toast.error('Services collection not found. Creating it now...');
        // Try to create the collection by adding a document
        try {
          const tempRef = await addDoc(collection(db, 'services'), {
            title: 'Temp Service',
            vendor_id: user?.uid,
            created_at: serverTimestamp(),
          });
          await updateDoc(doc(db, 'services', tempRef.id), { title: null });
          toast.success('Collection created. Please try again.');
        } catch (createError) {
          toast.error('Failed to create collection. Check Firebase console.');
        }
      } else {
        toast.error(isEditMode ? 'Failed to update service.' : 'Failed to create service.');
      }
    } finally {
      setIsSubmitting(false);
      console.log('🏁 Form submission finished');
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
          {/* Title */}
          <Form.Group>
            <Label htmlFor="title">Service Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Professional SEO Audit & Strategy"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              maxLength={100}
              disabled={isSubmitting}
              className={validationErrors.title ? 'is-invalid' : ''}
            />
            {validationErrors.title && (
              <div className="invalid-feedback d-block">{validationErrors.title}</div>
            )}
          </Form.Group>

          {/* Category */}
          <Form.Group>
            <Label htmlFor="category">Category *</Label>
            <div className="d-flex align-items-center gap-2">
              <Form.Select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                disabled={isSubmitting || loadingCategories}
                className={validationErrors.category ? 'is-invalid' : ''}
              >
                <option value="" disabled>Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </Form.Select>
              {loadingCategories && <Spinner animation="border" size="sm" />}
            </div>
            {validationErrors.category && (
              <div className="invalid-feedback d-block">{validationErrors.category}</div>
            )}
            {categories.length === 0 && !loadingCategories && (
              <div className="text-warning small mt-1">
                No categories found. Using default categories.
              </div>
            )}
          </Form.Group>

          {/* Description */}
          <Form.Group>
            <Label htmlFor="description">Short Description *</Label>
            <Textarea
              id="description"
              placeholder="Brief overview of your service (max 200 characters)"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              maxLength={200}
              rows={2}
              disabled={isSubmitting}
              className={validationErrors.description ? 'is-invalid' : ''}
            />
            <div className="d-flex justify-content-between">
              <Form.Text className="text-muted small">{formData.description.length}/200</Form.Text>
              {validationErrors.description && (
                <span className="text-danger small">{validationErrors.description}</span>
              )}
            </div>
          </Form.Group>

          {/* Long Description */}
          <Form.Group>
            <Label htmlFor="longDescription">Detailed Description</Label>
            <Textarea
              id="longDescription"
              placeholder="Provide a detailed description of what clients will receive..."
              value={formData.longDescription}
              onChange={(e) => handleInputChange('longDescription', e.target.value)}
              rows={4}
              disabled={isSubmitting}
            />
          </Form.Group>

          {/* Price and Price Type */}
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
                  disabled={isSubmitting}
                  className={validationErrors.price ? 'is-invalid' : ''}
                />
                {validationErrors.price && (
                  <div className="invalid-feedback d-block">{validationErrors.price}</div>
                )}
              </Form.Group>
            </div>
            <div className="col-6">
              <Form.Group>
                <Label htmlFor="priceType">Pricing Type *</Label>
                <Form.Select
                  value={formData.priceType}
                  onChange={(e) => handleInputChange('priceType', e.target.value)}
                  disabled={isSubmitting}
                >
                  <option value="one-time">One-time</option>
                  <option value="monthly">Monthly</option>
                  <option value="hourly">Hourly</option>
                </Form.Select>
              </Form.Group>
            </div>
          </div>

          {/* Delivery Time */}
          <Form.Group>
            <Label htmlFor="deliveryTime">Delivery Time</Label>
            <Form.Select
              value={formData.deliveryTime}
              onChange={(e) => handleInputChange('deliveryTime', e.target.value)}
              disabled={isSubmitting}
            >
              {deliveryTimeOptions.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          {/* Features */}
          <Form.Group>
            <Label>Features Included *</Label>
            {validationErrors.features && (
              <div className="text-danger small mb-2">{validationErrors.features}</div>
            )}
            <div className="d-flex flex-column gap-2">
              {formData.features.map((feature, index) => (
                <div key={index} className="d-flex gap-2">
                  <Input
                    placeholder={`Feature ${index + 1} (e.g., Professional quality work)`}
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                    disabled={isSubmitting}
                  />
                  {formData.features.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFeature(index)}
                      className="text-danger p-0"
                      disabled={isSubmitting}
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
                disabled={isSubmitting}
              >
                <Plus size={16} className="me-2" />
                Add Feature
              </Button>
            </div>
          </Form.Group>

          {/* Tags */}
          <Form.Group>
            <Label>Tags</Label>
            <div className="d-flex gap-2 mb-2">
              <Input
                placeholder="Add a tag (e.g., web-design, seo, marketing)"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
                disabled={isSubmitting}
              />
              <Button
                type="button"
                variant="outline"
                onClick={addTag}
                disabled={isSubmitting}
              >
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
                      onClick={() => !isSubmitting && removeTag(tag)}
                      className="ms-1 hover-text-danger cursor-pointer"
                      style={{ cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                    >
                      <X size={12} />
                    </span>
                  </Badge>
                ))}
              </div>
            )}
          </Form.Group>

          {/* Availability */}
          <div className="d-flex align-items-center justify-content-between p-3 border rounded bg-light">
            <div>
              <Label htmlFor="available" className="mb-0">Service Available</Label>
              <p className="small text-muted mb-0">
                Make this service visible to clients
              </p>
            </div>
            <Switch
              id="available"
              checked={formData.is_active}
              onCheckedChange={(checked) => handleInputChange('is_active', checked)}
              disabled={isSubmitting}
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
        <Button
          type="button"
          variant="primary"
          disabled={isSubmitting || loadingCategories}
          onClick={handleSubmit}
        >
          {isSubmitting ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              {isEditMode ? 'Saving...' : 'Creating...'}
            </>
          ) : (
            isEditMode ? 'Save Changes' : 'Create Service'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}