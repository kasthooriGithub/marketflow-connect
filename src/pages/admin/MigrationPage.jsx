import React, { useState } from 'react';
import { Container, Card, Button, Alert, Spinner } from 'react-bootstrap';
import { migrateOrdersToTwoStagePayment } from '../../utils/migrateOrders';
import { CheckCircle, AlertCircle } from 'lucide-react';

/**
 * Admin Migration Page
 * Use this page to migrate existing orders to the two-stage payment system
 */
export default function MigrationPage() {
    const [migrating, setMigrating] = useState(false);
    const [result, setResult] = useState(null);

    const handleMigrate = async () => {
        setMigrating(true);
        setResult(null);

        const migrationResult = await migrateOrdersToTwoStagePayment();

        setResult(migrationResult);
        setMigrating(false);
    };

    return (
        <Container className="py-5">
            <Card className="border-0 shadow-sm">
                <Card.Body className="p-5">
                    <h2 className="h3 fw-bold mb-4">Order Migration Utility</h2>

                    <Alert variant="info" className="mb-4">
                        <AlertCircle size={18} className="me-2" />
                        <strong>What this does:</strong> Updates all existing orders to support the new two-stage payment system (30% advance + 70% remaining).
                    </Alert>

                    <Alert variant="warning" className="mb-4">
                        <strong>⚠️ Important:</strong>
                        <ul className="mb-0 mt-2">
                            <li>This will update ALL orders in your database</li>
                            <li>Orders already paid will be marked as fully paid</li>
                            <li>Orders in progress will be marked as advance paid</li>
                            <li>Run this only once after deploying the two-stage payment update</li>
                        </ul>
                    </Alert>

                    <Button
                        variant="primary"
                        size="lg"
                        onClick={handleMigrate}
                        disabled={migrating}
                        className="w-100 mb-4"
                    >
                        {migrating ? (
                            <>
                                <Spinner animation="border" size="sm" className="me-2" />
                                Migrating Orders...
                            </>
                        ) : (
                            'Start Migration'
                        )}
                    </Button>

                    {result && (
                        <Alert variant={result.success ? 'success' : 'danger'}>
                            {result.success ? (
                                <>
                                    <CheckCircle size={18} className="me-2" />
                                    <strong>Migration Successful!</strong>
                                    <div className="mt-2">
                                        <p className="mb-0">✅ Migrated: {result.migrated} orders</p>
                                        <p className="mb-0">⏭️ Skipped: {result.skipped} orders (already migrated)</p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <AlertCircle size={18} className="me-2" />
                                    <strong>Migration Failed:</strong> {result.error}
                                </>
                            )}
                        </Alert>
                    )}

                    <div className="mt-4 p-3 bg-light rounded">
                        <h5 className="h6 fw-bold mb-2">After Migration:</h5>
                        <ul className="small mb-0">
                            <li>New proposals will automatically use two-stage payments</li>
                            <li>Existing orders will show correct payment stages</li>
                            <li>Clients will see "Pay Advance" or "Pay Remaining" buttons</li>
                            <li>Vendors can only deliver after advance payment</li>
                        </ul>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
}
