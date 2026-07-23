import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot, getDocs, doc, getDoc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { demoStore } from '../../utils/demoStore';
import { ChevronDown, Users, Check, X, ArrowRight } from 'lucide-react';

export default function Candidates() {
  const { user } = useAuth();
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [workers, setWorkers] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch all employer jobs for dropdown
  useEffect(() => {
    if (!user) return;

    if (!isFirebaseConfigured) {
      const loadDemoJobs = () => {
        const jobsData = demoStore.getJobs().filter(j => j.employerId === user.uid || j.employerId === 'employer_demo_1');
        setJobs(jobsData);
        if (jobsData.length > 0) {
          if (jobId) {
            const j = jobsData.find(item => item.id === jobId);
            setSelectedJob(j || jobsData[0]);
          } else {
            setSelectedJob(jobsData[0]);
          }
        }
        setLoading(false);
      };

      loadDemoJobs();
      const unsub = demoStore.subscribe(loadDemoJobs);
      return () => unsub();
    }

    const fetchJobs = async () => {
      const q = query(collection(db, 'jobs'), where('employerId', '==', user.uid));
      const snap = await getDocs(q);
      const jobsData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setJobs(jobsData);
      
      if (jobsData.length > 0) {
        if (jobId) {
           const job = jobsData.find(j => j.id === jobId);
           if (job) setSelectedJob(job);
           else setSelectedJob(jobsData[0]);
        } else {
           setSelectedJob(jobsData[0]);
        }
      }
      setLoading(false);
    };
    fetchJobs();
  }, [user, jobId]);

  // Fetch applications when selectedJob changes
  useEffect(() => {
    if (!selectedJob) return;

    if (!isFirebaseConfigured) {
      const loadDemoApps = () => {
        const apps = demoStore.getApplications().filter(a => a.jobId === selectedJob.id);
        setApplications(apps);
        setWorkers(demoStore.users);
      };

      loadDemoApps();
      const unsub = demoStore.subscribe(loadDemoApps);
      return () => unsub();
    }

    const q = query(collection(db, 'applications'), where('jobId', '==', selectedJob.id));
    const unsubscribe = onSnapshot(q, async (snap) => {
      const apps = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setApplications(apps);

      if (apps.length > 0) {
        const workerIds = [...new Set(apps.map(a => a.workerId))];
        const workersData = { ...workers };
        
        for (const wid of workerIds) {
          if (!workersData[wid]) {
            const wDoc = await getDoc(doc(db, 'users', wid));
            if (wDoc.exists()) {
              workersData[wid] = wDoc.data();
            }
          }
        }
        setWorkers(workersData);
      }
    });

    return () => unsubscribe();
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
      
      await addDoc(collection(db, 'notifications'), {
        userId: workerId,
        type: 'status_change',
        message: `Your application for ${selectedJob.title} has been updated to: ${newStatus}`,
        jobId: selectedJob.id,
        read: false,
        timestamp: serverTimestamp()
      });
      
      addToast(`Candidate moved to ${newStatus}`, 'success');
    } catch (error) {
      addToast('Error updating status', 'error');
    }
  };

  const getNextStage = (currentStatus) => {
    if (!selectedJob || !selectedJob.hiringProcess) return 'Hired';
    const currentIndex = selectedJob.hiringProcess.indexOf(currentStatus);
    if (currentIndex === -1 || currentIndex === selectedJob.hiringProcess.length - 1) return 'Hired';
    return selectedJob.hiringProcess[currentIndex + 1];
  };

  if (loading) return <div className="p-8 text-white mt-20 text-center">Loading board...</div>;

  if (jobs.length === 0) {
    return (
      <div className="p-8 text-white text-center mt-20">
        <h2 className="text-2xl font-bold mb-4">No Jobs Found</h2>
        <p className="text-gray-400 mb-6">You need to post a job before you can view candidates.</p>
        <button onClick={() => navigate('/employer/create')} className="bg-purple-600 px-6 py-2 rounded-lg font-medium">Create Job</button>
      </div>
    );
  }

  const columns = selectedJob?.hiringProcess ? [...selectedJob.hiringProcess, 'Rejected'] : ['Application', 'Hired', 'Rejected'];

  const getColumnColor = (col) => {
    if (col === 'Rejected') return 'border-t-red-500';
    if (col === 'Hired') return 'border-t-emerald-500';
    if (col === 'Application' || col === 'Applied') return 'border-t-blue-500';
    return 'border-t-purple-500';
  };

  return (
    <div className="h-[calc(100vh-4rem)] bg-[#0F0B1A] text-white flex flex-col overflow-hidden pt-16">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold mb-1">Recruitment Kanban Board</h1>
          <p className="text-sm text-gray-400">Multi-stage candidate evaluation pipeline</p>
        </div>
        
        <div className="relative">
          <select 
            className="appearance-none bg-white/5 border border-white/20 text-white py-2 pl-4 pr-10 rounded-xl focus:outline-none focus:border-purple-500 cursor-pointer"
            value={selectedJob?.id || ''}
            onChange={(e) => {
               const j = jobs.find(job => job.id === e.target.value);
               setSelectedJob(j);
               navigate(`/employer/candidates/${j.id}`, { replace: true });
            }}
          >
            {jobs.map(job => (
              <option key={job.id} value={job.id} className="bg-gray-900">{job.title}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto p-4 md:p-6 pb-10">
        <div className="flex gap-6 h-full min-w-max">
          {columns.map(col => {
            const columnApps = applications.filter(a => a.status === col || (col === 'Application' && a.status === 'Applied'));
            
            return (
              <div key={col} className={`w-80 flex flex-col glass-card bg-white/5 border border-white/10 rounded-2xl overflow-hidden border-t-4 ${getColumnColor(col)}`}>
                <div className="p-4 border-b border-white/5 bg-black/20 flex justify-between items-center flex-shrink-0">
                  <h3 className="font-semibold text-gray-200">{col}</h3>
                  <span className="bg-white/10 text-xs px-2.5 py-1 rounded-full text-gray-300 font-semibold">
                    {columnApps.length}
                  </span>
                </div>
                
                <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                  {columnApps.map(app => {
                    const worker = workers[app.workerId] || { name: 'Rahul Sharma', skillScore: 88, bio: 'Student Developer' };
                    const nextStage = getNextStage(app.status);
                    const isEndState = app.status === 'Hired' || app.status === 'Rejected';
                    
                    return (
                      <div key={app.id} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-purple-500/40 transition-colors">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-orange-500 flex items-center justify-center font-bold text-sm flex-shrink-0">
                            {worker?.name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <h4 className="font-medium text-sm leading-tight">{worker?.name || 'Applicant'}</h4>
                            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                              ⭐ Skill Score: <span className="text-orange-400 font-semibold">{worker?.skillScore || 80}/100</span>
                            </p>
                          </div>
                        </div>

                        {worker?.bio && (
                          <p className="text-xs text-gray-400 line-clamp-2 mb-3 bg-black/20 p-2 rounded border border-white/5">
                            "{worker.bio}"
                          </p>
                        )}
                        
                        {!isEndState && (
                          <div className="flex gap-2 mt-3 pt-3 border-t border-white/5">
                            <button 
                              onClick={() => handleAction(app.id, 'Rejected', app.workerId)}
                              className="flex-1 bg-red-500/10 text-red-400 hover:bg-red-500/20 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-center"
                            >
                              <X className="w-3 h-3 mr-1" /> Reject
                            </button>
                            <button 
                              onClick={() => handleAction(app.id, nextStage, app.workerId)}
                              className="flex-1 bg-purple-600/20 text-purple-300 hover:bg-purple-600/40 border border-purple-500/30 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-center"
                            >
                              {nextStage === 'Hired' ? (
                                <><Check className="w-3 h-3 mr-1" /> Hire</>
                              ) : (
                                <>Advance <ArrowRight className="w-3 h-3 ml-1" /></>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {columnApps.length === 0 && (
                    <div className="text-center p-6 text-xs text-gray-500 border border-dashed border-white/5 rounded-xl">
                      No candidates in this stage
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
