import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Pages
import LoginPage from './pages/LoginPage';
import OnboardingPage from './pages/OnboardingPage';

// Worker Pages
import JobFeed from './pages/worker/JobFeed';
import CareersPage from './pages/worker/CareersPage';
import SkillScorePage from './pages/worker/SkillScorePage';
import PulsePage from './pages/worker/PulsePage';
import MyApplications from './pages/worker/MyApplications';
import Profile from './pages/worker/Profile';

// Employer Pages matching screenshots
import Dashboard from './pages/employer/Dashboard';
import CreateJob from './pages/employer/CreateJob';
import MyPostings from './pages/employer/MyPostings';
import Candidates from './pages/employer/Candidates';
import EmployerBilling from './pages/employer/EmployerBilling';
import EmployerProfile from './pages/employer/EmployerProfile';

function App() {
  const { user, userProfile, loading } = useAuth();
  const [selectedLocation, setSelectedLocation] = useState(null);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F7FC]">
        <div className="text-4xl font-extrabold text-[#5B21B6] animate-pulse flex items-center gap-2">
          <span className="text-3xl">⏳</span> InstaHours
        </div>
        <div className="mt-4 w-10 h-10 border-4 border-purple-200 border-t-[#6D28D9] rounded-full animate-spin"></div>
      </div>
    );
  }

  // Determine root redirect
  const getRootRedirect = () => {
    if (!user) return '/login';
    if (!userProfile) return '/onboarding';
    return userProfile.role === 'worker' ? '/feed' : '/employer';
  };

  const renderWorkerLayout = (children) => (
    <div className="min-h-screen bg-[#F8F7FC]">
      <Navbar selectedLocation={selectedLocation} onLocationChange={setSelectedLocation} />
      {children}
    </div>
  );

  const renderEmployerLayout = (children) => (
    <div className="min-h-screen bg-[#F8F7FC]">
      <Navbar />
      {children}
    </div>
  );

  return (
    <Routes>
      <Route path="/login" element={user && userProfile ? <Navigate to={getRootRedirect()} /> : <LoginPage />} />
      <Route path="/onboarding" element={user && !userProfile ? <OnboardingPage /> : <Navigate to={getRootRedirect()} />} />

      {/* Worker Tab Routes */}
      <Route path="/feed" element={<ProtectedRoute role="worker">{renderWorkerLayout(<JobFeed selectedLocation={selectedLocation} onLocationChange={setSelectedLocation} />)}</ProtectedRoute>} />
      <Route path="/careers" element={<ProtectedRoute role="worker">{renderWorkerLayout(<CareersPage />)}</ProtectedRoute>} />
      <Route path="/jobs" element={<ProtectedRoute role="worker">{renderWorkerLayout(<CareersPage />)}</ProtectedRoute>} />
      <Route path="/skill-score" element={<ProtectedRoute role="worker">{renderWorkerLayout(<SkillScorePage />)}</ProtectedRoute>} />
      <Route path="/pulse" element={<ProtectedRoute role="worker">{renderWorkerLayout(<PulsePage />)}</ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute role="worker">{renderWorkerLayout(<Profile />)}</ProtectedRoute>} />
      <Route path="/applications" element={<ProtectedRoute role="worker">{renderWorkerLayout(<MyApplications />)}</ProtectedRoute>} />

      {/* Employer Tab Routes matching screenshots */}
      <Route path="/employer" element={<ProtectedRoute role="employer">{renderEmployerLayout(<Dashboard />)}</ProtectedRoute>} />
      <Route path="/employer/create" element={<ProtectedRoute role="employer">{renderEmployerLayout(<CreateJob />)}</ProtectedRoute>} />
      <Route path="/employer/postings" element={<ProtectedRoute role="employer">{renderEmployerLayout(<MyPostings />)}</ProtectedRoute>} />
      <Route path="/employer/candidates" element={<ProtectedRoute role="employer">{renderEmployerLayout(<Candidates />)}</ProtectedRoute>} />
      <Route path="/employer/candidates/:jobId" element={<ProtectedRoute role="employer">{renderEmployerLayout(<Candidates />)}</ProtectedRoute>} />
      <Route path="/employer/billing" element={<ProtectedRoute role="employer">{renderEmployerLayout(<EmployerBilling />)}</ProtectedRoute>} />
      <Route path="/employer/profile" element={<ProtectedRoute role="employer">{renderEmployerLayout(<EmployerProfile />)}</ProtectedRoute>} />

      <Route path="/" element={<Navigate to={getRootRedirect()} />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
