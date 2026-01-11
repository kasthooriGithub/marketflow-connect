import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useVendorServices } from '@/contexts/VendorServicesContext';
import { AddServiceModal } from '@/components/vendor/AddServiceModal';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Star,
  Package,
  MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { Service } from '@/data/services';

export default function MyServices() {
  const { user } = useAuth();
  const { vendorServices, deleteService, categories } = useVendorServices();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);

  const handleEditClick = (service: Service) => {
    setEditingService(service);
    setIsAddModalOpen(true);
  };

  const handleModalClose = (open: boolean) => {
    setIsAddModalOpen(open);
    if (!open) {
      setEditingService(null);
    }
  };

  const handleDeleteClick = (serviceId: string) => {
    setServiceToDelete(serviceId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (serviceToDelete) {
      deleteService(serviceToDelete);
      toast.success('Service deleted successfully');
      setServiceToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || categoryId;
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link 
              to="/dashboard" 
              className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              My Services
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage and organize your service listings
            </p>
          </div>
          <Button variant="hero" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add New Service
          </Button>
        </div>

        {/* Services Grid */}
        {vendorServices.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vendorServices.map((service) => (
              <div 
                key={service.id} 
                className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Service Image */}
                <div className="aspect-video bg-gradient-to-br from-primary/10 to-accent/10 relative flex items-center justify-center">
                  <span className="text-4xl">
                    {service.tags[0] === 'SEO' ? '🔍' : 
                     service.tags[0] === 'Social Media' ? '📱' : 
                     service.tags[0] === 'Content' ? '✍️' : 
                     service.tags[0] === 'PPC' ? '📈' : 
                     service.tags[0] === 'Video' ? '🎬' : 
                     service.tags[0] === 'Branding' ? '🎨' : 
                     service.tags[0] === 'Email' ? '📧' : '📊'}
                  </span>
                  
                  {/* Actions Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="secondary" 
                        size="icon" 
                        className="absolute top-3 right-3 h-8 w-8"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to={`/services/${service.id}`} className="flex items-center">
                          <Eye className="w-4 h-4 mr-2" />
                          View Service
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditClick(service)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Service
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive focus:text-destructive"
                        onClick={() => handleDeleteClick(service.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Service
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Service Info */}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {getCategoryName(service.category)}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{service.rating}</span>
                      <span>({service.reviewCount})</span>
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                    {service.title}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {service.description}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div>
                      <span className="text-xl font-bold text-foreground">${service.price}</span>
                      <span className="text-sm text-muted-foreground">
                        /{service.priceType === 'monthly' ? 'mo' : service.priceType === 'hourly' ? 'hr' : 'project'}
                      </span>
                    </div>
                    <Link to={`/services/${service.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-card rounded-xl border border-border">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-display text-xl font-semibold text-foreground mb-2">
              No services yet
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Start selling by creating your first service listing. Showcase your skills and attract clients.
            </p>
            <Button variant="hero" onClick={() => setIsAddModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Service
            </Button>
          </div>
        )}

        {/* Add/Edit Service Modal */}
        <AddServiceModal 
          open={isAddModalOpen} 
          onOpenChange={handleModalClose}
          editService={editingService}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Service</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this service? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleConfirmDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}
