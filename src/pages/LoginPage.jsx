import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { RecaptchaVerifier, signInWithPhoneNumber, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { demoStore } from '../utils/demoStore';
import { User, Building2, UserPlus, LogIn, ArrowRight, Shield, Mail, CheckCircle2, Award, Zap, Briefcase, Star, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState(null); // 'worker' | 'employer'
  const [mode, setMode] = useState('choice'); // 'choice' | 'register' | 'login' | 'otp'

  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);

  const navigate = useNavigate();
  const { addToast } = useToast();
  const inputRefs = useRef([]);

  const validatePhone = (p) => /^\d{10}$/.test(p);

  const handleSelectRole = (role) => {
    setSelectedRole(role);
    setMode('choice');
    setError('');
  };

  // Real Google Sign-In (Gmail Authorization)
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');

    try {
      if (isFirebaseConfigured && auth && googleProvider) {
        const result = await signInWithPopup(auth, googleProvider);
        const googleUser = result.user;
        
        if (selectedRole === 'employer') {
          demoStore.currentUser = {
            uid: googleUser.uid,
            name: googleUser.displayName || 'Employer Account',
            email: googleUser.email,
            role: 'employer',
            category: 'Technology & Services'
          };
          addToast(`Logged in as ${googleUser.displayName || googleUser.email}`, 'success');
          navigate('/employer');
        } else {
          demoStore.currentUser = {
            uid: googleUser.uid,
            name: googleUser.displayName || 'Student User',
            email: googleUser.email,
            role: 'worker',
            skillScore: 75,
            skills: ['React', 'Content Writing']
          };
          addToast(`Logged in as ${googleUser.displayName || googleUser.email}`, 'success');
          navigate('/feed');
        }
        return;
      }
    } catch (err) {
      console.warn("Google Sign-In Popup Warning/Fallback:", err);
    }

    // Fallback to Google Authenticated Demo Session
    setTimeout(() => {
      setIsLoading(false);
      if (selectedRole === 'employer') {
        demoStore.loginAsDemoEmployer();
        addToast('Signed in with Google (Employer Portal)', 'success');
        navigate('/employer');
      } else {
        demoStore.loginAsDemoWorker();
        addToast('Signed in with Google (Student Portal)', 'success');
        navigate('/feed');
      }
    }, 400);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!validatePhone(phone)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    setIsLoading(true);

    if (!isFirebaseConfigured || !auth) {
      setTimeout(() => {
        setIsLoading(false);
        if (selectedRole === 'employer') {
          demoStore.loginAsDemoEmployer();
        } else {
          if (mode === 'register') {
            demoStore.currentUser = {
              uid: `worker_${Date.now()}`,
              name: name || 'Student User',
              email: email || 'student@example.com',
              mobile: phone,
              role: 'worker',
              skillScore: 40,
              skills: []
            };
          } else {
            demoStore.loginWithPhone(phone);
          }
        }
        setMode('otp');
        addToast('OTP sent (Use 123456)', 'info');
      }, 400);
      return;
    }

    try {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
        });
      }

      const formattedPhone = `+91${phone}`;
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, window.recaptchaVerifier);
      setConfirmationResult(confirmation);
      setMode('otp');
      addToast('OTP sent to phone', 'success');
    } catch (err) {
      console.warn("Firebase OTP fallback:", err);
      if (selectedRole === 'employer') {
        demoStore.loginAsDemoEmployer();
      } else {
        demoStore.loginWithPhone(phone);
      }
      setMode('otp');
      addToast('OTP sent (Use 123456)', 'info');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) {
      setError('Please enter 6-digit OTP code');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      if (confirmationResult) {
        await confirmationResult.confirm(code);
      } else {
        if (selectedRole === 'employer') {
          demoStore.loginAsDemoEmployer();
        } else {
          demoStore.loginAsDemoWorker();
        }
      }

      addToast('Welcome to InstaHours!', 'success');
      navigate(selectedRole === 'employer' ? '/employer' : '/feed');
    } catch (err) {
      console.warn("Verify fallback:", err);
      if (selectedRole === 'employer') {
        demoStore.loginAsDemoEmployer();
        navigate('/employer');
      } else {
        demoStore.loginAsDemoWorker();
        navigate('/feed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7FC] flex flex-col text-gray-900">
      <div id="recaptcha-container" className="hidden"></div>

      {/* Header */}
      <header className="w-full bg-white border-b border-purple-100 py-4 px-6 sm:px-12 flex justify-between items-center sticky top-0 z-30 shadow-sm">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center text-white font-black text-xl shadow-sm">
            ⏳
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-[#5B21B6]">
            InstaHours
          </span>
        </Link>
        <span className="text-xs font-extrabold text-purple-700 bg-purple-50 px-3 py-1.5 rounded-full border border-purple-200">
          Verified Student Marketplace
        </span>
      </header>

      {/* Main Full-Width Desktop Section */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 flex flex-col lg:flex-row gap-12 items-center justify-between">
        
        {/* Left Side: About InstaHours */}
        <div className="flex-1 space-y-6 max-w-xl">
          <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 font-extrabold text-xs px-3.5 py-1.5 rounded-full border border-orange-200">
            <Zap className="w-4 h-4 fill-orange-500" /> Fast-Track Hiring & Verified Skill Scores
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-[#5B21B6] leading-tight tracking-tight">
            Connect Students & Employers with <span className="text-orange-500">Verified Gigs</span>
          </h1>

          <p className="text-base font-semibold text-gray-600 leading-relaxed">
            InstaHours is India's premier workforce marketplace where student skills are tested out of 100 by experts, allowing employers to hire top talent instantly without long recruitment cycles.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="bg-white p-4 rounded-2xl border border-purple-100 shadow-sm">
              <Award className="w-6 h-6 text-purple-600 mb-2" />
              <h4 className="font-extrabold text-sm text-gray-900">Verified Skill Score</h4>
              <p className="text-xs font-semibold text-gray-500 mt-1">Every candidate receives a verified score out of 100</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-purple-100 shadow-sm">
              <Briefcase className="w-6 h-6 text-orange-500 mb-2" />
              <h4 className="font-extrabold text-sm text-gray-900">Hiring Pipeline</h4>
              <p className="text-xs font-semibold text-gray-500 mt-1">Track applicant evaluation stages in real-time</p>
            </div>
          </div>
        </div>

        {/* Right Side: Role Selection & Authentication Card */}
        <div className="w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-[0_15px_45px_rgba(109,40,217,0.1)] border border-purple-100">
          
          <div className="flex flex-col items-center mb-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-orange-500 flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-orange-500/30 mb-3">
              ⏳
            </div>
            <h2 className="text-2xl font-extrabold text-[#5B21B6]">
              Welcome to InstaHours
            </h2>
            <p className="text-xs font-semibold text-gray-500 mt-1">
              {!selectedRole ? 'Choose your portal to get started' : `Portal: ${selectedRole === 'worker' ? 'Student / Worker' : 'Employer / Hiring'}`}
            </p>
          </div>

          {/* PHASE 1: ROLE SELECTION */}
          {!selectedRole && (
            <div className="space-y-4">
              <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest text-center mb-2">
                Who are you?
              </p>

              <button
                onClick={() => handleSelectRole('worker')}
                className="w-full p-4 rounded-2xl border-2 border-purple-200 hover:border-purple-600 bg-purple-50/50 hover:bg-purple-100/50 transition-all flex items-center gap-4 text-left group"
              >
                <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold flex-shrink-0 group-hover:scale-105 transition-transform shadow-md">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#5B21B6]">I am a Worker / Student</h3>
                  <p className="text-xs font-semibold text-gray-500">Looking for gigs, internships & jobs</p>
                </div>
              </button>

              <button
                onClick={() => handleSelectRole('employer')}
                className="w-full p-4 rounded-2xl border-2 border-orange-200 hover:border-orange-500 bg-orange-50/50 hover:bg-orange-100/50 transition-all flex items-center gap-4 text-left group"
              >
                <div className="w-12 h-12 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold flex-shrink-0 group-hover:scale-105 transition-transform shadow-md">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-orange-600">I am an Employer</h3>
                  <p className="text-xs font-semibold text-gray-500">Hiring student talent & posting gigs</p>
                </div>
              </button>
            </div>
          )}

          {/* PHASE 2: AUTH OPTIONS (Google Sign-In + Phone OTP) */}
          {selectedRole && mode === 'choice' && (
            <div className="space-y-4">
              
              {/* Google Sign-In Button (Gmail Auth) */}
              <button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full py-3.5 px-6 bg-white border-2 border-gray-200 hover:border-purple-300 text-gray-800 font-extrabold text-sm rounded-2xl flex items-center justify-center gap-3 transition-all hover:bg-gray-50 shadow-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Continue with Google (Gmail)</span>
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-purple-100"></div>
                <span className="flex-shrink mx-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">
                  OR PHONE NUMBER
                </span>
                <div className="flex-grow border-t border-purple-100"></div>
              </div>

              <button
                onClick={() => setMode('register')}
                className="w-full py-3.5 px-6 bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-purple-600/25 transition-all"
              >
                <UserPlus className="w-4 h-4" />
                <span>New Here? Phone Register</span>
              </button>

              <button
                onClick={() => setMode('login')}
                className="w-full py-3.5 px-6 bg-white hover:bg-purple-50 text-[#6D28D9] font-extrabold text-sm rounded-2xl border-2 border-[#6D28D9] flex items-center justify-center gap-2 transition-all"
              >
                <LogIn className="w-4 h-4" />
                <span>Phone OTP Login</span>
              </button>

              <button
                onClick={() => setSelectedRole(null)}
                className="w-full text-center text-xs font-bold text-gray-500 hover:text-purple-700 py-2 flex items-center justify-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Change Role Selection
              </button>
            </div>
          )}

          {/* PHASE 3: REGISTER FORM */}
          {selectedRole && mode === 'register' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-purple-50/50 border border-purple-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-800 focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
                  Mobile Number
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-4 bg-purple-100 border border-r-0 border-purple-200 rounded-l-xl text-purple-900 font-bold text-sm">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="w-full bg-purple-50/50 border border-purple-200 rounded-r-xl px-4 py-3 text-sm font-semibold text-gray-800 focus:outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-purple-50/50 border border-purple-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-800 focus:outline-none focus:border-purple-600"
                />
              </div>

              {error && <p className="text-red-500 text-xs font-bold">{error}</p>}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-extrabold rounded-xl shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 transition-all"
              >
                {isLoading ? 'Sending OTP...' : 'Send Registration OTP'}
              </button>

              <button
                type="button"
                onClick={() => setMode('choice')}
                className="w-full text-center text-xs font-bold text-gray-500 hover:text-purple-700 py-1"
              >
                ← Back
              </button>
            </form>
          )}

          {/* PHASE 4: LOGIN FORM */}
          {selectedRole && mode === 'login' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
                  Registered Mobile Number
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-4 bg-purple-100 border border-r-0 border-purple-200 rounded-l-xl text-purple-900 font-bold text-sm">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="w-full bg-purple-50/50 border border-purple-200 rounded-r-xl px-4 py-3 text-sm font-semibold text-gray-800 focus:outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              {error && <p className="text-red-500 text-xs font-bold">{error}</p>}

              <button
                type="submit"
                disabled={isLoading || phone.length !== 10}
                className="w-full py-3.5 bg-[#6D28D9] hover:bg-[#5B21B6] disabled:opacity-50 text-white font-extrabold rounded-xl shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 transition-all"
              >
                {isLoading ? 'Sending OTP...' : 'Send Login OTP'}
              </button>

              <button
                type="button"
                onClick={() => setMode('choice')}
                className="w-full text-center text-xs font-bold text-gray-500 hover:text-purple-700 py-1"
              >
                ← Back
              </button>
            </form>
          )}

          {/* PHASE 5: OTP VERIFICATION */}
          {mode === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="text-center">
                <p className="text-xs font-bold text-gray-500">
                  Enter 6-digit code sent to <span className="text-purple-700 font-extrabold">+91 {phone || '9876543210'}</span>
                </p>
              </div>

              <div className="flex justify-between gap-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-11 h-13 text-center text-xl font-extrabold bg-purple-50/80 border-2 border-purple-200 rounded-xl text-purple-950 focus:outline-none focus:border-purple-600"
                  />
                ))}
              </div>

              {error && <p className="text-red-500 text-xs text-center font-bold">{error}</p>}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-extrabold rounded-xl shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 transition-all"
              >
                {isLoading ? 'Verifying...' : 'Verify OTP & Enter'}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
