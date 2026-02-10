import { Placeholder } from 'react-bootstrap';

export default function StatsSkeleton() {
    return (
        <div className="d-flex flex-wrap justify-content-center gap-5 pt-4">
            {[1, 2, 3].map((item) => (
                <div key={item} className="text-center pt-4" style={{ minWidth: '150px' }}>
                    <Placeholder as="div" animation="glow" className="mb-2 d-flex justify-content-center">
                        <Placeholder xs={8} style={{ height: '2.5rem', borderRadius: '4px' }} />
                    </Placeholder>
                    <Placeholder as="div" animation="glow" className="d-flex justify-content-center">
                        <Placeholder xs={6} size="sm" />
                    </Placeholder>
                </div>
            ))}
        </div>
    );
}
