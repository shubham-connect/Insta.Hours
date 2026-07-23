import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { demoStore } from '../../utils/demoStore';
import { Briefcase, CheckCircle, FileText, UserCheck, Plus, Users, ArrowRight } from 'lucide-react';

export default function Dashboard() {
  const { userProfile } = useAuth();
  const [stats, setStats] = useState({ totalJobs: 0, activeJobs: 0, totalApps: 0, hired: 0 });
  const [recentApps, setRecentApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userProfile) return;

    if (!isFirebaseConfigured) {
      const loadDemoData = () => {
        const allJobs = demoStore.getJobs().filter(j => j.employerId === userProfile.uid);
        const activeJobs = allJobs.filter(j => j.isActive);
        const jobIds = new Set(allJobs.map(j => j.id));
        
        const allApps = demoStore.getApplications().filter(a => jobIds.has(a.jobId));
        const hiredApps = allApps.filter(a => a.status === 'Hired');

        setStats({
          totalJobs: allJobs.length,
          activeJobs: activeJobs.length,
          totalApps: allApps.length,
          hired: hiredApps.length
        });

        // Recent apps mapping
        const users = demoStore.users;
        const mappedRecent = allApps.slice(0, 5).map(app => {
          const job = allJobs.find(j => j.id === app.jobId);
          const worker = users[app.workerId] || { name: 'Applicant' };
          return {
            id: app.id,
            jobTitle: job ? job.title : 'Job',
            workerName: worker.name,
            status: app.status,
            date: app.timestamp
          };
        });

        setRecentApps(mappedRecent);
        setLoading(false);
      };

      loadDemoData();
      const unsub = demoStore.subscribe(loadDemoData);
      return () => unsub();
    }

    // Real Firebase logic
    const jobsQuery = query(collection(db, 'jobs'), where('employerId', '==', userProfile.uid));
    const unsubscribeJobs = onSnapshot(jobsQuery, async (snap) => {
      const jobs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const activeCount = jobs.filter(j => j.isActive).length;

      let totalApplications = 0;
      let hiredCount = 0;
      const recentList = [];

      for (const job of jobs) {
        const appSnap = await getDocs(query(collection(db, 'applications'), where('jobId', '==', job.id)));
        totalApplications += appSnap.size;
        appSnap.docs.forEach(docSnap => {
          const appData = docSnap.data();
          if (appData.status === 'Hired') hiredCount++;
          recentList.push({
            id: docSnap.id,
            jobTitle: job.title,
            workerId: appData.workerId,
            status: appData.status,
            date: appData.timestamp
          });
        });
      }

      setStats({
        totalJobs: jobs.length,
        activeJobs: activeCount,
        totalApps: totalApplications,
        hired: hiredCount
      });

      setRecentApps(recentList.slice(0, 5));
      setLoading(false);
    });

    return () => unsubscribeJobs();
  }, [userProfile]);

  return (
    <div className="min-h-screen bg-[#0F0B1A] text-white p-4 md:p-8 pt-20">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Welcome Banner */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
          <div>
            <h1 className="text-3xl font-bold">Employer Dashboard</h1>
            <p className="text-gray-400 mt-1">Welcome back, {userProfile?.name || 'Partner'}. Manage your listings and recruits.</p>
          </div>
          <Link
            to="/employer/create"
            className="btn-primary flex items-center gap-2 px-5 py-3 shadow-lg shadow-purple-600/30"
          >
            <Plus className="w-5 h-5" /> Post New Job
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total Job Postings', value: stats.totalJobs, icon: Briefcase, color: 'from-purple-500/20 to-purple-800/10 border-purple-500/30 text-purple-400' },
            { label: 'Active Postings', value: stats.activeJobs, icon: CheckCircle, color: 'from-emerald-500/20 to-emerald-800/10 border-emerald-500/30 text-emerald-400' },
            { label: 'Total Applications', value: stats.totalApps, icon: FileText, color: 'from-orange-500/20 to-orange-800/10 border-orange-500/30 text-orange-400' },
            { label: 'Candidates Hired', value: stats.hired, icon: UserCheck, color: 'from-blue-500/20 to-blue-800/10 border-blue-500/30 text-blue-400' },
          ].map((item, idx) => (
            <div key={idx} className={`glass-card p-6 rounded-2xl border bg-gradient-to-br ${item.color} flex justify-between items-center`}>
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{item.label}</p>
                <p className="text-3xl font-bold mt-2 text-white">{loading ? '...' : item.value}</p>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <item.icon className="w-6 h-6" />
              </div>
            </div>
          ))}
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link to="/employer/create" className="glass-card p-6 rounded-2xl border border-white/10 bg-white/5 hover:border-purple-500/50 hover:bg-white/10 transition-all flex items-center justify-between group">
            <div>
              <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">Post a New Gig or Job</h3>
              <p className="text-sm text-gray-400 mt-1">Define custom hiring stages, pay, and required skill sets.</p>
            </div>
            <ArrowRight className="w-6 h-6 text-purple-400 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link to="/employer/candidates" className="glass-card p-6 rounded-2xl border border-white/10 bg-white/5 hover:border-orange-500/50 hover:bg-white/10 transition-all flex items-center justify-between group">
            <div>
              <h3 className="text-lg font-semibold text-white group-hover:text-orange-300 transition-colors">Review Kanban Candidates</h3>
              <p className="text-sm text-gray-400 mt-1">Drag and move applicants across your custom recruitment funnel.</p>
            </div>
            <Users className="w-6 h-6 text-orange-400 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Recent Applications Table */}
        <div className="glass-card rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Recent Applications</h3>
            <Link to="/employer/candidates" className="text-xs text-purple-400 hover:text-purple-300 font-medium">View All →</Link>
          </div>

          {recentApps.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No recent candidate applications yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400 text-xs uppercase">
                    <th className="pb-3">Candidate</th>
                    <th className="pb-3">Position</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {recentApps.map((app) => (
                    <tr key={app.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 font-medium text-white">{app.workerName || 'Applicant'}</td>
                      <td className="py-3 text-gray-300">{app.jobTitle}</td>
                      <td className="py-3">
                        <span className="px-2.5 py-1 text-xs rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {app.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
