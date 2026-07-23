import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Zap, Briefcase, Award, Activity, User, Bell, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { isFirebaseConfigured, db } from '../lib/firebase';
import { demoStore } from '../utils/demoStore';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import NotificationDropdown from './NotificationDropdown';

const Navbar = () => {
  const { user, userProfile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(1);

  const role = userProfile?.role || 'worker';

  useEffect(() => {
    if (!user) return;

    if (!isFirebaseConfigured) {
      const updateUnread = () => {
        const notifs = demoStore.getNotifications(user.uid);
        const unread = notifs.filter(n => !n.read).length;
        setUnreadCount(unread || 1);
      };
      updateUnread();
      const unsub = demoStore.subscribe(updateUnread);
      return () => unsub();
    }

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      where('read', '==', false)
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      setUnreadCount(snap.size);
    });

    return () => unsubscribe();
  }, [user]);

  const workerNavLinks = [
    { path: '/feed', label: 'Gigs', icon: Zap },
    { path: '/careers', label: 'Careers', icon: Briefcase },
    { path: '/skill-score', label: 'Skill Score', icon: Award },
    { path: '/pulse', label: 'Pulse', icon: Activity },
    { path: '/profile', label: 'Profile', icon: User }
  ];

  const employerNavLinks = [
    { path: '/employer', label: 'Dashboard', icon: Briefcase },
    { path: '/employer/postings', label: 'My Postings', icon: Briefcase },
    { path: '/employer/candidates', label: 'Candidates', icon: User }
  ];

  const navLinks = role === 'employer' ? employerNavLinks : workerNavLinks;

  return (
    <nav className="sticky top-0 w-full bg-white/95 backdrop-blur-md border-b border-purple-100 z-40 shadow-[0_2px_15px_rgba(109,40,217,0.04)]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex justify-between items-center">
        
        {/* Left Section: Hourglass Logo + Title */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white font-black text-lg shadow-sm shadow-orange-500/30">
            ⏳
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-[#5B21B6]">
            InstaHours
          </span>
        </Link>

        {/* Center Section: Top Navigation Links ONLY */}
        <div className="flex items-center gap-6 md:gap-8">
          {user && navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path || (link.path === '/feed' && location.pathname === '/');
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-2 text-sm font-bold transition-all relative py-5 ${
                  isActive ? 'text-purple-700' : 'text-gray-500 hover:text-purple-600'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-purple-700' : 'text-gray-400'}`} />
                <span>{link.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-1 bg-purple-700 rounded-t-full" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right Section: Bell Notification + Profile Dropdown ONLY (No role switcher) */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Bell Icon Notification */}
              <div className="relative">
                <button
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className="p-2 text-purple-900 hover:bg-purple-50 rounded-full transition-colors relative"
                  title="Notifications"
                >
                  <Bell className="w-6 h-6 text-purple-900" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-orange-500 rounded-full ring-2 ring-white animate-pulse" />
                  )}
                </button>
                {isNotificationOpen && (
                  <NotificationDropdown
                    isOpen={isNotificationOpen}
                    onClose={() => setIsNotificationOpen(false)}
                  />
                )}
              </div>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-purple-600 text-white font-black text-sm flex items-center justify-center shadow-md focus:outline-none ring-2 ring-purple-100"
                >
                  {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
                </button>

                {isProfileOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                    <div className="absolute right-0 mt-2 w-52 bg-white border border-purple-100 rounded-2xl shadow-xl py-2 z-50 animate-scale-in">
                      <div className="px-4 py-2 border-b border-purple-50">
                        <p className="text-sm font-bold text-gray-900 truncate">{userProfile?.name || 'User'}</p>
                        <p className="text-xs text-purple-600 font-semibold capitalize">{role} Portal</p>
                      </div>
                      <Link
                        to={role === 'worker' ? '/profile' : '/employer'}
                        onClick={() => setIsProfileOpen(false)}
                        className="w-full text-left px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-purple-50 flex items-center gap-2"
                      >
                        <User className="w-4 h-4 text-purple-600" /> View Profile
                      </Link>
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          signOut();
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-purple-50"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <Link to="/login" className="btn-purple text-xs">
              Log In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
