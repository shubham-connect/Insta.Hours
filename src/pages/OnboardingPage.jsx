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
    role: 'worker' // default 'worker'
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
      addToast('Profile saved!', 'success');
      if (formData.role === 'worker') {
        navigate('/feed');
      } else {
        navigate('/employer');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7FC] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 text-gray-900">
      <div className="max-w-md w-full bg-white rounded-[2rem] p-8 shadow-[0_15px_45px_rgba(109,40,217,0.1)] border border-purple-100">
        
        {/* Logo & Heading */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-orange-500 rounded-2xl mb-3 shadow-lg shadow-orange-500/30 text-white text-3xl font-black">
            ⏳
          </div>
          <h1 className="text-2xl font-black text-[#5B21B6]">Complete Your Profile</h1>
          <p className="text-xs font-semibold text-gray-500 mt-1">Tell us about yourself to get started on InstaHours</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Role Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">I am here to:</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'worker' })}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                  formData.role === 'worker' 
                    ? 'border-purple-600 bg-purple-50 text-purple-900 shadow-sm' 
                    : 'border-purple-100 bg-purple-50/30 text-gray-600 hover:bg-purple-50'
                }`}
              >
                <Briefcase className={`w-6 h-6 ${formData.role === 'worker' ? 'text-purple-600' : 'text-gray-400'}`} />
                <span className="font-extrabold text-xs">Find Work</span>
              </button>
              
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'employer' })}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                  formData.role === 'employer' 
                    ? 'border-orange-500 bg-orange-50 text-orange-900 shadow-sm' 
                    : 'border-purple-100 bg-purple-50/30 text-gray-600 hover:bg-purple-50'
                }`}
              >
                <Building2 className={`w-6 h-6 ${formData.role === 'employer' ? 'text-orange-500' : 'text-gray-400'}`} />
                <span className="font-extrabold text-xs">Hire Talent</span>
              </button>
            </div>
            {errors.role && <p className="text-red-500 text-xs font-bold">{errors.role}</p>}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Full Name</label>
              <div className="relative">
                <User className="h-4 w-4 text-purple-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-purple-50/50 border border-purple-200 rounded-xl pl-10 pr-4 py-3 text-sm font-semibold text-gray-800 focus:outline-none focus:border-purple-600"
                />
              </div>
              {errors.name && <p className="text-red-500 text-xs font-bold mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Email Address</label>
              <div className="relative">
                <Mail className="h-4 w-4 text-purple-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-purple-50/50 border border-purple-200 rounded-xl pl-10 pr-4 py-3 text-sm font-semibold text-gray-800 focus:outline-none focus:border-purple-600"
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs font-bold mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Bio / About</label>
              <textarea
                placeholder="Tell employers or candidates about yourself..."
                rows="3"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full p-3 bg-purple-50/50 border border-purple-200 rounded-xl text-sm font-semibold text-gray-800 focus:outline-none focus:border-purple-600 resize-none"
              ></textarea>
              {errors.bio && <p className="text-red-500 text-xs font-bold mt-1">{errors.bio}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-extrabold py-3.5 rounded-xl shadow-lg shadow-purple-600/20 flex items-center justify-center transition-all mt-4"
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
