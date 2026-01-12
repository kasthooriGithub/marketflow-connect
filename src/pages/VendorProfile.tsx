import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useVendorPortfolio } from '@/contexts/VendorPortfolioContext';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { services } from '@/data/services';
import { getVendorByEmail, Vendor, PortfolioItem } from '@/data/vendors';
import { ServiceCard } from '@/components/services/ServiceCard';
import { AddPortfolioModal } from '@/components/vendor/AddPortfolioModal';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Star, 
  CheckCircle,
  Edit,
  Plus,
  Briefcase,
  MessageSquare,
  ExternalLink,
  Image as ImageIcon,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';


interface PortfolioSectionProps {
  vendor: Vendor;
  isOwner: boolean;
  customPortfolioItems: PortfolioItem[];
  onAddClick: () => void;
  onEditClick: (item: PortfolioItem) => void;
  onDeleteClick: (id: string) => void;
}

function PortfolioSection({ 
  vendor, 
  isOwner, 
  customPortfolioItems, 
  onAddClick,
  onEditClick,
  onDeleteClick 
}: PortfolioSectionProps) {
  // Combine vendor's default portfolio with custom items
  const allPortfolioItems = [...vendor.portfolio, ...customPortfolioItems];

  return (
    <div className="space-y-6">
      {isOwner && (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={onAddClick}>
            <Plus className="w-4 h-4 mr-2" />
            Add Portfolio Item
          </Button>
        </div>
      )}
      
      <div className="grid md:grid-cols-2 gap-6">
        {allPortfolioItems.map((item) => {
          const isCustomItem = item.id.startsWith('portfolio_');
          return (
            <div key={item.id} className="group relative bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all">
              <div className="aspect-video bg-muted relative">
                <img 
                  src={item.image} 
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  {item.link && (
                    <Button size="sm" variant="secondary" asChild>
                      <a href={item.link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View
                      </a>
                    </Button>
                  )}
                  {isOwner && isCustomItem && (
                    <>
                      <Button size="sm" variant="secondary" onClick={() => onEditClick(item)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => onDeleteClick(item.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
              <div className="p-4">
                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                  {item.category}
                </span>
                <h3 className="font-display font-semibold text-foreground mt-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {allPortfolioItems.length === 0 && (
        <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed border-border">
          <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-2">No portfolio items yet</h3>
          <p className="text-muted-foreground text-sm mb-4">
            {isOwner ? 'Showcase your best work to attract clients' : 'This vendor hasn\'t added portfolio items yet'}
          </p>
          {isOwner && (
            <Button variant="outline" onClick={onAddClick}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Project
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function ReviewsSection({ vendor }: { vendor: Vendor }) {
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: vendor.reviews.filter(r => Math.floor(r.rating) === rating).length,
    percentage: (vendor.reviews.filter(r => Math.floor(r.rating) === rating).length / vendor.reviews.length) * 100
  }));

  return (
    <div className="space-y-6">
      {/* Rating Overview */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="text-center md:text-left">
            <div className="text-5xl font-bold text-foreground">{vendor.rating}</div>
            <div className="flex items-center justify-center md:justify-start gap-1 mt-2">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-5 h-5 ${i < Math.floor(vendor.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`}
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-1">{vendor.reviewCount} reviews</p>
          </div>
          
          <div className="flex-1 space-y-2">
            {ratingDistribution.map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground w-6">{rating}</span>
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-yellow-400 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-muted-foreground w-8">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Review List */}
      <div className="space-y-4">
        {vendor.reviews.map((review) => (
          <div key={review.id} className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-semibold">
                    {review.clientName.charAt(0)}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">{review.clientName}</h4>
                  <p className="text-xs text-muted-foreground">{review.serviceName}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`}
                  />
                ))}
              </div>
            </div>
            <p className="text-muted-foreground">{review.comment}</p>
            <p className="text-xs text-muted-foreground mt-3">
              {new Date(review.date).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ServicesSection({ vendorId, isOwner }: { vendorId: string; isOwner: boolean }) {
  const vendorServices = services.filter(s => s.vendorId === vendorId);

  return (
    <div className="space-y-6">
      {isOwner && (
        <div className="flex justify-end">
          <Button variant="gradient" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add New Service
          </Button>
        </div>
      )}

      {vendorServices.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-6">
          {vendorServices.map((service) => (
            <div key={service.id} className="relative">
              <ServiceCard service={service} />
              {isOwner && (
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button size="icon" variant="secondary" className="h-8 w-8">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="destructive" className="h-8 w-8">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed border-border">
          <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-2">No services listed</h3>
          <p className="text-muted-foreground text-sm mb-4">
            {isOwner ? 'Start selling by adding your first service' : 'This vendor hasn\'t listed any services yet'}
          </p>
          {isOwner && (
            <Button variant="gradient">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Service
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default function VendorProfile() {
  const { user } = useAuth();
  const { portfolioItems, addPortfolioItem, updatePortfolioItem, deletePortfolioItem } = useVendorPortfolio();
  const [activeTab, setActiveTab] = useState('portfolio');
  const [portfolioModalOpen, setPortfolioModalOpen] = useState(false);
  const [editingPortfolioItem, setEditingPortfolioItem] = useState<PortfolioItem | null>(null);
  
  // For demo, show the logged-in vendor's profile or a default vendor
  const vendor = user?.email ? getVendorByEmail(user.email) : null;
  const isOwner = user?.role === 'vendor' && vendor?.email === user?.email;

  // Default vendor data for demo
  const displayVendor: Vendor = vendor || {
    id: '2',
    name: user?.name || 'Digital Agency',
    email: user?.email || 'vendor@example.com',
    tagline: 'Full-service digital marketing agency',
    description: 'We are a passionate team of digital marketing experts dedicated to helping businesses grow online. With over 10 years of experience, we specialize in SEO, content marketing, and social media management.',
    location: 'New York, USA',
    memberSince: 'January 2023',
    responseTime: '< 2 hours',
    completionRate: 98,
    totalProjects: 156,
    rating: 4.9,
    reviewCount: 127,
    skills: ['SEO', 'Content Marketing', 'Social Media', 'PPC', 'Email Marketing', 'Analytics'],
    categories: ['seo', 'social-media', 'content', 'ppc', 'email', 'analytics'],
    startingPrice: 499,
    portfolio: [
      {
        id: 'p1',
        title: 'E-commerce SEO Overhaul',
        description: 'Increased organic traffic by 340% for a major e-commerce brand',
        image: '/placeholder.svg',
        category: 'SEO'
      },
      {
        id: 'p2',
        title: 'Social Media Campaign',
        description: 'Viral campaign that reached 2M+ users',
        image: '/placeholder.svg',
        category: 'Social Media'
      }
    ],
    reviews: [
      {
        id: 'r1',
        clientName: 'Sarah Johnson',
        rating: 5,
        comment: 'Absolutely fantastic work! They exceeded all expectations and delivered results ahead of schedule.',
        serviceName: 'Complete SEO Audit & Strategy',
        date: '2024-01-15'
      }
    ]
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Cover Image */}
        <div className="h-48 md:h-64 bg-gradient-to-r from-primary via-primary/80 to-accent relative">
          {isOwner && (
            <Button 
              variant="secondary" 
              size="sm" 
              className="absolute bottom-4 right-4"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Cover
            </Button>
          )}
        </div>

        <div className="container mx-auto px-4">
          {/* Profile Header */}
          <div className="relative -mt-16 mb-8">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 rounded-2xl bg-card border-4 border-background shadow-lg flex items-center justify-center overflow-hidden">
                  {displayVendor.avatar ? (
                    <img src={displayVendor.avatar} alt={displayVendor.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl font-bold text-primary">
                      {displayVendor.name.charAt(0)}
                    </span>
                  )}
                </div>
                {isOwner && (
                  <Button 
                    size="icon" 
                    variant="secondary" 
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 pt-4 md:pt-8">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div>
                    <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                      {displayVendor.name}
                    </h1>
                    <p className="text-muted-foreground mt-1">{displayVendor.tagline}</p>
                    
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {displayVendor.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Member since {displayVendor.memberSince}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Responds {displayVendor.responseTime}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    {isOwner ? (
                      <Button variant="outline">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                    ) : (
                      <>
                        <Button variant="outline">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Message
                        </Button>
                        <Button variant="gradient">
                          Hire Me
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-card rounded-xl border border-border p-4 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <span className="text-2xl font-bold text-foreground">{displayVendor.rating}</span>
              </div>
              <p className="text-sm text-muted-foreground">{displayVendor.reviewCount} reviews</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-4 text-center">
              <div className="text-2xl font-bold text-foreground">{displayVendor.totalProjects}</div>
              <p className="text-sm text-muted-foreground">Completed projects</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-4 text-center">
              <div className="flex items-center justify-center gap-1">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-2xl font-bold text-foreground">{displayVendor.completionRate}%</span>
              </div>
              <p className="text-sm text-muted-foreground">Completion rate</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-4 text-center">
              <div className="text-2xl font-bold text-foreground">{displayVendor.responseTime}</div>
              <p className="text-sm text-muted-foreground">Response time</p>
            </div>
          </div>

          {/* About & Skills */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="md:col-span-2 bg-card rounded-xl border border-border p-6">
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">About</h2>
              <p className="text-muted-foreground">{displayVendor.description}</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {displayVendor.skills.map((skill) => (
                  <span 
                    key={skill}
                    className="px-3 py-1 text-sm rounded-full bg-primary/10 text-primary"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="pb-12">
            <TabsList className="w-full justify-start bg-transparent border-b border-border rounded-none p-0 h-auto">
              <TabsTrigger 
                value="portfolio"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
              >
                Portfolio
              </TabsTrigger>
              <TabsTrigger 
                value="services"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
              >
                Services
              </TabsTrigger>
              <TabsTrigger 
                value="reviews"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
              >
                Reviews
              </TabsTrigger>
            </TabsList>

            <TabsContent value="portfolio" className="mt-6">
              <PortfolioSection 
                vendor={displayVendor} 
                isOwner={isOwner} 
                customPortfolioItems={portfolioItems}
                onAddClick={() => {
                  setEditingPortfolioItem(null);
                  setPortfolioModalOpen(true);
                }}
                onEditClick={(item) => {
                  setEditingPortfolioItem(item);
                  setPortfolioModalOpen(true);
                }}
                onDeleteClick={(id) => {
                  deletePortfolioItem(id);
                  toast.success('Portfolio item deleted');
                }}
              />
            </TabsContent>

            <TabsContent value="services" className="mt-6">
              <ServicesSection vendorId={displayVendor.id} isOwner={isOwner} />
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <ReviewsSection vendor={displayVendor} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Portfolio Modal */}
      <AddPortfolioModal
        open={portfolioModalOpen}
        onOpenChange={setPortfolioModalOpen}
        editItem={editingPortfolioItem}
        onSave={(item) => {
          if (editingPortfolioItem) {
            updatePortfolioItem(editingPortfolioItem.id, item);
          } else {
            addPortfolioItem(item);
          }
        }}
      />
    </Layout>
  );
}
