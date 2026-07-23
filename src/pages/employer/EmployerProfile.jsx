import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { CheckCircle2, Star, Crown, ChevronRight, LogOut, Building2, Edit3, ShieldCheck, Mail, MapPin, HelpCircle, MessageSquare, PhoneCall } from 'lucide-react';

export default function EmployerProfile() {
  const { userProfile, signOut } = useAuth();
  const { addToast } = useToast();

  const name = userProfile?.name || 'TechCorp Solutions';
  const category = userProfile?.category || 'Information Technology • 11-50 employees';

  return (
    <div className="min-h-screen bg-[#F8F7FC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Header */}
        <div className="flex justify-between items-center pb-2 border-b border-purple-100">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#5B21B6]">Company Profile</h1>
            <p className="text-xs font-semibold text-gray-500 mt-0.5">Manage your organization settings, plan, and public profile</p>
          </div>
        </div>

        {/* 2-Column Desktop Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Column (1/3 width): Main Profile Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="app-card p-6 bg-white border border-purple-100 rounded-3xl shadow-sm text-center flex flex-col items-center space-y-4">
              <div className="w-24 h-24 rounded-3xl bg-[#6D28D9] text-white font-black text-3xl flex items-center justify-center shadow-lg shadow-purple-600/30">
                TN
              </div>

              <div>
                <div className="flex items-center justify-center gap-1.5">
                  <h2 className="text-2xl font-black text-gray-900">{name}</h2>
                  <CheckCircle2 className="w-6 h-6 fill-purple-600 text-white" />
                </div>
                <p className="text-xs font-semibold text-gray-500 mt-1">{category}</p>
                <p className="text-xs font-bold text-purple-700 mt-2 flex items-center justify-center gap-1">
                  <MapPin className="w-3.5 h-3.5 fill-purple-700 text-white" /> Bengaluru, Karnataka
                </p>
              </div>

              {/* 3 Stat Cards Row */}
              <div className="w-full grid grid-cols-3 gap-2 pt-2">
                <div className="bg-purple-50/50 border border-purple-100 rounded-2xl p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-orange-500 font-black text-base">
                    <Star className="w-4 h-4 fill-orange-500" /> 4.6
                  </div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">RATING</p>
                </div>

                <div className="bg-purple-50/50 border border-purple-100 rounded-2xl p-3 text-center">
                  <p className="font-black text-base text-gray-900">12</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">POSTINGS</p>
                </div>

                <div className="bg-purple-50/50 border border-purple-100 rounded-2xl p-3 text-center">
                  <p className="font-black text-base text-gray-900">1,240</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">FOLLOWERS</p>
                </div>
              </div>
            </div>

            {/* Enterprise Plan Card */}
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
          </div>

          {/* Right Column (2/3 width): About Company & Employer Support */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* About Company Section */}
            <div className="app-card p-6 bg-white border border-purple-100 rounded-3xl shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-purple-50 pb-3">
                <h3 className="font-extrabold text-lg text-[#5B21B6]">About {name}</h3>
                <button
                  onClick={() => addToast('Edit company description', 'info')}
                  className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit Details
                </button>
              </div>

              <p className="text-sm font-semibold text-gray-600 leading-relaxed">
                TechCorp Solutions is a fast-growing technology firm specializing in web software development, AI solutions, and digital marketing. We hire top student talent for short-term gigs, internships, and full-time engineering roles.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-purple-50/40 rounded-2xl border border-purple-100">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Hiring Contact Email</p>
                  <p className="text-sm font-bold text-purple-900 mt-1">hiring@techcorp.io</p>
                </div>

                <div className="p-4 bg-purple-50/40 rounded-2xl border border-purple-100">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Verification Status</p>
                  <p className="text-sm font-bold text-emerald-600 mt-1 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4" /> Verified Employer
                  </p>
                </div>
              </div>
            </div>

            {/* EMPLOYER CONTACT SUPPORT SECTION */}
            <div className="app-card p-6 bg-white border border-purple-100 rounded-3xl shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-[#5B21B6]">
                <HelpCircle className="w-5 h-5 text-purple-600" />
                <h3 className="font-extrabold text-lg">Contact Employer Support & Account Manager</h3>
              </div>

              <p className="text-xs font-semibold text-gray-500">
                Need help with escrow billing payouts, custom hiring pipelines, or dedicated talent sourcing? Reach out to your account manager.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <button
                  onClick={() => addToast('Connecting to Dedicated Account Manager...', 'info')}
                  className="p-4 bg-purple-50 hover:bg-purple-100 rounded-2xl border border-purple-100 flex items-center gap-3 transition-all text-left"
                >
                  <MessageSquare className="w-5 h-5 text-purple-700" />
                  <div>
                    <p className="font-extrabold text-xs text-purple-900">Dedicated Account Manager</p>
                    <p className="text-[10px] text-gray-500 font-semibold">Priority 1-on-1 Support</p>
                  </div>
                </button>

                <button
                  onClick={() => addToast('Employer Support Helpline: +91 1800-888-9999', 'info')}
                  className="p-4 bg-orange-50 hover:bg-orange-100 rounded-2xl border border-orange-100 flex items-center gap-3 transition-all text-left"
                >
                  <PhoneCall className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="font-extrabold text-xs text-orange-900">Employer Hotline</p>
                    <p className="text-[10px] text-gray-500 font-semibold">1800-888-9999 (24/7 Helpline)</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Account Logout */}
            <button
              onClick={() => {
                signOut();
                addToast('Logged Out', 'info');
              }}
              className="w-full app-card p-4 bg-purple-50/50 border border-purple-100 rounded-2xl flex items-center justify-between text-left hover:bg-red-50 hover:border-red-200 transition-all group"
            >
              <span className="font-extrabold text-sm text-orange-600 group-hover:text-red-600">Log Out of Employer Account</span>
              <LogOut className="w-5 h-5 text-orange-500 group-hover:text-red-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
