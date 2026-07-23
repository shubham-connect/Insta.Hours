import React from 'react';
import { useToast } from '../../contexts/ToastContext';
import { CreditCard, FileText, CheckCircle2, ArrowDownRight, ArrowUpRight, Download, ShieldCheck } from 'lucide-react';

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
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Header */}
        <div className="flex justify-between items-center pb-2 border-b border-purple-100">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#5B21B6]">Billing & Invoices</h1>
            <p className="text-xs font-semibold text-gray-500 mt-0.5">Manage payouts, platform fee breakdowns, and download GST invoices</p>
          </div>
        </div>

        {/* 2-Column Wide Desktop Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Column (1/3 width): Large Hero Balance Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-6">
              <div>
                <p className="text-xs font-extrabold text-orange-100 uppercase tracking-wider">
                  Total Outstanding Balance
                </p>
                <h2 className="text-4xl sm:text-5xl font-black tracking-tight mt-1">
                  ₹12,500
                </h2>
                <p className="text-xs text-orange-100 font-semibold mt-2">
                  Due date: 31st July 2026
                </p>
              </div>

              {/* Action Buttons Row */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handlePayNow}
                  className="bg-white text-orange-600 hover:bg-orange-50 font-extrabold text-sm px-6 py-3 rounded-xl shadow-md transition-all hover:scale-105 flex-1"
                >
                  Pay Now
                </button>

                <button
                  onClick={handleInvoices}
                  className="bg-orange-700/50 hover:bg-orange-700 text-white font-extrabold text-sm px-6 py-3 rounded-xl transition-all border border-orange-400/40 flex-1 flex items-center justify-center gap-1.5"
                >
                  <Download className="w-4 h-4" /> Invoices
                </button>
              </div>
            </div>

            {/* Billing Protection Notice */}
            <div className="app-card p-5 bg-white border border-purple-100 rounded-2xl shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-purple-700 font-extrabold text-sm">
                <ShieldCheck className="w-5 h-5 text-purple-600" />
                <span>Escrow Payout Guarantee</span>
              </div>
              <p className="text-xs font-semibold text-gray-500 leading-relaxed">
                Worker payouts are held safely in escrow and only released once candidate attendance and work deliverables are confirmed.
              </p>
            </div>
          </div>

          {/* Right Column (2/3 width): Billing Breakdown & Payment History */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Billing Breakdown */}
            <div className="space-y-3">
              <h2 className="text-lg font-extrabold text-[#5B21B6]">Billing Breakdown</h2>

              <div className="app-card p-6 bg-white border border-purple-100 rounded-3xl space-y-4 shadow-sm">
                <div className="flex justify-between items-center text-sm font-bold text-gray-700">
                  <span>Gig Worker Payouts (5 Verified Candidates)</span>
                  <span className="font-extrabold text-gray-900">₹10,000</span>
                </div>

                <div className="flex justify-between items-center text-sm font-bold text-gray-700">
                  <span>Platform Service Fee (10%)</span>
                  <span className="font-extrabold text-gray-900">₹1,000</span>
                </div>

                <div className="flex justify-between items-center text-sm font-bold text-gray-700">
                  <span>Featured Job Postings (x3 Active Slots)</span>
                  <span className="font-extrabold text-gray-900">₹1,500</span>
                </div>

                <div className="pt-4 border-t border-purple-100 flex justify-between items-center">
                  <span className="font-black text-base text-[#5B21B6]">Total Due Balance</span>
                  <span className="font-black text-2xl text-orange-600">₹12,500</span>
                </div>
              </div>
            </div>

            {/* Payment History */}
            <div className="space-y-3">
              <h2 className="text-lg font-extrabold text-[#5B21B6]">Payment History</h2>

              <div className="space-y-3">
                {/* History Item 1 */}
                <div className="app-card p-5 bg-white border border-purple-100 rounded-2xl flex items-center justify-between shadow-sm">
                  <div>
                    <h3 className="font-extrabold text-sm text-gray-900">Cleared Balance via UPI</h3>
                    <p className="text-xs font-semibold text-gray-400 mt-0.5">Transaction ID: TXN_987654321 • 12 Jul 2026</p>
                  </div>

                  <span className="font-black text-lg text-emerald-600">
                    -₹5,500
                  </span>
                </div>

                {/* History Item 2 */}
                <div className="app-card p-5 bg-white border border-purple-100 rounded-2xl flex items-center justify-between shadow-sm">
                  <div>
                    <h3 className="font-extrabold text-sm text-gray-900">Refund: Candidate No-Show Adjustment</h3>
                    <p className="text-xs font-semibold text-gray-400 mt-0.5">Adjustment Ref: REF_44321 • 05 Jul 2026</p>
                  </div>

                  <span className="font-black text-lg text-purple-700">
                    +₹500
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
