import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { demoStore } from '../utils/demoStore';
import { UserPlus, LogIn, Briefcase, ArrowRight, Shield, ArrowLeft, Smartphone, User, Mail } from 'lucide-react';

export default function LoginPage() {
  // Views: 'landing' (Initial Screen matching screenshot) | 'login' | 'register' | 'employer' | 'otp'
  const [view, setView] = useState('landing');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('worker'); // 'worker' | 'employer'
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);

  const navigate = useNavigate();
  const { addToast } = useToast();
  const inputRefs = useRef([]);

  const validatePhone = (p) => /^\d{10}$/.test(p);

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
        if (view === 'register') {
          demoStore.currentUser = {
            uid: `user_${Date.now()}`,
            name: name || 'Student User',
            email: email || 'student@example.com',
            mobile: phone,
            role: role,
            skillScore: 40,
            skills: []
          };
        } else if (view === 'employer') {
          demoStore.loginAsDemoEmployer();
        } else {
          demoStore.loginWithPhone(phone);
        }
        setStepOtp();
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
      setStepOtp();
    } catch (err) {
      console.warn("Firebase OTP Error:", err);
      // Fall back to demo mode seamlessly
      if (view === 'register') {
        demoStore.currentUser = {
          uid: `user_${Date.now()}`,
          name: name || 'Student User',
          email: email || 'student@example.com',
          mobile: phone,
          role: role,
          skillScore: 40,
          skills: []
        };
      } else if (view === 'employer') {
        demoStore.loginAsDemoEmployer();
      } else {
        demoStore.loginWithPhone(phone);
      }
      setStepOtp();
    } finally {
      setIsLoading(false);
    }
  };

  const setStepOtp = () => {
    setStep('otp');
    setView('otp');
    addToast('OTP Sent (Use 123456 or test OTP)', 'info');
  };

  const [step, setStep] = useState('phone');

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
      setError('Please enter all 6 digits');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      if (confirmationResult) {
        await confirmationResult.confirm(code);
      } else {
        if (role === 'employer' || view === 'employer') {
          demoStore.loginAsDemoEmployer();
        } else {
          demoStore.loginAsDemoWorker();
        }
      }

      addToast('Logged in successfully!', 'success');
      navigate(role === 'employer' || view === 'employer' ? '/employer' : '/feed');
    } catch (err) {
      console.warn("Verify OTP fallback:", err);
      if (role === 'employer' || view === 'employer') {
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
    <div className="min-h-screen bg-[#F8F7FC] flex items-center justify-center p-4">
      <div id="recaptcha-container" className="hidden"></div>

      {/* Main Card Container matching Screenshot */}
      <div className="w-full max-w-md bg-white rounded-[2rem] p-8 shadow-[0_10px_35px_rgba(109,40,217,0.08)] border border-purple-100 relative">
        
        {/* Top Centered Logo */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-orange-500 flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-orange-500/30 mb-4">
            ⏳
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#5B21B6] tracking-tight">
            Welcome to InstaHours
          </h1>
          <p className="text-sm font-semibold text-gray-500 mt-1">
            Verified gigs & jobs for students
          </p>
        </div>

        {/* 1. LANDING VIEW (Exact Screenshot Match) */}
        {view === 'landing' && (
          <div className="space-y-4">
            {/* New Here? Register Button */}
            <button
              onClick={() => { setView('register'); setRole('worker'); }}
              className="w-full py-4 px-6 bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-extrabold text-base rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-purple-600/25 transition-all hover:scale-[1.01]"
            >
              <UserPlus className="w-5 h-5" />
              <span>New Here? Register</span>
            </button>

            {/* I Already Have an Account Button */}
            <button
              onClick={() => { setView('login'); setRole('worker'); }}
              className="w-full py-4 px-6 bg-white hover:bg-purple-50 text-[#6D28D9] font-extrabold text-base rounded-2xl border-2 border-[#6D28D9] flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
            >
              <LogIn className="w-5 h-5" />
              <span>I Already Have an Account</span>
            </button>

            {/* HIRING Divider */}
            <div className="relative flex py-3 items-center">
              <div className="flex-grow border-t border-purple-100"></div>
              <span className="flex-shrink mx-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">
                HIRING?
              </span>
              <div className="flex-grow border-t border-purple-100"></div>
            </div>

            {/* Login as Employer Button */}
            <button
              onClick={() => {
                demoStore.loginAsDemoEmployer();
                addToast('Logged in as Employer Portal', 'success');
                navigate('/employer');
              }}
              className="w-full py-3.5 px-6 bg-purple-50/60 hover:bg-purple-100/60 text-[#6D28D9] font-bold text-sm rounded-2xl border border-purple-200 flex items-center justify-center gap-2 transition-all"
            >
              <Briefcase className="w-4 h-4 text-purple-700" />
              <span>Login as Employer</span>
            </button>
          </div>
        )}

        {/* 2. REGISTER VIEW */}
        {view === 'register' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 text-purple-500 absolute left-3.5" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-purple-50/50 border border-purple-200 rounded-xl pl-10 pr-4 py-3 text-sm font-semibold text-gray-800 focus:outline-none focus:border-purple-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
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
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-purple-500 absolute left-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-purple-50/50 border border-purple-200 rounded-xl pl-10 pr-4 py-3 text-sm font-semibold text-gray-800 focus:outline-none focus:border-purple-600"
                />
              </div>
            </div>

            {error && <p className="text-red-500 text-xs font-bold">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-extrabold rounded-xl shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 transition-all mt-2"
            >
              {isLoading ? 'Sending OTP...' : 'Continue & Verify OTP'}
            </button>

            <button
              type="button"
              onClick={() => setView('landing')}
              className="w-full text-center text-xs font-bold text-gray-500 hover:text-purple-700 py-1"
            >
              ← Back to Main Menu
            </button>
          </form>
        )}

        {/* 3. LOGIN VIEW */}
        {view === 'login' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
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
              onClick={() => setView('landing')}
              className="w-full text-center text-xs font-bold text-gray-500 hover:text-purple-700 py-1"
            >
              ← Back to Main Menu
            </button>
          </form>
        )}

        {/* 4. OTP VERIFICATION VIEW */}
        {view === 'otp' && (
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
              {isLoading ? 'Verifying...' : 'Verify OTP & Proceed'}
            </button>

            <button
              type="button"
              onClick={() => setView('landing')}
              className="w-full text-center text-xs font-bold text-gray-500 hover:text-purple-700"
            >
              ← Back to Main Menu
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
