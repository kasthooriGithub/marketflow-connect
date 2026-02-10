import { Card, Placeholder } from 'react-bootstrap';

export default function ReviewSkeleton() {
    return (
        <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="p-4">
                {/* Rating Stars Placeholder */}
                <div className="d-flex mb-3 gap-1">
                    {[...Array(5)].map((_, i) => (
                        <Placeholder key={i} as="div" animation="glow" style={{ width: 16, height: 16, borderRadius: '2px', background: '#f0f0f0' }} />
                    ))}
                </div>

                {/* Content Placeholder */}
                <Placeholder as="div" animation="glow">
                    <Placeholder xs={12} className="mb-2" />
                    <Placeholder xs={11} className="mb-2" />
                    <Placeholder xs={8} className="mb-4" />
                </Placeholder>

                {/* User Info Placeholder */}
                <div className="d-flex align-items-center gap-3">
                    <Placeholder as="div" animation="glow" style={{ width: 48, height: 48, borderRadius: '50%', background: '#e9ecef' }} />
                    <div>
                        <Placeholder as="div" animation="glow" className="mb-1" style={{ width: 120, height: 16, background: '#e9ecef' }} />
                        <Placeholder as="div" animation="glow" style={{ width: 80, height: 12, background: '#e9ecef' }} />
                    </div>
                </div>
            </Card.Body>
        </Card>
    );
}
