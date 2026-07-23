import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Zap, Briefcase, Award, Activity, User, Building2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function BottomNav() {
  const location = useLocation();
  const { userProfile } = useAuth();
  
  // Only render for workers or when on worker pages
  if (userProfile?.role === 'employer') return null;

  const tabs = [
    { path: '/feed', label: 'Gigs', icon: Zap },
    { path: '/careers', label: 'Careers', icon: Briefcase },
    { path: '/skill-score', label: 'Skill Score', icon: Award },
    { path: '/pulse', label: 'Pulse', icon: Activity },
    { path: '/profile', label: 'Profile', icon: User }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-purple-100 z-50 py-2 px-4 shadow-[0_-4px_20px_rgba(109,40,217,0.08)]">
      <div className="max-w-md mx-auto flex justify-around items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.path || (tab.path === '/feed' && location.pathname === '/');
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex flex-col items-center gap-1 text-xs font-semibold transition-colors ${
                isActive ? 'text-purple-700' : 'text-gray-400 hover:text-purple-600'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-purple-700 stroke-[2.5]' : 'text-gray-400'}`} />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
