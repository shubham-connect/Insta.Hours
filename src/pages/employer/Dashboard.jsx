import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { demoStore } from '../../utils/demoStore';
import AiAssistantWidget from '../../components/AiAssistantWidget';
import { Bell, Briefcase, Users, Zap, GraduationCap, ChevronRight, ArrowRight, Calendar, DollarSign, UserCheck } from 'lucide-react';

export default function Dashboard() {
  const { user, userProfile } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState({
    activeGigs: 5,
    activeJobs: 4,
    activeInternships: 3,
    interviewsToday: 8,
    quickHiresMonth: 24,
    outstandingBalance: 12500
  });

  const [recentPostings, setRecentPostings] = useState([]);

  const name = userProfile?.name || 'TechCorp Solutions';

  useEffect(() => {
    const employerUid = user ? user.uid : 'employer_demo_1';

    const loadDemoData = () => {
      const allJobs = demoStore.getJobs();
      const myJobs = allJobs.filter(j => j.employerId === employerUid || j.employerId === 'employer_demo_1');
      
      const gigs = myJobs.filter(j => j.type === 'Gig' && j.isActive !== false).length;
      const interns = myJobs.filter(j => j.type === 'Internship' && j.isActive !== false).length;
      const fullJobs = myJobs.filter(j => (j.type === 'Job' || !j.type) && j.isActive !== false).length;

      setMetrics({
        activeGigs: gigs || 5,
        activeJobs: fullJobs || 4,
        activeInternships: interns || 3,
        interviewsToday: 8,
        quickHiresMonth: 24,
        outstandingBalance: 12500
      });

      setRecentPostings(myJobs.length > 0 ? myJobs : [
        { id: 'p1', title: 'Video Editor & Reel Creator', type: 'Gig', pay: '₹500/reel', applicantCount: 12 },
        { id: 'p2', title: 'Sales Executive', type: 'Job', pay: '₹20,000/mo', applicantCount: 45 },
        { id: 'p3', title: 'Brand Marketing Intern', type: 'Internship', pay: '₹10,000/mo', applicantCount: 28 }
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
          setRecentPostings(jobsData.length > 0 ? jobsData : demoStore.getJobs());
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
    <div className="min-h-screen bg-[#F8F7FC] py-8 px-4 sm:px-6 lg:px-8 relative pb-20">
      
      {/* Interactive AI Hiring & Support Assistant Widget */}
      <AiAssistantWidget />

      {/* Wide Desktop Grid max-w-7xl */}
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Header Row */}
        <div className="flex justify-between items-center pb-3 border-b border-purple-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#6D28D9] text-white font-black text-lg flex items-center justify-center shadow-lg shadow-purple-600/30">
              TN
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#5B21B6] leading-tight flex items-center gap-2">
                <span>👋</span> Good Morning, {name}
              </h1>
              <p className="text-xs font-semibold text-gray-500 mt-0.5">Today's Hiring Summary & Metrics</p>
            </div>
          </div>

          <button
            onClick={() => addToast('Notifications', 'info')}
            className="p-2.5 bg-white border border-purple-100 hover:bg-purple-50 rounded-2xl transition-all relative shadow-sm"
          >
            <Bell className="w-5 h-5 text-purple-900" />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-orange-500 rounded-full ring-2 ring-white animate-pulse" />
          </button>
        </div>

        {/* 2-Column Wide Desktop Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Left Column (2/3 width): 6 Alternating-Color Metric Cards + Quick Actions */}
          <div className="lg:col-span-2 space-y-5">
            
            {/* 6 Equal-Sized Metric Cards Grid (Alternating Purple & Orange Theme) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              
              {/* 1. Active Gigs (Purple) */}
              <div className="app-card p-4 bg-white border-2 border-purple-100 rounded-2xl shadow-sm hover:border-purple-300 transition-all">
                <p className="text-[10px] font-extrabold text-purple-600 uppercase tracking-wider flex items-center gap-1 mb-1">
                  <Zap className="w-3.5 h-3.5 text-purple-600" /> ACTIVE GIGS
                </p>
                <p className="text-3xl font-black text-[#5B21B6]">
                  {metrics.activeGigs}
                </p>
              </div>

              {/* 2. Active Jobs (Orange) */}
              <div className="app-card p-4 bg-white border-2 border-orange-100 rounded-2xl shadow-sm hover:border-orange-300 transition-all">
                <p className="text-[10px] font-extrabold text-orange-600 uppercase tracking-wider flex items-center gap-1 mb-1">
                  <Briefcase className="w-3.5 h-3.5 text-orange-500" /> ACTIVE JOBS
                </p>
                <p className="text-3xl font-black text-[#EA580C]">
                  {metrics.activeJobs}
                </p>
              </div>

              {/* 3. Active Internships (Purple) */}
              <div className="app-card p-4 bg-white border-2 border-purple-100 rounded-2xl shadow-sm hover:border-purple-300 transition-all">
                <p className="text-[10px] font-extrabold text-purple-600 uppercase tracking-wider flex items-center gap-1 mb-1">
                  <GraduationCap className="w-3.5 h-3.5 text-purple-600" /> INTERNSHIPS
                </p>
                <p className="text-3xl font-black text-[#5B21B6]">
                  {metrics.activeInternships}
                </p>
              </div>

              {/* 4. Interviews Today (Orange) */}
              <div className="app-card p-4 bg-white border-2 border-orange-100 rounded-2xl shadow-sm hover:border-orange-300 transition-all">
                <p className="text-[10px] font-extrabold text-orange-600 uppercase tracking-wider flex items-center gap-1 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-orange-500" /> INTERVIEWS TODAY
                </p>
                <p className="text-3xl font-black text-[#EA580C]">
                  {metrics.interviewsToday}
                </p>
              </div>

              {/* 5. Quick Hires This Month (Purple) */}
              <div className="app-card p-4 bg-white border-2 border-purple-100 rounded-2xl shadow-sm hover:border-purple-300 transition-all">
                <p className="text-[10px] font-extrabold text-purple-600 uppercase tracking-wider flex items-center gap-1 mb-1">
                  <UserCheck className="w-3.5 h-3.5 text-purple-600" /> HIRED THIS MONTH
                </p>
                <p className="text-3xl font-black text-[#5B21B6]">
                  {metrics.quickHiresMonth}
                </p>
              </div>

              {/* 6. Outstanding Balance (Orange Gradient) */}
              <div 
                onClick={() => navigate('/employer/billing')}
                className="app-card p-4 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-2xl shadow-md hover:shadow-lg transition-all cursor-pointer hover:scale-[1.02] flex flex-col justify-between"
              >
                <p className="text-[10px] font-extrabold text-orange-100 uppercase tracking-wider flex items-center gap-1">
                  💳 BALANCE (INR)
                </p>
                <div className="flex items-baseline justify-between">
                  <p className="text-2xl font-black tracking-tight">
                    ₹{metrics.outstandingBalance.toLocaleString('en-IN')}
                  </p>
                  <ChevronRight className="w-5 h-5 text-white/90" />
                </div>
              </div>
            </div>

            {/* Quick Actions Section (Alternating Colors) */}
            <div className="space-y-3 pt-1">
              <h2 className="text-lg font-extrabold text-[#5B21B6]">Quick Actions</h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. Purple */}
                <Link
                  to="/employer/create?type=Gig"
                  className="bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-sm transition-all hover:scale-105 group"
                >
                  <Zap className="w-6 h-6 text-white mb-1.5 group-hover:scale-110 transition-transform" />
                  <span className="font-extrabold text-xs sm:text-sm">Post Gig</span>
                </Link>

                {/* 2. Orange */}
                <Link
                  to="/employer/create?type=Internship"
                  className="bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-sm transition-all hover:scale-105 group"
                >
                  <GraduationCap className="w-6 h-6 text-white mb-1.5 group-hover:scale-110 transition-transform" />
                  <span className="font-extrabold text-xs sm:text-sm">Post Intern</span>
                </Link>

                {/* 3. Purple */}
                <Link
                  to="/employer/create?type=Job"
                  className="bg-gradient-to-br from-[#4C1D95] to-[#5B21B6] hover:from-[#3B1578] hover:to-[#4C1D95] text-white rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-sm transition-all hover:scale-105 group"
                >
                  <Briefcase className="w-6 h-6 text-white mb-1.5 group-hover:scale-110 transition-transform" />
                  <span className="font-extrabold text-xs sm:text-sm">Post Job</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column (1/3 width): RECENT POSTINGS */}
          <div className="lg:col-span-1 space-y-5">
            <div className="app-card p-5 bg-white border border-purple-100 rounded-3xl shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-purple-50 pb-3">
                <h2 className="text-base font-extrabold text-[#5B21B6]">Recent Postings</h2>
                <Link to="/employer/postings" className="text-xs font-extrabold text-orange-600 hover:text-orange-700 flex items-center gap-1">
                  View All <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-3">
                {recentPostings.slice(0, 4).map((posting, idx) => (
                  <div 
                    key={posting.id || idx}
                    onClick={() => navigate('/employer/postings')}
                    className="p-3 bg-purple-50/50 hover:bg-purple-100/50 rounded-2xl flex items-center justify-between border border-purple-100 cursor-pointer transition-all"
                  >
                    <div>
                      <h4 className="font-extrabold text-xs text-gray-900 leading-snug">{posting.title}</h4>
                      <p className="text-[10px] font-semibold text-gray-500 mt-0.5">{posting.type || 'Gig'} • {posting.pay}</p>
                    </div>

                    <span className="text-[10px] font-black text-purple-700 bg-purple-100 px-2.5 py-1 rounded-full flex-shrink-0">
                      {posting.applicantCount || 12} Apps
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
