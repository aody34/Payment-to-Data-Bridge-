const axios = require('axios');
require('dotenv').config();

// Somtel eDahab Service
const edahabService = {
    /**
     * Disburse Data/Funds via eDahab
     * Note: This usually requires a B2C (Business to Customer) or Bulk Payment endpoint.
     * Standard eDahab API is for receiving payments (Invoicing).
     * Assuming a specific "Credit" or "Transfer" endpoint exists for merchants.
     * 
     * @param {string} recipientPhone - The recipient's phone number (e.g., 25265xxxxxxx)
     * @param {number} amount - Amount or Bundle ID
     * @returns {Promise<object>}
     */
    async disburseBundle(recipientPhone, amount) {
        const { EDAHAB_API_KEY, EDAHAB_SECRET_KEY, EDAHAB_AGENT_CODE } = process.env;

        if (!EDAHAB_API_KEY || !EDAHAB_SECRET_KEY) {
            throw new Error('Missing eDahab credentials in .env');
        }

        // Token Generation (Often required first)
        // const token = await this.getToken(); 

        const payload = {
            apiKey: EDAHAB_API_KEY,
            secretKey: EDAHAB_SECRET_KEY, // Or hashed/signed version
            transactionType: "B2C", // Hypothetical
            recipient: recipientPhone,
            amount: amount,
            currency: "USD",
            reference: `DISB_${Date.now()}`
        };

        try {
            // Endpoint to be confirmed with Somtel documentation
            const response = await axios.post('https://edahab.net/api/api/transaction', payload);

            if (response.data && response.data.StatusCode === 0) {
                return { success: true, txnId: response.data.TransactionId };
            } else {
                return { success: false, error: response.data.StatusMessage || 'Failed' };
            }
        } catch (error) {
            console.error('eDahab Error:', error.response?.data || error.message);
            throw error;
        }
    }
};

module.exports = edahabService;
