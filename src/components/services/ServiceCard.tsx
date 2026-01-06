import { Link } from 'react-router-dom';
import { Star, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Service } from '@/data/services';

interface ServiceCardProps {
  service: Service;
  requiresAuth?: boolean;
}

export function ServiceCard({ service, requiresAuth = true }: ServiceCardProps) {
  return (
    <div className="group bg-card rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      {/* Image */}
      <div className="relative h-40 bg-gradient-to-br from-primary/10 to-accent/10 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-5xl">{service.tags[0] === 'SEO' ? '🔍' : service.tags[0] === 'Social Media' ? '📱' : service.tags[0] === 'Content' ? '✍️' : service.tags[0] === 'PPC' ? '📈' : service.tags[0] === 'Video' ? '🎬' : service.tags[0] === 'Branding' ? '🎨' : '📊'}</span>
        </div>
        {service.popular && (
          <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground">
            Popular
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          {service.tags.slice(0, 2).map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <h3 className="font-display font-semibold text-lg text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {service.title}
        </h3>

        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {service.description}
        </p>

        {/* Vendor & Rating */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground">{service.vendorName}</span>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="text-sm font-medium">{service.rating}</span>
            <span className="text-xs text-muted-foreground">({service.reviewCount})</span>
          </div>
        </div>

        {/* Price & Action */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div>
            <span className="text-xl font-bold text-foreground">${service.price}</span>
            <span className="text-sm text-muted-foreground">
              /{service.priceType === 'monthly' ? 'mo' : service.priceType === 'hourly' ? 'hr' : 'project'}
            </span>
          </div>
          <Link to={requiresAuth ? `/services/${service.id}` : `/services/${service.id}`}>
            <Button size="sm" variant="gradient" className="gap-1">
              View <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Delivery Time */}
        <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>{service.deliveryTime}</span>
        </div>
      </div>
    </div>
  );
}
