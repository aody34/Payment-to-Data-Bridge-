import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { RefreshCw, CheckCircle, XCircle, Clock, Zap } from 'lucide-react';

const TransactionTable = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchTransactions = async () => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const response = await axios.get(`${apiUrl}/transactions`);
            setTransactions(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching transactions:', err);
            setError('Failed to load transactions');
        }
    };

    useEffect(() => {
        fetchTransactions();
        const interval = setInterval(fetchTransactions, 3000); // Poll every 3 seconds
        return () => clearInterval(interval);
    }, []);

    const handleDisburse = async (txnId) => {
        setLoading(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            await axios.post(`${apiUrl}/disburse`, { transactionId: txnId });
            fetchTransactions(); // Immediate refresh
        } catch (err) {
            console.error('Disbursement failed:', err);
            alert('Disbursement failed. See console.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'PENDING':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" /> Pending</span>;
            case 'PAID':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" /> Paid</span>;
            case 'DISBURSED':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"><Zap className="w-3 h-3 mr-1" /> Disbursed</span>;
            case 'FAILED':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" /> Failed</span>;
            default:
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
        }
    };

    const getBundleBadge = (type) => {
        if (type === '6hrs') return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">6 Hours</span>;
        if (type === '12hrs') return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">12 Hours</span>;
        return type;
    };

    return (
        <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Transaction Logs</h3>
                <button onClick={fetchTransactions} className="text-gray-500 hover:text-gray-700">
                    <RefreshCw className="w-5 h-5" />
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User (EVC)</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipient (Somtel)</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bundle</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {transactions.map((txn) => (
                            <tr key={txn.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{txn.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(txn.created_at).toLocaleTimeString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{txn.user_phone}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{txn.recipient_phone}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${txn.amount}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{getBundleBadge(txn.bundle_type)}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(txn.status)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    {txn.status === 'PAID' && (
                                        <button
                                            onClick={() => handleDisburse(txn.id)}
                                            disabled={loading}
                                            className="text-indigo-600 hover:text-indigo-900 disabled:opacity-50"
                                        >
                                            Disburse
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {transactions.length === 0 && (
                            <tr>
                                <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                                    No transactions yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TransactionTable;
