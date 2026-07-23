import React, { useEffect, useState, useRef } from 'react';
import { BellOff, CheckCircle, Info, Clock, AlertCircle } from 'lucide-react';
import { collection, query, where, orderBy, limit, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { demoStore } from '../utils/demoStore';

const NotificationDropdown = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!user) return;

    if (!isFirebaseConfigured) {
      const loadDemoNotifs = () => {
        const notifs = demoStore.getNotifications(user.uid);
        setNotifications(notifs);
        setLoading(false);
      };

      loadDemoNotifs();
      const unsub = demoStore.subscribe(loadDemoNotifs);
      return () => unsub();
    }

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = [];
      snapshot.forEach((doc) => {
        notifs.push({ id: doc.id, ...doc.data() });
      });
      setNotifications(notifs);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching notifications:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const markAsRead = async (notif) => {
    if (notif.read) return;

    if (!isFirebaseConfigured) {
      demoStore.markNotificationRead(notif.id);
      return;
    }

    try {
      await updateDoc(doc(db, 'notifications', notif.id), {
        read: true
      });
    } catch (err) {
      console.error("Error marking as read", err);
    }
  };

  const getRelativeTime = (timestamp) => {
    if (!timestamp) return 'Recently';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 172800) return 'Yesterday';
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const getIcon = (type) => {
    switch (type) {
      case 'status_change': return <CheckCircle className="w-5 h-5 text-purple-400" />;
      case 'new_application': return <Info className="w-5 h-5 text-orange-400" />;
      case 'reminder': return <Clock className="w-5 h-5 text-blue-400" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={dropdownRef}
      className="absolute top-12 right-0 w-80 sm:w-96 bg-[#1a1025] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 backdrop-blur-2xl"
    >
      <div className="flex justify-between items-center px-4 py-3 border-b border-white/10 bg-white/5">
        <h3 className="font-semibold text-white">Notifications</h3>
      </div>
      
      <div className="max-h-96 overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="p-8 flex flex-col items-center justify-center text-gray-400">
            <BellOff className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">No notifications yet</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {notifications.map((notif) => (
              <div 
                key={notif.id}
                onClick={() => markAsRead(notif)}
                className={`flex gap-3 p-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition relative ${!notif.read ? 'bg-white/[0.02]' : ''}`}
              >
                {!notif.read && (
                  <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-orange-500 rounded-full" />
                )}
                <div className="flex-shrink-0 mt-0.5 ml-1">
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!notif.read ? 'text-white' : 'text-gray-300'}`}>
                    {notif.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {getRelativeTime(notif.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default NotificationDropdown;
