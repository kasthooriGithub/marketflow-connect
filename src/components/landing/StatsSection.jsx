import { useState, useEffect } from 'react';
import { db } from 'lib/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import StatsSkeleton from './StatsSkeleton';
import { Button } from 'react-bootstrap';

const formatNumber = (num) => {
    if (num === null || num === undefined) return '—';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M+';
    if (num >= 1000) return Math.floor(num / 1000) + 'K+'; // 50000 -> 50K+
    return num.toLocaleString() + '+'; // 2498 -> 2,498+
};

const formatRating = (rating) => {
    if (rating === null || rating === undefined) return '—';
    return `${Number(rating).toFixed(1)}/5`;
};

export default function StatsSection() {
    const [stats, setStats] = useState({
        verifiedExperts: null,
        projectsCompleted: null,
        avgRating: null
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [permissionError, setPermissionError] = useState(false);

    useEffect(() => {
        // Firestore path: platformStats/overview
        const statsRef = doc(db, 'platformStats', 'overview');

        const unsubscribe = onSnapshot(statsRef, (docSnap) => {
            if (docSnap.exists()) {
                setStats(docSnap.data());
                setError(false);
            } else {
                console.warn("Stats document not found at platformStats/overview");
                setError(true);
            }
            setLoading(false);
        }, (err) => {
            console.error("Error fetching stats:", err);
            setError(true);
            if (err.code === 'permission-denied') {
                setPermissionError(true);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const initializeStats = async () => {
        try {
            await setDoc(doc(db, 'platformStats', 'overview'), {
                verifiedExperts: 2500,
                projectsCompleted: 50000,
                avgRating: 4.9
            });
            // The onSnapshot listener will pick this up automatically
            alert("Success: Stats initialized!");
        } catch (err) {
            console.error("Error creating stats:", err);
            alert(`Error: ${err.message}. You may need to create 'platformStats/overview' in the Firestore Console manually.`);
        }
    };

    if (loading) {
        return <StatsSkeleton />;
    }

    return (
        <div className="d-flex flex-wrap justify-content-center gap-5 mt-5 pt-4" style={{ borderTop: '1px solid #E4E5E7' }}>

            {/* Verified Experts */}
            <div className="text-center pt-4">
                <div className="h2 fw-bold mb-1" style={{ color: '#404145' }}>
                    {error ? '—' : formatNumber(stats.verifiedExperts)}
                </div>
                <div className="small" style={{ color: '#95979D' }}>Verified Experts</div>
            </div>

            {/* Projects Completed */}
            <div className="text-center pt-4">
                <div className="h2 fw-bold mb-1" style={{ color: '#404145' }}>
                    {error ? '—' : formatNumber(stats.projectsCompleted)}
                </div>
                <div className="small" style={{ color: '#95979D' }}>Projects Completed</div>
            </div>

            {/* Average Rating */}
            <div className="text-center pt-4">
                <div className="h2 fw-bold mb-1" style={{ color: '#404145' }}>
                    {error ? '—' : formatRating(stats.avgRating)}
                </div>
                <div className="small" style={{ color: '#95979D' }}>Average Rating</div>
            </div>

            {error && !permissionError && (
                <div className="w-100 text-center mt-3">
                    <p className="small text-danger mb-2">Unavailable (Document Missing)</p>
                    <Button size="sm" variant="outline-primary" onClick={initializeStats}>
                        Initialize Data
                    </Button>
                </div>
            )}

            {error && permissionError && (
                <div className="w-100 text-center mt-3">
                    <p className="small text-danger">Unable to load (Permission Denied)</p>
                </div>
            )}
        </div>
    );
}
