import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Mail, CheckCircle2, AlertCircle, Loader2, RefreshCw, ArrowRight } from 'lucide-react';
import { api } from '../../api/client';
import { SvgNetworkIllustration } from '../components/2d/SvgNetworkIllustration';

export const VerifyEmailPage: React.FC = () => {
  const [tokenInput, setTokenInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [resendNotice, setResendNotice] = useState<string | null>(null);

  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  // Check if there was an auto-provided dev token in session
  useEffect(() => {
    const devToken = sessionStorage.getItem('last_dev_token');
    if (devToken) {
      setTokenInput(devToken);
    }
  }, []);

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setResendNotice(null);

    const tokenToSubmit = tokenInput.trim();
    if (!tokenToSubmit) {
      setError('Please enter or paste your verification token.');
      return;
    }

    setLoading(true);
    const res = await api.verifyEmail(tokenToSubmit);
    setLoading(false);

    if (res.ok) {
      setSuccess(true);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#3B5BFF', '#7C93FF', '#34D399', '#38BDF8'],
      });
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } else {
      setError(res.error?.message || 'Invalid or expired verification token.');
    }
  };

  const handleResend = async () => {
    const email = sessionStorage.getItem('pending_verify_email') || prompt('Enter your registered email address:');
    if (!email) return;

    setResending(true);
    setError(null);
    const res = await api.resendVerification(email);
    setResending(false);

    if (res.ok) {
      setResendNotice('If an unverified account exists, a new token has been generated.');
      if (res.data?.dev_token) {
        setTokenInput(res.data.dev_token);
      }
    } else {
      setError(res.error?.message || 'Failed to resend verification.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F7FB] flex flex-col lg:flex-row">
      {/* Left Column: Clean Light Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 z-10">
        <div className="w-full max-w-md">
          {/* Brand */}
          <Link to="/" className="inline-flex items-center gap-2 mb-8 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#3B5BFF] to-[#7C93FF] flex items-center justify-center text-white font-bold text-sm shadow-md">
              RT
            </div>
            <span className="font-extrabold text-lg text-[#0B1020]">RepoTrackr AI</span>
          </Link>

          <div className="bg-white rounded-3xl shadow-xl border border-[#E4E7EF] p-8 text-center relative overflow-hidden">
            {/* Glow Top Accent */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#3B5BFF] via-[#7C93FF] to-[#34D399]" />

            <div className="w-14 h-14 rounded-2xl bg-[#E8ECFF] text-[#3B5BFF] flex items-center justify-center mx-auto mb-5 shadow-sm">
              <Mail className="w-7 h-7" />
            </div>

            <h1 className="text-2xl font-extrabold text-[#0B1020]">Verify your email</h1>
            <p className="text-xs text-[#5B6478] mt-2 leading-relaxed">
              Paste the verification token sent to your email to activate your account.
            </p>

            {error && (
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mt-4 p-3.5 rounded-xl bg-[#FEF2F2] border border-[#FCA5A5] text-[#EF4444] text-xs flex items-center justify-center gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {resendNotice && (
              <div className="mt-4 p-3.5 rounded-xl bg-[#F0FDF4] border border-[#86EFAC] text-[#16A34A] text-xs">
                {resendNotice}
              </div>
            )}

            {success ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="my-8 py-6"
              >
                <CheckCircle2 className="w-16 h-16 text-[#10B981] mx-auto mb-3 animate-bounce" />
                <h3 className="text-lg font-bold text-[#0B1020]">Email verified successfully!</h3>
                <p className="text-xs text-[#5B6478] mt-1">Redirecting to login...</p>
              </motion.div>
            ) : (
              <form onSubmit={handleVerify} className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-left text-[#0B1020] mb-1.5">
                    Verification Token
                  </label>
                  <input
                    ref={inputRef}
                    type="text"
                    autoFocus
                    required
                    value={tokenInput}
                    onChange={e => setTokenInput(e.target.value)}
                    placeholder="Paste verification token"
                    className="w-full px-4 py-3 rounded-xl border border-[#E4E7EF] bg-[#F6F7FB] focus:bg-white focus:border-[#3B5BFF] focus:outline-none text-xs font-mono text-[#0B1020] text-center"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !tokenInput.trim()}
                  className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-[#0B1020] hover:bg-[#1E293B] shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify Email</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="pt-3 flex items-center justify-between text-xs text-[#5B6478]">
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resending}
                    className="flex items-center gap-1.5 text-[#3B5BFF] hover:underline font-semibold cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                    <span>Resend token</span>
                  </button>
                  <Link to="/login" className="hover:text-[#0B1020]">
                    Back to login
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Soft Gradient Panel with 2D SVG Illustration */}
      <div className="hidden lg:block lg:w-1/2 p-6 sm:p-12">
        <SvgNetworkIllustration
          title="Account Verification"
          subtitle="Tokens expire in 24 hours. Once verified, you can analyze codebases and explore the Repo Galaxy."
        />
      </div>
    </div>
  );
};
