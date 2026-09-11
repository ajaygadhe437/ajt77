import React, { useState, useEffect } from 'react';
import { ShieldCheck, Award, FileText, CheckCircle2, Lock, ExternalLink, X, Eye } from 'lucide-react';
import { requestApi } from '../lib/api';
import type { TrackRecordDocument } from '../types';

export const TrackRecordSection: React.FC = () => {
  const [records, setRecords] = useState<TrackRecordDocument[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [activeDoc, setActiveDoc] = useState<TrackRecordDocument | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    setIsLoading(true);
    try {
      const data = await requestApi<TrackRecordDocument[]>('/api/track-records');
      setRecords(data);
    } catch (err) {
      console.error('Failed to load track records:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const categories = ['ALL', 'MILESTONE', 'TRADING_STATEMENT', 'PAYOUT'];

  const filtered = records.filter(
    (r) => selectedCategory === 'ALL' || r.category === selectedCategory
  );

  return (
    <section id="track-record" className="py-20 bg-[#07090e] border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>VERIFIED PERFORMANCE & DISCIPLINE</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-display">
            Authentic Track Record
          </h2>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            Genuine milestones, audited certificates, and payout receipts earned through systematic risk management.
          </p>
        </div>

        {/* Mandatory Redaction & Privacy Notice Banner */}
        <div className="max-w-4xl mx-auto mb-10 p-4 rounded-xl bg-[#0b0f19] border border-slate-800 flex items-start space-x-3.5 text-xs">
          <Lock className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="text-slate-400 leading-relaxed">
            <strong className="text-white">Strict Compliance & Redaction Policy:</strong> To protect personal cybersecurity and sensitive financial credentials, all published trading records, prop certificates, and bank statements have private account numbers, addresses, and tax identifiers strictly redacted.
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex justify-center items-center space-x-2 mb-10 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-[#0b0f19] text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {cat.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Documents Grid */}
        {isLoading ? (
          <div className="text-center py-16 text-slate-500 font-mono text-sm">
            Verifying records from database...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">
            No records found for this category.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {filtered.map((record) => (
              <div
                key={record.id}
                onClick={() => setActiveDoc(record)}
                className="group bg-[#0b0f19] border border-slate-800 rounded-2xl overflow-hidden hover:border-emerald-500/50 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Thumbnail */}
                  <div className="relative aspect-video w-full bg-[#080b12] overflow-hidden">
                    <img
                      src={record.thumbnail_url || record.document_url}
                      alt={record.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f19] via-transparent to-transparent opacity-80" />

                    <div className="absolute top-3 left-3">
                      <span className="px-2 py-0.5 bg-black/80 backdrop-blur-md rounded text-[10px] font-mono font-bold text-emerald-400 border border-emerald-500/30">
                        {record.category.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="absolute bottom-3 right-3 flex items-center space-x-1 px-2 py-0.5 bg-emerald-500/20 rounded text-[10px] font-mono text-emerald-300 border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>Redaction Verified</span>
                    </div>
                  </div>

                  {/* Text Details */}
                  <div className="p-5 space-y-2.5">
                    <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-400">
                      <span>Date: {record.document_date}</span>
                      <span>•</span>
                      <span>By {record.created_by}</span>
                    </div>
                    <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {record.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                      {record.description}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-3">
                  <span className="font-mono text-[11px] text-slate-400">ID: {record.id}</span>
                  <span className="text-emerald-400 font-semibold flex items-center space-x-1">
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Record</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Document Viewer Modal */}
      {activeDoc && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0b0f19] border border-slate-700 rounded-2xl max-w-3xl w-full p-6 space-y-5">
            <div className="flex justify-between items-start border-b border-slate-800 pb-3">
              <div>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-xs font-mono">
                  {activeDoc.category.replace('_', ' ')}
                </span>
                <h3 className="text-lg font-bold text-white mt-1.5">{activeDoc.title}</h3>
                <p className="text-xs text-slate-400 font-mono">Audited Date: {activeDoc.document_date}</p>
              </div>
              <button
                onClick={() => setActiveDoc(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-xl overflow-hidden border border-slate-800 max-h-[460px] bg-black">
              <img
                src={activeDoc.document_url}
                alt={activeDoc.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain max-h-[460px] mx-auto"
              />
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-[#101522] p-3 rounded-xl border border-slate-800">
              {activeDoc.description}
            </p>

            <div className="flex justify-between items-center text-xs text-slate-400 border-t border-slate-800 pt-3">
              <span className="text-emerald-400 font-mono text-[11px]">Sensitive details redacted in compliance with privacy guidelines.</span>
              <button
                onClick={() => setActiveDoc(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
