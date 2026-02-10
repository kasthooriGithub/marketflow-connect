import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Tabs, Tab, Alert } from 'react-bootstrap';
import { Layout } from 'components/layout/Layout'; // Keep if used elsewhere or remove
import { AdminLayout } from 'components/layout/AdminLayout';
// Actually AdminDashboard in App.jsx is wrapped in AdminRoute. 
// AdminDashboard likely has its own layout or sidebar.
// Let's assume for now we need a standalone page or consistent layout. 
// Reviewing AdminDashboard.jsx will confirm layout usage. 
// Based on typical admin setups, I'll structure it as a standalone component that matches the admin style.

import { db } from 'lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { Star, CheckCircle, XCircle, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export default function AdminReviews() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, pending, featured

    useEffect(() => {
        const q = query(collection(db, 'platformReviews'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const loaded = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                // Handle timestamps safely
                createdAt: doc.data().createdAt?.toDate() || new Date()
            }));
            setReviews(loaded);
            setLoading(false);
        }, (err) => {
            console.error("Error fetching reviews:", err);
            toast.error("Failed to load reviews");
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleToggleFeature = async (review) => {
        try {
            const ref = doc(db, 'platformReviews', review.id);
            await updateDoc(ref, {
                featured: !review.featured
            });
            toast.success(review.featured ? "Review un-featured" : "Review featured on landing page");
        } catch (err) {
            console.error("Error updating review:", err);
            toast.error("Failed to update status");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this review? This action cannot be undone.")) return;

        try {
            await deleteDoc(doc(db, 'platformReviews', id));
            toast.success("Review deleted");
        } catch (err) {
            console.error("Error deleting review:", err);
            toast.error("Failed to delete review");
        }
    };

    const filteredReviews = reviews.filter(r => {
        if (filter === 'pending') return !r.featured;
        if (filter === 'featured') return r.featured;
        return true;
    });

    return (
        <AdminLayout title="Platform Reviews">
            <div className="py-4">
                {/* Header is handled by AdminLayout */}
                <div className="d-flex justify-content-end align-items-center mb-4">
                    <Link to="/admin/dashboard" className="btn btn-outline-secondary btn-sm">Dashboard Overview</Link>
                </div>

                <Card className="border-0 shadow-sm rounded-4">
                    <Card.Header className="bg-white border-bottom pt-4 px-4 pb-0">
                        <Tabs
                            activeKey={filter}
                            onSelect={(k) => setFilter(k)}
                            className="mb-0 border-0"
                        >
                            <Tab eventKey="all" title={`All Reviews (${reviews.length})`} />
                            <Tab eventKey="pending" title={`Pending (${reviews.filter(r => !r.featured).length})`} />
                            <Tab eventKey="featured" title={`Featured (${reviews.filter(r => r.featured).length})`} />
                        </Tabs>
                    </Card.Header>
                    <Card.Body className="p-0">
                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary" role="status"></div>
                            </div>
                        ) : filteredReviews.length === 0 ? (
                            <div className="text-center py-5 text-muted">
                                <p>No reviews found matching this filter.</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <Table hover className="align-middle mb-0">
                                    <thead className="bg-light">
                                        <tr>
                                            <th className="ps-4 text-uppercase text-muted small fw-bold">User</th>
                                            <th className="text-uppercase text-muted small fw-bold">Rating</th>
                                            <th className="text-uppercase text-muted small fw-bold" style={{ width: '40%' }}>Comment</th>
                                            <th className="text-uppercase text-muted small fw-bold">Status</th>
                                            <th className="text-uppercase text-muted small fw-bold">Date</th>
                                            <th className="text-uppercase text-muted small fw-bold text-end pe-4">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredReviews.map(review => (
                                            <tr key={review.id}>
                                                <td className="ps-4">
                                                    <div className="d-flex align-items-center">
                                                        {review.avatar ? (
                                                            <img src={review.avatar} alt={review.name} className="rounded-circle me-3" width="32" height="32" style={{ objectFit: 'cover' }} />
                                                        ) : (
                                                            <div className="rounded-circle bg-light d-flex align-items-center justify-content-center me-3 text-muted fw-bold" style={{ width: 32, height: 32, fontSize: 12 }}>
                                                                {review.name?.substring(0, 2).toUpperCase()}
                                                            </div>
                                                        )}
                                                        <div>
                                                            <div className="fw-bold text-dark">{review.name}</div>
                                                            <div className="small text-muted">{review.userRole}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="d-flex text-warning">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} strokeWidth={i < review.rating ? 0 : 2} className={i < review.rating ? "" : "text-muted opacity-25"} />
                                                        ))}
                                                    </div>
                                                </td>
                                                <td>
                                                    <p className="mb-0 small text-dark" style={{ maxWidth: '400px', lineHeight: '1.4' }}>
                                                        {review.content}
                                                    </p>
                                                </td>
                                                <td>
                                                    {review.featured ? (
                                                        <Badge bg="success" className="d-inline-flex align-items-center gap-1">
                                                            <CheckCircle size={10} /> Live
                                                        </Badge>
                                                    ) : (
                                                        <Badge bg="secondary" className="bg-opacity-25 text-secondary border border-secondary d-inline-flex align-items-center gap-1">
                                                            Hidden
                                                        </Badge>
                                                    )}
                                                </td>
                                                <td className="small text-muted">
                                                    {review.createdAt.toLocaleDateString()}
                                                </td>
                                                <td className="text-end pe-4">
                                                    <div className="d-flex justify-content-end gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant={review.featured ? "outline-warning" : "outline-success"}
                                                            onClick={() => handleToggleFeature(review)}
                                                            title={review.featured ? "Un-feature" : "Feature on Landing Page"}
                                                        >
                                                            {review.featured ? <XCircle size={16} /> : <CheckCircle size={16} />}
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline-danger"
                                                            onClick={() => handleDelete(review.id)}
                                                            title="Delete Review"
                                                        >
                                                            <Trash2 size={16} />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        )}
                    </Card.Body>
                </Card>
            </div>
        </AdminLayout>
    );
}
