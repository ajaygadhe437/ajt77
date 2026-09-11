import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Bell,
  Loader2,
  ArrowRight,
  BookOpen,
  Upload,
  Maximize2,
  X,
  CheckCircle2,
  ShieldCheck,
  Check,
  FileCheck,
} from 'lucide-react';
import { requestApi } from '../lib/api';
import type { BookRecord } from '../types';

export const TradingMasterSection: React.FC = () => {
  const [book, setBook] = useState<BookRecord | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredSuccess, setRegisteredSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchBook();
  }, []);

  const fetchBook = async () => {
    try {
      const data = await requestApi<BookRecord>('/api/book');
      if (data) {
        setBook(data);
      }
    } catch (err) {
      console.error('Failed to load book data:', err);
    }
  };

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || cleanName.length < 2) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await requestApi<{
        isNew: boolean;
        alreadyRegistered: boolean;
        totalWaitlist?: number;
      }>('/api/waitlist', {
        method: 'POST',
        body: JSON.stringify({ name: cleanName, email: cleanEmail }),
      });

      if (res?.totalWaitlist && book) {
        setBook({ ...book, waitlist_count: res.totalWaitlist });
      }

      setRegisteredSuccess(true);
      setSuccessMessage(
        res?.alreadyRegistered
          ? 'You are already registered on the priority waitlist! We will notify you the moment pre-orders open.'
          : 'Thank you for registering for early access to the AJAY TRADES ICT & SMC TRADING MASTERBOOK by Ajay Gadhe. A confirmation email has been dispatched to your inbox.'
      );
    } catch (err: any) {
      console.error('Waitlist submission failed:', err);
      setErrorMessage(err.message || 'Unable to join waitlist at this time. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (.png, .jpg, .jpeg, .webp)');
      return;
    }

    setIsUploading(true);
    setUploadNotice('Processing official cover image...');

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const dataUrl = reader.result as string;
          const res = await requestApi<{ book: BookRecord; cover_url: string }>('/api/book/upload-cover', {
            method: 'POST',
            body: JSON.stringify({ dataUrl, fileName: file.name }),
          });

          if (res?.book) {
            setBook(res.book);
            setImgError(false);
            setUploadNotice('Official book cover updated and saved successfully!');
            setTimeout(() => setUploadNotice(null), 4000);
          }
        } catch (err: any) {
          alert('Upload failed: ' + (err.message || 'Unknown error'));
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setIsUploading(false);
      alert('Failed to read file: ' + err.message);
    }
  };

  const coverSrc = book?.cover_image_url || '/trading-master-cover.png';

  return (
    <section id="trading-master" className="py-24 bg-[#07090e] border-b border-slate-800/80 relative overflow-hidden">
      {/* Hidden file picker for direct book cover upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-sky-500/10 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          {/* Left: Official Book Cover Presentation */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="relative group w-full max-w-md">
              {/* Coming Soon Ribbon */}
              <div className="absolute -top-3.5 -right-2.5 z-30 pointer-events-none">
                <span className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-xs font-black uppercase tracking-widest rounded-full shadow-xl shadow-amber-950/60 flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>COMING SOON</span>
                </span>
              </div>

              {/* Book Container with Realistic Framing and Depth */}
              <div
                id="book-cover-container"
                className="relative rounded-2xl bg-gradient-to-br from-slate-900 via-[#0d121f] to-slate-950 border border-slate-700/80 p-4 sm:p-6 shadow-2xl shadow-sky-950/60 transition-all duration-300"
              >
                {/* Official Cover Image */}
                <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner group/img">
                  {!imgError ? (
                    <img
                      src={coverSrc}
                      alt="AJAY TRADES ICT & SMC TRADING MASTERBOOK by Ajay Gadhe"
                      referrerPolicy="no-referrer"
                      className="w-full h-auto object-contain rounded-lg transition-transform duration-300 hover:scale-[1.01]"
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    /* Clean Fallback Container with Upload Option */
                    <div className="aspect-[4/3] rounded-lg bg-gradient-to-b from-slate-900 to-[#070b14] border border-slate-700/60 p-6 flex flex-col justify-between text-center relative">
                      <div className="space-y-1 text-left">
                        <span className="text-[10px] font-mono tracking-widest uppercase text-sky-400 font-bold block">
                          OFFICIAL COVER ARTWORK
                        </span>
                        <h4 className="text-xl font-bold text-white leading-tight">
                          ICT & SMC TRADING MASTERBOOK
                        </h4>
                        <p className="text-xs text-slate-400">Ajay Trades • Ajay Gadhe</p>
                      </div>

                      <div className="my-auto py-4">
                        <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center mx-auto text-sky-400 mb-3 shadow-lg shadow-sky-500/10">
                          <BookOpen className="w-7 h-7" />
                        </div>
                        <p className="text-xs text-slate-300 max-w-xs mx-auto">
                          Official cover file ready to sync. Click below to load your official image.
                        </p>
                      </div>

                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-2 transition-colors cursor-pointer"
                      >
                        {isUploading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4" />
                        )}
                        <span>Upload Official Book Cover File</span>
                      </button>
                    </div>
                  )}

                  {/* Hover Actions Overlay */}
                  {!imgError && (
                    <div className="absolute bottom-3 right-3 flex items-center space-x-2 opacity-90 hover:opacity-100 transition-opacity">
                      <button
                        id="zoom-book-cover-btn"
                        type="button"
                        onClick={() => setIsZoomOpen(true)}
                        className="px-2.5 py-1.5 bg-slate-950/85 hover:bg-slate-900 text-white border border-slate-700/80 rounded-lg text-xs font-mono flex items-center space-x-1.5 backdrop-blur-sm shadow-lg cursor-pointer"
                        title="View Full Resolution Cover"
                      >
                        <Maximize2 className="w-3.5 h-3.5 text-sky-400" />
                        <span>Inspect Cover</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Subtitle & Official Authentication Bar */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="font-mono text-[11px] text-slate-300">Official AJT77 Publication</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="text-[11px] font-mono text-sky-400 hover:text-sky-300 underline underline-offset-2 flex items-center space-x-1 cursor-pointer"
                  >
                    <Upload className="w-3 h-3" />
                    <span>{isUploading ? 'Updating...' : 'Update Cover'}</span>
                  </button>
                </div>

                {uploadNotice && (
                  <div className="mt-3 p-2.5 bg-emerald-950/80 border border-emerald-500/40 rounded-lg text-[11px] text-emerald-300 flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>{uploadNotice}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Book Details & Priority Early Access Enrollment */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-300 text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>OFFICIAL MASTERBOOK</span>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
                AJAY TRADES ICT & SMC TRADING MASTERBOOK
              </h2>
              <p className="text-base sm:text-lg font-mono text-sky-400 font-semibold">
                Beginner to Advanced • Trade • Learn • Earn
              </p>
            </div>

            <p className="text-base text-slate-300 leading-relaxed max-w-2xl">
              Authored by <strong>Ajay Gadhe (AjayTrades77)</strong>, the <em>ICT & SMC Trading Masterbook</em> is a complete and in-depth educational blueprint combining institutional Smart Money Concepts with pure Price Action principles to trade financial markets systematically and with confidence.
            </p>

            {/* Core Curriculum Highlights from Official Back Cover */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 text-xs text-slate-300">
                <span className="font-bold text-sky-400 block mb-1 text-sm">Market Structure & Price Action</span>
                Break of Structure (BOS), Change of Character (CHoCH), multi-timeframe swing analysis, and institutional candle mechanics.
              </div>
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 text-xs text-slate-300">
                <span className="font-bold text-sky-400 block mb-1 text-sm">ICT & SMC Core Concepts</span>
                Order Blocks (all variations), Liquidity Concepts (buy-side/sell-side), and Fair Value Gaps (FVG) / Imbalances.
              </div>
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 text-xs text-slate-300">
                <span className="font-bold text-sky-400 block mb-1 text-sm">Multi-Timeframe Analysis & Execution</span>
                Top-down market narrative framing, high-probability entry confirmations, and real trade case studies.
              </div>
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 text-xs text-slate-300">
                <span className="font-bold text-sky-400 block mb-1 text-sm">Risk Management & Psychology</span>
                Mathematical risk parameters, drawdown containment, trade journaling systems, and psychological mastery.
              </div>
            </div>

            {/* Core Maxims (from Official Book Cover) */}
            <div className="bg-[#0b101c] border border-slate-800 rounded-xl p-4">
              <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400 block mb-2 font-semibold">
                Guiding Institutional Maxims
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                <div className="px-2.5 py-1.5 bg-slate-900/90 rounded-lg border border-slate-800 text-slate-300 text-center">
                  <span className="text-emerald-400 font-bold block text-[11px]">DISCIPLINE</span>
                  <span>IS FREEDOM</span>
                </div>
                <div className="px-2.5 py-1.5 bg-slate-900/90 rounded-lg border border-slate-800 text-slate-300 text-center">
                  <span className="text-sky-400 font-bold block text-[11px]">STRATEGY</span>
                  <span>IS EDGE</span>
                </div>
                <div className="px-2.5 py-1.5 bg-slate-900/90 rounded-lg border border-slate-800 text-slate-300 text-center">
                  <span className="text-amber-400 font-bold block text-[11px]">RISK MGMT</span>
                  <span>IS SURVIVAL</span>
                </div>
                <div className="px-2.5 py-1.5 bg-slate-900/90 rounded-lg border border-slate-800 text-slate-300 text-center">
                  <span className="text-indigo-400 font-bold block text-[11px]">CONSISTENCY</span>
                  <span>IS WEALTH</span>
                </div>
              </div>
            </div>

            {/* Early Access Registration Card */}
            <div
              id="waitlist-card"
              className="bg-slate-900 border border-slate-700/80 rounded-2xl p-6 sm:p-7 space-y-4 max-w-2xl shadow-xl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <Bell className="w-4 h-4 text-sky-400" />
                  <h4 className="text-base font-bold text-white">Join Early Access Waitlist</h4>
                </div>
                <span className="text-xs font-mono text-emerald-400 font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  {book?.waitlist_count ?? 342} Readers Registered
                </span>
              </div>

              {registeredSuccess ? (
                <div className="p-4 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-emerald-200 text-xs sm:text-sm space-y-2">
                  <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <span>Priority Waitlist Registration Confirmed!</span>
                  </div>
                  <p className="leading-relaxed text-slate-300">
                    {successMessage}
                  </p>
                  <p className="text-[11px] text-slate-400 pt-1">
                    Check your email inbox (and spam folder) for our official welcome confirmation from AJT77.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleWaitlistSubmit} className="space-y-3.5">
                  <p className="text-xs text-slate-300">
                    Register to receive official launch notifications, pre-order release dates, and exclusive early-bird reader discounts.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                        Full Name
                      </label>
                      <input
                        id="waitlist-name-input"
                        type="text"
                        required
                        placeholder="e.g. Rahul Sharma"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                        Email Address
                      </label>
                      <input
                        id="waitlist-email-input"
                        type="email"
                        required
                        placeholder="e.g. rahul@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                      />
                    </div>
                  </div>

                  {errorMessage && (
                    <p className="text-rose-400 text-xs font-medium">{errorMessage}</p>
                  )}

                  <button
                    id="join-trading-master-waitlist-btn"
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-sky-950/50 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Confirming Registration...</span>
                      </>
                    ) : (
                      <>
                        <span>Notify Me When Book Launches</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Full Resolution Zoom / Inspect Modal */}
      {isZoomOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-5xl w-full max-h-[95vh] flex flex-col items-center">
            <button
              onClick={() => setIsZoomOpen(false)}
              className="absolute -top-12 right-0 p-2 text-slate-400 hover:text-white bg-slate-800/80 rounded-full transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="overflow-auto max-h-[85vh] rounded-xl border border-slate-700 bg-slate-950 p-2 shadow-2xl">
              <img
                src={coverSrc}
                alt="AJAY TRADES ICT & SMC TRADING MASTERBOOK Full Cover"
                referrerPolicy="no-referrer"
                className="w-full h-auto object-contain rounded-lg"
              />
            </div>

            <p className="text-xs text-slate-400 font-mono mt-3 text-center">
              AJAY TRADES ICT & SMC TRADING MASTERBOOK • Official Jacket Wrap (Back, Spine & Front)
            </p>
          </div>
        </div>
      )}
    </section>
  );
};
