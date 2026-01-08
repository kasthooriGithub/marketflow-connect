import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, TrendingUp, Users, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout/Layout';
import { ServiceCard } from '@/components/services/ServiceCard';
import { categories, getPopularServices } from '@/data/services';

const stats = [
  { value: '2,500+', label: 'Active Vendors' },
  { value: '50K+', label: 'Services Sold' },
  { value: '98%', label: 'Satisfaction Rate' },
  { value: '$12M+', label: 'Paid to Vendors' },
];

const features = [
  {
    icon: Shield,
    title: 'Verified Vendors',
    description: 'Every vendor goes through a rigorous vetting process to ensure quality service delivery.',
  },
  {
    icon: Zap,
    title: 'Fast Delivery',
    description: 'Get your marketing services delivered quickly with our streamlined project management.',
  },
  {
    icon: Users,
    title: 'Expert Support',
    description: '24/7 support team ready to help you find the perfect service for your needs.',
  },
  {
    icon: TrendingUp,
    title: 'Growth Focused',
    description: 'Services designed to help your business scale and achieve measurable results.',
  },
];

export default function Index() {
  const popularServices = getPopularServices();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="gradient-hero py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent mb-6 animate-fade-up">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-medium">The #1 Digital Marketing Marketplace</span>
            </div>
            
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
              Grow Your Business with{' '}
              <span className="gradient-text">Expert Marketing</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: '0.2s' }}>
              Connect with top digital marketing agencies and freelancers. From SEO to social media, find the perfect service to scale your business.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up" style={{ animationDelay: '0.3s' }}>
              <Link to="/services">
                <Button variant="hero" size="xl">
                  Browse Services <ArrowRight className="w-5 h-5 ml-1" />
                </Button>
              </Link>
              <Link to="/signup">
                <Button variant="hero-outline" size="xl">
                  Become a Vendor
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-16 border-t border-border animate-fade-up" style={{ animationDelay: '0.4s' }}>
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl md:text-4xl font-display font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Browse by Category
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Find the perfect marketing service from our curated categories
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/category/${category.id}`}
                className="group p-6 bg-background rounded-xl border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
              >
                <div className="text-4xl mb-3">{category.icon}</div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
                <p className="text-sm text-muted-foreground">Browse vendors</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Services */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
                Popular Services
              </h2>
              <p className="text-muted-foreground">Top-rated services trusted by thousands</p>
            </div>
            <Link to="/services">
              <Button variant="outline" className="hidden md:flex">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Link to="/services">
              <Button variant="outline">
                View All Services <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-foreground text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Why Choose MarketFlow?
            </h2>
            <p className="text-primary-foreground/70 max-w-2xl mx-auto">
              We make it easy to find, hire, and work with the best marketing professionals
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="text-center p-6">
                <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-primary-foreground/10 flex items-center justify-center">
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-primary-foreground/70 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-3xl gradient-primary p-12 md:p-16 text-center">
            <div className="absolute inset-0 bg-[url('/placeholder.svg')] opacity-5"></div>
            <div className="relative z-10">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
                Ready to Grow Your Business?
              </h2>
              <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8">
                Join thousands of businesses who have found their perfect marketing partner on MarketFlow.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/signup">
                  <Button size="xl" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                    Get Started Free <ArrowRight className="w-5 h-5 ml-1" />
                  </Button>
                </Link>
                <Link to="/how-it-works">
                  <Button size="xl" variant="ghost" className="text-primary-foreground border-primary-foreground/30 border hover:bg-primary-foreground/10">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
