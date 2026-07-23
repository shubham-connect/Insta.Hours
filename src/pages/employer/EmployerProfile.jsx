import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { CheckCircle2, Star, Crown, ChevronRight, LogOut, Building2, Edit3 } from 'lucide-react';

export default function EmployerProfile() {
  const { userProfile, signOut } = useAuth();
  const { addToast } = useToast();

  const name = userProfile?.name || 'TechNova Solutions';
  const category = userProfile?.category || 'Information Technology • 11-50 employees';

  return (
    <div className="min-h-screen bg-[#F8F7FC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Top Header matching Screenshot 2 & 3 */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#5B21B6]">Company Profile</h1>
        </div>

        {/* Profile Details Card matching Screenshot 2 */}
        <div className="app-card p-6 bg-white border border-purple-100 rounded-3xl shadow-sm text-center flex flex-col items-center space-y-4">
          
          {/* Square Violet Logo with TN Initials */}
          <div className="w-24 h-24 rounded-3xl bg-[#6D28D9] text-white font-black text-3xl flex items-center justify-center shadow-lg shadow-purple-600/30">
            TN
          </div>

          <div>
            <div className="flex items-center justify-center gap-1.5">
              <h2 className="text-2xl font-black text-gray-900">{name}</h2>
              <CheckCircle2 className="w-6 h-6 fill-purple-600 text-white" />
            </div>
            <p className="text-xs font-semibold text-gray-500 mt-1">{category}</p>
          </div>

          {/* 3 Stat Cards Row matching Screenshot 2 */}
          <div className="w-full grid grid-cols-3 gap-3 pt-2">
            <div className="bg-purple-50/50 border border-purple-100 rounded-2xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-orange-500 font-black text-base">
                <Star className="w-4 h-4 fill-orange-500" /> 4.6
              </div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">RATING</p>
            </div>

            <div className="bg-purple-50/50 border border-purple-100 rounded-2xl p-3 text-center">
              <p className="font-black text-base text-gray-900">2</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">POSTINGS</p>
            </div>

            <div className="bg-purple-50/50 border border-purple-100 rounded-2xl p-3 text-center">
              <p className="font-black text-base text-gray-900">1,240</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">FOLLOWERS</p>
            </div>
          </div>
        </div>

        {/* Enterprise Plan Card matching Screenshot 2 */}
        <div className="app-card p-5 bg-white border border-purple-100 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Crown className="w-6 h-6 text-orange-500" />
            <div>
              <h3 className="font-extrabold text-base text-gray-900">Enterprise Plan</h3>
              <p className="text-xs font-semibold text-gray-400 mt-0.5">Active • Renews Aug 1, 2026</p>
            </div>
          </div>

          <button
            onClick={() => addToast('Plan details & invoices', 'info')}
            className="text-xs font-extrabold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-4 py-2 rounded-xl transition-all"
          >
            Manage
          </button>
        </div>

        {/* Action Options List matching Screenshot 2 */}
        <div className="space-y-3">
          <button
            onClick={() => addToast('Edit Company Profile modal', 'info')}
            className="w-full app-card p-4 bg-white border border-purple-100 rounded-2xl flex items-center justify-between text-left hover:border-purple-300 transition-all"
          >
            <span className="font-extrabold text-sm text-purple-900">Edit Company Profile</span>
            <ChevronRight className="w-5 h-5 text-purple-400" />
          </button>

          <button
            onClick={() => {
              signOut();
              addToast('Logged Out', 'info');
            }}
            className="w-full app-card p-4 bg-purple-50/50 border border-purple-100 rounded-2xl flex items-center justify-between text-left hover:bg-red-50 hover:border-red-200 transition-all group"
          >
            <span className="font-extrabold text-sm text-orange-600 group-hover:text-red-600">Log Out</span>
            <LogOut className="w-5 h-5 text-orange-500 group-hover:text-red-600" />
          </button>
        </div>
      </div>
    </div>
  );
}
