import { useParams, Link, Navigate } from 'react-router-dom';
import { Star, Clock, Check, ArrowLeft, User, MessageSquare, Shield } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getServiceById, services } from '@/data/services';
import { useAuth } from '@/contexts/AuthContext';
import { ServiceCard } from '@/components/services/ServiceCard';

export default function ServiceDetail() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: { pathname: `/services/${id}` } }} />;
  }

  const service = getServiceById(id || '');

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

  return (
    <Layout>
      <div className="bg-muted/30 py-6">
        <div className="container mx-auto px-4">
          <Link to="/services" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Services
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                {service.tags.map(tag => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                {service.title}
              </h1>
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{service.vendorName}</p>
                    <p className="text-muted-foreground">Verified Vendor</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                  <span className="font-semibold">{service.rating}</span>
                  <span className="text-muted-foreground">({service.reviewCount} reviews)</span>
                </div>
              </div>
            </div>

            {/* Image */}
            <div className="aspect-video rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <span className="text-8xl">{service.tags[0] === 'SEO' ? '🔍' : service.tags[0] === 'Social Media' ? '📱' : service.tags[0] === 'Content' ? '✍️' : service.tags[0] === 'PPC' ? '📈' : service.tags[0] === 'Video' ? '🎬' : service.tags[0] === 'Branding' ? '🎨' : '📊'}</span>
            </div>

            {/* Description */}
            <div>
              <h2 className="font-display text-xl font-semibold mb-4">About This Service</h2>
              <p className="text-muted-foreground leading-relaxed">
                {service.longDescription}
              </p>
            </div>

            {/* Features */}
            <div>
              <h2 className="font-display text-xl font-semibold mb-4">What's Included</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {service.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 rounded-xl bg-muted/50">
                    <Check className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Order Box */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-card rounded-2xl border border-border p-6 shadow-lg">
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-foreground">${service.price}</span>
                  <span className="text-muted-foreground">
                    /{service.priceType === 'monthly' ? 'month' : service.priceType === 'hourly' ? 'hour' : 'project'}
                  </span>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <span><strong>Delivery:</strong> {service.deliveryTime}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MessageSquare className="w-5 h-5 text-muted-foreground" />
                  <span><strong>Revisions:</strong> Included</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Shield className="w-5 h-5 text-muted-foreground" />
                  <span><strong>Money-back:</strong> Guaranteed</span>
                </div>
              </div>

              <Button variant="hero" size="lg" className="w-full mb-3">
                Order Now
              </Button>
              <Button variant="outline" size="lg" className="w-full">
                Contact Vendor
              </Button>

              <p className="text-xs text-center text-muted-foreground mt-4">
                You won't be charged yet
              </p>
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
