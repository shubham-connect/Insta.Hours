import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import HeroBannerCarousel from '../../components/HeroBannerCarousel';
import { Video, FileText, Palette, ChevronRight, Award, ShieldCheck, CheckCircle2 } from 'lucide-react';

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
    { id: 't1', title: 'Video Editing', duration: '15 mins test', icon: Video },
    { id: 't2', title: 'Content Writing', duration: '10 mins test', icon: FileText },
    { id: 't3', title: 'Graphic Design', duration: '20 mins test', icon: Palette }
  ];

  const handleTakeTest = (test) => {
    setCompletedTests(prev => new Set(prev).add(test.id));
    addToast(`Test "${test.title}" started! Score will update upon completion.`, 'info');
  };

  const score = userProfile?.skillScore || 40;

  return (
    <div className="min-h-screen bg-[#F8F7FC] pb-8 pt-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Top Header */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white font-black text-lg">
            ⏳
          </div>
          <h1 className="text-2xl font-extrabold text-[#5B21B6]">Skill Score</h1>
        </div>

        {/* Carousel Banner */}
        <HeroBannerCarousel banners={skillScoreBanners} />

        {/* Overall Score Section */}
        <div>
          <h2 className="text-lg font-extrabold text-[#5B21B6] mb-3">Your Overall Score</h2>
          
          {/* Main Purple Score Card matching Screenshot 3 */}
          <div className="bg-gradient-to-r from-purple-800 to-violet-800 text-white rounded-2xl p-6 shadow-xl flex justify-between items-center cursor-pointer hover:shadow-2xl transition-all">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl sm:text-5xl font-black">{score}</span>
                <span className="text-xl text-purple-200 font-bold">/ 100</span>
              </div>
              <p className="text-xs text-purple-200 font-medium mt-2">
                Tap to view detailed breakdown
              </p>
            </div>
            <ChevronRight className="w-8 h-8 text-white/80" />
          </div>
        </div>

        {/* Verify New Skills Section */}
        <div>
          <h2 className="text-lg font-extrabold text-[#5B21B6] mb-3">Verify New Skills</h2>

          <div className="space-y-3">
            {availableTests.map((test) => {
              const Icon = test.icon;
              const isDone = completedTests.has(test.id);

              return (
                <div key={test.id} className="app-card p-4 flex items-center justify-between bg-white border border-purple-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-700">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-gray-900 leading-snug">{test.title}</h3>
                      <p className="text-xs text-gray-400 font-medium mt-0.5">{test.duration}</p>
                    </div>
                  </div>

                  {isDone ? (
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg flex items-center gap-1 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                    </span>
                  ) : (
                    <button
                      onClick={() => handleTakeTest(test)}
                      className="text-xs font-extrabold text-[#EA580C] hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-4 py-2 rounded-lg transition-colors border border-orange-200"
                    >
                      Take Test
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
