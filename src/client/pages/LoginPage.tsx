import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../context/AuthContext';
import { SvgNetworkIllustration } from '../components/2d/SvgNetworkIllustration';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }

    setLoading(true);
    const res = await api.login(email, password);
    setLoading(false);

    if (res.ok && res.data?.access_token) {
      setSuccess(true);
      await login(res.data.access_token, res.data.refresh_token);
      setTimeout(() => {
        navigate('/dashboard');
      }, 600);
    } else {
      if (res.status === 403) {
        setError('Email not verified. Please verify your email before logging in.');
      } else {
        setError(res.error?.message || 'Invalid email or password.');
      }
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
            <h1 className="text-3xl font-extrabold text-[#0B1020] tracking-tight">Welcome back</h1>
            <p className="text-sm text-[#5B6478] mt-1.5">
              Enter your credentials to access your tracked code repositories.
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

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-[#0B1020] mb-1.5">Email address</label>
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
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-[#0B1020]">Password</label>
                <Link to="/verify-email" className="text-xs text-[#3B5BFF] hover:underline font-medium">
                  Verify token?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
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
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-[#0B1020] hover:bg-[#1E293B] shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : success ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                  <span>Success! Redirecting...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[#E4E7EF] text-center text-xs text-[#5B6478]">
            Don't have an account yet?{' '}
            <Link to="/signup" className="font-bold text-[#3B5BFF] hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>

      {/* Right Column: Soft Gradient Panel with 2D SVG Node Network */}
      <div className="hidden lg:block lg:w-1/2 p-6 h-screen sticky top-0">
        <SvgNetworkIllustration
          title="Explore python call graphs"
          subtitle="Every node is a verified function or class. Every edge is a real AST import."
        />
      </div>
    </div>
  );
};
