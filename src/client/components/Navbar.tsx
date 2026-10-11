import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Terminal, LayoutDashboard, LogOut, ChevronDown, User, ShieldCheck } from 'lucide-react';

export const Navbar: React.FC<{ onOpenCommandBar?: () => void }> = ({ onOpenCommandBar }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-[#E4E7EF] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#3B5BFF] to-[#7C93FF] flex items-center justify-center text-white font-extrabold shadow-md shadow-[#3B5BFF]/20 group-hover:scale-105 transition-transform">
              RT
            </div>
            <div>
              <span className="font-extrabold text-lg text-[#0B1020] tracking-tight">RepoTrackr</span>
              <span className="text-xs font-bold text-[#3B5BFF] ml-1 px-1.5 py-0.5 rounded-md bg-[#E8ECFF]">AI</span>
            </div>
          </Link>

          {/* Navigation Links */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center gap-2">
              <Link
                to="/dashboard"
                className={`relative px-3.5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors ${
                  isActive('/dashboard') ? 'text-[#3B5BFF]' : 'text-[#5B6478] hover:text-[#0B1020]'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
                {isActive('/dashboard') && (
                  <motion.div
                    layoutId="navbar-underline"
                    className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#3B5BFF] rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
              <Link
                to="/developer"
                className={`relative px-3.5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors ${
                  isActive('/developer') ? 'text-[#3B5BFF]' : 'text-[#5B6478] hover:text-[#0B1020]'
                }`}
              >
                <Terminal className="w-4 h-4" />
                <span>Developer</span>
                {isActive('/developer') && (
                  <motion.div
                    layoutId="navbar-underline"
                    className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#3B5BFF] rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            </nav>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {onOpenCommandBar && (
            <button
              onClick={onOpenCommandBar}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#E4E7EF] bg-[#F6F7FB] text-xs text-[#5B6478] hover:border-[#3B5BFF]/40 hover:text-[#0B1020] transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#3B5BFF]" />
              <span>Ask anything...</span>
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-[#E4E7EF] text-[10px] font-mono shadow-xs">
                ⌘K
              </kbd>
            </button>
          )}

          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 pl-3 rounded-xl border border-[#E4E7EF] hover:border-[#3B5BFF]/30 hover:bg-[#F6F7FB] transition-all cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-[#E8ECFF] text-[#3B5BFF] flex items-center justify-center font-bold text-xs">
                  {user?.email[0].toUpperCase()}
                </div>
                <span className="text-xs font-semibold text-[#0B1020] max-w-[120px] truncate hidden sm:inline">
                  {user?.email}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#5B6478]" />
              </button>

              {dropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 rounded-xl bg-white border border-[#E4E7EF] shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  onMouseLeave={() => setDropdownOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-[#E4E7EF]">
                    <p className="text-xs text-[#5B6478]">Signed in as</p>
                    <p className="text-xs font-bold text-[#0B1020] truncate">{user?.email}</p>
                    <div className="flex items-center gap-1.5 mt-1 text-[11px] text-[#16A34A] font-medium">
                      <ShieldCheck className="w-3 h-3" />
                      <span>{user?.is_verified ? 'Verified Account' : 'Unverified'}</span>
                    </div>
                  </div>
                  <div className="py-1">
                    <Link
                      to="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-[#0B1020] hover:bg-[#F6F7FB]"
                    >
                      <LayoutDashboard className="w-4 h-4 text-[#5B6478]" />
                      My Repositories
                    </Link>
                    <Link
                      to="/developer"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-[#0B1020] hover:bg-[#F6F7FB]"
                    >
                      <Terminal className="w-4 h-4 text-[#5B6478]" />
                      API Console & Logs
                    </Link>
                  </div>
                  <div className="border-t border-[#E4E7EF] pt-1">
                    <button
                      onClick={async () => {
                        setDropdownOpen(false);
                        await logout();
                        navigate('/login');
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs text-[#EF4444] hover:bg-[#FEF2F2] cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                to="/login"
                className="px-4 py-2 text-xs font-semibold text-[#5B6478] hover:text-[#0B1020] transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 text-xs font-semibold text-white bg-[#0B1020] hover:bg-[#1E293B] rounded-lg shadow-sm transition-all"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
