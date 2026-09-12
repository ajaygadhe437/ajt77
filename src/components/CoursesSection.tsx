import React, { useState, useEffect } from 'react';
import { Check, ShieldCheck, Zap, ArrowRight, HelpCircle, AlertCircle, Loader2 } from 'lucide-react';
import { requestApi } from '../lib/api';
import type { CourseRecord } from '../types';
import { useWebsiteContent } from '../context/WebsiteContentContext';

interface CoursesSectionProps {
  onEnroll: (course: 'AJT77 Basic' | 'AJT77 Pro') => void;
}

export const CoursesSection: React.FC<CoursesSectionProps> = ({ onEnroll }) => {
  const { content } = useWebsiteContent();
  const [courses, setCourses] = useState<CourseRecord[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  const [enquiryModalOpen, setEnquiryModalOpen] = useState(false);
  const [enquiryCourse, setEnquiryCourse] = useState('AJT77 Basic');
  const [enquiryName, setEnquiryName] = useState('');
  const [enquiryEmail, setEnquiryEmail] = useState('');
  const [enquiryPhone, setEnquiryPhone] = useState('');
  const [enquiryMessage, setEnquiryMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [enquirySuccess, setEnquirySuccess] = useState(false);
  const [enquiryError, setEnquiryError] = useState<string | null>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const data = await requestApi<CourseRecord[]>('/api/courses');
      if (data && data.length > 0) {
        setCourses(data);
      }
    } catch (err) {
      console.error('Failed to load courses from API:', err);
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnquiryError(null);
    setIsSubmitting(true);
    try {
      await requestApi('/api/course-enquiry', {
        method: 'POST',
        body: JSON.stringify({
          name: enquiryName,
          email: enquiryEmail,
          phone: enquiryPhone,
          courseId: enquiryCourse,
          message: enquiryMessage,
        }),
      });
      setEnquirySuccess(true);
      setIsSubmitting(false);
    } catch (err: any) {
      setIsSubmitting(false);
      setEnquiryError(err.message || 'Failed to submit enquiry');
    }
  };

  const basicCourse = courses.find((c) => c.slug === 'basic' || c.name.toLowerCase().includes('basic')) || {
    id: 'ajt77-basic',
    slug: 'basic',
    name: 'AJT77 Basic',
    badge: 'Zero to 100 Foundation',
    price: 6000,
    short_description: 'Beginner to Advanced Trading Education',
    features: [
      'Complete Price Action Framework (Zero to 100)',
      'Institutional Market Structure & Swing High/Low Mapping',
      'Liquidity Sweeps & Stop Run Recognition',
      'Supply & Demand / Fair Value Gap (FVG) Identification',
      'Multi-Timeframe Top-Down Analysis Process',
      'Position Sizing & Risk Management Calculator',
      'Trading Journaling System & Mistake Analysis',
      'Lifetime Access to Future Curriculum Upgrades',
    ],
  };

  const proCourse = courses.find((c) => c.slug === 'pro' || c.name.toLowerCase().includes('pro')) || {
    id: 'ajt77-pro',
    slug: 'pro',
    name: 'AJT77 Pro',
    badge: 'Execution & Mentorship',
    price: 10000,
    short_description: 'Advanced Execution & Daily Setup Guidance',
    features: [
      'Everything included in AJT77 Basic',
      'Execution Framework & Live Market Nuances',
      'Advanced Dynamic Risk & Capital Allocation Model',
      'Market-Condition-Based Setup Guidance',
      '1–2 Educational Setup Ideas Per Day (Market-dependent)',
      'Trade Invalidation & Trailing Stop Rules',
      'Weekly Market Structure & Session Breakdown',
      'Direct Mentor Interaction & Priority Q&A',
    ],
  };

  return (
    <section id="courses" className="py-20 bg-[#07090e] border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-mono">
            <Zap className="w-3.5 h-3.5" />
            <span>INSTITUTIONAL CURRICULUM</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-display">
            Master Systematic Price Action
          </h2>
          <p className="text-base text-slate-400 leading-relaxed">
            Engineered by {content.founderName || 'Ajay Gadhe'} ({content.brandName || 'AJT77'}) to eliminate guesswork, master market structure, and establish rigorous risk-adjusted trading habits.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* AJT77 BASIC */}
          <div className="relative rounded-2xl bg-[#0b0f19] border border-slate-700/80 p-8 flex flex-col justify-between hover:border-slate-600 transition-all shadow-xl">
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-sky-400 px-2.5 py-1 bg-sky-500/10 rounded-md border border-sky-500/20">
                    {basicCourse.badge || 'Zero to 100 Foundation'}
                  </span>
                  <h3 className="text-2xl font-bold text-white mt-3">{basicCourse.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">{basicCourse.short_description}</p>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-baseline space-x-2 pt-2 border-b border-slate-800 pb-6">
                <span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">₹{basicCourse.price.toLocaleString('en-IN')}</span>
                <span className="text-sm font-semibold text-slate-400 uppercase">INR / One-time</span>
              </div>

              {/* Features */}
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-300">Curriculum Highlights</p>
                <ul className="space-y-2.5 text-xs text-slate-300">
                  {basicCourse.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start space-x-2.5">
                      <div className="w-4 h-4 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-8 space-y-3">
              <button
                id="enroll-basic-card-btn"
                onClick={() => onEnroll('AJT77 Basic')}
                className="w-full py-3.5 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl border border-slate-600/80 shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>Enroll in {basicCourse.name} (₹{basicCourse.price.toLocaleString('en-IN')})</span>
                <ArrowRight className="w-4 h-4 text-sky-400" />
              </button>

              <button
                onClick={() => {
                  setEnquiryCourse(basicCourse.name);
                  setEnquiryModalOpen(true);
                }}
                className="w-full py-2 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                Have questions? Submit Course Enquiry
              </button>
            </div>
          </div>

          {/* AJT77 PRO */}
          <div className="relative rounded-2xl bg-[#0d1222] border-2 border-sky-500/80 p-8 flex flex-col justify-between shadow-2xl shadow-sky-950/60 transition-all">
            {/* Featured Badge */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider px-3.5 py-1 bg-gradient-to-r from-sky-500 via-indigo-500 to-cyan-400 text-white rounded-full shadow-md whitespace-nowrap">
                Recommended For Serious Traders
              </span>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400 px-2.5 py-1 bg-indigo-500/10 rounded-md border border-indigo-500/20">
                    {proCourse.badge || 'Execution & Mentorship'}
                  </span>
                  <h3 className="text-2xl font-bold text-white mt-3">{proCourse.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">{proCourse.short_description}</p>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-baseline space-x-2 pt-2 border-b border-slate-800 pb-6">
                <span className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-300 tracking-tight">
                  ₹{proCourse.price.toLocaleString('en-IN')}
                </span>
                <span className="text-sm font-semibold text-slate-400 uppercase">INR / One-time</span>
              </div>

              {/* Features */}
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-300">Complete Pro Package</p>
                <ul className="space-y-2.5 text-xs text-slate-300">
                  {proCourse.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start space-x-2.5">
                      <div className="w-4 h-4 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                      <span className={idx === 4 ? 'text-sky-300 font-medium' : ''}>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-8 space-y-3">
              <button
                id="enroll-pro-card-btn"
                onClick={() => onEnroll('AJT77 Pro')}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-sky-600 via-sky-500 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-sky-600/30 transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>Enroll in {proCourse.name} (₹{proCourse.price.toLocaleString('en-IN')})</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setEnquiryCourse(proCourse.name);
                  setEnquiryModalOpen(true);
                }}
                className="w-full py-2 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                Have questions? Submit Course Enquiry
              </button>
            </div>
          </div>
        </div>

        {/* Responsible Education Disclaimer */}
        <div className="mt-12 max-w-4xl mx-auto p-4 rounded-xl bg-[#090d16] border border-slate-800/80 text-xs text-slate-400 flex items-start space-x-3">
          <ShieldCheck className="w-5 h-5 text-sky-400 flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-slate-200">Strict Ethical Standards:</strong> Trade setups and educational ideas shared in AJT77 programs are solely for training and market-structure comprehension. We do not provide advisory services, tips, or guaranteed return schemes. All financial trading carries substantial risk of capital loss.
          </div>
        </div>
      </div>

      {/* Enquiry Modal */}
      {enquiryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b0f19] border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">Course Enquiry: {enquiryCourse}</h3>
              <button
                onClick={() => {
                  setEnquiryModalOpen(false);
                  setEnquirySuccess(false);
                }}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {enquirySuccess ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-white">Enquiry Received</h4>
                <p className="text-xs text-slate-300">
                  Thank you! Ajay Gadhe / AJT77 team will review your query and get in touch with you shortly.
                </p>
                <button
                  onClick={() => {
                    setEnquiryModalOpen(false);
                    setEnquirySuccess(false);
                  }}
                  className="px-4 py-2 bg-slate-800 text-white text-xs rounded-lg"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleEnquirySubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={enquiryName}
                    onChange={(e) => setEnquiryName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#121827] border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={enquiryEmail}
                    onChange={(e) => setEnquiryEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-[#121827] border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={enquiryPhone}
                    onChange={(e) => setEnquiryPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-[#121827] border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Your Question or Background</label>
                  <textarea
                    rows={3}
                    required
                    value={enquiryMessage}
                    onChange={(e) => setEnquiryMessage(e.target.value)}
                    placeholder="Tell us about your current trading experience..."
                    className="w-full px-3 py-2 bg-[#121827] border border-slate-700 rounded-lg text-white"
                  />
                </div>

                {enquiryError && (
                  <p className="text-rose-400 text-xs">{enquiryError}</p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Submit Enquiry</span>}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
