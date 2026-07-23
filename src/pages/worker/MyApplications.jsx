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
    if (!user) return;

    if (!isFirebaseConfigured) {
      const loadDemoData = () => {
        const apps = demoStore.getApplications().filter(a => a.workerId === user.uid);
        setApplications(apps);

        const allJobs = demoStore.getJobs();
        const map = {};
        allJobs.forEach(j => { map[j.id] = j; });
        setJobsMap(map);
        setLoading(false);
      };

      loadDemoData();
      const unsub = demoStore.subscribe(loadDemoData);
      return () => unsub();
    }

    const q = query(
      collection(db, 'applications'),
      where('workerId', '==', user.uid),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, async (snap) => {
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
    });

    return () => unsubscribe();
  }, [user]);

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'applied':
        return <span className="status-applied flex items-center gap-1"><Clock className="w-3 h-3" /> Applied</span>;
      case 'hired':
        return <span className="status-hired flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Hired 🎉</span>;
      case 'rejected':
        return <span className="status-rejected flex items-center gap-1"><XCircle className="w-3 h-3" /> Rejected</span>;
      default:
        return <span className="status-shortlisted flex items-center gap-1"><Award className="w-3 h-3" /> {status}</span>;
    }
  };

  const formatDate = (ts) => {
    if (!ts) return 'Recent';
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-[#0F0B1A] text-white p-4 md:p-8 pt-20">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <FileText className="w-8 h-8 text-purple-500" />
            My Applications
          </h1>
          <p className="text-gray-400">Track your application status across all gigs and jobs in real-time</p>
        </div>

        {/* Status Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Applied', count: applications.length, color: 'text-blue-400' },
            { label: 'In Review', count: applications.filter(a => a.status !== 'Hired' && a.status !== 'Rejected').length, color: 'text-yellow-400' },
            { label: 'Hired', count: applications.filter(a => a.status === 'Hired').length, color: 'text-emerald-400' },
            { label: 'Rejected', count: applications.filter(a => a.status === 'Rejected').length, color: 'text-red-400' },
          ].map((stat, i) => (
            <div key={i} className="glass-card p-4 rounded-xl border border-white/10 bg-white/5">
              <p className="text-xs text-gray-400 font-medium">{stat.label}</p>
              <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.count}</p>
            </div>
          ))}
        </div>

        {/* Applications Table */}
        <div className="glass-card rounded-2xl border border-white/10 bg-white/5 overflow-hidden shadow-xl">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading applications...</div>
          ) : applications.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-white mb-1">No Applications Yet</h3>
              <p className="text-gray-400 text-sm mb-4">Start exploring active gigs and jobs to submit your first application.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-black/20 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    <th className="p-4 pl-6">Job Position</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Pay Rate</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Applied Date</th>
                    <th className="p-4 pr-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {applications.map((app) => {
                    const job = jobsMap[app.jobId] || {};
                    return (
                      <tr key={app.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 pl-6 font-medium text-white">
                          {job.title || 'Job Position'}
                        </td>
                        <td className="p-4">
                          <span className="text-xs px-2.5 py-1 rounded-full bg-white/10 border border-white/10 text-gray-300">
                            {job.type || 'Gig'}
                          </span>
                        </td>
                        <td className="p-4 text-orange-400 font-medium">
                          {job.pay || 'N/A'}
                        </td>
                        <td className="p-4">
                          {getStatusBadge(app.status)}
                        </td>
                        <td className="p-4 text-gray-400 text-xs">
                          {formatDate(app.timestamp)}
                        </td>
                        <td className="p-4 pr-6 text-right">
                          {job.title && (
                            <button
                              onClick={() => setSelectedJob(job)}
                              className="inline-flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 font-medium transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" /> Details
                            </button>
                          )}
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
