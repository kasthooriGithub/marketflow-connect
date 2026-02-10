import { db } from '../lib/firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

export async function migrateOrdersToTwoStagePayment() {
    console.log('🔄 Starting order migration to two-stage payment...');

    try {
        const ordersRef = collection(db, 'orders');
        const snapshot = await getDocs(ordersRef);

        let migratedCount = 0;
        let skippedCount = 0;

        for (const orderDoc of snapshot.docs) {
            const order = orderDoc.data();

            // Skip if already migrated
            if (order.advance_amount !== undefined && order.remaining_amount !== undefined) {
                console.log(`⏭️  Skipping ${orderDoc.id} - already migrated`);
                skippedCount++;
                continue;
            }

            // Calculate amounts
            const totalAmount = order.total_amount || 0;
            const advanceAmount = Math.round(totalAmount * 0.30);
            const remainingAmount = totalAmount - advanceAmount;

            // Determine payment stage based on current status
            let paymentStage = 'PENDING_ADVANCE';
            let paidAdvance = false;
            let paidRemaining = false;

            if (order.payment_status === 'paid' || order.status === 'completed') {
                // If already paid, mark as fully paid
                paymentStage = 'PAID_FULL';
                paidAdvance = true;
                paidRemaining = true;
            } else if (order.status === 'in_progress' || order.status === 'delivered') {
                // If in progress, assume advance was paid
                paymentStage = 'IN_PROGRESS';
                paidAdvance = true;
                paidRemaining = false;
            }

            // Update order
            const orderRef = doc(db, 'orders', orderDoc.id);
            await updateDoc(orderRef, {
                advance_amount: advanceAmount,
                remaining_amount: remainingAmount,
                paid_advance: paidAdvance,
                paid_remaining: paidRemaining,
                payment_stage: paymentStage
            });

            console.log(`✅ Migrated ${orderDoc.id}: $${totalAmount} → Advance: $${advanceAmount}, Remaining: $${remainingAmount}`);
            migratedCount++;
        }

        console.log(`\n✨ Migration complete!`);
        console.log(`   Migrated: ${migratedCount} orders`);
        console.log(`   Skipped: ${skippedCount} orders`);

        return { success: true, migrated: migratedCount, skipped: skippedCount };

    } catch (error) {
        console.error('❌ Migration failed:', error);
        return { success: false, error: error.message };
    }
}

