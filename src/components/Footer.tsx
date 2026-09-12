import React from 'react';
import { ShieldCheck, Youtube, Instagram, Linkedin, Twitter, MessageSquare, AlertTriangle } from 'lucide-react';
import { useWebsiteContent } from '../context/WebsiteContentContext';

interface FooterProps {
  onNavigate: (tab: string) => void;
  onOpenLegal: (type: 'DISCLAIMER' | 'TERMS' | 'PRIVACY') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenLegal }) => {
  const { content } = useWebsiteContent();

  const social = content.social || {
    youtube: 'https://youtube.com/@ajaytrades77?si=3piKHv2eHqB_A_4S',
    instagram: 'https://www.instagram.com/ajaytrades_77?stkn=eHVreHA3MDQ4cHNl',
    linkedin: 'https://www.linkedin.com/in/ajay-gadhe-703066361',
    twitter: 'https://x.com/AjayTrades77',
    discord: 'https://discord.gg/ESDzAbxBNZ',
    telegram: 'https://t.me/ajaytrades77',
  };

  return (
    <footer className="bg-[#05070a] border-t border-slate-800 text-slate-400 text-xs">
      {/* High-visibility Mandatory Trading Risk Disclaimer */}
      <div className="border-b border-slate-800/80 py-8 bg-[#070a10]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-start space-x-3.5 bg-[#0b0f19] border border-amber-500/20 rounded-2xl p-5 text-slate-300">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1.5 leading-relaxed text-[11px]">
              <p className="font-bold text-amber-300 uppercase tracking-wide">
                Regulatory Risk Disclosure & Educational Notice:
              </p>
              <p>
                {content.footer?.riskNotice || `Trading derivatives, equities, currencies, commodities, and digital assets involves significant financial risk and is not suitable for all investors. Capital loss can equal or exceed deposited funds. All content, technical breakdowns, course curriculums, and setup observations shared across ${content.brandName || 'AJT77'} / ${content.subBrand || 'AjayTrades77'} / ${content.founderName || 'Ajay Gadhe'} are provided exclusively for educational and illustrative purposes.`}
              </p>
              <p>
                {content.footer?.disclaimerExtra || 'Past performance, verified prop statements, and historical payout certificates are not indicative or guarantees of future results. We do not provide financial advice, SEBI-registered portfolio management, tips, or guaranteed profit schemes. You are solely responsible for your own trading and risk management decisions.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Brand */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/40 flex items-center justify-center font-black text-sky-400 font-mono text-sm">
                77
              </div>
              <div>
                <span className="text-base font-extrabold text-white tracking-tight font-display">
                  {content.brandName || 'AJT77'}
                </span>
                <p className="text-[11px] text-slate-500 font-mono">
                  {content.subBrand || 'AjayTrades77'} • {content.founderName || 'Ajay Gadhe'}
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              {content.footer?.tagline || 'Institutional price action, liquidity dynamics, and systematic market execution. Educational programs powering disciplined, self-sufficient traders.'}
            </p>
            <div className="flex items-center space-x-3 pt-2 text-slate-400">
              {social.youtube && (
                <a
                  href={social.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-red-400 transition-colors p-1.5 rounded-lg bg-slate-900 border border-slate-800"
                  title="YouTube"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              )}
              {social.instagram && (
                <a
                  href={social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-pink-400 transition-colors p-1.5 rounded-lg bg-slate-900 border border-slate-800"
                  title="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {social.linkedin && (
                <a
                  href={social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-sky-400 transition-colors p-1.5 rounded-lg bg-slate-900 border border-slate-800"
                  title="LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
              {social.twitter && (
                <a
                  href={social.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors p-1.5 rounded-lg bg-slate-900 border border-slate-800"
                  title="X (Twitter)"
                >
                  <Twitter className="w-4 h-4" />
                </a>
              )}
              {social.discord && (
                <a
                  href={social.discord}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-indigo-400 transition-colors p-1.5 rounded-lg bg-slate-900 border border-slate-800"
                  title="Discord Community"
                >
                  <MessageSquare className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Nav */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-white cursor-pointer">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('courses')} className="hover:text-white cursor-pointer">
                  {content.brandName || 'AJT77'} Courses
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('journey')} className="hover:text-white cursor-pointer">
                  Trading Journey & Philosophy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('trading-master')} className="hover:text-white cursor-pointer">
                  Trading Master Book (Coming Soon)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-white cursor-pointer">
                  Contact & Support
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Razorpay Security */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Legal & Security</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onOpenLegal('DISCLAIMER')} className="hover:text-white cursor-pointer">
                  Risk Disclaimer
                </button>
              </li>
              <li>
                <button onClick={() => onOpenLegal('TERMS')} className="hover:text-white cursor-pointer">
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button onClick={() => onOpenLegal('PRIVACY')} className="hover:text-white cursor-pointer">
                  Privacy Policy
                </button>
              </li>
            </ul>
            <div className="pt-2 text-[11px] text-emerald-400 flex items-center space-x-1.5 font-mono">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Razorpay Live Verified Gateway</span>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-3">
          <p>
            {content.footer?.copyright || `© ${new Date().getFullYear()} ${content.brandName || 'AJT77'} / ${content.subBrand || 'AjayTrades77'}. All rights reserved. Created by ${content.founderName || 'Ajay Gadhe'}.`}
          </p>
          <div className="flex items-center space-x-4">
            <span>Canonical: ajt77.com</span>
            <span>Live Mode: Active</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
