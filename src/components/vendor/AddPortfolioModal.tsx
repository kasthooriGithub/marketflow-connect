import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
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
import { toast } from 'sonner';

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
}

interface AddPortfolioModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (item: PortfolioItem) => void;
  editItem?: PortfolioItem | null;
}

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

const getInitialFormData = (item?: PortfolioItem | null) => ({
  title: item?.title || '',
  description: item?.description || '',
  image: item?.image || '',
  category: item?.category || '',
});

export function AddPortfolioModal({ open, onOpenChange, onSave, editItem }: AddPortfolioModalProps) {
  const [formData, setFormData] = useState(() => getInitialFormData(editItem));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = !!editItem;

  useEffect(() => {
    if (open) {
      setFormData(getInitialFormData(editItem));
    }
  }, [open, editItem]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
      const portfolioItem: PortfolioItem = {
        id: editItem?.id || `portfolio-${Date.now()}`,
        title: formData.title.trim(),
        description: formData.description.trim(),
        image: formData.image.trim() || '/placeholder.svg',
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {isEditMode ? 'Edit Portfolio Item' : 'Add Portfolio Item'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? 'Update your portfolio project details' 
              : 'Showcase your best work to attract potential clients'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Project Title *</Label>
            <Input
              id="title"
              placeholder="e.g., E-commerce SEO Overhaul"
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
                {categoryOptions.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe the project and results achieved..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              maxLength={300}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">{formData.description.length}/300</p>
          </div>

          {/* Image URL */}
          <div className="space-y-2">
            <Label htmlFor="image">Image URL</Label>
            <Input
              id="image"
              placeholder="https://example.com/project-image.jpg"
              value={formData.image}
              onChange={(e) => handleInputChange('image', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to use a placeholder image
            </p>
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
            <Button type="submit" variant="gradient" disabled={isSubmitting}>
              {isSubmitting 
                ? (isEditMode ? 'Saving...' : 'Adding...') 
                : (isEditMode ? 'Save Changes' : 'Add to Portfolio')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}