import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import HeroBannerCarousel from '../../components/HeroBannerCarousel';
import { Video, FileText, Palette, ChevronRight, Award, ShieldCheck, CheckCircle2, Star, Zap } from 'lucide-react';

export default function SkillScorePage() {
  const { userProfile } = useAuth();
  const { addToast } = useToast();
  const [completedTests, setCompletedTests] = useState(new Set());

  const skillScoreBanners = [
    {
      badge: 'PRO TIP',
      title: 'Boost Your Score',
      subtitle: 'Higher scores get 3x more invites from recruiters',
      bg: 'bg-gradient-to-r from-purple-700 to-violet-800'
    },
    {
      badge: 'NEW TEST',
      title: 'Excel & Data Analysis',
      subtitle: '15 mins practical test • Verified badge',
      bg: 'bg-gradient-to-r from-purple-800 to-indigo-800'
    }
  ];

  const availableTests = [
    { id: 't1', title: 'Video Editing & Reels', duration: '15 mins test', icon: Video, category: 'Media & Design' },
    { id: 't2', title: 'Content Writing & SEO', duration: '10 mins test', icon: FileText, category: 'Marketing' },
    { id: 't3', title: 'UI/UX Graphic Design', duration: '20 mins test', icon: Palette, category: 'Design' },
    { id: 't4', title: 'React & Frontend Dev', duration: '25 mins test', icon: Zap, category: 'Software Engineering' }
  ];

  const handleTakeTest = (test) => {
    setCompletedTests(prev => new Set(prev).add(test.id));
    addToast(`Test "${test.title}" started! Score will update upon completion.`, 'info');
  };

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
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#5B21B6]">Skill Score</h1>
              <p className="text-xs font-semibold text-gray-500 mt-0.5">Verified skill assessments scored out of 100 by InstaHours experts</p>
            </div>
          </div>
        </div>

        {/* 2-Column Wide Desktop Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Column (1/3 width): Overall Score Card & Hero Banner */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Main Score Card */}
            <div>
              <h2 className="text-lg font-extrabold text-[#5B21B6] mb-3">Your Overall Score</h2>
              <div className="bg-gradient-to-r from-purple-800 to-violet-800 text-white rounded-3xl p-8 shadow-xl flex justify-between items-center cursor-pointer hover:shadow-2xl transition-all hover:scale-[1.01]">
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl sm:text-6xl font-black">{score}</span>
                    <span className="text-2xl text-purple-200 font-bold">/ 100</span>
                  </div>
                  <p className="text-xs text-purple-200 font-semibold mt-3 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> Verified by InstaHours Team
                  </p>
                </div>
                <ChevronRight className="w-8 h-8 text-white/80" />
              </div>
            </div>

            {/* Banner Carousel */}
            <HeroBannerCarousel banners={skillScoreBanners} />
          </div>

          {/* Right Column (2/3 width): Verify New Skills Tests Grid */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-extrabold text-[#5B21B6]">Verify New Skills</h2>
              <span className="text-xs font-bold text-gray-500">4 Skill Tests Available</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {availableTests.map((test) => {
                const Icon = test.icon;
                const isDone = completedTests.has(test.id);

                return (
                  <div key={test.id} className="app-card p-5 flex flex-col justify-between bg-white border border-purple-100 rounded-2xl shadow-sm hover:border-purple-300 transition-all space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-700">
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="text-[10px] font-extrabold text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                            {test.category}
                          </span>
                          <h3 className="font-extrabold text-base text-gray-900 leading-snug mt-1">{test.title}</h3>
                          <p className="text-xs text-gray-400 font-semibold mt-0.5">{test.duration}</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-purple-50 flex justify-end">
                      {isDone ? (
                        <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl flex items-center gap-1 border border-emerald-200">
                          <CheckCircle2 className="w-4 h-4" /> Verified
                        </span>
                      ) : (
                        <button
                          onClick={() => handleTakeTest(test)}
                          className="text-xs font-extrabold text-white bg-[#EA580C] hover:bg-orange-600 px-5 py-2.5 rounded-xl transition-all shadow-md shadow-orange-500/20"
                        >
                          Take Test
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
