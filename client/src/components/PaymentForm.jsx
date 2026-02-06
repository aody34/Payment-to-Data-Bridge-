import React, { useState } from 'react';
import axios from 'axios';
import { Smartphone, DollarSign, Send } from 'lucide-react';

const PaymentForm = ({ onPaymentSuccess }) => {
    const [userPhone, setUserPhone] = useState('061');
    const [recipientPhone, setRecipientPhone] = useState('065');
    const [amount, setAmount] = useState('0.20');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        // Basic Validation
        if (userPhone.length < 9 || recipientPhone.length < 9) {
            setMessage({ type: 'error', text: 'Please enter valid phone numbers.' });
            setLoading(false);
            return;
        }

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const response = await axios.post(`${apiUrl}/pay`, {
                userPhone,
                recipientPhone,
                amount
            });

            setMessage({ type: 'success', text: `Payment Initiated! ID: ${response.data.transactionId}` });
            if (onPaymentSuccess) onPaymentSuccess();

            // Reset form slightly
            setUserPhone('061');
            setRecipientPhone('065');

        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: err.response?.data?.error || 'Payment failed.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">New Transaction</h3>

            <form onSubmit={handleSubmit} className="space-y-4">

                {/* User Phone (EVC) */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Hormuud Number (Payer)</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Smartphone className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={userPhone}
                            onChange={(e) => setUserPhone(e.target.value)}
                            className="input-field pl-10"
                            placeholder="061xxxxxxx"
                        />
                    </div>
                </div>

                {/* Recipient Phone (eDahab) */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Somtel Number (Recipient)</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Smartphone className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={recipientPhone}
                            onChange={(e) => setRecipientPhone(e.target.value)}
                            className="input-field pl-10"
                            placeholder="065xxxxxxx"
                        />
                    </div>
                </div>

                {/* Amount Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Select Bundle</label>
                    <div className="mt-1 grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => setAmount('0.20')}
                            className={`border rounded-md p-4 flex flex-col items-center justify-center transition-colors ${amount === '0.20' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-300 hover:bg-gray-50'
                                }`}
                        >
                            <span className="text-lg font-bold text-gray-900">$0.20</span>
                            <span className="text-xs text-blue-600 font-medium">6hrs Data</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setAmount('0.40')}
                            className={`border rounded-md p-4 flex flex-col items-center justify-center transition-colors ${amount === '0.40' ? 'border-purple-500 bg-purple-50 ring-1 ring-purple-500' : 'border-gray-300 hover:bg-gray-50'
                                }`}
                        >
                            <span className="text-lg font-bold text-gray-900">$0.40</span>
                            <span className="text-xs text-purple-600 font-medium">12hrs Data</span>
                        </button>
                    </div>
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {loading ? 'Processing...' : <span className="flex items-center">Pay & Process <Send className="ml-2 h-4 w-4" /></span>}
                </button>

                {/* Feedback Message */}
                {message && (
                    <div className={`mt-2 text-sm p-2 rounded ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                        {message.text}
                    </div>
                )}

            </form>
        </div>
    );
};

export default PaymentForm;
