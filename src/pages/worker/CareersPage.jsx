import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, getDoc, doc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { demoStore } from '../../utils/demoStore';
import FilterSidebar from '../../components/FilterSidebar';
import HeroBannerCarousel from '../../components/HeroBannerCarousel';
import JobDetailModal from '../../components/JobDetailModal';
import { Building2, Briefcase } from 'lucide-react';

export default function CareersPage() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [jobs, setJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);

  const [filters, setFilters] = useState({
    search: '',
    type: null,
    location: null,
    workMode: null,
    roleCategory: null,
    payout: null,
    skills: []
  });

  const careerBanners = [
    {
      badge: 'AD 1/5 • TOP COMPANY',
      title: 'Brand Marketing Intern',
      subtitle: 'Pre-placement offer available • ₹10k/mo',
      bg: 'bg-gradient-to-r from-purple-800 to-indigo-800'
    },
    {
      badge: 'AD 2/5 • FEATURED JOB',
      title: 'Junior Full Stack Engineer',
      subtitle: '₹8.5 LPA • Bengaluru • Top AI Startup',
      bg: 'bg-gradient-to-r from-purple-700 to-purple-900'
    }
  ];

  useEffect(() => {
    const loadDemoData = () => {
      const activeJobs = demoStore.getJobs().filter(j => j.isActive && j.type !== 'Gig');
      setJobs(activeJobs);
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
          const filtered = jobsData.filter(j => j.type !== 'Gig');
          setJobs(filtered.length > 0 ? filtered : demoStore.getJobs().filter(j => j.type !== 'Gig'));
          setLoading(false);
        },
        (err) => {
          console.warn("Firestore listener error, using demo data:", err);
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
            console.warn("Apps listener error:", err);
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

      addToast('Application submitted successfully!', 'success');
      setSelectedJob(null);
    } catch (error) {
      console.error(error);
      addToast('Application submitted (Local Mode)', 'success');
      setSelectedJob(null);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const sLower = (filters.search || '').toLowerCase();
    const matchesSearch = !sLower || 
      job.title.toLowerCase().includes(sLower) || 
      job.description.toLowerCase().includes(sLower) ||
      (job.location && job.location.toLowerCase().includes(sLower));

    const matchesType = !filters.type || job.type === filters.type;
    const matchesLoc = !filters.location || (job.location && job.location.toLowerCase() === filters.location.toLowerCase());
    const matchesMode = !filters.workMode || job.workMode === filters.workMode;

    return matchesType && matchesSearch && matchesLoc && matchesMode;
  });

  return (
    <div className="min-h-screen bg-[#F8F7FC] py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 items-start">
        
        {/* Left Column: Filter Sidebar (allowedOpportunityTypes set to ['Internship', 'Job']) */}
        <div className="w-full md:w-80 sticky top-20 flex-shrink-0">
          <FilterSidebar filters={filters} onFilterChange={setFilters} allowedOpportunityTypes={['Internship', 'Job']} />
        </div>

        {/* Right Column: Hero Banner + Career Launchpad Content */}
        <div className="flex-1 w-full space-y-6">
          
          <HeroBannerCarousel banners={careerBanners} />

          <div className="flex justify-between items-center pb-2 border-b border-purple-100">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#5B21B6]">Career Launchpad</h1>
              <p className="text-xs font-semibold text-gray-500 mt-0.5">
                Showing {filteredJobs.length} active positions
              </p>
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="app-card h-28 animate-pulse bg-white"></div>
              ))}
            </div>
          ) : filteredJobs.length > 0 ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {filteredJobs.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedJob(item)}
                  className="app-card p-5 flex items-center justify-between cursor-pointer hover:border-purple-300 transition-all bg-white shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-500 flex-shrink-0">
                      <Building2 className="w-6 h-6 text-orange-500" />
                    </div>

                    <div>
                      <h3 className="font-extrabold text-base text-[#5B21B6] leading-snug">
                        {item.title}
                      </h3>
                      <p className="text-xs font-semibold text-gray-500 mt-0.5">
                        {item.employerName || 'Baburao Merch Co.'}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          📍 {item.location || 'Remote'}
                        </span>
                        <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                          {item.type || 'Internship'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0 ml-4">
                    <p className="font-extrabold text-base text-[#5B21B6]">
                      {item.pay}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="app-card p-12 text-center text-gray-500 bg-white">
              <Briefcase className="w-12 h-12 text-purple-300 mx-auto mb-2" />
              <p className="font-extrabold text-lg text-[#5B21B6]">No Careers Found</p>
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
