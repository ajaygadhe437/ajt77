import React from 'react';
import {
  Compass,
  CheckCircle2,
  ShieldCheck,
  BrainCircuit,
  TrendingDown,
  TrendingUp,
  Scale,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { useWebsiteContent } from '../context/WebsiteContentContext';

export const AboutSection: React.FC = () => {
  const { content } = useWebsiteContent();
  const journey = content.journey;

  const pillarIcons = [Scale, BrainCircuit, TrendingUp, GraduationCap];

  const pillars = journey?.pillars && journey.pillars.length > 0
    ? journey.pillars
    : [
        {
          title: 'Asymmetric Risk Architecture',
          desc: 'Capital preservation is non-negotiable. We never risk more than defined parameters, maintaining favorable risk-to-reward ratios on every trade idea.',
        },
        {
          title: 'Execution Psychology & Discipline',
          desc: 'Mastering impulse control, preventing revenge trades, and systematically handling drawdowns without emotional disruption.',
        },
        {
          title: 'Pure Price Action & Liquidity',
          desc: 'Multi-timeframe structural analysis, breaker blocks, and liquidity grabs without reliance on lagging oscillators.',
        },
        {
          title: 'Student-Centric Mentorship',
          desc: 'Step-by-step guidance tailored to both emerging traders and experienced operators aiming to refine their edge.',
        },
      ];

  const phases = journey?.phases && journey.phases.length > 0
    ? journey.phases
    : [
        {
          phase: 'Phase 01',
          title: 'The Retail Indicator Trap & Realization',
          subtitle: 'Unlearning lagging indicators and noise',
          description:
            'Like many market participants, Ajay started exploring standard retail tools—RSI divergence, MACD crossovers, and complex moving average ribbons. The breaking point was realizing that all indicators merely lag price, obscuring what actually drives markets: orders, liquidity, and human psychology.',
          takeaway: 'Key Lesson: Stop looking at lagging formulas. Price alone reflects real-time institutional commitment.',
        },
        {
          phase: 'Phase 02',
          title: 'Institutional Orderflow & Liquidity Mapping',
          subtitle: 'Understanding market maker footprints',
          description:
            'Transitioned exclusively into raw candlestick mechanics: identifying where buy-side and sell-side liquidity rests, understanding Fair Value Gaps (FVG), orderblocks, and how market makers sweep retail stop-losses before initiating major directional moves.',
          takeaway: 'Key Lesson: When you understand where liquidity is trapped, your entries align with institutional momentum.',
        },
        {
          phase: 'Phase 03',
          title: 'Asymmetric Risk Management Architecture',
          subtitle: 'Mathematics and capital preservation first',
          description:
            'A trading edge is worthless without ironclad risk discipline. Ajay formalized a strict mathematical execution framework: minimum 1:2 to 1:3 risk-to-reward parameters, pre-calculated position sizing, maximum daily loss boundaries, and mandatory trading journals.',
          takeaway: 'Key Lesson: Trading is not about predicting every turn—it is about keeping losses small, managing risk, and executing with consistency.',
        },
        {
          phase: 'Phase 04',
          title: 'Mentorship & The AJT77 / AjayTrades77 Community',
          subtitle: 'Transparent, zero-hype trader education',
          description:
            'Founded AJT77 to provide an authentic, hype-free alternative to the get-rich-quick deceptions prevalent in trading media. Today, Ajay actively mentors serious students through structured curriculums (AJT77 Basic & Pro) and is authoring the comprehensive publication "Trading Master".',
          takeaway: 'Key Lesson: Sustainable trading is a professional craft requiring deep study, emotional stability, and continuous review.',
        },
      ];

  return (
    <section id="journey" className="py-24 bg-[#07090e] border-b border-slate-800/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-mono">
            <Compass className="w-3.5 h-3.5" />
            <span>{journey?.sectionBadge || 'THE MENTOR & THE METHODOLOGY'}</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            {journey?.sectionTitle || 'Trading Journey & Philosophy'}
          </h2>
          <p className="text-base text-slate-400 leading-relaxed">
            {journey?.sectionDescription || 'The authentic path of Ajay Gadhe (AjayTrades77 / AJT77): From retail misconceptions to systematic institutional price action, disciplined execution, and transparent mentorship.'}
          </p>
        </div>

        {/* Mentor Profile Overview Card */}
        <div className="bg-gradient-to-br from-slate-900 via-[#0b0f19] to-slate-950 border border-slate-800 rounded-3xl p-8 sm:p-12 mb-16 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-4 flex flex-col items-center text-center lg:items-start lg:text-left space-y-4">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 p-1 shadow-xl shadow-sky-950/80">
                <div className="w-full h-full bg-[#090d16] rounded-[14px] flex items-center justify-center">
                  <span className="text-4xl font-extrabold text-white tracking-tight">
                    {(journey?.mentorName || 'Ajay Gadhe').split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">{journey?.mentorName || 'Ajay Gadhe'}</h3>
                <p className="text-sm font-mono text-sky-400 mt-0.5 font-semibold">{journey?.mentorTitle || 'Founder • AjayTrades77 • AJT77'}</p>
                <p className="text-xs text-slate-400 mt-2">{journey?.mentorRole || 'Full-Time Price Action Trader & Educator'}</p>
              </div>
            </div>

            <div className="lg:col-span-8 space-y-4 text-slate-300 text-sm sm:text-base leading-relaxed border-t lg:border-t-0 lg:border-l border-slate-800 lg:pl-8 pt-6 lg:pt-0 font-normal">
              <p className="text-slate-200">
                &ldquo;{journey?.quote1 || 'Trading is not about predicting every move. It is about understanding price, waiting for the right conditions, managing risk, and executing with discipline.'}&rdquo;
              </p>
              <p className="text-slate-300">
                {journey?.quote2 || 'AJT77 is built around a simple philosophy: learn the market before trying to master it. My approach focuses on price action, market structure, liquidity, ICT & SMC concepts, multi-timeframe analysis, and disciplined risk management.'}
              </p>
              <p className="text-slate-400">
                {journey?.quote3 || 'The goal is not shortcuts or unrealistic promises. The goal is to build a clear process, develop consistency, and make decisions with greater confidence and control.'}
              </p>
            </div>
          </div>
        </div>

        {/* 4 Core Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-20">
          {pillars.map((p, idx) => {
            const Icon = pillarIcons[idx % pillarIcons.length];
            return (
              <div
                key={idx}
                className="bg-slate-900/70 border border-slate-800/90 hover:border-slate-700/90 rounded-2xl p-6 transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-white mb-2">{p.title}</h4>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{p.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Chronological Evolutionary Timeline */}
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Evolution of an Edge
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              How years of market engagement forged the structured AJT77 curriculum
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {phases.map((phase, idx) => (
              <div
                key={idx}
                className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 sm:p-8 flex flex-col justify-between hover:border-slate-700 transition-all space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-md bg-sky-500/10 border border-sky-500/20 text-sky-400 font-mono text-xs font-bold">
                      {phase.phase}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">{phase.subtitle}</span>
                  </div>
                  <h4 className="text-lg sm:text-xl font-bold text-white">{phase.title}</h4>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    {phase.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80">
                  <p className="text-xs font-medium text-emerald-400/90 leading-normal flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{phase.takeaway}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
