import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, getDoc, doc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { demoStore } from '../../utils/demoStore';
import FilterSidebar from '../../components/FilterSidebar';
import HeroBannerCarousel from '../../components/HeroBannerCarousel';
import JobCard from '../../components/JobCard';
import JobDetailModal from '../../components/JobDetailModal';
import { Calendar, Camera, FileSpreadsheet, Zap } from 'lucide-react';

export default function JobFeed() {
  const { user } = useAuth();
  const { addToast } = useToast();
  
  const [jobs, setJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);

  const [filters, setFilters] = useState({
    search: '',
    type: 'Gig',
    location: null,
    workMode: null,
    roleCategory: null,
    payout: null,
    skills: []
  });

  const gigBanners = [
    {
      badge: 'AD 1/5 • HOT GIG',
      title: 'Event Operations Rep',
      subtitle: '₹1500 • On-Site • 50+ Applied',
      bg: 'bg-gradient-to-r from-purple-700 to-indigo-700'
    },
    {
      badge: 'AD 2/5 • FAST PAY',
      title: 'Social Media Creator',
      subtitle: '₹1200/day • Remote • Same day payout',
      bg: 'bg-gradient-to-r from-purple-800 to-purple-900'
    }
  ];

  useEffect(() => {
    const loadDemoData = () => {
      const activeGigs = demoStore.getJobs().filter(j => j.isActive);
      setJobs(activeGigs);
      if (user) {
        const myApps = demoStore.getApplications().filter(a => a.workerId === user.uid);
        setAppliedJobs(new Set(myApps.map(a => a.jobId)));
      }
      setLoading(false);
    };

    if (!isFirebaseConfigured || !db) {
      loadDemoData();
      const unsub = demoStore.subscribe(loadDemoData);
      return () => unsub();
    }

    let unsubscribeJobs;
    let unsubscribeApps;

    try {
      const jobsQuery = query(collection(db, 'jobs'), where('isActive', '==', true));
      unsubscribeJobs = onSnapshot(
        jobsQuery,
        (snapshot) => {
          const jobsData = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
          setJobs(jobsData.length > 0 ? jobsData : demoStore.getJobs());
          setLoading(false);
        },
        (err) => {
          console.warn("Firestore listener warning, using fallback data:", err);
          loadDemoData();
        }
      );

      if (user) {
        const appsQuery = query(collection(db, 'applications'), where('workerId', '==', user.uid));
        unsubscribeApps = onSnapshot(
          appsQuery,
          (snapshot) => {
            const appliedSet = new Set(snapshot.docs.map(d => d.data().jobId));
            setAppliedJobs(appliedSet);
          },
          (err) => {
            console.warn("Firestore apps listener warning:", err);
          }
        );
      }
    } catch (error) {
      console.warn("Firestore setup error:", error);
      loadDemoData();
    }

    return () => {
      if (unsubscribeJobs) unsubscribeJobs();
      if (unsubscribeApps) unsubscribeApps();
    };
  }, [user]);

  const handleApply = async (jobId) => {
    const uid = user ? user.uid : 'worker_demo_1';

    try {
      setAppliedJobs(prev => {
        const newSet = new Set(prev);
        newSet.add(jobId);
        return newSet;
      });

      demoStore.applyForJob(jobId, uid);

      if (isFirebaseConfigured && db) {
        await addDoc(collection(db, 'applications'), {
          jobId,
          workerId: uid,
          status: 'Applied',
          timestamp: serverTimestamp()
        });

        const jobDoc = await getDoc(doc(db, 'jobs', jobId));
        if (jobDoc.exists()) {
          const jobData = jobDoc.data();
          await addDoc(collection(db, 'notifications'), {
            userId: jobData.employerId,
            type: 'new_application',
            message: `New applicant for ${jobData.title}`,
            jobId,
            read: false,
            timestamp: serverTimestamp()
          });
        }
      }

      addToast('Applied to Gig successfully!', 'success');
      setSelectedJob(null);
    } catch (error) {
      console.error(error);
      addToast('Applied to Gig (Local Mode)', 'success');
      setSelectedJob(null);
    }
  };

  const filteredGigs = jobs.filter(job => {
    const sLower = (filters.search || '').toLowerCase();
    const matchesSearch = !sLower || 
      job.title.toLowerCase().includes(sLower) || 
      job.description.toLowerCase().includes(sLower) ||
      (job.location && job.location.toLowerCase().includes(sLower));

    const matchesType = !filters.type || job.type === filters.type;
    const matchesLoc = !filters.location || (job.location && job.location.toLowerCase() === filters.location.toLowerCase());
    const matchesMode = !filters.workMode || job.workMode === filters.workMode;
    const matchesSkills = !filters.skills || filters.skills.length === 0 || 
      (job.skills && filters.skills.every(sk => job.skills.includes(sk)));

    return matchesSearch && matchesType && matchesLoc && matchesMode && matchesSkills;
  });

  return (
    <div className="min-h-screen bg-[#F8F7FC] py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 items-start">
        
        {/* Left Column: Filter Sidebar (hideOpportunityType set to true) */}
        <div className="w-full md:w-80 sticky top-20 flex-shrink-0">
          <FilterSidebar filters={filters} onFilterChange={setFilters} hideOpportunityType={true} />
        </div>

        {/* Right Column: Hero Banner + Instant Gigs List */}
        <div className="flex-1 w-full space-y-6">
          
          <HeroBannerCarousel banners={gigBanners} />

          <div className="flex justify-between items-center pb-2 border-b border-purple-100">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#5B21B6]">Instant Gigs</h1>
              <p className="text-xs font-semibold text-gray-500 mt-0.5">
                Showing {filteredGigs.length} active opportunities
              </p>
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="app-card h-28 animate-pulse bg-white"></div>
              ))}
            </div>
          ) : filteredGigs.length > 0 ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {filteredGigs.map((gig) => {
                const isCamera = gig.title?.toLowerCase().includes('photo') || gig.title?.toLowerCase().includes('video') || gig.title?.toLowerCase().includes('event');

                return (
                  <div
                    key={gig.id}
                    onClick={() => setSelectedJob(gig)}
                    className="app-card p-5 flex items-center justify-between cursor-pointer hover:border-purple-300 transition-all bg-white shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-orange-500 flex-shrink-0">
                        {isCamera ? <Camera className="w-6 h-6 text-orange-500" /> : <FileSpreadsheet className="w-6 h-6 text-purple-600" />}
                      </div>

                      <div>
                        <h3 className="font-extrabold text-base text-[#5B21B6] leading-snug">
                          {gig.title}
                        </h3>
                        <p className="text-xs font-semibold text-gray-500 mt-0.5">
                          {gig.employerName || 'Gurukul Dream Foundation'}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                            📍 {gig.location || 'Remote'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0 ml-4">
                      <p className="font-extrabold text-base text-[#EA580C]">
                        {gig.pay}
                      </p>
                      <span className="inline-flex items-center text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md mt-1 border border-purple-100">
                        <Calendar className="w-3 h-3 mr-0.5 text-purple-600" /> 1-7 Days
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="app-card p-12 text-center text-gray-500 bg-white">
              <Zap className="w-12 h-12 text-purple-300 mx-auto mb-2" />
              <p className="font-extrabold text-lg text-[#5B21B6]">No Gigs Match Your Filter</p>
              <p className="text-xs text-gray-400 mt-1">Try resetting the filter sidebar on the left</p>
            </div>
          )}
        </div>
      </div>

      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          isOpen={!!selectedJob}
          onClose={() => setSelectedJob(null)}
          onApply={() => handleApply(selectedJob.id)}
          applied={appliedJobs.has(selectedJob.id)}
        />
      )}
    </div>
  );
}
