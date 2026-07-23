import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { demoStore } from '../../utils/demoStore';
import { Bell, Briefcase, Users, Zap, GraduationCap, ChevronRight, ArrowRight, UserCheck } from 'lucide-react';

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
  const [loading, setLoading] = useState(true);

  const name = userProfile?.name || 'TechNova';

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
      setRecentApplications(allApps.slice(0, 5));
      setLoading(false);
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
          setLoading(false);
        },
        (err) => {
          console.warn("Dashboard jobs snapshot warning:", err);
          loadDemoData();
        }
      );
    } catch (error) {
      console.warn("Dashboard setup error:", error);
      loadDemoData();
    }

    return () => {
      if (unsubscribeJobs) unsubscribeJobs();
    };
  }, [user]);

  return (
    <div className="min-h-screen bg-[#F8F7FC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Top Header Row matching Screenshot */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            {/* TN Circle Avatar */}
            <div className="w-11 h-11 rounded-full bg-[#6D28D9] text-white font-black text-sm flex items-center justify-center shadow-md">
              TN
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#5B21B6] leading-tight flex items-center gap-2">
                <span>👋</span> Good Morning, {name}
              </h1>
              <p className="text-xs font-semibold text-gray-500">Today's Hiring Summary</p>
            </div>
          </div>

          <button
            onClick={() => addToast('Notifications', 'info')}
            className="p-2 text.purple-900 hover:bg-purple-100 rounded-full transition-colors relative"
          >
            <Bell className="w-6 h-6 text-purple-900" />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-orange-500 rounded-full ring-2 ring-white animate-pulse" />
          </button>
        </div>

        {/* Today's Hiring Summary 2-Column Cards matching Screenshot */}
        <div className="grid grid-cols-2 gap-4">
          
          {/* Card 1: Active Jobs */}
          <div className="app-card p-6 bg-white border border-purple-100 rounded-3xl shadow-sm">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <Briefcase className="w-4 h-4 text-purple-600" /> ACTIVE JOBS
            </p>
            <p className="text-4xl sm:text-5xl font-black text-[#5B21B6]">
              {stats.activeJobs}
            </p>
          </div>

          {/* Card 2: Applications */}
          <div className="app-card p-6 bg-white border border-purple-100 rounded-3xl shadow-sm">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <Users className="w-4 h-4 text-orange-500" /> APPLICATIONS
            </p>
            <p className="text-4xl sm:text-5xl font-black text-[#5B21B6]">
              {stats.totalApplications}
            </p>
          </div>
        </div>

        {/* Outstanding Balance Banner matching Screenshot */}
        <div
          onClick={() => navigate('/employer/billing')}
          className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl p-6 text-white shadow-lg flex justify-between items-center cursor-pointer hover:shadow-xl transition-all hover:scale-[1.01]"
        >
          <div>
            <p className="text-[11px] font-extrabold text-orange-100 uppercase tracking-wider flex items-center gap-1.5">
              💵 OUTSTANDING BALANCE
            </p>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mt-1">
              ₹{stats.outstandingBalance.toLocaleString('en-IN')}
            </h2>
          </div>
          <ChevronRight className="w-8 h-8 text-white/90" />
        </div>

        {/* Quick Actions Section matching Screenshot */}
        <div className="space-y-3">
          <h2 className="text-xl font-extrabold text-[#5B21B6]">Quick Actions</h2>

          {/* 3 Action Boxes Grid matching Screenshot */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            
            {/* Box 1: Post Gig */}
            <Link
              to="/employer/create?type=Gig"
              className="bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-3xl p-5 flex flex-col items-center justify-center text-center shadow-md transition-all hover:scale-105 group"
            >
              <Zap className="w-7 h-7 text-white mb-2 group-hover:scale-110 transition-transform" />
              <span className="font-extrabold text-xs sm:text-sm">Post Gig</span>
            </Link>

            {/* Box 2: Post Intern */}
            <Link
              to="/employer/create?type=Internship"
              className="bg-gradient-to-br from-purple-600 to-violet-700 hover:from-purple-700 hover:to-violet-800 text-white rounded-3xl p-5 flex flex-col items-center justify-center text-center shadow-md transition-all hover:scale-105 group"
            >
              <GraduationCap className="w-7 h-7 text-white mb-2 group-hover:scale-110 transition-transform" />
              <span className="font-extrabold text-xs sm:text-sm">Post Intern</span>
            </Link>

            {/* Box 3: Post Job */}
            <Link
              to="/employer/create?type=Job"
              className="bg-gradient-to-br from-[#4C1D95] to-[#5B21B6] hover:from-[#3B1578] hover:to-[#4C1D95] text-white rounded-3xl p-5 flex flex-col items-center justify-center text-center shadow-md transition-all hover:scale-105 group"
            >
              <Briefcase className="w-7 h-7 text-white mb-2 group-hover:scale-110 transition-transform" />
              <span className="font-extrabold text-xs sm:text-sm">Post Job</span>
            </Link>
          </div>
        </div>

        {/* Recent Applications Activity */}
        <div className="space-y-3 pt-2">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-extrabold text-[#5B21B6]">Recent Candidates</h2>
            <Link to="/employer/candidates" className="text-xs font-extrabold text-orange-600 hover:text-orange-700 flex items-center gap-1">
              View All Candidates <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="app-card p-4 bg-white border border-purple-100 rounded-2xl shadow-sm divide-y divide-purple-50">
            {recentApplications.map((app, idx) => (
              <div key={app.id || idx} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-900 font-extrabold text-xs flex items-center justify-center">
                    {app.workerName ? app.workerName.charAt(0) : 'R'}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900">{app.workerName || 'Rahul Sharma'}</h4>
                    <p className="text-xs font-semibold text-gray-500">React Frontend Developer</p>
                  </div>
                </div>

                <span className="text-xs font-bold px-3 py-1 bg-purple-50 text-purple-700 rounded-full border border-purple-100">
                  {app.status || 'Applied'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
