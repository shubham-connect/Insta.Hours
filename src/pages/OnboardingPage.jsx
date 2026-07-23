import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { demoStore } from '../utils/demoStore';
import { Sparkles, User, Mail, Briefcase, Building2, Rocket } from 'lucide-react';

export default function OnboardingPage() {
  const { user, setUserProfile } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    role: '' // 'worker' or 'employer'
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim() || formData.name.length < 2 || !/^[a-zA-Z\s]+$/.test(formData.name)) {
      newErrors.name = 'Please enter a valid name (letters only, min 2 chars)';
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.bio.trim()) {
      newErrors.bio = 'Please tell us a bit about yourself';
    }
    if (!formData.role) {
      newErrors.role = 'Please select a role';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const phoneNumber = user?.phoneNumber?.replace('+91', '') || '9876543210';
      
      const userData = {
        uid: user?.uid || 'user_' + Date.now(),
        name: formData.name,
        email: formData.email,
        bio: formData.bio,
        role: formData.role,
        mobile: phoneNumber,
        skillScore: formData.role === 'worker' ? 75 : 0,
        skills: formData.role === 'worker' ? [{ name: 'General Work', score: 75, verified: true }] : [],
        createdAt: new Date().toISOString()
      };

      if (!isFirebaseConfigured) {
        demoStore.createUserProfile(userData.uid, userData);
        setUserProfile(userData);
      } else {
        await setDoc(doc(db, 'users', user.uid), { ...userData, createdAt: serverTimestamp() });
        setUserProfile(userData);
      }

      addToast('Profile completed successfully!', 'success');
      
      if (formData.role === 'worker') {
        navigate('/feed');
      } else {
        navigate('/employer');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      addToast('Failed to save profile. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0B1A] flex items-center justify-center relative py-12 px-4 sm:px-6 lg:px-8 text-white">
      {/* Animated gradient blobs */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/30 blur-[120px] animate-pulse pointer-events-none"></div>
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-orange-600/20 blur-[120px] animate-pulse pointer-events-none" style={{ animationDelay: '2s' }}></div>

      <div className="glass-card max-w-lg w-full rounded-2xl p-8 relative z-10 bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-500 to-orange-500 rounded-xl mb-4">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Complete Your Profile</h1>
          <p className="text-gray-400 mt-2">Tell us about yourself to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300">I am here to:</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'worker' })}
                className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-3 transition-all ${
                  formData.role === 'worker' 
                    ? 'border-purple-500 bg-purple-500/10' 
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <Briefcase className={`w-8 h-8 ${formData.role === 'worker' ? 'text-purple-400' : 'text-gray-400'}`} />
                <span className="font-medium text-sm">Find Work</span>
              </button>
              
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'employer' })}
                className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-3 transition-all ${
                  formData.role === 'employer' 
                    ? 'border-purple-500 bg-purple-500/10' 
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <Building2 className={`w-8 h-8 ${formData.role === 'employer' ? 'text-purple-400' : 'text-gray-400'}`} />
                <span className="font-medium text-sm">Hire Talent</span>
              </button>
            </div>
            {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
          </div>

          <div className="space-y-4">
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="block w-full pl-10 pr-3 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                />
              </div>
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="block w-full pl-10 pr-3 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                />
              </div>
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <textarea
                placeholder="Tell employers about yourself..."
                rows="3"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="block w-full p-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors resize-none"
              ></textarea>
              {errors.bio && <p className="text-red-500 text-sm mt-1">{errors.bio}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium py-3 rounded-xl flex items-center justify-center transition-colors mt-8"
          >
            {isLoading ? 'Saving...' : (
              <>
                Get Started
                <Rocket className="w-5 h-5 ml-2" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
