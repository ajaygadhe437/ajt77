import React from 'react';
import { X, ShieldAlert, FileText, Lock } from 'lucide-react';

interface LegalModalProps {
  type: 'DISCLAIMER' | 'TERMS' | 'PRIVACY' | null;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0b0f19] border border-slate-700 rounded-2xl max-w-2xl w-full p-6 space-y-5 text-slate-300 text-xs leading-relaxed max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            {type === 'DISCLAIMER' && <ShieldAlert className="w-5 h-5 text-amber-400" />}
            {type === 'TERMS' && <FileText className="w-5 h-5 text-sky-400" />}
            {type === 'PRIVACY' && <Lock className="w-5 h-5 text-emerald-400" />}
            <h3 className="font-bold text-white text-base">
              {type === 'DISCLAIMER' && 'Full Regulatory Risk Disclaimer'}
              {type === 'TERMS' && 'Terms and Conditions of Enrollment'}
              {type === 'PRIVACY' && 'Privacy Policy & Data Redaction Standard'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {type === 'DISCLAIMER' && (
          <div className="space-y-3">
            <p className="font-semibold text-white">1. Educational Nature of Content</p>
            <p>
              The content provided on AJT77, AjayTrades77, and by Ajay Gadhe is strictly for educational, informational, and training purposes. Nothing on this website constitutes personalized investment advice, financial planning, recommendation to buy or sell securities, commodities, derivatives, or currencies.
            </p>

            <p className="font-semibold text-white">2. High-Risk Warning</p>
            <p>
              Trading financial markets involves high exposure to volatility and potential loss of capital. Most retail traders lose capital. Never trade with money you cannot afford to lose completely.
            </p>

            <p className="font-semibold text-white">3. No Guaranteed Profit or Income</p>
            <p>
              AJT77 explicitly disclaims any representations of guaranteed returns, 100% win-rates, or effortless wealth. Trading success depends on individual practice, psychological discipline, and market variability.
            </p>

            <p className="font-semibold text-white">4. Regulatory Disclosure</p>
            <p>
              AJT77 / Ajay Gadhe is not a SEBI registered investment adviser or research analyst. All trade setups and market discussions represent personal analytical opinions intended to illustrate educational price action principles.
            </p>
          </div>
        )}

        {type === 'TERMS' && (
          <div className="space-y-3">
            <p className="font-semibold text-white">1. Course Enrollment & Fees</p>
            <p>
              Enrollment in AJT77 Basic (₹6,000 INR) and AJT77 Pro (₹10,000 INR) grants personal, non-transferable access to the educational materials. Fees are collected in Indian Rupees (INR) via official Razorpay Standard Checkout.
            </p>

            <p className="font-semibold text-white">2. Intellectual Property</p>
            <p>
              All video curriculums, chart analyses, course frameworks, and publications are the exclusive intellectual property of Ajay Gadhe (AJT77). Unauthorized redistribution, recording, or commercial resale is strictly prohibited.
            </p>

            <p className="font-semibold text-white">3. Setup Guidance Notice</p>
            <p>
              AJT77 Pro includes educational market-condition setup ideas (1-2 per day when appropriate and available). These are illustrative frameworks, not buy/sell signals. Students remain solely liable for their execution choices.
            </p>
          </div>
        )}

        {type === 'PRIVACY' && (
          <div className="space-y-3">
            <p className="font-semibold text-white">1. Data Privacy & Handling</p>
            <p>
              We collect your name, email, and contact number solely to generate verified Razorpay payment receipts and provision course access. We do not sell your personal information.
            </p>

            <p className="font-semibold text-white">2. Payment Security</p>
            <p>
              We never collect or store card numbers, UPI PINs, or bank passwords. All payments are handled directly by Razorpay Payment Gateway under PCI-DSS Level 1 compliance.
            </p>

            <p className="font-semibold text-white">3. Redaction Compliance</p>
            <p>
              All trading statements, certificates, and payout receipts posted to the public track record vault have sensitive account identifiers, residential addresses, and private numbers strictly redacted.
            </p>
          </div>
        )}

        <div className="border-t border-slate-800 pt-3 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};
