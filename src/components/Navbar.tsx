import React, { useState } from 'react';
import { ShieldCheck, Menu, X, ArrowRight, Lock } from 'lucide-react';

interface NavbarProps {
  activeTab?: string;
  currentTab?: string;
  onNavigate?: (tab: string) => void;
  setCurrentTab?: (tab: string) => void;
  onOpenEnroll: (course?: 'AJT77 Basic' | 'AJT77 Pro') => void;
  onOpenAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  currentTab,
  onNavigate,
  setCurrentTab,
  onOpenEnroll,
  onOpenAdmin,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const active = activeTab || currentTab || 'home';

  const handleNavClick = (tabId: string) => {
    if (onNavigate) {
      onNavigate(tabId);
    } else if (setCurrentTab) {
      setCurrentTab(tabId);
    }
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'courses', label: 'Courses' },
    { id: 'journey', label: 'Trading Journey' },
    { id: 'trading-master', label: 'Trading Master' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#07090e]/85 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Identity */}
          <button
            id="brand-logo-btn"
            onClick={() => handleNavClick('home')}
            className="flex items-center space-x-3 group text-left cursor-pointer focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-cyan-400 p-[1.5px] shadow-lg shadow-sky-500/20 group-hover:shadow-sky-500/40 transition-all">
              <div className="w-full h-full bg-[#090d16] rounded-[10px] flex items-center justify-center">
                <span className="font-extrabold text-white text-base tracking-tighter">77</span>
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl text-white tracking-tight font-display">
                  AJT<span className="text-sky-400">77</span>
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/30">
                  Live
                </span>
              </div>
              <p className="text-xs text-slate-400 tracking-wide font-medium">AjayTrades77 • Ajay Gadhe</p>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((item) => (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                  active === item.id
                    ? 'text-white bg-slate-800/80 shadow-sm border border-slate-700/60'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right Action CTAs */}
          <div className="hidden md:flex items-center space-x-3">
            <button
              id="admin-portal-nav-btn"
              onClick={onOpenAdmin}
              className="px-3 py-2 text-xs font-mono text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-lg border border-slate-800 transition-colors flex items-center space-x-1.5 cursor-pointer"
              title="Admin Portal"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>

            <button
              id="enroll-nav-cta-btn"
              onClick={() => onOpenEnroll('AJT77 Basic')}
              className="relative group px-4 py-2 text-xs uppercase tracking-wider font-semibold text-white bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 rounded-lg shadow-md shadow-sky-950/40 transition-all flex items-center space-x-2 cursor-pointer"
            >
              <span>Enroll Now</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              id="mobile-enroll-btn"
              onClick={() => onOpenEnroll('AJT77 Basic')}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-sky-600 rounded-md"
            >
              Enroll
            </button>
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0a0d16] border-b border-slate-800 px-4 pt-2 pb-6 space-y-2">
          {navLinks.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`block w-full text-left px-4 py-2.5 text-sm font-medium rounded-lg cursor-pointer ${
                active === item.id
                  ? 'text-white bg-sky-500/10 text-sky-400 border border-sky-500/20'
                  : 'text-slate-300 hover:bg-slate-800/60'
              }`}
            >
              {item.label}
            </button>
          ))}
          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
            <button
              onClick={() => {
                onOpenAdmin();
                setMobileMenuOpen(false);
              }}
              className="px-3 py-2 text-xs font-mono text-slate-400 hover:text-white flex items-center space-x-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Admin Portal</span>
            </button>
            <div className="flex items-center space-x-1 text-[11px] text-emerald-400 font-mono">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Razorpay Verified</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
