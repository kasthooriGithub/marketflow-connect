import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Image, Link as LinkIcon, X } from 'lucide-react';
import { PortfolioItem } from '@/data/vendors';

interface AddPortfolioModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (item: Omit<PortfolioItem, 'id'>) => void;
  editItem?: PortfolioItem | null;
}

const portfolioCategories = [
  'SEO',
  'Social Media',
  'Content',
  'PPC',
  'Email Marketing',
  'Video',
  'Branding',
  'Analytics',
  'Web Design',
  'Growth',
  'Other'
];

export function AddPortfolioModal({ open, onOpenChange, onSave, editItem }: AddPortfolioModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [projectLink, setProjectLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = !!editItem;

  // Pre-fill form when editing
  useEffect(() => {
    if (editItem) {
      setTitle(editItem.title);
      setDescription(editItem.description);
      setCategory(editItem.category);
      setImageUrl(editItem.image);
      setProjectLink(editItem.link || '');
    } else {
      resetForm();
    }
  }, [editItem, open]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('');
    setImageUrl('');
    setProjectLink('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim() || !category) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const portfolioItem: Omit<PortfolioItem, 'id'> = {
        title: title.trim(),
        description: description.trim(),
        category,
        image: imageUrl.trim() || '/placeholder.svg',
        link: projectLink.trim() || undefined,
      };

      onSave(portfolioItem);
      toast.success(isEditMode ? 'Portfolio item updated!' : 'Portfolio item added!');
      resetForm();
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to save portfolio item');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {isEditMode ? 'Edit Portfolio Item' : 'Add Portfolio Item'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Project Title *</Label>
            <Input
              id="title"
              placeholder="E.g., E-commerce SEO Overhaul"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {portfolioCategories.map((cat) => (
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
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              required
            />
          </div>

          {/* Image URL */}
          <div className="space-y-2">
            <Label htmlFor="imageUrl" className="flex items-center gap-2">
              <Image className="w-4 h-4" />
              Image URL
            </Label>
            <Input
              id="imageUrl"
              type="url"
              placeholder="https://example.com/project-image.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to use a placeholder image
            </p>
          </div>

          {/* Project Link */}
          <div className="space-y-2">
            <Label htmlFor="projectLink" className="flex items-center gap-2">
              <LinkIcon className="w-4 h-4" />
              Project Link (Optional)
            </Label>
            <Input
              id="projectLink"
              type="url"
              placeholder="https://example.com/case-study"
              value={projectLink}
              onChange={(e) => setProjectLink(e.target.value)}
            />
          </div>

          {/* Preview */}
          {(title || imageUrl) && (
            <div className="border border-border rounded-lg p-4 bg-muted/30">
              <p className="text-xs text-muted-foreground mb-2 font-medium">Preview</p>
              <div className="flex gap-3">
                <div className="w-16 h-12 rounded bg-muted overflow-hidden flex-shrink-0">
                  {imageUrl ? (
                    <img 
                      src={imageUrl} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Image className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground truncate">
                    {title || 'Project Title'}
                  </p>
                  {category && (
                    <span className="text-xs text-primary">{category}</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gradient"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting 
                ? 'Saving...' 
                : isEditMode 
                  ? 'Update Item' 
                  : 'Add to Portfolio'
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}