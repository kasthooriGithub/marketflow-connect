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
    if (!isAuthenticated) return;
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

  const getServiceIcon = () => {
    if (service.category_icon) return service.category_icon;
    const tag = service.tags?.[0];
    switch (tag) {
      case 'SEO': return '🔍';
      case 'Social Media': return '📱';
      case 'Content': return '✍️';
      case 'PPC': return '📈';
      case 'Video': return '🎬';
      case 'Branding': return '🎨';
      case 'Email': return '📧';
      case 'Analytics': return '📊';
      default: return '💼';
    }
  };

  // Firebase field compatibility
  const vendorIdForLink = service.vendor_id || service.vendorId;

  return (
    <Card className="h-100 border hover-shadow transition-all" style={{ transition: 'all 0.3s' }}>
      <div
        className="position-relative d-flex align-items-center justify-content-center overflow-hidden"
        style={{
          height: '160px',
          background: 'linear-gradient(135deg, rgba(13, 110, 253, 0.1) 0%, rgba(13, 202, 240, 0.1) 100%)'
        }}
      >
        <span className="display-4">{getServiceIcon()}</span>
        <button
          onClick={handleToggleSave}
          disabled={loading}
          className="position-absolute top-0 end-0 m-3 btn btn-light rounded-circle p-2 shadow-sm d-flex align-items-center justify-content-center border-0"
          style={{ width: '38px', height: '38px', zIndex: 10 }}
        >
          <Heart size={20} className={isSaved ? "text-danger fill-danger" : "text-muted"} style={{ fill: isSaved ? 'currentColor' : 'none' }} />
        </button>
      </div>

      <Card.Body className="d-flex flex-column p-4">
        <div className="d-flex align-items-center gap-2 mb-2">
          {service.tags?.slice(0, 2).map(tag => (
            <Badge key={tag} variant="secondary" className="fw-normal">{tag}</Badge>
          ))}
        </div>

        <Card.Title className="fw-bold mb-2 text-truncate-2" style={{ minHeight: '3rem' }}>
          {service.title}
        </Card.Title>

        <Card.Text className="text-muted small mb-3 text-truncate-2">
          {service.description}
        </Card.Text>

        <div className="d-flex align-items-center justify-content-between mb-3 mt-auto">
          {/* Path Corrected: /vendors/ (matches App.jsx) */}
          <Link 
            to={`/vendors/${vendorIdForLink}`} 
            className="text-decoration-none"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="small text-primary fw-medium hover-underline" style={{ cursor: 'pointer' }}>
              {service.vendor_name || 'Professional'}
            </span>
          </Link>
          
          <div className="d-flex align-items-center gap-1">
            <Star size={14} className="text-warning fill-warning" />
            <span className="small fw-medium">{service.average_rating || 5.0}</span>
          </div>
        </div>

        <div className="d-flex align-items-center justify-content-between pt-3 border-top">
          <span className="h5 fw-bold mb-0 text-dark">${service.price}</span>
          <Link to={`/services/${service.id}`}>
            <Button size="sm" variant="gradient" className="d-flex align-items-center gap-1">
              View <ArrowRight size={14} />
            </Button>
          </Link>
        </div>
      </Card.Body>
      <style>{`
        .text-truncate-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .fill-warning { fill: #ffc107; }
        .fill-danger { fill: #dc3545; }
        .hover-shadow:hover { box-shadow: 0 .5rem 1rem rgba(0,0,0,.15); transform: translateY(-2px); }
        .hover-underline:hover { text-decoration: underline !important; color: #0056b3 !important; }
      `}</style>
    </Card>
  );
}