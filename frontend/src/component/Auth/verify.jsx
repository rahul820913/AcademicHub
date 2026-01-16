import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, ArrowLeft, RefreshCw, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // 1. Import Auth Hook

const VerifyPage = () => {
  const navigate = useNavigate();
  const { verifyOtp } = useAuth(); // 2. Get verify function
  
  const [otp, setOtp] = useState(['', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  
  const inputRefs = useRef([]);

  // Get the email from local storage for display purposes
  useEffect(() => {
    const pendingEmail = localStorage.getItem('pending_email');
    if (pendingEmail) {
      setEmail(pendingEmail);
    } else {
      // If no email is pending, they shouldn't be here, redirect to register
      navigate('/register');
    }
  }, [navigate]);

  // Handle Input Change
  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 4) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Handle Backspace
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 5) return;

    setError('');
    setLoading(true);

    try {
      // 3. Call backend verification
      await verifyOtp(code);
      
      // On success, redirect to Dashboard
      navigate('/'); 
    } catch (err) {
      setError(err.message || 'Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-xl shadow-slate-200 border border-slate-100 text-center">
        
        {/* Icon Header */}
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldCheck className="w-8 h-8 text-blue-600" />
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-2">Check your email</h1>
        <p className="text-slate-500 text-sm mb-6">
          We sent a verification code to <br />
          <span className="font-semibold text-slate-700">{email}</span>
        </p>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm mb-6">
            {error}
          </div>
        )}

        {/* OTP Inputs */}
        <div className="flex justify-center gap-3 mb-8">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              disabled={loading}
              className="w-12 h-14 border-2 border-slate-200 rounded-xl text-center text-2xl font-bold text-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all disabled:opacity-50"
            />
          ))}
        </div>

        {/* Verify Button */}
        <button 
          onClick={handleVerify}
          disabled={otp.some(d => !d) || loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-all shadow-sm shadow-blue-200 mb-6 flex items-center justify-center gap-2"
        >
          {loading ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Verifying...</>
          ) : (
            "Verify Email"
          )}
        </button>

        <div className="flex items-center justify-center gap-2 text-sm">
          <span className="text-slate-500">Didn't receive the email?</span>
          <button 
            onClick={() => alert("Resend feature coming soon!")} // You can hook this to register API again if needed
            className="text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-1"
          >
            Click to resend <RefreshCw className="w-3 h-3" />
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100">
          <button onClick={() => navigate('/login')} className="flex items-center justify-center gap-2 text-slate-500 hover:text-slate-800 transition-colors text-sm font-medium mx-auto">
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </button>
        </div>

      </div>
    </div>
  );
};

export default VerifyPage;