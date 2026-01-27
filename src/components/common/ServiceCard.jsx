import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, ArrowRight, Heart } from 'lucide-react';
import { Button } from 'components/ui/button';
import { Badge } from 'components/ui/badge';
import { Card } from 'react-bootstrap';
import { useAuth } from 'contexts/AuthContext';
import { isServiceSaved, saveService, unsaveService } from 'services/savedServiceService';

export function ServiceCard({ service, requiresAuth = true }) {
  const { user, isAuthenticated } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkSavedStatus = async () => {
      if (isAuthenticated && user?.uid) {
        const saved = await isServiceSaved(user.uid, service.id);
        setIsSaved(saved);
      }
    };
    checkSavedStatus();
  }, [isAuthenticated, user?.uid, service.id]);

  const handleToggleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      // Logic for when user is not authenticated (optional: redirect to login)
      return;
    }

    setLoading(true);
    try {
      if (isSaved) {
        await unsaveService(user.uid, service.id);
        setIsSaved(false);
      } else {
        await saveService(user.uid, service);
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Error toggling save status:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="h-100 border hover-shadow transition-all" style={{ transition: 'all 0.3s' }}>
      {/* Image Header with Gradient */}
      <div
        className="position-relative d-flex align-items-center justify-content-center overflow-hidden"
        style={{
          height: '160px',
          background: 'linear-gradient(135deg, rgba(13, 110, 253, 0.1) 0%, rgba(13, 202, 240, 0.1) 100%)'
        }}
      >
        <span className="display-4">
          {service.tags[0] === 'SEO' ? '🔍' :
            service.tags[0] === 'Social Media' ? '📱' :
              service.tags[0] === 'Content' ? '✍️' :
                service.tags[0] === 'PPC' ? '📈' :
                  service.tags[0] === 'Video' ? '🎬' :
                    service.tags[0] === 'Branding' ? '🎨' : '📊'}
        </span>

        {/* Heart Toggle Button */}
        <button
          onClick={handleToggleSave}
          disabled={loading}
          className="position-absolute top-0 end-0 m-3 btn btn-light rounded-circle p-2 shadow-sm d-flex align-items-center justify-content-center border-0"
          style={{ width: '38px', height: '38px', zIndex: 10, transition: 'transform 0.2s' }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <Heart
            size={20}
            className={isSaved ? "text-danger fill-danger" : "text-muted"}
            style={{ fill: isSaved ? 'currentColor' : 'none' }}
          />
        </button>

        {service.popular && (
          <div className="position-absolute top-0 start-0 m-3">
            <Badge variant="secondary">Popular</Badge>
          </div>
        )}
      </div>

      <Card.Body className="d-flex flex-column p-4">
        {/* Tags */}
        <div className="d-flex align-items-center gap-2 mb-2">
          {service.tags.slice(0, 2).map(tag => (
            <Badge key={tag} variant="secondary" className="fw-normal">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Title */}
        <Card.Title className="fw-bold mb-2 text-truncate-2" style={{ minHeight: '3rem' }}>
          {service.title}
        </Card.Title>

        {/* Description */}
        <Card.Text className="text-muted small mb-3 text-truncate-2">
          {service.description}
        </Card.Text>

        {/* Vendor & Rating */}
        <div className="d-flex align-items-center justify-content-between mb-3 mt-auto">
          <span className="small text-muted">{service.vendorName}</span>
          <div className="d-flex align-items-center gap-1">
            <Star size={14} className="text-warning fill-warning" />
            <span className="small fw-medium">{service.rating}</span>
            <span className="small text-muted">({service.reviewCount})</span>
          </div>
        </div>

        {/* Price & Action */}
        <div className="d-flex align-items-center justify-content-between pt-3 border-top">
          <div>
            <span className="h5 fw-bold mb-0 text-dark">${service.price}</span>
            <span className="small text-muted ms-1">
              /{service.priceType === 'monthly' ? 'mo' : service.priceType === 'hourly' ? 'hr' : 'project'}
            </span>
          </div>
          <Link to={requiresAuth ? `/services/${service.id}` : `/services/${service.id}`}>
            <Button size="sm" variant="gradient" className="d-flex align-items-center gap-1">
              View <ArrowRight size={14} />
            </Button>
          </Link>
        </div>

        {/* Delivery Time */}
        <div className="d-flex align-items-center gap-1 mt-3 small text-muted">
          <Clock size={12} />
          <span>{service.deliveryTime}</span>
        </div>
      </Card.Body>
      <style>{`
        .text-truncate-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
        .fill-warning { fill: #ffc107; }
        .fill-danger { fill: #dc3545; }
        .hover-shadow:hover { box-shadow: 0 .5rem 1rem rgba(0,0,0,.15); transform: translateY(-2px); }
      `}</style>
    </Card>
  );
}
