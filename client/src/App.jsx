import React from 'react';
import TransactionTable from './components/TransactionTable';
import PaymentForm from './components/PaymentForm';
import { LayoutDashboard } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900">

      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex items-center">
          <div className="bg-green-600 p-2 rounded-lg mr-4">
            <LayoutDashboard className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payment-to-Data Bridge</h1>
            <p className="text-sm text-gray-500">Hormuud EVC to Somtel eDahab Admin Portal</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">

        {/* Dashboard Grid */}
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Left Column: Payment Form */}
            <div className="md:col-span-1">
              <PaymentForm />

              <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      <strong>Mock Mode Active:</strong> payments have a 90% success rate.
                      Amounts are simulated.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Transactions Log */}
            <div className="md:col-span-2">
              <TransactionTable />
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
