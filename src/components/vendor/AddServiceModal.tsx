import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useVendorServices, NewService } from '@/contexts/VendorServicesContext';
import { toast } from 'sonner';

interface AddServiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

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

export function AddServiceModal({ open, onOpenChange }: AddServiceModalProps) {
  const navigate = useNavigate();
  const { addService, categories } = useVendorServices();
  
  const [formData, setFormData] = useState<NewService>({
    title: '',
    description: '',
    longDescription: '',
    category: '',
    price: 0,
    priceType: 'one-time',
    deliveryTime: '3-5 days',
    features: [''],
    tags: [],
    available: true,
  });

  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof NewService, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData(prev => ({ ...prev, features: newFeatures }));
  };

  const addFeature = () => {
    setFormData(prev => ({ ...prev, features: [...prev.features, ''] }));
  };

  const removeFeature = (index: number) => {
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

  const removeTag = (tag: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      toast.error('Please enter a service title');
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
    if (formData.price <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    setIsSubmitting(true);

    try {
      // Filter out empty features
      const cleanedFeatures = formData.features.filter(f => f.trim());
      if (cleanedFeatures.length === 0) {
        toast.error('Please add at least one feature');
        setIsSubmitting(false);
        return;
      }

      const serviceToAdd = {
        ...formData,
        features: cleanedFeatures,
        longDescription: formData.longDescription || formData.description,
      };

      const newService = addService(serviceToAdd);
      
      toast.success('Service created successfully!');
      onOpenChange(false);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        longDescription: '',
        category: '',
        price: 0,
        priceType: 'one-time',
        deliveryTime: '3-5 days',
        features: [''],
        tags: [],
        available: true,
      });

      // Navigate to the new service
      navigate(`/services/${newService.id}`);
    } catch (error) {
      toast.error('Failed to create service. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Add New Service</DialogTitle>
          <DialogDescription>
            Create a new service listing for your clients to purchase
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Service Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Professional SEO Audit & Strategy"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              maxLength={100}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleInputChange('category', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <span className="flex items-center gap-2">
                      <span>{cat.icon}</span>
                      <span>{cat.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Short Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Short Description *</Label>
            <Textarea
              id="description"
              placeholder="Brief overview of your service (max 200 characters)"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              maxLength={200}
              rows={2}
            />
            <p className="text-xs text-muted-foreground">{formData.description.length}/200</p>
          </div>

          {/* Long Description */}
          <div className="space-y-2">
            <Label htmlFor="longDescription">Detailed Description</Label>
            <Textarea
              id="longDescription"
              placeholder="Provide a detailed description of what clients will receive..."
              value={formData.longDescription}
              onChange={(e) => handleInputChange('longDescription', e.target.value)}
              rows={4}
            />
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
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
            </div>
            <div className="space-y-2">
              <Label htmlFor="priceType">Pricing Type *</Label>
              <Select
                value={formData.priceType}
                onValueChange={(value: 'one-time' | 'monthly' | 'hourly') => handleInputChange('priceType', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="one-time">One-time</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="hourly">Hourly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Delivery Time */}
          <div className="space-y-2">
            <Label htmlFor="deliveryTime">Delivery Time</Label>
            <Select
              value={formData.deliveryTime}
              onValueChange={(value) => handleInputChange('deliveryTime', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {deliveryTimeOptions.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Features */}
          <div className="space-y-2">
            <Label>Features Included *</Label>
            <div className="space-y-2">
              {formData.features.map((feature, index) => (
                <div key={index} className="flex gap-2">
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
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addFeature}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Feature
              </Button>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
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
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Availability */}
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <Label htmlFor="available">Service Available</Label>
              <p className="text-sm text-muted-foreground">
                Make this service visible to clients
              </p>
            </div>
            <Switch
              id="available"
              checked={formData.available}
              onCheckedChange={(checked) => handleInputChange('available', checked)}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="hero" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Service'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
