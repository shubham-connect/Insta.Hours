import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Settings, Camera, MapPin, Edit3, Wallet, Store, Check, X, ShieldCheck, Award } from 'lucide-react';

export default function Profile() {
  const { userProfile, setUserProfile } = useAuth();
  const { addToast } = useToast();

  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioText, setBioText] = useState(userProfile?.bio || 'Passionate developer and event manager looking for part-time gigs to build experience and fund my studies. Reliable and fast learner.');

  const handleSaveBio = () => {
    setUserProfile(prev => ({ ...prev, bio: bioText }));
    setIsEditingBio(false);
    addToast('Profile bio updated!', 'success');
  };

  const name = userProfile?.name || 'Student User';
  const location = userProfile?.location || 'Gwalior';
  const score = userProfile?.skillScore || 40;

  return (
    <div className="min-h-screen bg-[#F8F7FC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Header */}
        <div className="flex justify-between items-center pb-2 border-b border-purple-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white font-black text-lg">
              ⏳
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#5B21B6]">Student Worker Profile</h1>
              <p className="text-xs font-semibold text-gray-500 mt-0.5">Manage your verified skills, rating, and wallet earnings</p>
            </div>
          </div>

          <button 
            onClick={() => addToast('Opening App Settings', 'info')}
            className="p-2 text-[#5B21B6] hover:bg-purple-100 rounded-full transition-colors"
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>

        {/* 2-Column Wide Desktop Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Column (1/3 width): Avatar & Stats Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="app-card p-6 bg-white border border-purple-100 rounded-3xl shadow-sm flex flex-col items-center text-center">
              <div className="relative mb-3">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white font-black text-3xl flex items-center justify-center shadow-lg border-4 border-white">
                  US
                </div>
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-purple-700 text-white rounded-full flex items-center justify-center border-2 border-white shadow-md">
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              <h2 className="text-2xl font-extrabold text-gray-900">{name}</h2>
              <p className="text-xs font-semibold text-gray-600 mt-0.5">BCA Student • Frontend Developer</p>
              <p className="text-xs font-bold text-purple-700 mt-1 flex items-center justify-center gap-1">
                <MapPin className="w-3.5 h-3.5 fill-purple-700 text-white" /> {location}
              </p>

              <button 
                onClick={() => setIsEditingBio(true)}
                className="mt-4 bg-[#EDE9FE] text-purple-700 hover:bg-purple-200 px-5 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit Profile
              </button>
            </div>

            {/* 4 Stats Grid */}
            <div className="app-card p-5 bg-white border border-purple-100 rounded-3xl shadow-sm grid grid-cols-2 gap-3 text-center">
              <div className="p-3 bg-purple-50/50 rounded-2xl">
                <p className="text-2xl font-black text-[#5B21B6]">12</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">Gigs Done</p>
              </div>

              <div className="p-3 bg-purple-50/50 rounded-2xl">
                <p className="text-2xl font-black text-orange-500">4.8</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">Rating</p>
              </div>

              <div className="p-3 bg-purple-50/50 rounded-2xl">
                <p className="text-2xl font-black text-[#5B21B6]">{score}/100</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">Skill Score</p>
              </div>

              <div className="p-3 bg-purple-50/50 rounded-2xl">
                <p className="text-2xl font-black text-orange-500">0</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">Complaints</p>
              </div>
            </div>
          </div>

          {/* Right Column (2/3 width): About Me & Action Cards */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* About Me Section */}
            <div className="app-card p-6 bg-white border border-purple-100 rounded-3xl shadow-sm">
              <div className="flex justify-between items-center mb-4 border-b border-purple-50 pb-3">
                <h3 className="font-extrabold text-lg text-[#5B21B6]">About Me</h3>
                {!isEditingBio && (
                  <button 
                    onClick={() => setIsEditingBio(true)}
                    className="text-xs font-extrabold text-orange-500 hover:text-orange-600 flex items-center gap-1"
                  >
                    <Edit3 className="w-3 h-3" /> Edit
                  </button>
                )}
              </div>

              {isEditingBio ? (
                <div className="space-y-3">
                  <textarea
                    rows="4"
                    value={bioText}
                    onChange={(e) => setBioText(e.target.value)}
                    className="w-full p-4 bg-purple-50/50 border border-purple-200 rounded-2xl text-sm font-medium text-gray-800 focus:outline-none focus:border-purple-600 resize-none"
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setIsEditingBio(false)}
                      className="px-4 py-2 text-xs font-bold text-gray-500 bg-gray-100 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveBio}
                      className="px-5 py-2 text-xs font-bold text-white bg-purple-700 rounded-xl shadow-md"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm font-semibold text-gray-600 leading-relaxed">
                  {bioText}
                </p>
              )}
            </div>

            {/* Quick Action Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div 
                onClick={() => addToast('Opening Earnings & Payout Wallet', 'info')}
                className="p-6 rounded-3xl bg-gradient-to-r from-purple-700 to-indigo-700 text-white cursor-pointer hover:shadow-xl transition-all hover:scale-[1.01] flex items-center gap-4 shadow-lg"
              >
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-base font-extrabold">Earnings Wallet</p>
                  <p className="text-xs text-purple-200">Payout history & UPI bank accounts</p>
                </div>
              </div>

              <div 
                onClick={() => addToast('Opening Gigs History', 'info')}
                className="p-6 rounded-3xl bg-gradient-to-r from-orange-500 to-orange-600 text-white cursor-pointer hover:shadow-xl transition-all hover:scale-[1.01] flex items-center gap-4 shadow-lg"
              >
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                  <Store className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-base font-extrabold">My Gigs History</p>
                  <p className="text-xs text-orange-100">Completed jobs & employer ratings</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
