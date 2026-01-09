import { useState } from 'react';
import { useParams, Link, Navigate, useNavigate } from 'react-router-dom';
import { 
  Star, Clock, Check, ArrowLeft, User, MessageSquare, Shield, 
  ShoppingCart, Send, BadgeCheck, RefreshCw, Zap, Award, 
  MapPin, Calendar, TrendingUp, Play, ChevronRight
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { getServiceById, services } from '@/data/services';
import { getVendorById, vendors } from '@/data/vendors';
import { useAuth } from '@/contexts/AuthContext';
import { ServiceCard } from '@/components/services/ServiceCard';
import { useCart, PaymentType } from '@/contexts/CartContext';
import { useMessaging } from '@/contexts/MessagingContext';
import { toast } from 'sonner';

// Pricing tier type
interface PricingTier {
  id: 'basic' | 'standard' | 'premium';
  name: string;
  price: number;
  description: string;
  deliveryTime: string;
  revisions: number;
  features: string[];
  popular?: boolean;
}

export default function ServiceDetail() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { startConversation, setActiveConversation } = useMessaging();
  const navigate = useNavigate();
  const [selectedTier, setSelectedTier] = useState<'basic' | 'standard' | 'premium'>('standard');
  const [activeTab, setActiveTab] = useState('description');

  const service = getServiceById(id || '');
  const vendor = service ? getVendorById(service.vendorId) || vendors.find(v => v.name === service.vendorName) : null;

  // Generate pricing tiers based on service price
  const generateTiers = (): PricingTier[] => {
    if (!service) return [];
    const basePrice = service.price;
    return [
      {
        id: 'basic',
        name: 'Basic',
        price: Math.round(basePrice * 0.6),
        description: 'Essential package for getting started',
        deliveryTime: service.deliveryTime === 'Ongoing' ? '7 days' : service.deliveryTime,
        revisions: 1,
        features: service.features.slice(0, 3),
      },
      {
        id: 'standard',
        name: 'Standard',
        price: basePrice,
        description: 'Most popular choice for professionals',
        deliveryTime: service.deliveryTime === 'Ongoing' ? '5 days' : service.deliveryTime.replace(/\d+/, (match) => String(Math.max(1, parseInt(match) - 2))),
        revisions: 3,
        features: service.features.slice(0, 5),
        popular: true,
      },
      {
        id: 'premium',
        name: 'Premium',
        price: Math.round(basePrice * 1.8),
        description: 'Complete solution with priority support',
        deliveryTime: service.deliveryTime === 'Ongoing' ? '3 days' : service.deliveryTime.replace(/\d+/, (match) => String(Math.max(1, parseInt(match) - 4))),
        revisions: -1, // Unlimited
        features: service.features,
      },
    ];
  };

  const tiers = generateTiers();
  const currentTier = tiers.find(t => t.id === selectedTier) || tiers[1];

  const handleAddToCart = () => {
    if (!service) return;
    const modifiedService = { ...service, price: currentTier.price };
    addToCart(modifiedService, 'one-time' as PaymentType, undefined);
    toast.success(`${currentTier.name} package added to cart!`);
  };

  const handleBuyNow = () => {
    if (!service) return;
    const modifiedService = { ...service, price: currentTier.price };
    addToCart(modifiedService, 'one-time' as PaymentType, undefined);
    navigate('/cart');
  };

  const handleContactVendor = () => {
    if (!service) return;
    const conversation = startConversation(
      service.vendorId,
      service.vendorName,
      service.id,
      service.title
    );
    setActiveConversation(conversation);
    navigate('/messages');
    toast.success('Conversation started!');
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: { pathname: `/services/${id}` } }} />;
  }

  if (!service) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Service not found</h1>
          <Link to="/services">
            <Button>Back to Services</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const relatedServices = services
    .filter(s => s.category === service.category && s.id !== service.id)
    .slice(0, 3);

  // Get vendor reviews or use mock reviews
  const vendorReviews = vendor?.reviews || [
    { id: 'r1', clientName: 'Happy Customer', rating: 5, comment: 'Excellent service! Would highly recommend.', serviceName: service.title, date: '2024-01-15' },
    { id: 'r2', clientName: 'Satisfied Client', rating: 4, comment: 'Great work and professional communication.', serviceName: service.title, date: '2024-01-10' },
  ];

  // Rating distribution (mock)
  const ratingDistribution = [
    { stars: 5, percentage: 78 },
    { stars: 4, percentage: 15 },
    { stars: 3, percentage: 5 },
    { stars: 2, percentage: 1 },
    { stars: 1, percentage: 1 },
  ];

  return (
    <Layout>
      {/* Breadcrumb */}
      <div className="bg-muted/30 border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/services" className="hover:text-foreground transition-colors">
              Services
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link to={`/category/${service.category}`} className="hover:text-foreground transition-colors capitalize">
              {service.category.replace('-', ' ')}
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground truncate max-w-[200px]">{service.title}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Service Title */}
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground leading-tight">
                {service.title}
              </h1>
            </div>

            {/* Vendor Info Bar */}
            <div className="flex flex-wrap items-center gap-4 p-4 bg-card rounded-xl border border-border">
              <Link to={`/vendors/${vendor?.id || service.vendorId}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                  <AvatarImage src={vendor?.avatar} alt={service.vendorName} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {service.vendorName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">{service.vendorName}</span>
                    <BadgeCheck className="w-4 h-4 text-primary fill-primary/20" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {vendor?.tagline || 'Verified Seller'}
                  </p>
                </div>
              </Link>

              <div className="h-8 w-px bg-border hidden sm:block" />

              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                <span className="font-bold text-foreground">{service.rating}</span>
                <span className="text-muted-foreground">({service.reviewCount})</span>
              </div>

              <div className="h-8 w-px bg-border hidden sm:block" />

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>{vendor?.totalProjects || 100}+ orders</span>
                </div>
                <Badge variant="secondary" className="bg-accent/10 text-accent border-0">
                  <Zap className="w-3 h-3 mr-1" />
                  Quick Response
                </Badge>
              </div>
            </div>

            {/* Service Media Preview */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 border border-border">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 shadow-lg cursor-pointer hover:scale-105 transition-transform">
                    <Play className="w-8 h-8 text-primary ml-1" />
                  </div>
                  <span className="text-6xl">
                    {service.tags[0] === 'SEO' ? '🔍' : 
                     service.tags[0] === 'Social Media' ? '📱' : 
                     service.tags[0] === 'Content' ? '✍️' : 
                     service.tags[0] === 'PPC' ? '📈' : 
                     service.tags[0] === 'Video' ? '🎬' : 
                     service.tags[0] === 'Branding' ? '🎨' : 
                     service.tags[0] === 'Email' ? '📧' : '📊'}
                  </span>
                </div>
              </div>
            </div>

            {/* Tabbed Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-b border-border rounded-none">
                <TabsTrigger 
                  value="description" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3 font-medium"
                >
                  Description
                </TabsTrigger>
                <TabsTrigger 
                  value="reviews" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3 font-medium"
                >
                  Reviews ({service.reviewCount})
                </TabsTrigger>
                <TabsTrigger 
                  value="about" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3 font-medium"
                >
                  About Seller
                </TabsTrigger>
              </TabsList>

              {/* Description Tab */}
              <TabsContent value="description" className="mt-6 space-y-8">
                <div>
                  <h2 className="font-display text-xl font-semibold mb-4">About This Service</h2>
                  <p className="text-muted-foreground leading-relaxed text-base">
                    {service.longDescription}
                  </p>
                </div>

                <div>
                  <h2 className="font-display text-xl font-semibold mb-4">What's Included</h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {service.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                        <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-accent" />
                        </div>
                        <span className="text-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="font-display text-xl font-semibold mb-4">Tags</h2>
                  <div className="flex flex-wrap gap-2">
                    {service.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="px-3 py-1">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Reviews Tab */}
              <TabsContent value="reviews" className="mt-6 space-y-8">
                {/* Rating Summary */}
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-foreground">{service.rating}</div>
                      <div className="flex items-center justify-center gap-0.5 my-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-5 h-5 ${star <= Math.round(service.rating) ? 'fill-amber-400 text-amber-400' : 'text-muted'}`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground">{service.reviewCount} reviews</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {ratingDistribution.map(({ stars, percentage }) => (
                      <div key={stars} className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground w-16">{stars} Stars</span>
                        <Progress value={percentage} className="h-2 flex-1" />
                        <span className="text-sm text-muted-foreground w-10">{percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reviews List */}
                <div className="space-y-4">
                  {vendorReviews.map((review) => (
                    <div key={review.id} className="p-5 bg-card rounded-xl border border-border">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={review.clientAvatar} />
                          <AvatarFallback className="bg-muted text-muted-foreground">
                            {review.clientName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <span className="font-semibold text-foreground">{review.clientName}</span>
                              <div className="flex items-center gap-0.5 mt-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-4 h-4 ${star <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-muted'}`}
                                  />
                                ))}
                              </div>
                            </div>
                            <span className="text-sm text-muted-foreground">{review.date}</span>
                          </div>
                          <p className="text-muted-foreground">{review.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* About Seller Tab */}
              <TabsContent value="about" className="mt-6 space-y-6">
                <div className="p-6 bg-card rounded-xl border border-border">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-24 w-24 ring-4 ring-primary/10">
                        <AvatarImage src={vendor?.avatar} alt={service.vendorName} />
                        <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">
                          {service.vendorName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-display text-xl font-bold">{service.vendorName}</h3>
                          <BadgeCheck className="w-5 h-5 text-primary fill-primary/20" />
                        </div>
                        <p className="text-muted-foreground mb-3">{vendor?.tagline || 'Professional Service Provider'}</p>
                        <div className="flex items-center gap-1 mb-2">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          <span className="font-semibold">{vendor?.rating || service.rating}</span>
                          <span className="text-muted-foreground">({vendor?.reviewCount || service.reviewCount} reviews)</span>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleContactVendor}>
                          <Send className="w-4 h-4 mr-2" />
                          Contact Me
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border">
                    <div className="text-center p-4 rounded-lg bg-muted/50">
                      <MapPin className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium">{vendor?.location || 'United States'}</p>
                      <p className="text-xs text-muted-foreground">Location</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-muted/50">
                      <Calendar className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium">{vendor?.memberSince || 'Jan 2023'}</p>
                      <p className="text-xs text-muted-foreground">Member since</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-muted/50">
                      <Clock className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium">{vendor?.responseTime || '< 1 hour'}</p>
                      <p className="text-xs text-muted-foreground">Response time</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-muted/50">
                      <TrendingUp className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium">{vendor?.totalProjects || 100}+</p>
                      <p className="text-xs text-muted-foreground">Completed</p>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-border">
                    <h4 className="font-semibold mb-3">About</h4>
                    <p className="text-muted-foreground leading-relaxed">
                      {vendor?.description || `${service.vendorName} is a professional service provider with extensive experience in ${service.category.replace('-', ' ')}. Known for delivering high-quality work and maintaining excellent communication with clients.`}
                    </p>
                  </div>

                  {vendor?.skills && (
                    <div className="mt-6 pt-6 border-t border-border">
                      <h4 className="font-semibold mb-3">Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {vendor.skills.map((skill) => (
                          <Badge key={skill} variant="secondary" className="px-3 py-1">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Pricing Sidebar - Right Side */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* Pricing Tier Tabs */}
              <div className="bg-card rounded-2xl border border-border shadow-lg overflow-hidden">
                {/* Tier Selection Tabs */}
                <div className="grid grid-cols-3 border-b border-border">
                  {tiers.map((tier) => (
                    <button
                      key={tier.id}
                      onClick={() => setSelectedTier(tier.id)}
                      className={`relative py-4 px-2 text-center font-medium transition-all ${
                        selectedTier === tier.id 
                          ? 'bg-card text-foreground border-b-2 border-primary -mb-px' 
                          : 'bg-muted/30 text-muted-foreground hover:bg-muted/50'
                      }`}
                    >
                      {tier.popular && (
                        <span className="absolute -top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full font-medium">
                          Popular
                        </span>
                      )}
                      <span className="text-sm">{tier.name}</span>
                    </button>
                  ))}
                </div>

                {/* Selected Tier Details */}
                <div className="p-6">
                  {/* Price */}
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl font-bold text-foreground">${currentTier.price}</span>
                  </div>
                  <p className="text-muted-foreground text-sm mb-6">{currentTier.description}</p>

                  {/* Delivery & Revisions */}
                  <div className="flex items-center justify-between text-sm mb-6 pb-6 border-b border-border">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{currentTier.deliveryTime} Delivery</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 text-muted-foreground" />
                      <span>{currentTier.revisions === -1 ? 'Unlimited' : currentTier.revisions} Revisions</span>
                    </div>
                  </div>

                  {/* Features Checklist */}
                  <div className="space-y-3 mb-6">
                    {service.features.map((feature, index) => {
                      const isIncluded = index < currentTier.features.length;
                      return (
                        <div key={index} className={`flex items-start gap-3 ${!isIncluded ? 'opacity-40' : ''}`}>
                          <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isIncluded ? 'text-accent' : 'text-muted'}`} />
                          <span className={`text-sm ${isIncluded ? 'text-foreground' : 'text-muted-foreground line-through'}`}>
                            {feature}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* CTA Buttons */}
                  <Button 
                    variant="hero" 
                    size="lg" 
                    className="w-full mb-3 h-12 text-base font-semibold"
                    onClick={handleBuyNow}
                  >
                    Continue (${currentTier.price})
                    <ChevronRight className="w-5 h-5 ml-1" />
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="w-full mb-3 h-11"
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Cart
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="lg" 
                    className="w-full h-11"
                    onClick={handleContactVendor}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Contact Seller
                  </Button>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="bg-card rounded-xl border border-border p-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <Shield className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <span className="text-xs text-muted-foreground">Money Back</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <Clock className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <span className="text-xs text-muted-foreground">On-Time</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <Award className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <span className="text-xs text-muted-foreground">Top Rated</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Services */}
        {relatedServices.length > 0 && (
          <div className="mt-16 pt-16 border-t border-border">
            <h2 className="font-display text-2xl font-bold mb-8">Related Services</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedServices.map((s) => (
                <ServiceCard key={s.id} service={s} />
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
