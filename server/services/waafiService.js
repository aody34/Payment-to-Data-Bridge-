const axios = require('axios');
require('dotenv').config();

// Hormuud WaafiPay Service
const waafiService = {
    /**
     * Initiate Payment via WaafiPay
     * @param {string} payerPhone - The customer's phone number (e.g., 25261xxxxxxx)
     * @param {number} amount - Amount to charge
     * @returns {Promise<object>} - The API response
     */
    async processPayment(payerPhone, amount) {
        // 1. Validate Configuration
        const { WAAFI_API_USER_ID, WAAFI_API_KEY, WAAFI_MERCHANT_UID } = process.env;
        if (!WAAFI_API_USER_ID || !WAAFI_API_KEY || !WAAFI_MERCHANT_UID) {
            throw new Error('Missing WaafiPay credentials in .env');
        }

        // 2. Prepare Payload
        // Note: This matches standard WaafiPay Merchant API JSON structure.
        // Consult official docs for exact field names as they may vary by version.
        const payload = {
            schemaVersion: "1.0",
            requestId: `REQ_${Date.now()}`,
            timestamp: Date.now().toString(),
            channelName: "WEB",
            serviceName: "API_PURCHASE",
            serviceParams: {
                merchantUid: WAAFI_MERCHANT_UID,
                apiUserId: WAAFI_API_USER_ID,
                apiKey: WAAFI_API_KEY,
                paymentMethod: "MWALLET_ACCOUNT",
                payerInfo: {
                    accountNo: payerPhone // Format: 25261xxxxxxx
                },
                transactionInfo: {
                    referenceId: `REF_${Date.now()}`,
                    invoiceId: `INV_${Date.now()}`,
                    amount: amount.toString(),
                    currency: "USD",
                    description: "Data Bundle Purchase"
                }
            }
        };

        try {
            // 3. Send Request
            // URL is typically https://api.waafipay.net/asm - Verify with documentation
            const response = await axios.post('https://api.waafipay.net/asm', payload);

            // 4. Handle Response
            // Check responseCode or status (usually "2001" is success in Waafi)
            if (response.data && response.data.responseCode === '2001') {
                return { success: true, txnId: response.data.params.transactionId, data: response.data };
            } else {
                return { success: false, error: response.data.responseMsg || 'Unknown Error', data: response.data };
            }

        } catch (error) {
            console.error('WaafiPay Error:', error.response?.data || error.message);
            throw error;
        }
    }
};

module.exports = waafiService;
