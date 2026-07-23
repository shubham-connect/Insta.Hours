import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { demoStore } from '../utils/demoStore';
import { Zap, ArrowRight, Shield, ArrowLeft, User, Building2 } from 'lucide-react';

export default function LoginPage() {
  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  
  const navigate = useNavigate();
  const { addToast } = useToast();
  const inputRefs = useRef([]);

  const validatePhone = (p) => {
    return /^\d{10}$/.test(p);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!validatePhone(phone)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    setIsLoading(true);

    if (!isFirebaseConfigured) {
      // Demo mode OTP simulation
      setTimeout(() => {
        setIsLoading(false);
        setStep('otp');
        addToast('Demo OTP sent (use 123456)', 'info');
      }, 500);
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
      setStep('otp');
      addToast('OTP sent successfully', 'success');
    } catch (err) {
      console.error(err);
      setError('Failed to send OTP. Falling back to Demo login...');
      // Allow demo fallback if firebase fails
      setStep('otp');
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
      setError('Please enter all 6 digits');
      return;
    }

    setError('');
    setIsLoading(true);

    if (!isFirebaseConfigured || !confirmationResult) {
      // Demo Mode verify
      setTimeout(() => {
        setIsLoading(false);
        demoStore.loginWithPhone(phone);
        addToast('Logged in (Demo Mode)', 'success');
      }, 400);
      return;
    }

    try {
      await confirmationResult.confirm(code);
      addToast('Logged in successfully', 'success');
    } catch (err) {
      console.error(err);
      setError('Invalid OTP. (For Demo Mode, any 6 digits works)');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoWorker = () => {
    demoStore.loginAsDemoWorker();
    addToast('Logged in as Worker (Rahul Sharma)', 'success');
    navigate('/feed');
  };

  const handleQuickDemoEmployer = () => {
    demoStore.loginAsDemoEmployer();
    addToast('Logged in as Employer (TechCorp)', 'success');
    navigate('/employer');
  };

  return (
    <div className="min-h-screen bg-[#0F0B1A] flex items-center justify-center relative overflow-hidden text-white p-4">
      {/* Animated gradient blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/30 blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-orange-600/20 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      
      <div id="recaptcha-container" className="hidden"></div>

      <div className="glass-card max-w-md w-full rounded-2xl p-8 relative z-10 bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-orange-500 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-purple-500/20">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-center">Welcome to InstaHours</h1>
          <p className="text-gray-400 text-sm mt-2 text-center">
            {step === 'phone' ? 'Enter your phone number to continue' : `Enter the 6-digit code sent to +91 ${phone}`}
          </p>
        </div>

        {step === 'phone' ? (
          <div className="space-y-6">
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Phone Number
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-4 bg-white/10 border border-r-0 border-white/20 rounded-l-xl text-gray-300 font-medium">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-white/5 border border-white/20 rounded-r-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                    placeholder="10-digit mobile number"
                    maxLength={10}
                  />
                </div>
                {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading || phone.length !== 10}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl flex items-center justify-center transition-colors shadow-lg shadow-purple-600/20"
              >
                {isLoading ? 'Sending OTP...' : (
                  <>
                    Send OTP
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </button>
            </form>

            {/* Demo Quick Access Section */}
            <div className="pt-6 border-t border-white/10 space-y-3">
              <p className="text-xs text-center text-gray-400 font-medium uppercase tracking-wider">
                ⚡ Quick Demo Experience
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleQuickDemoWorker}
                  className="flex flex-col items-center justify-center p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-purple-500/20 hover:border-purple-500/50 transition-all text-xs font-medium text-purple-300"
                >
                  <User className="w-5 h-5 mb-1 text-purple-400" />
                  Demo Worker
                </button>
                <button
                  type="button"
                  onClick={handleQuickDemoEmployer}
                  className="flex flex-col items-center justify-center p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-orange-500/20 hover:border-orange-500/50 transition-all text-xs font-medium text-orange-300"
                >
                  <Building2 className="w-5 h-5 mb-1 text-orange-400" />
                  Demo Employer
                </button>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
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
                  className="w-12 h-14 text-center text-xl bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
                />
              ))}
            </div>
            {error && <p className="text-red-400 text-xs text-center">{error}</p>}

            <button
              type="submit"
              disabled={isLoading || otp.join('').length !== 6}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl flex items-center justify-center transition-colors"
            >
              {isLoading ? 'Verifying...' : (
                <>
                  Verify & Enter
                  <Shield className="w-5 h-5 ml-2" />
                </>
              )}
            </button>

            <div className="flex flex-col items-center gap-4 mt-6 text-sm">
              <button
                type="button"
                onClick={() => setStep('phone')}
                className="flex items-center text-gray-400 hover:text-white transition-colors text-xs"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Phone
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
