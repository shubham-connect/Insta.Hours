import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Video, FileText, Palette, ChevronRight, Award, ShieldCheck, CheckCircle2, Star, Zap } from 'lucide-react';

export default function SkillScorePage() {
  const { userProfile } = useAuth();
  const { addToast } = useToast();
  const [completedTests, setCompletedTests] = useState(new Set());

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
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* STRUCTURAL BREAKDOWN (Separated Clean Title on Left, Standalone Score Box on Right) */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-6 border-b border-purple-100">
          
          {/* Left Side: Clean Title & Subtext (Unboxed) */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center text-white font-black text-2xl shadow-md">
              ⏳
            </div>
            <div>
              <h1 className="text-2xl sm:text-4xl font-black text-[#5B21B6]">Skill Score Assessment</h1>
              <p className="text-xs sm:text-sm font-semibold text-gray-500 mt-0.5">Verified skill assessments scored out of 100 by InstaHours experts</p>
            </div>
          </div>

          {/* Right Side: Standalone Stretched Overall Score Box Card */}
          <div className="bg-gradient-to-r from-purple-800 to-violet-800 text-white rounded-3xl px-8 py-5 shadow-xl flex items-center gap-6 flex-shrink-0 border border-purple-400/30">
            <div>
              <p className="text-[10px] font-black text-purple-200 uppercase tracking-wider">YOUR OVERALL SCORE</p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-4xl font-black">{score}</span>
                <span className="text-lg text-purple-200 font-bold">/ 100</span>
              </div>
            </div>
            <ShieldCheck className="w-10 h-10 text-emerald-400 flex-shrink-0" />
          </div>
        </div>

        {/* Square-Shaped Banner Ads Row (Alternating Colors) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Banner Ad 1 Square (Purple) */}
          <div className="bg-gradient-to-br from-purple-700 to-purple-900 text-white p-6 rounded-3xl shadow-md space-y-3 flex flex-col justify-between h-48">
            <span className="text-[10px] font-extrabold text-orange-400 bg-black/30 px-3 py-1 rounded-full self-start">
              PRO TIP 💡
            </span>
            <div>
              <h3 className="font-extrabold text-lg">Boost Your Score</h3>
              <p className="text-xs text-purple-200 font-semibold mt-1">Higher scores get 3x more invites from top recruiters.</p>
            </div>
          </div>

          {/* Banner Ad 2 Square (Orange) */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-3xl shadow-md space-y-3 flex flex-col justify-between h-48">
            <span className="text-[10px] font-extrabold text-white bg-black/30 px-3 py-1 rounded-full self-start">
              NEW TEST 🚀
            </span>
            <div>
              <h3 className="font-extrabold text-lg">Excel & Data Analysis</h3>
              <p className="text-xs text-orange-100 font-semibold mt-1">15 mins practical test • Earn verified badge.</p>
            </div>
          </div>

          {/* Banner Ad 3 Square (Purple) */}
          <div className="bg-gradient-to-br from-violet-800 to-indigo-900 text-white p-6 rounded-3xl shadow-md space-y-3 flex flex-col justify-between h-48">
            <span className="text-[10px] font-extrabold text-purple-200 bg-black/30 px-3 py-1 rounded-full self-start">
              VERIFICATION 🛡️
            </span>
            <div>
              <h3 className="font-extrabold text-lg">Expert Certified</h3>
              <p className="text-xs text-purple-200 font-semibold mt-1">Tested by industry professionals & AI evaluators.</p>
            </div>
          </div>
        </div>

        {/* Verify New Skills Tests Grid */}
        <div className="space-y-4 pt-2">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-extrabold text-[#5B21B6]">Available Skill Assessments</h2>
            <span className="text-xs font-bold text-gray-500">4 Skill Tests Available</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {availableTests.map((test, idx) => {
              const Icon = test.icon;
              const isDone = completedTests.has(test.id);
              const isPurple = idx % 2 === 0;

              return (
                <div key={test.id} className={`app-card p-6 flex flex-col justify-between bg-white border-2 rounded-3xl shadow-sm hover:scale-[1.02] transition-all space-y-4 ${
                  isPurple ? 'border-purple-100 hover:border-purple-300' : 'border-orange-100 hover:border-orange-300'
                }`}>
                  <div className="space-y-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      isPurple ? 'bg-purple-50 text-purple-700' : 'bg-orange-50 text-orange-600'
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                        isPurple ? 'text-purple-600 bg-purple-50' : 'text-orange-600 bg-orange-50'
                      }`}>
                        {test.category}
                      </span>
                      <h3 className="font-extrabold text-base text-gray-900 leading-snug mt-1.5">{test.title}</h3>
                      <p className="text-xs text-gray-400 font-semibold mt-0.5">{test.duration}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-purple-50">
                    {isDone ? (
                      <span className="w-full text-xs font-extrabold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl flex items-center justify-center gap-1 border border-emerald-200">
                        <CheckCircle2 className="w-4 h-4" /> Verified
                      </span>
                    ) : (
                      <button
                        onClick={() => handleTakeTest(test)}
                        className={`w-full text-xs font-extrabold text-white py-2.5 rounded-xl transition-all shadow-md ${
                          isPurple 
                            ? 'bg-[#6D28D9] hover:bg-[#5B21B6] shadow-purple-600/20' 
                            : 'bg-[#EA580C] hover:bg-orange-600 shadow-orange-500/20'
                        }`}
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
  );
}
