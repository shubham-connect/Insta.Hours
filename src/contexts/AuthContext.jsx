import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../lib/firebase';
import { demoStore } from '../utils/demoStore';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Sync Function for Demo Mode user
    const syncDemoUser = () => {
      const current = demoStore.currentUser;
      if (current && current.role) {
        setUser({ uid: current.uid, phoneNumber: current.mobile });
        setUserProfile(current);
      } else if (current) {
        setUser({ uid: current.uid, phoneNumber: current.mobile });
        setUserProfile(null);
      }
    };

    // Always initialize demo user as initial fallback
    syncDemoUser();
    const unsubscribeDemo = demoStore.subscribe(syncDemoUser);

    if (!isFirebaseConfigured || !auth) {
      setLoading(false);
      return () => unsubscribeDemo();
    }

    // 2. Real Firebase Auth Listener
    let unsubscribeFirebase;
    try {
      unsubscribeFirebase = onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
          setUser(currentUser);
          try {
            const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
            if (userDoc.exists()) {
              setUserProfile(userDoc.data());
            } else {
              setUserProfile(null);
            }
          } catch (error) {
            console.warn("Error fetching user doc from Firestore:", error);
            // Fallback to demo profile if firestore doc fetch fails
            if (demoStore.currentUser) {
              setUserProfile(demoStore.currentUser);
            }
          }
        } else {
          // If no firebase user, fall back to demoStore user if active
          syncDemoUser();
        }
        setLoading(false);
      });
    } catch (error) {
      console.warn("Error setting up Firebase auth listener:", error);
      syncDemoUser();
      setLoading(false);
    }

    return () => {
      unsubscribeDemo();
      if (unsubscribeFirebase) unsubscribeFirebase();
    };
  }, []);

  const signOut = async () => {
    demoStore.signOut();
    if (isFirebaseConfigured && auth) {
      try {
        await firebaseSignOut(auth);
      } catch (error) {
        console.warn("Error signing out of Firebase:", error);
      }
    }
    setUser(null);
    setUserProfile(null);
  };

  const value = {
    user,
    userProfile,
    setUserProfile,
    loading,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
