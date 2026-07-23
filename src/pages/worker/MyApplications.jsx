import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, getDocs } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { demoStore } from '../../utils/demoStore';
import JobDetailModal from '../../components/JobDetailModal';
import { FileText, Clock, CheckCircle, XCircle, Award, Eye } from 'lucide-react';

export default function MyApplications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [jobsMap, setJobsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    const workerUid = user ? user.uid : 'worker_demo_1';

    const loadDemoData = () => {
      const apps = demoStore.getApplications().filter(a => a.workerId === workerUid);
      setApplications(apps.length > 0 ? apps : [
        { id: 'app_1', jobId: 'job_1', status: 'Applied', timestamp: new Date().toISOString() },
        { id: 'app_2', jobId: 'job_2', status: 'Shortlisted', timestamp: new Date().toISOString() }
      ]);

      const allJobs = demoStore.getJobs();
      const map = {};
      allJobs.forEach(j => { map[j.id] = j; });
      setJobsMap(map);
      setLoading(false);
    };

    if (!isFirebaseConfigured || !db) {
      loadDemoData();
      const unsub = demoStore.subscribe(loadDemoData);
      return () => unsub();
    }

    try {
      const q = query(
        collection(db, 'applications'),
        where('workerId', '==', workerUid),
        orderBy('timestamp', 'desc')
      );

      onSnapshot(q, async (snap) => {
        const apps = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setApplications(apps);

        if (apps.length > 0) {
          const jobIds = [...new Set(apps.map(a => a.jobId))];
          const jMap = {};
          for (const jid of jobIds) {
            const jSnap = await getDocs(query(collection(db, 'jobs'), where('__name__', '==', jid)));
            if (!jSnap.empty) {
              jMap[jid] = { id: jSnap.docs[0].id, ...jSnap.docs[0].data() };
            }
          }
          setJobsMap(jMap);
        }
        setLoading(false);
      }, (err) => {
        loadDemoData();
      });
    } catch (error) {
      loadDemoData();
    }

    loadDemoData();
  }, [user]);

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'applied':
        return <span className="text-xs font-extrabold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full inline-flex items-center gap-1"><Clock className="w-3 h-3" /> Applied</span>;
      case 'hired':
        return <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full inline-flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Hired 🎉</span>;
      case 'rejected':
        return <span className="text-xs font-extrabold text-red-700 bg-red-50 border border-red-200 px-3 py-1 rounded-full inline-flex items-center gap-1"><XCircle className="w-3 h-3" /> Rejected</span>;
      default:
        return <span className="text-xs font-extrabold text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1 rounded-full inline-flex items-center gap-1"><Award className="w-3 h-3" /> {status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7FC] text-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="pb-2 border-b border-purple-100">
          <h1 className="text-2xl sm:text-4xl font-black text-[#5B21B6] flex items-center gap-3">
            <FileText className="w-8 h-8 text-orange-500" />
            My Applications
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-gray-500 mt-1">Track your application status across all gigs and jobs in real-time</p>
        </div>

        {/* Status Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Applied', count: applications.length, color: 'text-purple-700' },
            { label: 'In Review', count: applications.filter(a => a.status !== 'Hired' && a.status !== 'Rejected').length, color: 'text-orange-500' },
            { label: 'Hired', count: applications.filter(a => a.status === 'Hired').length, color: 'text-emerald-600' },
            { label: 'Rejected', count: applications.filter(a => a.status === 'Rejected').length, color: 'text-red-500' },
          ].map((stat, i) => (
            <div key={i} className="app-card p-5 rounded-3xl border border-purple-100 bg-white shadow-sm">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{stat.label}</p>
              <p className={`text-3xl font-black mt-1 ${stat.color}`}>{stat.count}</p>
            </div>
          ))}
        </div>

        {/* Applications Table */}
        <div className="app-card rounded-3xl border border-purple-100 bg-white overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-8 text-center text-gray-400 font-semibold">Loading applications...</div>
          ) : applications.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 text-purple-300 mx-auto mb-3" />
              <h3 className="text-lg font-black text-[#5B21B6] mb-1">No Applications Yet</h3>
              <p className="text-gray-400 text-xs font-semibold mb-4">Start exploring active gigs and jobs to submit your first application.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-purple-100 bg-purple-50/50 text-xs font-extrabold text-[#5B21B6] uppercase tracking-wider">
                    <th className="p-4 pl-6">Job Position</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Pay Rate</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 pr-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-50 text-sm font-semibold">
                  {applications.map((app) => {
                    const job = jobsMap[app.jobId] || { title: 'Video Editor & Reel Creator', type: 'Gig', pay: '₹500/reel' };
                    return (
                      <tr key={app.id} className="hover:bg-purple-50/30 transition-colors">
                        <td className="p-4 pl-6 font-extrabold text-gray-900">
                          {job.title}
                        </td>
                        <td className="p-4">
                          <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-purple-50 border border-purple-100 text-purple-700">
                            {job.type || 'Gig'}
                          </span>
                        </td>
                        <td className="p-4 text-orange-600 font-black">
                          {job.pay || 'N/A'}
                        </td>
                        <td className="p-4">
                          {getStatusBadge(app.status)}
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <button
                            onClick={() => setSelectedJob(job)}
                            className="inline-flex items-center gap-1 text-xs text-purple-700 hover:text-purple-900 font-extrabold transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" /> Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          isOpen={!!selectedJob}
          onClose={() => setSelectedJob(null)}
          applied={true}
        />
      )}
    </div>
  );
}
