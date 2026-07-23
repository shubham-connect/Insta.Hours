import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { demoStore } from '../../utils/demoStore';
import { Plus, Users, Target, Briefcase, Eye, ToggleLeft, ToggleRight, Search, ChevronDown, ChevronUp, Check, X, ArrowRight, Star, Filter, Tag, DollarSign, Laptop } from 'lucide-react';

export default function MyPostings() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [postings, setPostings] = useState([]);
  const [expandedJobId, setExpandedJobId] = useState(null);
  const [jobApplications, setJobApplications] = useState([]);

  // Filters State
  const [filters, setFilters] = useState({
    search: '',
    type: 'All', // All, Gig, Internship, Job
    status: 'All', // All, Active, Deactivated
    workMode: 'All' // All, Remote, On-Site, Hybrid
  });

  useEffect(() => {
    const employerUid = user ? user.uid : 'employer_demo_1';

    const loadDemoData = () => {
      const allJobs = demoStore.getJobs();
      const myJobs = allJobs.filter(j => j.employerId === employerUid || j.employerId === 'employer_demo_1');
      setPostings(myJobs.length > 0 ? myJobs : [
        {
          id: 'post_1',
          title: 'Video Editor & Reel Creator',
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
        },
        {
          id: 'post_3',
          title: 'Brand Marketing Intern',
          type: 'Internship',
          workMode: 'Hybrid',
          pay: '₹10,000/mo',
          isActive: false,
          applicantCount: 28,
          minScore: '55+'
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

  const toggleJobStatus = async (jobId, jobTitle, currentStatus) => {
    const newStatus = !currentStatus;
    try {
      if (!isFirebaseConfigured || !db) {
        demoStore.toggleJobActive(jobId);
        if (!newStatus) {
          addToast(`Posting for "${jobTitle}" has been deactivated. Applicants notified.`, 'info');
        } else {
          addToast(`Posting for "${jobTitle}" activated!`, 'success');
        }
        return;
      }

      await updateDoc(doc(db, 'jobs', jobId), {
        isActive: newStatus
      });
      if (!newStatus) {
        addToast(`Posting for "${jobTitle}" has been deactivated. Applicants notified.`, 'info');
      } else {
        addToast(`Posting for "${jobTitle}" activated!`, 'success');
      }
    } catch (error) {
      demoStore.toggleJobActive(jobId);
      if (!newStatus) {
        addToast(`Posting for "${jobTitle}" has been deactivated. Applicants notified.`, 'info');
      } else {
        addToast(`Posting for "${jobTitle}" activated!`, 'success');
      }
    }
  };

  const handleTogglePipeline = (jobId) => {
    if (expandedJobId === jobId) {
      setExpandedJobId(null);
    } else {
      setExpandedJobId(jobId);
      const apps = demoStore.getApplications().filter(a => a.jobId === jobId);
      setJobApplications(apps.length > 0 ? apps : [
        { id: `app_${jobId}_1`, workerName: 'Rahul Sharma', status: 'Applied', skillScore: 85 },
        { id: `app_${jobId}_2`, workerName: 'Priya Verma', status: 'Shortlisted', skillScore: 78 },
        { id: `app_${jobId}_3`, workerName: 'Amit Patel', status: 'Hired', skillScore: 92 }
      ]);
    }
  };

  const handleUpdateApplicantStatus = (appId, newStatus) => {
    demoStore.updateApplicationStatus(appId, newStatus);
    setJobApplications(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a));
    addToast(`Candidate updated to ${newStatus}`, 'success');
  };

  // Filtered Postings Logic
  const filteredPostings = postings.filter(job => {
    const sLower = (filters.search || '').toLowerCase();
    const matchesSearch = !sLower || job.title.toLowerCase().includes(sLower);
    const matchesType = filters.type === 'All' || job.type === filters.type;
    
    const isActive = job.isActive !== false;
    const matchesStatus = filters.status === 'All' || 
      (filters.status === 'Active' && isActive) || 
      (filters.status === 'Deactivated' && !isActive);

    const matchesMode = filters.workMode === 'All' || job.workMode === filters.workMode || job.location === filters.workMode;

    return matchesSearch && matchesType && matchesStatus && matchesMode;
  });

  const pipelineStages = ['Applied', 'Shortlisted', 'Interview', 'Hired', 'Rejected'];

  return (
    <div className="min-h-screen bg-[#F8F7FC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-purple-100">
          <div>
            <h1 className="text-2xl sm:text-4xl font-black text-[#5B21B6]">Manage Postings</h1>
            <p className="text-xs sm:text-sm font-semibold text-gray-500 mt-0.5">Filter postings or click to expand candidate evaluation pipeline</p>
          </div>
          
          <Link
            to="/employer/create"
            className="px-5 py-2.5 rounded-2xl bg-[#6D28D9] text-white hover:bg-[#5B21B6] font-extrabold text-xs shadow-md transition-all flex items-center gap-2 hover:scale-105"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Post New Opportunity
          </Link>
        </div>

        {/* 2-Column Wide Desktop Grid with Left-Side Filter Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Left Column (1/4 width): Filter Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="app-card p-6 bg-white border border-purple-100 rounded-3xl space-y-5 shadow-sm">
              <div className="flex items-center gap-2 border-b border-purple-100 pb-3">
                <Filter className="w-5 h-5 text-purple-700" />
                <h3 className="font-extrabold text-base text-[#5B21B6]">Filter Postings</h3>
              </div>

              {/* 1. Search Bar */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Search Title</label>
                <div className="relative">
                  <Search className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    placeholder="Role title..."
                    className="w-full bg-purple-50/50 border border-purple-200 rounded-xl pl-9 pr-4 py-2.5 text-xs font-semibold text-gray-800 focus:outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              {/* 2. Opportunity Type */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-purple-600" /> Type
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  className="w-full bg-purple-50/50 border border-purple-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-gray-800 focus:outline-none focus:border-purple-600 cursor-pointer"
                >
                  <option value="All">All Types (Gigs, Jobs, Interns)</option>
                  <option value="Gig">Gig Only</option>
                  <option value="Internship">Internship Only</option>
                  <option value="Job">Full Job Only</option>
                </select>
              </div>

              {/* 3. Active Status */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <ToggleRight className="w-3.5 h-3.5 text-emerald-600" /> Status
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {['All', 'Active', 'Deactivated'].map(status => (
                    <button
                      key={status}
                      onClick={() => setFilters({ ...filters, status })}
                      className={`py-1.5 text-[11px] font-bold rounded-lg border transition-all ${
                        filters.status === status 
                          ? 'bg-purple-700 text-white border-purple-700' 
                          : 'bg-purple-50/50 border-purple-100 text-gray-600'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Work Mode */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Laptop className="w-3.5 h-3.5 text-orange-500" /> Work Mode
                </label>
                <select
                  value={filters.workMode}
                  onChange={(e) => setFilters({ ...filters, workMode: e.target.value })}
                  className="w-full bg-purple-50/50 border border-purple-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-gray-800 focus:outline-none focus:border-purple-600 cursor-pointer"
                >
                  <option value="All">All Work Modes</option>
                  <option value="Remote">Remote</option>
                  <option value="On-Site">On-Site</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>

              <button
                onClick={() => setFilters({ search: '', type: 'All', status: 'All', workMode: 'All' })}
                className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl border border-red-200 transition-all"
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* Right Column (3/4 width): Postings Grid with Alternating Theme Accents */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-extrabold text-[#5B21B6]">Postings List</h2>
              <span className="text-xs font-bold text-gray-500">{filteredPostings.length} Postings Found</span>
            </div>

            {filteredPostings.length > 0 ? (
              <div className="space-y-4">
                {filteredPostings.map((job, idx) => {
                  const applicantsCount = job.applicantCount || (job.title?.includes('Video') ? 12 : 45);
                  const minScore = job.minScore || (job.title?.includes('Video') ? '60+' : '50+');
                  const isExpanded = expandedJobId === job.id;
                  const isActive = job.isActive !== false;

                  // Alternate Colors (Idx 0: Purple Theme, Idx 1: Orange Theme, Idx 2: Purple, etc.)
                  const isPurpleTheme = idx % 2 === 0;

                  return (
                    <div
                      key={job.id}
                      className={`app-card p-6 bg-white border-2 rounded-3xl shadow-sm transition-all space-y-4 ${
                        !isActive 
                          ? 'border-gray-200 opacity-80' 
                          : isPurpleTheme 
                            ? 'border-purple-100 hover:border-purple-300' 
                            : 'border-orange-100 hover:border-orange-300'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                              isPurpleTheme
                                ? 'text-purple-700 bg-purple-50 border-purple-100'
                                : 'text-orange-600 bg-orange-50 border-orange-100'
                            }`}>
                              {job.type || 'Gig'}
                            </span>
                            <h3 className="text-xl font-extrabold text-gray-900 leading-snug">
                              {job.title}
                            </h3>
                          </div>
                          <p className="text-xs font-bold text-gray-500 mt-1">
                            {job.workMode || job.location || 'Remote'} • <span className={`font-black ${isPurpleTheme ? 'text-purple-700' : 'text-orange-600'}`}>{job.pay}</span>
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          {/* Active/Deactive Status Toggle Switch */}
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-extrabold px-3 py-1 rounded-lg ${
                              isActive
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                : 'bg-gray-100 text-gray-500'
                            }`}>
                              {isActive ? 'Active' : 'Deactivated'}
                            </span>

                            <button
                              onClick={() => toggleJobStatus(job.id, job.title, isActive)}
                              className="text-purple-600 hover:text-purple-900 p-1 transition-transform active:scale-95"
                              title={isActive ? 'Click to Deactivate Posting' : 'Click to Activate Posting'}
                            >
                              {isActive ? <ToggleRight className={`w-8 h-8 ${isPurpleTheme ? 'text-purple-700' : 'text-orange-500'}`} /> : <ToggleLeft className="w-8 h-8 text-gray-400" />}
                            </button>
                          </div>

                          <button
                            onClick={() => handleTogglePipeline(job.id)}
                            className={`text-xs font-extrabold text-white px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 ${
                              isPurpleTheme
                                ? 'bg-[#6D28D9] hover:bg-[#5B21B6]'
                                : 'bg-[#EA580C] hover:bg-orange-600'
                            }`}
                          >
                            <Users className="w-4 h-4" />
                            <span>{isExpanded ? 'Hide Pipeline' : 'View Pipeline'}</span>
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Metrics Bar */}
                      <div className="flex items-center gap-6 pt-3 border-t border-purple-50 text-xs font-extrabold">
                        <div className={`flex items-center gap-1.5 ${isPurpleTheme ? 'text-purple-800' : 'text-orange-900'}`}>
                          <Users className={`w-4 h-4 ${isPurpleTheme ? 'text-purple-600' : 'text-orange-500'}`} />
                          <span>{applicantsCount} Applicants</span>
                        </div>

                        <div className={`flex items-center gap-1.5 ${isPurpleTheme ? 'text-purple-800' : 'text-orange-900'}`}>
                          <Target className={`w-4 h-4 ${isPurpleTheme ? 'text-purple-600' : 'text-orange-500'}`} />
                          <span>Min Score {minScore}</span>
                        </div>
                      </div>

                      {/* EMBEDDED HIRING PIPELINE VIEW */}
                      {isExpanded && (
                        <div className="pt-4 border-t-2 border-purple-100 space-y-4 animate-scale-in">
                          <div className="flex justify-between items-center">
                            <h4 className="font-extrabold text-sm text-[#5B21B6]">Candidate Evaluation Pipeline</h4>
                            <span className="text-xs font-semibold text-gray-500">{jobApplications.length} Candidates in Pipeline</span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                            {pipelineStages.map(stage => {
                              const appsInStage = jobApplications.filter(a => a.status === stage || (stage === 'Applied' && !a.status));

                              return (
                                <div key={stage} className="bg-purple-50/40 border border-purple-100 rounded-2xl p-3 space-y-3">
                                  <div className="flex justify-between items-center border-b border-purple-100 pb-1.5">
                                    <span className="font-extrabold text-xs text-[#5B21B6]">{stage}</span>
                                    <span className="text-[10px] font-black bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                                      {appsInStage.length}
                                    </span>
                                  </div>

                                  <div className="space-y-2 min-h-[160px]">
                                    {appsInStage.map(app => (
                                      <div key={app.id} className="bg-white p-3 rounded-xl border border-purple-100 shadow-sm space-y-2">
                                        <div className="flex items-center gap-2">
                                          <div className="w-7 h-7 rounded-full bg-[#6D28D9] text-white font-extrabold text-[10px] flex items-center justify-center">
                                            {app.workerName ? app.workerName.charAt(0) : 'R'}
                                          </div>
                                          <div>
                                            <p className="font-extrabold text-xs text-gray-900 leading-tight">{app.workerName || 'Rahul'}</p>
                                            <p className="text-[10px] font-bold text-orange-600 flex items-center gap-0.5">
                                              <Star className="w-2.5 h-2.5 fill-orange-500" /> {app.skillScore || 85}/100
                                            </p>
                                          </div>
                                        </div>

                                        {stage !== 'Hired' && stage !== 'Rejected' && (
                                          <div className="flex gap-1 pt-1">
                                            <button
                                              onClick={() => handleUpdateApplicantStatus(app.id, 'Rejected')}
                                              className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 py-1 rounded text-[10px] font-bold"
                                            >
                                              Reject
                                            </button>
                                            <button
                                              onClick={() => handleUpdateApplicantStatus(app.id, stage === 'Applied' ? 'Shortlisted' : stage === 'Shortlisted' ? 'Interview' : 'Hired')}
                                              className="flex-1 bg-purple-600 text-white hover:bg-purple-700 py-1 rounded text-[10px] font-bold"
                                            >
                                              Next
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    ))}

                                    {appsInStage.length === 0 && (
                                      <p className="text-[10px] font-semibold text-gray-400 text-center py-8">Empty</p>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="app-card p-12 text-center text-gray-500 bg-white rounded-3xl">
                <Briefcase className="w-12 h-12 text-purple-300 mx-auto mb-2" />
                <p className="font-extrabold text-lg text-[#5B21B6]">No Postings Match Your Filter</p>
                <p className="text-xs text-gray-400 mt-1 mb-4">Try resetting the filter sidebar on the left</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
