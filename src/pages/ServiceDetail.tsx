import { useState } from 'react';
import { useParams, Link, Navigate, useNavigate } from 'react-router-dom';
import { Star, Clock, Check, ArrowLeft, User, MessageSquare, Shield, ShoppingCart, Send } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { getServiceById, services } from '@/data/services';
import { useAuth } from '@/contexts/AuthContext';
import { ServiceCard } from '@/components/services/ServiceCard';
import { useCart, PaymentType, SubscriptionPeriod } from '@/contexts/CartContext';
import { useMessaging } from '@/contexts/MessagingContext';
import { toast } from 'sonner';
export default function ServiceDetail() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { startConversation, setActiveConversation } = useMessaging();
  const navigate = useNavigate();
  const [paymentType, setPaymentType] = useState<PaymentType>('one-time');
  const [subscriptionPeriod, setSubscriptionPeriod] = useState<SubscriptionPeriod>('monthly');

  const handleAddToCart = () => {
    if (!service) return;
    addToCart(service, paymentType, paymentType === 'subscription' ? subscriptionPeriod : undefined);
    toast.success('Added to cart!');
  };

  const handleBuyNow = () => {
    if (!service) return;
    addToCart(service, paymentType, paymentType === 'subscription' ? subscriptionPeriod : undefined);
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

              {/* Payment Type Selection */}
              <div className="space-y-4 mb-6">
                <Label className="text-sm font-medium">Payment Type</Label>
                <RadioGroup
                  value={paymentType}
                  onValueChange={(value) => setPaymentType(value as PaymentType)}
                  className="space-y-2"
                >
                  <div className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer ${paymentType === 'one-time' ? 'border-primary bg-primary/5' : ''}`}>
                    <RadioGroupItem value="one-time" id="one-time" />
                    <Label htmlFor="one-time" className="cursor-pointer flex-1">
                      <span className="font-medium">One-time purchase</span>
                      <p className="text-xs text-muted-foreground">Pay once, use forever</p>
                    </Label>
                  </div>
                  <div className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer ${paymentType === 'subscription' ? 'border-primary bg-primary/5' : ''}`}>
                    <RadioGroupItem value="subscription" id="subscription" />
                    <Label htmlFor="subscription" className="cursor-pointer flex-1">
                      <span className="font-medium">Subscription</span>
                      <p className="text-xs text-muted-foreground">Recurring service</p>
                    </Label>
                  </div>
                </RadioGroup>

                {paymentType === 'subscription' && (
                  <RadioGroup
                    value={subscriptionPeriod}
                    onValueChange={(value) => setSubscriptionPeriod(value as SubscriptionPeriod)}
                    className="grid grid-cols-2 gap-2"
                  >
                    <div className={`p-3 border rounded-lg cursor-pointer text-center ${subscriptionPeriod === 'monthly' ? 'border-primary bg-primary/5' : ''}`}>
                      <RadioGroupItem value="monthly" id="monthly" className="sr-only" />
                      <Label htmlFor="monthly" className="cursor-pointer">
                        <p className="font-medium">Monthly</p>
                        <p className="text-sm text-muted-foreground">${service.price}/mo</p>
                      </Label>
                    </div>
                    <div className={`p-3 border rounded-lg cursor-pointer text-center ${subscriptionPeriod === 'yearly' ? 'border-primary bg-primary/5' : ''}`}>
                      <RadioGroupItem value="yearly" id="yearly" className="sr-only" />
                      <Label htmlFor="yearly" className="cursor-pointer">
                        <p className="font-medium">Yearly</p>
                        <p className="text-sm text-muted-foreground">${(service.price * 12 * 0.8).toFixed(0)}/yr</p>
                        <Badge variant="secondary" className="mt-1">Save 20%</Badge>
                      </Label>
                    </div>
                  </RadioGroup>
                )}
              </div>

              <div className="space-y-3 mb-6">
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

              <Button variant="hero" size="lg" className="w-full mb-3" onClick={handleBuyNow}>
                <ShoppingCart className="w-4 h-4 mr-2" />
                Buy Now
              </Button>
              <Button variant="outline" size="lg" className="w-full mb-3" onClick={handleAddToCart}>
                Add to Cart
              </Button>
              <Button variant="ghost" size="lg" className="w-full" onClick={handleContactVendor}>
                <Send className="w-4 h-4 mr-2" />
                Contact Vendor
              </Button>

              <p className="text-xs text-center text-muted-foreground mt-4">
                Secure checkout powered by MarketFlow
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
