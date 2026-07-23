import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot, getDocs, doc, getDoc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { demoStore } from '../../utils/demoStore';
import { ChevronDown, Users, Check, X, ArrowRight, Star } from 'lucide-react';

export default function Candidates() {
  const { user } = useAuth();
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [workers, setWorkers] = useState({});

  // Initialize with fail-safe demo jobs
  useEffect(() => {
    const loadJobsData = () => {
      const employerUid = user ? user.uid : 'employer_demo_1';
      const allJobs = demoStore.getJobs();
      const myJobs = allJobs.filter(j => j.employerId === employerUid || j.employerId === 'employer_demo_1');
      setJobs(myJobs.length > 0 ? myJobs : allJobs);
      
      const current = (myJobs.length > 0 ? myJobs : allJobs)[0];
      setSelectedJob(current);
    };

    if (!isFirebaseConfigured || !db) {
      loadJobsData();
      const unsub = demoStore.subscribe(loadJobsData);
      return () => unsub();
    }

    try {
      const employerUid = user ? user.uid : 'employer_demo_1';
      const q = query(collection(db, 'jobs'), where('employerId', '==', employerUid));
      onSnapshot(q, (snap) => {
        const jobsData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        if (jobsData.length > 0) {
          setJobs(jobsData);
          setSelectedJob(jobsData[0]);
        } else {
          loadJobsData();
        }
      }, (err) => {
        console.warn("Candidates jobs error:", err);
        loadJobsData();
      });
    } catch (error) {
      loadJobsData();
    }

    loadJobsData();
  }, [user, jobId]);

  // Fetch applications for selected job
  useEffect(() => {
    const targetJobId = selectedJob ? selectedJob.id : 'job_1';

    const loadDemoApps = () => {
      const allApps = demoStore.getApplications();
      const jobApps = allApps.filter(a => a.jobId === targetJobId);
      setApplications(jobApps.length > 0 ? jobApps : [
        { id: 'app_1', workerId: 'worker_1', workerName: 'Rahul Sharma', status: 'Applied', timestamp: 'Today' },
        { id: 'app_2', workerId: 'worker_2', workerName: 'Priya Verma', status: 'Shortlisted', timestamp: 'Yesterday' },
        { id: 'app_3', workerId: 'worker_3', workerName: 'Amit Patel', status: 'Hired', timestamp: '3 days ago' }
      ]);
      setWorkers(demoStore.users);
    };

    if (!isFirebaseConfigured || !db) {
      loadDemoApps();
      const unsub = demoStore.subscribe(loadDemoApps);
      return () => unsub();
    }

    try {
      const q = query(collection(db, 'applications'), where('jobId', '==', targetJobId));
      onSnapshot(q, (snap) => {
        const apps = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        if (apps.length > 0) {
          setApplications(apps);
        } else {
          loadDemoApps();
        }
      }, (err) => {
        console.warn("Applications snapshot error:", err);
        loadDemoApps();
      });
    } catch (error) {
      loadDemoApps();
    }

    loadDemoApps();
  }, [selectedJob]);

  const handleAction = async (appId, newStatus, workerId) => {
    try {
      if (!isFirebaseConfigured) {
        demoStore.updateApplicationStatus(appId, newStatus);
        addToast(`Candidate status updated to ${newStatus}`, 'success');
        return;
      }

      await updateDoc(doc(db, 'applications', appId), {
        status: newStatus
      });

      addToast(`Candidate moved to ${newStatus}`, 'success');
    } catch (error) {
      demoStore.updateApplicationStatus(appId, newStatus);
      addToast(`Candidate moved to ${newStatus}`, 'success');
    }
  };

  const columns = ['Application', 'Shortlisted', 'Interview', 'Hired', 'Rejected'];

  const getColumnColor = (col) => {
    if (col === 'Rejected') return 'border-t-red-500';
    if (col === 'Hired') return 'border-t-emerald-500';
    if (col === 'Shortlisted') return 'border-t-orange-500';
    if (col === 'Interview') return 'border-t-purple-600';
    return 'border-t-purple-500';
  };

  return (
    <div className="min-h-screen bg-[#F8F7FC] py-8 px-4 sm:px-6 lg:px-8">
      {/* Wide Desktop Container max-w-7xl */}
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-purple-100">
          <div>
            <h1 className="text-2xl sm:text-4xl font-black text-[#5B21B6]">Recruitment Kanban Board</h1>
            <p className="text-xs sm:text-sm font-semibold text-gray-500 mt-0.5">Multi-stage candidate evaluation pipeline and hiring workflow</p>
          </div>
          
          <div className="relative w-full sm:w-72">
            <select 
              className="w-full appearance-none bg-white border border-purple-200 text-purple-900 py-3 pl-4 pr-10 rounded-2xl font-extrabold text-sm focus:outline-none focus:border-purple-600 cursor-pointer shadow-sm"
              value={selectedJob?.id || ''}
              onChange={(e) => {
                 const j = jobs.find(job => job.id === e.target.value);
                 if (j) setSelectedJob(j);
              }}
            >
              {jobs.map(job => (
                <option key={job.id} value={job.id}>{job.title} ({job.type || 'Gig'})</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-600 pointer-events-none" />
          </div>
        </div>

        {/* Horizontal Kanban Columns */}
        <div className="overflow-x-auto pb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 min-w-[900px]">
            {columns.map(col => {
              const columnApps = applications.filter(a => a.status === col || (col === 'Application' && (a.status === 'Applied' || !a.status)));

              return (
                <div key={col} className={`bg-white border border-purple-100 rounded-3xl p-4 shadow-sm space-y-4 border-t-4 ${getColumnColor(col)}`}>
                  <div className="flex justify-between items-center pb-2 border-b border-purple-50">
                    <h3 className="font-extrabold text-sm text-[#5B21B6]">{col}</h3>
                    <span className="bg-purple-50 text-[#5B21B6] text-xs px-2.5 py-1 rounded-full font-black">
                      {columnApps.length}
                    </span>
                  </div>

                  <div className="space-y-3 min-h-[300px]">
                    {columnApps.map(app => {
                      const worker = workers[app.workerId] || { name: app.workerName || 'Candidate', skillScore: 85 };

                      return (
                        <div key={app.id} className="p-4 bg-purple-50/40 border border-purple-100 rounded-2xl space-y-3 hover:border-purple-300 transition-all shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#6D28D9] text-white font-extrabold text-xs flex items-center justify-center shadow-sm">
                              {worker?.name?.charAt(0) || 'C'}
                            </div>
                            <div>
                              <h4 className="font-extrabold text-sm text-gray-900 leading-tight">{worker.name}</h4>
                              <p className="text-[11px] font-bold text-orange-600 flex items-center gap-1 mt-0.5">
                                <Star className="w-3 h-3 fill-orange-500" /> Score: {worker.skillScore || 85}/100
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-2 pt-2 border-t border-purple-100">
                            {col !== 'Rejected' && col !== 'Hired' && (
                              <button
                                onClick={() => handleAction(app.id, 'Rejected', app.workerId)}
                                className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 py-1.5 rounded-xl text-xs font-extrabold transition-colors flex items-center justify-center gap-1"
                              >
                                <X className="w-3 h-3" /> Reject
                              </button>
                            )}

                            {col !== 'Hired' && (
                              <button
                                onClick={() => handleAction(app.id, col === 'Application' ? 'Shortlisted' : col === 'Shortlisted' ? 'Interview' : 'Hired', app.workerId)}
                                className="flex-1 bg-[#6D28D9] text-white hover:bg-[#5B21B6] py-1.5 rounded-xl text-xs font-extrabold transition-colors flex items-center justify-center gap-1 shadow-sm"
                              >
                                Advance <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {columnApps.length === 0 && (
                      <div className="text-center py-12 text-xs font-bold text-gray-400 border border-dashed border-purple-200 rounded-2xl">
                        No candidates in {col}
                      </div>
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
