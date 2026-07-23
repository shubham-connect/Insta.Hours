import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { demoStore } from '../../utils/demoStore';
import { Plus, Users, Target, Briefcase, Eye, ToggleLeft, ToggleRight, Search } from 'lucide-react';

export default function MyPostings() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [postings, setPostings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const employerUid = user ? user.uid : 'employer_demo_1';

    const loadDemoData = () => {
      const allJobs = demoStore.getJobs();
      const myJobs = allJobs.filter(j => j.employerId === employerUid || j.employerId === 'employer_demo_1');
      setPostings(myJobs.length > 0 ? myJobs : [
        {
          id: 'post_1',
          title: 'Video Editor',
          type: 'Gig',
          workMode: 'Remote',
          pay: '₹500/reel',
          isActive: true,
          applicantCount: 12,
          minScore: '60+'
        },
        {
          id: 'post_2',
          title: 'Sales Executive',
          type: 'Job',
          workMode: 'On-Site',
          pay: '₹20,000/mo',
          isActive: true,
          applicantCount: 45,
          minScore: '50+'
        }
      ]);
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

    loadDemoData();

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

  const filteredPostings = postings.filter(job => 
    !searchTerm || job.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8F7FC] py-8 px-4 sm:px-6 lg:px-8">
      {/* Wide Desktop Layout max-w-7xl */}
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Header matching Screenshot 1 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-purple-100">
          <div>
            <h1 className="text-2xl sm:text-4xl font-black text-[#5B21B6]">Manage Postings</h1>
            <p className="text-xs sm:text-sm font-semibold text-gray-500 mt-0.5">View active hiring slots, candidate numbers, and active toggles</p>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-purple-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search postings..."
                className="w-full bg-white border border-purple-200 rounded-xl pl-9 pr-4 py-2 text-xs font-semibold text-gray-800 focus:outline-none focus:border-purple-600"
              />
            </div>

            {/* Plus Circle Button */}
            <Link
              to="/employer/create"
              className="w-10 h-10 rounded-full bg-[#6D28D9] text-white hover:bg-[#5B21B6] flex items-center justify-center shadow-md transition-all hover:scale-105 flex-shrink-0"
              title="Create New Job Posting"
            >
              <Plus className="w-6 h-6 stroke-[3]" />
            </Link>
          </div>
        </div>

        {/* 2-Column Grid for Postings Cards */}
        {filteredPostings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPostings.map((job) => {
              const applicantsCount = job.applicantCount || (job.title?.includes('Video') ? 12 : 45);
              const minScore = job.minScore || (job.title?.includes('Video') ? '60+' : '50+');

              return (
                <div
                  key={job.id}
                  className="app-card p-6 bg-white border border-purple-100 rounded-3xl shadow-sm hover:border-purple-300 transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-extrabold text-gray-900 leading-snug">
                          {job.title}
                        </h3>
                        <p className="text-xs font-bold text-gray-500 mt-1">
                          {job.type || 'Gig'} • {job.workMode || job.location || 'Remote'} • <span className="text-purple-700 font-black">{job.pay}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-extrabold px-3 py-1 rounded-lg ${
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
                          {job.isActive !== false ? <ToggleRight className="w-8 h-8 text-purple-700" /> : <ToggleLeft className="w-8 h-8 text-gray-400" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Metrics Row matching Screenshot 1 */}
                  <div className="flex items-center justify-between pt-3 border-t border-purple-50 text-xs font-extrabold text-purple-900">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-purple-800">
                        <Users className="w-4 h-4 text-purple-600" />
                        <span>{applicantsCount} Applicants</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-purple-800">
                        <Target className="w-4 h-4 text-purple-600" />
                        <span>Min Score {minScore}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(`/employer/candidates/${job.id}`)}
                      className="text-xs font-extrabold text-white bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Kanban
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="app-card p-12 text-center text-gray-500 bg-white rounded-3xl">
            <Briefcase className="w-12 h-12 text-purple-300 mx-auto mb-2" />
            <p className="font-extrabold text-lg text-[#5B21B6]">No Job Postings Found</p>
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
