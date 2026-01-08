import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Star, 
  CheckCircle,
  MessageSquare,
  ArrowLeft,
  ExternalLink,
  Briefcase
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ServiceCard } from '@/components/services/ServiceCard';
import { getVendorById, Vendor } from '@/data/vendors';
import { services } from '@/data/services';
import { useAuth } from '@/contexts/AuthContext';
import { useMessaging } from '@/contexts/MessagingContext';
import { toast } from 'sonner';

function PortfolioSection({ vendor }: { vendor: Vendor }) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {vendor.portfolio.map((item) => (
        <div key={item.id} className="group relative bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all">
          <div className="aspect-video bg-muted relative">
            <img 
              src={item.image} 
              alt={item.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button size="sm" variant="secondary">
                <ExternalLink className="w-4 h-4 mr-2" />
                View Project
              </Button>
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
      ))}

      {vendor.portfolio.length === 0 && (
        <div className="col-span-2 text-center py-12 bg-muted/30 rounded-xl border border-dashed border-border">
          <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-2">No portfolio items yet</h3>
          <p className="text-muted-foreground text-sm">
            This vendor hasn't added portfolio items yet
          </p>
        </div>
      )}
    </div>
  );
}

function ReviewsSection({ vendor }: { vendor: Vendor }) {
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: vendor.reviews.filter(r => Math.floor(r.rating) === rating).length,
    percentage: vendor.reviews.length > 0 
      ? (vendor.reviews.filter(r => Math.floor(r.rating) === rating).length / vendor.reviews.length) * 100
      : 0
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

function ServicesSection({ vendorId }: { vendorId: string }) {
  const vendorServices = services.filter(s => s.vendorId === vendorId);

  return (
    <div className="space-y-6">
      {vendorServices.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-6">
          {vendorServices.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed border-border">
          <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-2">No services listed</h3>
          <p className="text-muted-foreground text-sm">
            This vendor hasn't listed any services yet
          </p>
        </div>
      )}
    </div>
  );
}

export default function PublicVendorProfile() {
  const { vendorId } = useParams<{ vendorId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { startConversation } = useMessaging();
  const [activeTab, setActiveTab] = useState('portfolio');

  const vendor = vendorId ? getVendorById(vendorId) : null;

  if (!vendor) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Vendor not found</h1>
          <Button onClick={() => navigate('/services')}>Browse Services</Button>
        </div>
      </Layout>
    );
  }

  const handleContactVendor = () => {
    if (!isAuthenticated) {
      toast.error('Please log in to message vendors');
      navigate('/login');
      return;
    }

    const vendorServices = services.filter(s => s.vendorId === vendor.id);
    const serviceName = vendorServices.length > 0 ? vendorServices[0].title : 'General Inquiry';
    const serviceId = vendorServices.length > 0 ? vendorServices[0].id : 'general';

    startConversation(
      vendor.id,
      vendor.name,
      serviceId,
      serviceName
    );
    navigate('/messages');
    toast.success(`Started conversation with ${vendor.name}`);
  };

  const vendorServices = services.filter(s => s.vendorId === vendor.id);

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Cover Image */}
        <div className="h-48 md:h-64 bg-gradient-to-r from-primary via-primary/80 to-accent relative">
          <Button 
            variant="secondary" 
            size="sm" 
            className="absolute top-4 left-4"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="container mx-auto px-4">
          {/* Profile Header */}
          <div className="relative -mt-16 mb-8">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 rounded-2xl bg-card border-4 border-background shadow-lg flex items-center justify-center overflow-hidden">
                  {vendor.avatar ? (
                    <img src={vendor.avatar} alt={vendor.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl font-bold text-primary">
                      {vendor.name.charAt(0)}
                    </span>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 pt-4 md:pt-8">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div>
                    <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                      {vendor.name}
                    </h1>
                    <p className="text-muted-foreground mt-1">{vendor.tagline}</p>
                    
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {vendor.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Member since {vendor.memberSince}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Responds {vendor.responseTime}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={handleContactVendor}>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                    {vendorServices.length > 0 && (
                      <Button variant="gradient" asChild>
                        <Link to={`/services/${vendorServices[0].id}`}>
                          View Services
                        </Link>
                      </Button>
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
                <span className="text-2xl font-bold text-foreground">{vendor.rating}</span>
              </div>
              <p className="text-sm text-muted-foreground">{vendor.reviewCount} reviews</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-4 text-center">
              <div className="text-2xl font-bold text-foreground">{vendor.totalProjects}</div>
              <p className="text-sm text-muted-foreground">Completed projects</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-4 text-center">
              <div className="flex items-center justify-center gap-1">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-2xl font-bold text-foreground">{vendor.completionRate}%</span>
              </div>
              <p className="text-sm text-muted-foreground">Completion rate</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-4 text-center">
              <div className="text-2xl font-bold text-foreground">${vendor.startingPrice}</div>
              <p className="text-sm text-muted-foreground">Starting price</p>
            </div>
          </div>

          {/* About & Skills */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="md:col-span-2 bg-card rounded-xl border border-border p-6">
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">About</h2>
              <p className="text-muted-foreground">{vendor.description}</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {vendor.skills.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Trust Banner */}
          <div className="mb-8 bg-primary/5 rounded-xl p-6 border border-primary/10">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Message Before You Pay</h3>
                <p className="text-sm text-muted-foreground">
                  Discuss your project requirements, clarify scope, and get to know {vendor.name} before committing. 
                  Only proceed to checkout when you're confident about the engagement.
                </p>
                <Button variant="link" className="px-0 mt-2" onClick={handleContactVendor}>
                  Start a conversation →
                </Button>
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
                Portfolio ({vendor.portfolio.length})
              </TabsTrigger>
              <TabsTrigger 
                value="services"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
              >
                Services ({vendorServices.length})
              </TabsTrigger>
              <TabsTrigger 
                value="reviews"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
              >
                Reviews ({vendor.reviewCount})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="portfolio" className="mt-6">
              <PortfolioSection vendor={vendor} />
            </TabsContent>

            <TabsContent value="services" className="mt-6">
              <ServicesSection vendorId={vendor.id} />
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <ReviewsSection vendor={vendor} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
