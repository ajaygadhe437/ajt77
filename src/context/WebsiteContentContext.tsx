import React, { createContext, useContext, useState, useEffect } from 'react';
import { requestApi } from '../lib/api';
import type { SiteContent } from '../types';

export const DEFAULT_SITE_CONTENT: SiteContent = {
  brandName: 'AJT77',
  subBrand: 'AjayTrades77',
  founderName: 'Ajay Gadhe',
  logoText: 'AJT77',
  logoBadge: '77',
  seoTitle: 'AJT77 — AjayTrades77 | Professional Price Action & Risk Architecture',
  seoDescription: 'Official education platform by Ajay Gadhe (AjayTrades77). Master market structure, institutional liquidity sweeps, and disciplined risk architecture.',
  supportEmail: 'support@ajt77.com',
  supportPhone: '+91 83908 23386',
  whatsappNumber: '+918390823386',
  canonicalUrl: 'https://ajt77.com',
  sectionVisibility: {
    hero: true,
    courses: true,
    journey: true,
    book: true,
    contact: true,
    disclaimerBanner: true,
  },
  sectionOrder: ['hero', 'courses', 'journey', 'book', 'contact'],
  hero: {
    badge: 'AJT77 • Institutional Price Action & Risk Architecture',
    titlePrimary: 'Master Markets Through',
    titleGradient: 'Pure Price Action.',
    mentorLine: 'Ajay Gadhe | Trader & Mentor | AjayTrades77',
    description: 'Systematic market understanding built on raw orderflow, liquidity sweep mechanics, and mathematically disciplined risk control. No retail indicator noise, no artificial promises—just structured, transparent execution education.',
    ctaPrimaryText: 'Explore Official Courses',
    ctaSecondaryText: 'Trading Journey',
    ctaTertiaryText: 'Trading Master (Book)',
    statMethodology: 'Raw Price Action',
    statBasicPriceLabel: '₹6,000 INR',
    statProPriceLabel: '₹10,000 INR',
    statVerificationLabel: 'Razorpay Live',
  },
  journey: {
    sectionBadge: 'THE MENTOR & THE METHODOLOGY',
    sectionTitle: 'Trading Journey & Philosophy',
    sectionDescription: 'The authentic path of Ajay Gadhe (AjayTrades77 / AJT77): From retail misconceptions to systematic institutional price action, disciplined execution, and transparent mentorship.',
    mentorName: 'Ajay Gadhe',
    mentorTitle: 'Founder • AjayTrades77 • AJT77',
    mentorRole: 'Full-Time Price Action Trader & Educator',
    quote1: 'Trading is not about predicting every move. It is about understanding price, waiting for the right conditions, managing risk, and executing with discipline.',
    quote2: 'AJT77 is built around a simple philosophy: learn the market before trying to master it. My approach focuses on price action, market structure, liquidity, ICT & SMC concepts, multi-timeframe analysis, and disciplined risk management.',
    quote3: 'The goal is not shortcuts or unrealistic promises. The goal is to build a clear process, develop consistency, and make decisions with greater confidence and control.',
    pillars: [
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
    ],
    phases: [
      {
        phase: 'Phase 01',
        title: 'The Retail Indicator Trap & Realization',
        subtitle: 'Unlearning lagging indicators and noise',
        description: 'Like many market participants, Ajay started exploring standard retail tools—RSI divergence, MACD crossovers, and complex moving average ribbons. The breaking point was realizing that all indicators merely lag price, obscuring what actually drives markets: orders, liquidity, and human psychology.',
        takeaway: 'Key Lesson: Stop looking at lagging formulas. Price alone reflects real-time institutional commitment.',
      },
      {
        phase: 'Phase 02',
        title: 'Institutional Orderflow & Liquidity Mapping',
        subtitle: 'Understanding market maker footprints',
        description: 'Transitioned exclusively into raw candlestick mechanics: identifying where buy-side and sell-side liquidity rests, understanding Fair Value Gaps (FVG), orderblocks, and how market makers sweep retail stop-losses before initiating major directional moves.',
        takeaway: 'Key Lesson: When you understand where liquidity is trapped, your entries align with institutional momentum.',
      },
      {
        phase: 'Phase 03',
        title: 'Asymmetric Risk Management Architecture',
        subtitle: 'Mathematics and capital preservation first',
        description: 'A trading edge is worthless without ironclad risk discipline. Ajay formalized a strict mathematical execution framework: minimum 1:2 to 1:3 risk-to-reward parameters, pre-calculated position sizing, maximum daily loss boundaries, and mandatory trading journals.',
        takeaway: 'Key Lesson: Trading is not about predicting every turn—it is about keeping losses small, managing risk, and executing with consistency.',
      },
      {
        phase: 'Phase 04',
        title: 'Mentorship & The AJT77 / AjayTrades77 Community',
        subtitle: 'Transparent, zero-hype trader education',
        description: 'Founded AJT77 to provide an authentic, hype-free alternative to the get-rich-quick deceptions prevalent in trading media. Today, Ajay actively mentors serious students through structured curriculums (AJT77 Basic & Pro) and is authoring the comprehensive publication "Trading Master".',
        takeaway: 'Key Lesson: Sustainable trading is a professional craft requiring deep study, emotional stability, and continuous review.',
      },
    ],
  },
  legal: {
    disclaimerNoticeTitle: 'Regulatory Risk Disclosure & Educational Notice:',
    disclaimerNoticeText: 'Trading derivatives, equities, currencies, commodities, and digital assets involves significant financial risk and is not suitable for all investors. Capital loss can equal or exceed deposited funds. All content, technical breakdowns, course curriculums, and setup observations shared across AJT77 / AjayTrades77 / Ajay Gadhe are provided exclusively for educational and illustrative purposes.',
    disclaimerNoticeWarning: 'Past performance, verified prop statements, and historical payout certificates are not indicative or guarantees of future results. We do not provide financial advice, SEBI-registered portfolio management, tips, or guaranteed profit schemes. You are solely responsible for your own trading and risk management decisions.',
    fullDisclaimerHtml: '',
    termsConditionsHtml: '',
    privacyPolicyHtml: '',
  },
};

interface WebsiteContentContextType {
  content: SiteContent;
  isLoading: boolean;
  refreshContent: () => Promise<void>;
  updateLiveContent: (newContent: SiteContent) => void;
}

const WebsiteContentContext = createContext<WebsiteContentContextType>({
  content: DEFAULT_SITE_CONTENT,
  isLoading: true,
  refreshContent: async () => {},
  updateLiveContent: () => {},
});

export const WebsiteContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [content, setContent] = useState<SiteContent>(DEFAULT_SITE_CONTENT);
  const [isLoading, setIsLoading] = useState(true);

  const fetchContent = async () => {
    try {
      const data = await requestApi<SiteContent>('/api/site-content');
      if (data) {
        setContent((prev) => ({
          ...DEFAULT_SITE_CONTENT,
          ...data,
          sectionVisibility: {
            ...DEFAULT_SITE_CONTENT.sectionVisibility,
            ...(data.sectionVisibility || {}),
          },
          hero: {
            ...DEFAULT_SITE_CONTENT.hero,
            ...(data.hero || {}),
          },
          journey: {
            ...DEFAULT_SITE_CONTENT.journey,
            ...(data.journey || {}),
          },
          legal: {
            ...DEFAULT_SITE_CONTENT.legal,
            ...(data.legal || {}),
          },
        }));

        // Dynamic Document Title and Meta tags sync
        if (data.seoTitle) {
          document.title = data.seoTitle;
        }
        if (data.seoDescription) {
          const metaDesc = document.querySelector('meta[name="description"]');
          if (metaDesc) {
            metaDesc.setAttribute('content', data.seoDescription);
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch site content, using default:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const updateLiveContent = (newContent: SiteContent) => {
    setContent(newContent);
    if (newContent.seoTitle) {
      document.title = newContent.seoTitle;
    }
  };

  return (
    <WebsiteContentContext.Provider
      value={{
        content,
        isLoading,
        refreshContent: fetchContent,
        updateLiveContent,
      }}
    >
      {children}
    </WebsiteContentContext.Provider>
  );
};

export const useWebsiteContent = () => useContext(WebsiteContentContext);
