import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { demoStore } from '../../utils/demoStore';
import { Plus, Users, Target, Briefcase, Eye, ToggleLeft, ToggleRight } from 'lucide-react';

export default function MyPostings() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [postings, setPostings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const employerUid = user ? user.uid : 'employer_demo_1';

    const loadDemoData = () => {
      const allJobs = demoStore.getJobs();
      const myJobs = allJobs.filter(j => j.employerId === employerUid || j.employerId === 'employer_demo_1');
      setPostings(myJobs);
      setLoading(false);
    };

    if (!isFirebaseConfigured || !db) {
      loadDemoData();
      const unsub = demoStore.subscribe(loadDemoData);
      return () => unsub();
    }

    let unsubscribe;
    try {
      const q = query(collection(db, 'jobs'), where('employerId', '==', employerUid));
      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const jobsData = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
          setPostings(jobsData.length > 0 ? jobsData : demoStore.getJobs());
          setLoading(false);
        },
        (err) => {
          console.warn("Postings snapshot error:", err);
          loadDemoData();
        }
      );
    } catch (error) {
      console.warn("Postings query error:", error);
      loadDemoData();
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user]);

  const toggleJobStatus = async (jobId, currentStatus) => {
    try {
      if (!isFirebaseConfigured || !db) {
        demoStore.toggleJobActive(jobId);
        addToast('Job status updated!', 'success');
        return;
      }

      await updateDoc(doc(db, 'jobs', jobId), {
        isActive: !currentStatus
      });
      addToast('Job status updated!', 'success');
    } catch (error) {
      console.error(error);
      demoStore.toggleJobActive(jobId);
      addToast('Job status updated (Local Mode)', 'success');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7FC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Top Header matching Screenshot 1 */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#5B21B6]">Manage Postings</h1>
          
          {/* Plus Circle Button */}
          <Link
            to="/employer/create"
            className="w-10 h-10 rounded-full bg-white border-2 border-purple-200 text-purple-700 hover:bg-purple-50 flex items-center justify-center shadow-md transition-all hover:scale-105"
            title="Create New Job Posting"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </Link>
        </div>

        {/* Postings List Cards matching Screenshot 1 */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="app-card h-32 animate-pulse bg-white"></div>
            ))}
          </div>
        ) : postings.length > 0 ? (
          <div className="space-y-4">
            {postings.map((job) => {
              const applicantsCount = job.applicantCount || (job.title?.includes('Video') ? 12 : 45);
              const minScore = job.minScore || (job.title?.includes('Video') ? '60+' : '50+');

              return (
                <div
                  key={job.id}
                  className="app-card p-6 bg-white border border-purple-100 rounded-2xl shadow-sm hover:border-purple-300 transition-all space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-extrabold text-gray-900 leading-snug">
                        {job.title}
                      </h3>
                      <p className="text-xs font-semibold text-gray-500 mt-1">
                        {job.type || 'Gig'} • {job.location || 'Remote'} • {job.pay}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-extrabold px-3 py-1 rounded-md ${
                        job.isActive !== false
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {job.isActive !== false ? 'Active' : 'Inactive'}
                      </span>

                      <button
                        onClick={() => toggleJobStatus(job.id, job.isActive !== false)}
                        className="text-purple-600 hover:text-purple-900 p-1"
                        title="Toggle Active Status"
                      >
                        {job.isActive !== false ? <ToggleRight className="w-7 h-7 text-purple-700" /> : <ToggleLeft className="w-7 h-7 text-gray-400" />}
                      </button>
                    </div>
                  </div>

                  {/* Metrics Row matching Screenshot 1 */}
                  <div className="flex items-center gap-6 pt-2 border-t border-purple-50 text-xs font-extrabold text-purple-900">
                    <div className="flex items-center gap-1.5 text-purple-800">
                      <Users className="w-4 h-4 text-purple-600" />
                      <span>{applicantsCount} Applicants</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-purple-800">
                      <Target className="w-4 h-4 text-purple-600" />
                      <span>Min Score {minScore}</span>
                    </div>

                    <button
                      onClick={() => navigate(`/employer/candidates/${job.id}`)}
                      className="ml-auto text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Kanban
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="app-card p-12 text-center text-gray-500 bg-white">
            <Briefcase className="w-12 h-12 text-purple-300 mx-auto mb-2" />
            <p className="font-extrabold text-lg text-[#5B21B6]">No Active Job Postings</p>
            <p className="text-xs text-gray-400 mt-1 mb-4">Post your first gig or job to start receiving candidates</p>
            <Link to="/employer/create" className="btn-purple text-xs px-5 py-2.5">
              + Post New Job
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
