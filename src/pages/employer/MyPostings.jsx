import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot, doc, updateDoc, getDocs } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { demoStore } from '../../utils/demoStore';
import { ClipboardList, Users, Plus, ToggleLeft, ToggleRight, ArrowUpRight } from 'lucide-react';

export default function MyPostings() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [applicantCounts, setApplicantCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    if (!isFirebaseConfigured) {
      const loadDemoData = () => {
        const myJobs = demoStore.getJobs().filter(j => j.employerId === user.uid);
        setJobs(myJobs);

        const apps = demoStore.getApplications();
        const counts = {};
        myJobs.forEach(j => {
          counts[j.id] = apps.filter(a => a.jobId === j.id).length;
        });
        setApplicantCounts(counts);
        setLoading(false);
      };

      loadDemoData();
      const unsub = demoStore.subscribe(loadDemoData);
      return () => unsub();
    }

    const q = query(collection(db, 'jobs'), where('employerId', '==', user.uid));
    const unsubscribe = onSnapshot(q, async (snap) => {
      const jobList = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setJobs(jobList);

      const counts = {};
      for (const j of jobList) {
        const aSnap = await getDocs(query(collection(db, 'applications'), where('jobId', '==', j.id)));
        counts[j.id] = aSnap.size;
      }
      setApplicantCounts(counts);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleToggleActive = async (jobId, currentStatus) => {
    try {
      if (!isFirebaseConfigured) {
        demoStore.toggleJobActive(jobId);
        addToast(`Job status updated`, 'success');
        return;
      }

      await updateDoc(doc(db, 'jobs', jobId), {
        isActive: !currentStatus
      });
      addToast(`Job status updated`, 'success');
    } catch (err) {
      addToast('Failed to update job status', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0B1A] text-white p-4 md:p-8 pt-20">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1 flex items-center gap-3">
              <ClipboardList className="w-8 h-8 text-purple-500" />
              My Job Postings
            </h1>
            <p className="text-gray-400 text-sm">Manage your active and past job/gig listings</p>
          </div>

          <Link
            to="/employer/create"
            className="btn-primary flex items-center gap-2 px-4 py-2.5 shadow-lg shadow-purple-600/30 text-sm"
          >
            <Plus className="w-4 h-4" /> Create New Posting
          </Link>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="glass-card h-32 bg-white/5 border border-white/10 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="glass-card p-12 text-center border border-white/10 bg-white/5 rounded-2xl">
            <ClipboardList className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <h3 className="text-lg font-medium mb-1">No Postings Created Yet</h3>
            <p className="text-gray-400 text-sm mb-6">Create your first gig or job listing to start receiving candidate applications.</p>
            <Link to="/employer/create" className="btn-primary px-6 py-2.5 text-sm inline-block">Create Job</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="glass-card p-6 rounded-2xl border border-white/10 bg-white/5 hover:border-purple-500/30 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
                      job.type === 'Gig' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                      job.type === 'Internship' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                      'bg-purple-500/20 text-purple-400 border-purple-500/30'
                    }`}>
                      {job.type}
                    </span>
                    <span className="text-sm font-semibold text-orange-400">{job.pay}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${job.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'}`}>
                      {job.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <h3 className="text-xl font-semibold text-white">{job.title}</h3>
                  <p className="text-sm text-gray-400 line-clamp-2">{job.description}</p>
                  
                  {/* Hiring process stages */}
                  <div className="flex items-center gap-2 pt-2">
                    <span className="text-xs text-gray-500">Stages:</span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {job.hiringProcess?.map((stage, idx) => (
                        <span key={idx} className="text-xs px-2 py-0.5 bg-white/5 rounded border border-white/10 text-gray-300">
                          {stage}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-row md:flex-col items-end justify-between w-full md:w-auto gap-4 pt-4 md:pt-0 border-t md:border-t-0 border-white/10">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-medium text-white">{applicantCounts[job.id] || 0} Candidates</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleActive(job.id, job.isActive)}
                      className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
                      title="Toggle Active Status"
                    >
                      {job.isActive ? <ToggleRight className="w-5 h-5 text-emerald-400" /> : <ToggleLeft className="w-5 h-5 text-gray-500" />}
                      {job.isActive ? 'Active' : 'Paused'}
                    </button>

                    <button
                      onClick={() => navigate(`/employer/candidates/${job.id}`)}
                      className="btn-primary text-xs flex items-center gap-1 px-3 py-2"
                    >
                      Candidates <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
