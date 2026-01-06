import { Link } from 'react-router-dom';
import { Check, Zap, Building2, Star } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const plans = [
  {
    name: 'Starter',
    description: 'Perfect for small businesses getting started',
    price: 0,
    priceLabel: 'Free forever',
    features: [
      'Browse all services',
      'Message up to 5 vendors/month',
      'Basic project management',
      'Community support',
    ],
    cta: 'Get Started',
    variant: 'outline' as const,
  },
  {
    name: 'Professional',
    description: 'For growing businesses with bigger needs',
    price: 49,
    priceLabel: '/month',
    features: [
      'Everything in Starter',
      'Unlimited vendor messages',
      'Priority support',
      'Advanced analytics',
      'Custom contracts',
      'Dedicated account manager',
    ],
    cta: 'Start Free Trial',
    variant: 'hero' as const,
    popular: true,
  },
  {
    name: 'Enterprise',
    description: 'Custom solutions for large organizations',
    price: null,
    priceLabel: 'Custom pricing',
    features: [
      'Everything in Professional',
      'Custom integrations',
      'SLA guarantees',
      'White-label options',
      'Bulk discounts',
      'Dedicated success team',
    ],
    cta: 'Contact Sales',
    variant: 'outline' as const,
  },
];

const vendorPlans = [
  {
    name: 'Basic Vendor',
    commission: '15%',
    features: ['Up to 5 active listings', 'Basic analytics', 'Standard support'],
  },
  {
    name: 'Pro Vendor',
    commission: '10%',
    features: ['Unlimited listings', 'Advanced analytics', 'Priority placement', 'Featured badge'],
    popular: true,
  },
  {
    name: 'Agency',
    commission: '8%',
    features: ['Everything in Pro', 'Team accounts', 'API access', 'Custom branding'],
  },
];

export default function Pricing() {
  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <Badge variant="secondary" className="mb-4">Pricing</Badge>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your needs. No hidden fees, no surprises.
          </p>
        </div>
      </section>

      {/* Client Plans */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-2xl font-bold text-foreground text-center mb-12">
            For Clients
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative bg-card rounded-2xl border p-8 ${
                  plan.popular ? 'border-primary shadow-xl scale-105' : 'border-border'
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground">
                    Most Popular
                  </Badge>
                )}
                
                <div className="mb-6">
                  <h3 className="font-display text-xl font-bold text-foreground mb-2">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>

                <div className="mb-6">
                  {plan.price !== null ? (
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-foreground">${plan.price}</span>
                      <span className="text-muted-foreground">{plan.priceLabel}</span>
                    </div>
                  ) : (
                    <div className="text-2xl font-bold text-foreground">{plan.priceLabel}</div>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <Check className="w-5 h-5 text-accent flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link to="/signup">
                  <Button variant={plan.variant} className="w-full">
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vendor Plans */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-2xl font-bold text-foreground text-center mb-4">
            For Vendors
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
            Low commission rates that let you keep more of what you earn
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {vendorPlans.map((plan) => (
              <div
                key={plan.name}
                className={`bg-card rounded-xl border p-6 ${
                  plan.popular ? 'border-primary' : 'border-border'
                }`}
              >
                {plan.popular && (
                  <Badge variant="secondary" className="mb-4">Recommended</Badge>
                )}
                <h3 className="font-display text-lg font-bold text-foreground mb-2">{plan.name}</h3>
                <div className="text-3xl font-bold text-primary mb-4">{plan.commission}</div>
                <p className="text-sm text-muted-foreground mb-4">commission per sale</p>
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-accent" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/signup">
              <Button variant="gradient" size="lg">Start Selling Today</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-2xl font-bold text-foreground mb-8">
            Trusted by 2,500+ Agencies & 50,000+ Clients
          </h2>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            <span className="ml-2">4.9/5 from 10,000+ reviews</span>
          </div>
        </div>
      </section>
    </Layout>
  );
}
