import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { demoStore } from '../../utils/demoStore';
import { Bell, Briefcase, Users, Zap, GraduationCap, ChevronRight, ArrowRight, UserCheck, Plus, Sparkles, Award } from 'lucide-react';

export default function Dashboard() {
  const { user, userProfile } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    activeJobs: 12,
    totalApplications: 438,
    outstandingBalance: 12500
  });

  const [recentApplications, setRecentApplications] = useState([]);

  const name = userProfile?.name || 'TechCorp Solutions';

  useEffect(() => {
    const employerUid = user ? user.uid : 'employer_demo_1';

    const loadDemoData = () => {
      const allJobs = demoStore.getJobs();
      const myJobs = allJobs.filter(j => j.employerId === employerUid || j.employerId === 'employer_demo_1');
      const activeCount = myJobs.filter(j => j.isActive !== false).length;
      
      const allApps = demoStore.getApplications();
      setStats({
        activeJobs: activeCount || 12,
        totalApplications: allApps.length > 0 ? allApps.length : 438,
        outstandingBalance: 12500
      });
      setRecentApplications(allApps.length > 0 ? allApps : [
        { id: 'a1', workerName: 'Rahul Sharma', title: 'Video Editor', score: 85, status: 'Shortlisted' },
        { id: 'a2', workerName: 'Priya Verma', title: 'Sales Executive', score: 78, status: 'Applied' },
        { id: 'a3', workerName: 'Amit Patel', title: 'Social Media Manager', score: 92, status: 'Interview' }
      ]);
    };

    if (!isFirebaseConfigured || !db) {
      loadDemoData();
      const unsub = demoStore.subscribe(loadDemoData);
      return () => unsub();
    }

    let unsubscribeJobs;
    try {
      const q = query(collection(db, 'jobs'), where('employerId', '==', employerUid));
      unsubscribeJobs = onSnapshot(
        q,
        (snapshot) => {
          const jobsData = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
          setStats(prev => ({
            ...prev,
            activeJobs: jobsData.filter(j => j.isActive !== false).length || 12
          }));
        },
        (err) => {
          console.warn("Dashboard snapshot warning:", err);
          loadDemoData();
        }
      );
    } catch (error) {
      console.warn("Dashboard setup error:", error);
      loadDemoData();
    }

    loadDemoData();

    return () => {
      if (unsubscribeJobs) unsubscribeJobs();
    };
  }, [user]);

  return (
    <div className="min-h-screen bg-[#F8F7FC] py-8 px-4 sm:px-6 lg:px-8">
      {/* Wide Desktop Grid max-w-7xl */}
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Header Row */}
        <div className="flex justify-between items-center pb-4 border-b border-purple-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#6D28D9] text-white font-black text-xl flex items-center justify-center shadow-lg shadow-purple-600/30">
              TN
            </div>
            <div>
              <h1 className="text-2xl sm:text-4xl font-black text-[#5B21B6] leading-tight flex items-center gap-2">
                <span>👋</span> Good Morning, {name}
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-gray-500 mt-0.5">Today's Hiring Summary & Activity</p>
            </div>
          </div>

          <button
            onClick={() => addToast('Notifications', 'info')}
            className="p-3 bg-white border border-purple-100 hover:bg-purple-50 rounded-2xl transition-all relative shadow-sm"
          >
            <Bell className="w-6 h-6 text-purple-900" />
            <span className="absolute top-2 right-2 w-3 h-3 bg-orange-500 rounded-full ring-2 ring-white animate-pulse" />
          </button>
        </div>

        {/* 2-Column Wide Desktop Layout (2/3 Left, 1/3 Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Column (2/3 width): Main Stats & Quick Actions */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 2 Stat Boxes Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Card 1: Active Jobs */}
              <div className="app-card p-6 bg-white border border-purple-100 rounded-3xl shadow-sm hover:border-purple-300 transition-all">
                <p className="text-xs font-extrabold text-gray-400 uppercase tracking-wider flex items-center gap-2 mb-2">
                  <Briefcase className="w-4 h-4 text-purple-600" /> ACTIVE JOBS
                </p>
                <p className="text-5xl font-black text-[#5B21B6]">
                  {stats.activeJobs}
                </p>
              </div>

              {/* Card 2: Applications */}
              <div className="app-card p-6 bg-white border border-purple-100 rounded-3xl shadow-sm hover:border-purple-300 transition-all">
                <p className="text-xs font-extrabold text-gray-400 uppercase tracking-wider flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-orange-500" /> APPLICATIONS
                </p>
                <p className="text-5xl font-black text-[#5B21B6]">
                  {stats.totalApplications}
                </p>
              </div>
            </div>

            {/* Outstanding Balance Banner */}
            <div
              onClick={() => navigate('/employer/billing')}
              className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex justify-between items-center cursor-pointer hover:shadow-2xl transition-all hover:scale-[1.01]"
            >
              <div>
                <p className="text-xs font-extrabold text-orange-100 uppercase tracking-wider flex items-center gap-2">
                  💵 OUTSTANDING BALANCE
                </p>
                <h2 className="text-4xl sm:text-5xl font-black tracking-tight mt-1">
                  ₹{stats.outstandingBalance.toLocaleString('en-IN')}
                </h2>
              </div>
              <ChevronRight className="w-10 h-10 text-white/90" />
            </div>

            {/* Quick Actions Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-extrabold text-[#5B21B6]">Quick Actions</h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Box 1: Post Gig */}
                <Link
                  to="/employer/create?type=Gig"
                  className="bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-md transition-all hover:scale-105 group"
                >
                  <Zap className="w-8 h-8 text-white mb-2 group-hover:scale-110 transition-transform" />
                  <span className="font-extrabold text-sm sm:text-base">Post Gig</span>
                </Link>

                {/* Box 2: Post Intern */}
                <Link
                  to="/employer/create?type=Internship"
                  className="bg-gradient-to-br from-purple-600 to-violet-700 hover:from-purple-700 hover:to-violet-800 text-white rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-md transition-all hover:scale-105 group"
                >
                  <GraduationCap className="w-8 h-8 text-white mb-2 group-hover:scale-110 transition-transform" />
                  <span className="font-extrabold text-sm sm:text-base">Post Intern</span>
                </Link>

                {/* Box 3: Post Job */}
                <Link
                  to="/employer/create?type=Job"
                  className="bg-gradient-to-br from-[#4C1D95] to-[#5B21B6] hover:from-[#3B1578] hover:to-[#4C1D95] text-white rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-md transition-all hover:scale-105 group"
                >
                  <Briefcase className="w-8 h-8 text-white mb-2 group-hover:scale-110 transition-transform" />
                  <span className="font-extrabold text-sm sm:text-base">Post Job</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column (1/3 width): Recent Candidates & Hiring Hub */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Recent Candidates Card */}
            <div className="app-card p-6 bg-white border border-purple-100 rounded-3xl shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-purple-50 pb-3">
                <h2 className="text-lg font-extrabold text-[#5B21B6]">Recent Candidates</h2>
                <Link to="/employer/candidates" className="text-xs font-extrabold text-orange-600 hover:text-orange-700 flex items-center gap-1">
                  View All <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-3">
                {recentApplications.map((app, idx) => (
                  <div key={app.id || idx} className="p-3 bg-purple-50/50 rounded-2xl flex items-center justify-between border border-purple-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#6D28D9] text-white font-extrabold text-sm flex items-center justify-center shadow-sm">
                        {app.workerName ? app.workerName.charAt(0) : 'R'}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-gray-900">{app.workerName || 'Rahul Sharma'}</h4>
                        <p className="text-xs font-semibold text-gray-500">{app.title || 'Video Editor'}</p>
                      </div>
                    </div>

                    <span className="text-[10px] font-extrabold px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full">
                      {app.status || 'Applied'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Hiring Assistant Card */}
            <div className="app-card p-6 bg-gradient-to-br from-purple-900 to-indigo-900 text-white rounded-3xl shadow-lg space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-orange-400" />
                <h3 className="font-extrabold text-base">InstaScore AI Match</h3>
              </div>
              <p className="text-xs text-purple-200 font-semibold leading-relaxed">
                Candidates with Skill Scores above 80+ are 4x more likely to clear technical rounds.
              </p>
              <button
                onClick={() => navigate('/employer/candidates')}
                className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 font-extrabold text-xs text-white rounded-xl shadow-md transition-all"
              >
                Filter Top Candidates
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
