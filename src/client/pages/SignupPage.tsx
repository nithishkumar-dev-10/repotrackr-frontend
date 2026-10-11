import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, ArrowRight, Check, X } from 'lucide-react';
import { api } from '../../api/client';
import { SvgNetworkIllustration } from '../components/2d/SvgNetworkIllustration';

export const SignupPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  // Password rules validation
  const hasMinLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const isPasswordValid = hasMinLength && hasLetter && hasDigit;

  const strengthScore = [hasMinLength, hasLetter, hasDigit].filter(Boolean).length;

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isPasswordValid) {
      setError('Please fulfill all password requirements below.');
      return;
    }

    setLoading(true);
    const res = await api.signup(email, password);
    setLoading(false);

    if (res.ok) {
      setSuccess(true);
      if (res.data?.dev_token) {
        sessionStorage.setItem('last_dev_token', res.data.dev_token);
        sessionStorage.setItem('pending_verify_email', email);
      }
      setTimeout(() => {
        navigate('/verify-email');
      }, 600);
    } else {
      setError(res.error?.message || 'Failed to create account. Email may already be registered.');
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

          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-[#0B1020] tracking-tight">Create an account</h1>
            <p className="text-sm text-[#5B6478] mt-1.5">
              Start parsing Python repositories and understanding complex codebases.
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1, x: [0, -6, 6, -6, 6, 0] }}
              transition={{ duration: 0.4 }}
              className="mb-6 p-4 rounded-xl bg-[#FEF2F2] border border-[#FCA5A5] text-[#EF4444] text-xs flex items-center gap-2.5"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSignup} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-[#0B1020] mb-1.5">Work Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="developer@example.com"
                className="w-full px-4 py-3 rounded-xl border border-[#E4E7EF] bg-white focus:border-[#3B5BFF] focus:ring-4 focus:ring-[#3B5BFF]/10 focus:outline-none text-sm transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0B1020] mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  className="w-full px-4 py-3 rounded-xl border border-[#E4E7EF] bg-white focus:border-[#3B5BFF] focus:ring-4 focus:ring-[#3B5BFF]/10 focus:outline-none text-sm pr-11 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#5B6478] hover:text-[#0B1020] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Meter */}
              {password.length > 0 && (
                <div className="mt-3 p-3.5 rounded-xl bg-white border border-[#E4E7EF] space-y-2">
                  <div className="flex gap-1.5 h-1.5 w-full">
                    <div
                      className={`h-full flex-1 rounded-full transition-all ${
                        strengthScore >= 1 ? (strengthScore === 3 ? 'bg-[#10B981]' : 'bg-[#F59E0B]') : 'bg-[#E4E7EF]'
                      }`}
                    />
                    <div
                      className={`h-full flex-1 rounded-full transition-all ${
                        strengthScore >= 2 ? (strengthScore === 3 ? 'bg-[#10B981]' : 'bg-[#F59E0B]') : 'bg-[#E4E7EF]'
                      }`}
                    />
                    <div
                      className={`h-full flex-1 rounded-full transition-all ${
                        strengthScore === 3 ? 'bg-[#10B981]' : 'bg-[#E4E7EF]'
                      }`}
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-1 text-[11px] text-[#5B6478]">
                    <div className="flex items-center gap-1.5">
                      {hasMinLength ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <X className="w-3.5 h-3.5 text-[#94A3B8]" />}
                      <span>At least 8 characters</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {hasLetter ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <X className="w-3.5 h-3.5 text-[#94A3B8]" />}
                      <span>At least one letter (a-z)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {hasDigit ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <X className="w-3.5 h-3.5 text-[#94A3B8]" />}
                      <span>At least one number (0-9)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || success || !isPasswordValid}
              className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-[#0B1020] hover:bg-[#1E293B] shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : success ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                  <span>Account Created!</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[#E4E7EF] text-center text-xs text-[#5B6478]">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-[#3B5BFF] hover:underline">
              Log in
            </Link>
          </div>
        </div>
      </div>

      {/* Right Column: Soft Gradient Panel with 2D SVG Node Network */}
      <div className="hidden lg:block lg:w-1/2 p-6 h-screen sticky top-0">
        <SvgNetworkIllustration
          title="Deterministic AST Ingestion"
          subtitle="Real code symbols mapped to precise line numbers with zero guesswork."
        />
      </div>
    </div>
  );
};
