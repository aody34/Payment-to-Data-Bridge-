const express = require('express');
const router = express.Router();
const db = require('../db');

// Payment Route (Simulate EVC Plus)
router.post('/pay', async (req, res) => {
    const { userPhone, recipientPhone, amount } = req.body;

    if (!userPhone || !recipientPhone || !amount) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate amount (Must be 0.20 or 0.40)
    const numAmount = parseFloat(amount);
    if (numAmount !== 0.20 && numAmount !== 0.40) {
        return res.status(400).json({ error: 'Invalid amount. Must be 0.20 or 0.40' });
    }

    const bundleType = numAmount === 0.20 ? '6hrs' : '12hrs';

    try {
        // 1. Create Transaction (PENDING)
        const result = await db.query(
            'INSERT INTO transactions (user_phone, recipient_phone, amount, bundle_type, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [userPhone, recipientPhone, numAmount, bundleType, 'PENDING']
        );
        const transaction = result.rows[0];

        // 2. Process Payment (Real or Mock)
        const useRealApi = process.env.USE_REAL_API === 'true';
        let isSuccess = false;
        let paymentData = {};

        if (useRealApi) {
            console.log('Attempting REAL Payment via WaafiPay...');
            const waafiService = require('../services/waafiService');
            const paymentResult = await waafiService.processPayment(userPhone, numAmount);

            if (paymentResult.success) {
                isSuccess = true;
                paymentData = paymentResult.data;
                await db.query('UPDATE transactions SET status = $1 WHERE id = $2', ['PAID', transaction.id]);
            } else {
                await db.query('UPDATE transactions SET status = $1 WHERE id = $2', ['FAILED', transaction.id]);
                return res.status(400).json({ error: 'Payment Failed', details: paymentResult.error, txnId: transaction.id });
            }
        } else {
            // MOCK MODE
            console.log('Simulating MOCK Payment...');
            isSuccess = Math.random() < 0.9;
            // Simulate delay for mock
            await new Promise(resolve => setTimeout(resolve, 1000));

            const newStatus = isSuccess ? 'PAID' : 'FAILED';
            await db.query('UPDATE transactions SET status = $1 WHERE id = $2', [newStatus, transaction.id]);
        }

        res.json({
            message: 'Payment processed',
            transactionId: transaction.id,
            status: isSuccess ? 'PAID' : 'FAILED',
            amount: numAmount,
            bundleType: bundleType,
            mode: useRealApi ? 'REAL' : 'MOCK'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Disbursement Route (Simulate eDahab)
router.post('/disburse', async (req, res) => {
    const { transactionId } = req.body;

    try {
        const result = await db.query('SELECT * FROM transactions WHERE id = $1', [transactionId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        const transaction = result.rows[0];

        if (transaction.status !== 'PAID') {
            // Allow retry if it failed? Or only if Paid?
            // Requirement: "Step B: Upon success, trigger Mock eDahab Data Disbursement."
            // So we only disburse if PAID.
            return res.status(400).json({ error: 'Transaction is not in PAID state', status: transaction.status });
        }

        // Update to DISBURSED
        const useRealApi = process.env.USE_REAL_API === 'true';

        if (useRealApi) {
            console.log('Attempting REAL Disbursement via eDahab...');
            const edahabService = require('../services/edahabService');
            // Note: Check if amount needs parsing or mapping to Bundle ID here
            const disburseResult = await edahabService.disburseBundle(transaction.recipient_phone, transaction.amount);

            if (!disburseResult.success) {
                return res.status(400).json({ error: 'Disbursement Failed', details: disburseResult.error });
            }
        } else {
            console.log('Simulating MOCK Disbursement...');
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        const updateResult = await db.query(
            'UPDATE transactions SET status = $1 WHERE id = $2 RETURNING *',
            ['DISBURSED', transaction.id]
        );

        res.json({
            message: 'Data bundle disbursed successfully',
            transaction: updateResult.rows[0],
            mode: useRealApi ? 'REAL' : 'MOCK'
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get Logs
router.get('/transactions', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM transactions ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
