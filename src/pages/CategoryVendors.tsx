import { useState, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, MapPin, Clock, CheckCircle, Filter, SortAsc } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { categories } from '@/data/services';
import { getVendorsByCategory, Vendor } from '@/data/vendors';

function VendorCard({ vendor }: { vendor: Vendor }) {
  return (
    <Link 
      to={`/vendors/${vendor.id}`}
      className="group bg-card rounded-xl border border-border p-6 hover:border-primary/30 hover:shadow-lg transition-all duration-300"
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          {vendor.avatar ? (
            <img src={vendor.avatar} alt={vendor.name} className="w-full h-full object-cover rounded-xl" />
          ) : (
            <span className="text-2xl font-bold text-primary">{vendor.name.charAt(0)}</span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors">
                {vendor.name}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-1">{vendor.tagline}</p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="font-semibold text-foreground">{vendor.rating}</span>
              <span className="text-sm text-muted-foreground">({vendor.reviewCount})</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{vendor.description}</p>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {vendor.location}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {vendor.responseTime}
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-500" />
              {vendor.completionRate}% completion
            </span>
          </div>

          {/* Skills */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {vendor.skills.slice(0, 4).map((skill) => (
              <Badge key={skill} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
            {vendor.skills.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{vendor.skills.length - 4}
              </Badge>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <div>
              <span className="text-sm text-muted-foreground">Starting at </span>
              <span className="text-lg font-bold text-foreground">${vendor.startingPrice}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              {vendor.totalProjects} projects completed
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function CategoryVendors() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [priceFilter, setPriceFilter] = useState('all');

  const category = categories.find(c => c.id === categoryId);
  const vendors = categoryId ? getVendorsByCategory(categoryId) : [];

  const filteredAndSortedVendors = useMemo(() => {
    let result = [...vendors];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(v => 
        v.name.toLowerCase().includes(query) ||
        v.tagline.toLowerCase().includes(query) ||
        v.skills.some(s => s.toLowerCase().includes(query))
      );
    }

    // Price filter
    if (priceFilter !== 'all') {
      result = result.filter(v => {
        switch (priceFilter) {
          case 'under-500': return v.startingPrice < 500;
          case '500-1000': return v.startingPrice >= 500 && v.startingPrice <= 1000;
          case 'over-1000': return v.startingPrice > 1000;
          default: return true;
        }
      });
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'rating': return b.rating - a.rating;
        case 'reviews': return b.reviewCount - a.reviewCount;
        case 'price-low': return a.startingPrice - b.startingPrice;
        case 'price-high': return b.startingPrice - a.startingPrice;
        case 'projects': return b.totalProjects - a.totalProjects;
        default: return 0;
      }
    });

    return result;
  }, [vendors, searchQuery, sortBy, priceFilter]);

  if (!category) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Category not found</h1>
          <Button onClick={() => navigate('/services')}>Browse All Services</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header */}
      <div className="bg-gradient-to-b from-muted/50 to-background py-12">
        <div className="container mx-auto px-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="flex items-center gap-4 mb-4">
            <span className="text-5xl">{category.icon}</span>
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                {category.name} Experts
              </h1>
              <p className="text-muted-foreground mt-1">
                Compare and hire the best {category.name.toLowerCase()} vendors
              </p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mt-8">
            <div className="flex-1">
              <Input
                placeholder="Search vendors by name or skill..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11"
              />
            </div>
            <div className="flex gap-3">
              <Select value={priceFilter} onValueChange={setPriceFilter}>
                <SelectTrigger className="w-[160px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Price range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All prices</SelectItem>
                  <SelectItem value="under-500">Under $500</SelectItem>
                  <SelectItem value="500-1000">$500 - $1000</SelectItem>
                  <SelectItem value="over-1000">Over $1000</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[160px]">
                  <SortAsc className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="reviews">Most Reviews</SelectItem>
                  <SelectItem value="projects">Most Projects</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Vendors List */}
      <div className="container mx-auto px-4 py-12">
        <p className="text-muted-foreground mb-6">
          {filteredAndSortedVendors.length} vendor{filteredAndSortedVendors.length !== 1 ? 's' : ''} available
        </p>

        {filteredAndSortedVendors.length > 0 ? (
          <div className="space-y-4">
            {filteredAndSortedVendors.map((vendor) => (
              <VendorCard key={vendor.id} vendor={vendor} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-muted/30 rounded-xl">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">
              No vendors found
            </h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search or filter criteria
            </p>
            <Button 
              variant="outline" 
              onClick={() => { setSearchQuery(''); setPriceFilter('all'); }}
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* Trust Banner */}
        <div className="mt-12 bg-primary/5 rounded-xl p-6 border border-primary/10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">Trust-First Marketplace</h3>
              <p className="text-sm text-muted-foreground">
                Message vendors directly before making any payment. Clarify scope, expectations, 
                and pricing before committing. Only pay when you're ready to start.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
