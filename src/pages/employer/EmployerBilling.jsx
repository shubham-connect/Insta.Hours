import React from 'react';
import { useToast } from '../../contexts/ToastContext';
import { CreditCard, FileText, CheckCircle2, ArrowDownRight, ArrowUpRight } from 'lucide-react';

export default function EmployerBilling() {
  const { addToast } = useToast();

  const handlePayNow = () => {
    addToast('Redirecting to UPI & Payment Gateway...', 'success');
  };

  const handleInvoices = () => {
    addToast('Downloading PDF Invoices...', 'info');
  };

  return (
    <div className="min-h-screen bg-[#F8F7FC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Top Header matching Screenshot 4 */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#5B21B6]">Billing & Invoices</h1>
        </div>

        {/* Large Orange Hero Card matching Screenshot 4 */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-4">
          <div>
            <p className="text-xs font-bold text-orange-100 uppercase tracking-wider">
              Total Outstanding Balance
            </p>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight mt-1">
              ₹12,500
            </h2>
          </div>

          {/* Action Buttons Row matching Screenshot 4 */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handlePayNow}
              className="bg-white text-orange-600 hover:bg-orange-50 font-extrabold text-sm px-6 py-2.5 rounded-xl shadow-md transition-all hover:scale-105"
            >
              Pay Now
            </button>

            <button
              onClick={handleInvoices}
              className="bg-orange-700/50 hover:bg-orange-700 text-white font-extrabold text-sm px-6 py-2.5 rounded-xl transition-all border border-orange-400/40"
            >
              Invoices
            </button>
          </div>
        </div>

        {/* Billing Breakdown Section matching Screenshot 4 */}
        <div className="space-y-3">
          <h2 className="text-lg font-extrabold text-[#5B21B6]">Billing Breakdown</h2>

          <div className="app-card p-5 bg-white border border-purple-100 rounded-2xl space-y-3 shadow-sm">
            <div className="flex justify-between items-center text-xs sm:text-sm font-bold text-gray-700">
              <span>Gig Worker Payouts</span>
              <span className="font-extrabold text-gray-900">₹10,000</span>
            </div>

            <div className="flex justify-between items-center text-xs sm:text-sm font-bold text-gray-700">
              <span>Platform Fee (10%)</span>
              <span className="font-extrabold text-gray-900">₹1,000</span>
            </div>

            <div className="flex justify-between items-center text-xs sm:text-sm font-bold text-gray-700">
              <span>Featured Postings (x3)</span>
              <span className="font-extrabold text-gray-900">₹1,500</span>
            </div>

            <div className="pt-3 border-t border-purple-100 flex justify-between items-center">
              <span className="font-black text-sm text-[#5B21B6]">Total Due</span>
              <span className="font-black text-lg text-orange-600">₹12,500</span>
            </div>
          </div>
        </div>

        {/* Payment History Section matching Screenshot 4 */}
        <div className="space-y-3">
          <h2 className="text-lg font-extrabold text-[#5B21B6]">Payment History</h2>

          <div className="space-y-3">
            {/* History Item 1 */}
            <div className="app-card p-4 bg-white border border-purple-100 rounded-2xl flex items-center justify-between shadow-sm">
              <div>
                <h3 className="font-extrabold text-sm text-gray-900">Cleared Balance via UPI</h3>
                <p className="text-xs font-semibold text-gray-400 mt-0.5">12 Jul 2026</p>
              </div>

              <span className="font-black text-base text-emerald-600">
                -₹5,500
              </span>
            </div>

            {/* History Item 2 */}
            <div className="app-card p-4 bg-white border border-purple-100 rounded-2xl flex items-center justify-between shadow-sm">
              <div>
                <h3 className="font-extrabold text-sm text-gray-900">Refund: Candidate No-Show</h3>
                <p className="text-xs font-semibold text-gray-400 mt-0.5">05 Jul 2026</p>
              </div>

              <span className="font-black text-base text-purple-700">
                +₹500
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
