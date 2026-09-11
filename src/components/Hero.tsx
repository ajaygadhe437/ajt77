import React from 'react';
import { ArrowRight, ShieldCheck, BookOpen, Compass, CheckCircle2 } from 'lucide-react';

interface HeroProps {
  onExploreCourses: () => void;
  onViewJourney: () => void;
  onViewBook: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onExploreCourses,
  onViewJourney,
  onViewBook,
}) => {
  return (
    <section id="hero-section" className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-800/80">
      {/* Subtle Background Glows & Technical Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-sky-500/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[300px] bg-indigo-500/10 blur-[110px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Main Hero Content */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/70 text-slate-300 text-xs font-medium backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
              <span>AJT77 • Institutional Price Action & Risk Architecture</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.08]">
                Master Markets Through{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-300 to-cyan-300">
                  Pure Price Action.
                </span>
              </h1>
              <p className="text-lg sm:text-xl font-medium text-slate-300">
                Ajay Gadhe <span className="text-slate-600 px-1">|</span> Trader & Mentor <span className="text-slate-600 px-1">|</span> <span className="text-sky-400 font-semibold">AjayTrades77</span>
              </p>
            </div>

            <p className="text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed">
              Systematic market understanding built on raw orderflow, liquidity sweep mechanics, and mathematically disciplined risk control. No retail indicator noise, no artificial promises—just structured, transparent execution education.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                id="hero-explore-courses-btn"
                onClick={onExploreCourses}
                className="px-7 py-3.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-sky-950/50 hover:shadow-sky-900/60 transition-all flex items-center space-x-2 cursor-pointer"
              >
                <span>Explore Official Courses</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                id="hero-view-journey-btn"
                onClick={onViewJourney}
                className="px-6 py-3.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold rounded-xl border border-slate-700/80 transition-colors flex items-center space-x-2 cursor-pointer"
              >
                <Compass className="w-4 h-4 text-sky-400" />
                <span>Trading Journey</span>
              </button>

              <button
                id="hero-view-book-btn"
                onClick={onViewBook}
                className="px-5 py-3.5 bg-slate-900/60 hover:bg-slate-800/80 text-slate-300 hover:text-white font-medium rounded-xl border border-slate-800 transition-colors flex items-center space-x-2 cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>Trading Master (Book)</span>
              </button>
            </div>

            {/* Trust & Methodology Pillars */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-800/80">
              <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-3.5">
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Methodology</p>
                <p className="text-sm font-bold text-white mt-1">Raw Price Action</p>
              </div>
              <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-3.5">
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">AJT77 Basic</p>
                <p className="text-sm font-bold text-sky-400 mt-1">₹6,000 INR</p>
              </div>
              <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-3.5">
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">AJT77 Pro</p>
                <p className="text-sm font-bold text-indigo-400 mt-1">₹10,000 INR</p>
              </div>
              <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-3.5">
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Verification</p>
                <p className="text-sm font-bold text-emerald-400 mt-1">Razorpay Live</p>
              </div>
            </div>
          </div>

          {/* Educational Framework Card */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-6 sm:p-8 shadow-2xl shadow-slate-950/80">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-sky-400" />
                  <h3 className="text-base font-bold text-white">AJT77 Core Principles</h3>
                </div>
                <span className="text-[11px] font-mono px-2.5 py-0.5 bg-sky-500/10 text-sky-400 rounded-full border border-sky-500/20 font-semibold">
                  DISCIPLINE FIRST
                </span>
              </div>

              <div className="mt-6 space-y-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start space-x-3.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-white">Liquidity & Institutional Footprints</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Understand where large participants accumulate and distribute orders before entering high-timeframe setups.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start space-x-3.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-white">Asymmetric Risk-to-Reward Framework</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Capital preservation takes precedence. Every setup must possess clear invalidation levels and risk-controlled sizing.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start space-x-3.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-white">Zero Hype • 100% Genuine Education</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      No get-rich claims or false shortcuts. We teach real multi-timeframe chart reading, execution psychology, and journaling.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Direct Mentor Guidance</span>
                <span className="text-slate-300 font-semibold">Ajay Gadhe • AJT77</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
