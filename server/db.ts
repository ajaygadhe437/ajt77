import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import type {
  OrderRecord,
  ChartRecord,
  TrackRecordDocument,
  CourseRecord,
  CourseEnquiry,
  ContactMessage,
  BookRecord,
  SocialLink,
  AuditLog,
  AdminUser,
  WaitlistRecord,
  EmailLog,
  SiteContent,
} from '../src/types';

interface DatabaseSchema {
  orders: OrderRecord[];
  charts: ChartRecord[];
  trackRecords: TrackRecordDocument[];
  courses: CourseRecord[];
  enquiries: CourseEnquiry[];
  messages: ContactMessage[];
  waitlist: WaitlistRecord[];
  book: BookRecord;
  socialLinks: SocialLink[];
  adminUsers: AdminUser[];
  auditLogs: AuditLog[];
  emailLogs: EmailLog[];
  siteSettings: Record<string, string>;
  siteContent: SiteContent;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const INITIAL_DATA: DatabaseSchema = {
  orders: [],
  courses: [
    {
      id: 'course_ajt77_basic',
      name: 'AJT77 Basic',
      slug: 'ajt77-basic',
      short_description: 'Beginner to Advanced Price Action Education. Zero to 100 Trading Foundation.',
      description: 'The definitive foundation for trading financial markets systematically. Master institutional price action, liquidity sweeps, market structure shifts, supply and demand dynamics, and disciplined risk calculation.',
      price: 6000,
      currency: 'INR',
      level: 'Beginner to Advanced (Zero to 100)',
      features: [
        'Complete Price Action Framework (Zero to 100)',
        'Market Structure, Swings & Liquidity Concept Mapping',
        'High-Probability Key Level & Fair Value Gap Recognition',
        'Multi-Timeframe Top-Down Analysis Process',
        'Standard Risk Management & Position Sizing Calculator',
        'Trading Journaling & Psychological Discipline System',
        'Lifetime Access to Future Core Curriculum Updates',
        'Community Forum & Q&A Discussion Access'
      ],
      is_featured: true,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'course_ajt77_pro',
      name: 'AJT77 Pro',
      slug: 'ajt77-pro',
      short_description: 'Mastery & Execution Framework. Daily Educational Setup Guidance & Live Context.',
      description: 'Comprehensive pro-tier trading education. Includes everything in AJT77 Basic plus execution framework, advanced risk-management architecture, market-condition-based setup guidance, and 1–2 educational setup ideas per day when appropriate and available.',
      price: 10000,
      currency: 'INR',
      level: 'Advanced & Execution Mastery',
      features: [
        'Everything included in AJT77 Basic',
        'Live Execution Framework & Orderflow Nuances',
        'Advanced Risk-Management & Dynamic Capital Allocation Model',
        'Market-Condition-Based Setup Guidance',
        '1–2 Educational Setup Ideas Per Day (Market-dependent)',
        'Detailed Trade Invalidation & Trailing Rules',
        'Weekly Market Breakdown & Session Debriefs',
        'Priority Direct Mentor Interaction & Case Study Breakdowns'
      ],
      is_featured: true,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  charts: [
    {
      id: 'chart_1',
      title: 'NIFTY 50 Daily Liquidity Sweep & Demand Zone Confirmation',
      slug: 'nifty-50-daily-liquidity-sweep',
      instrument: 'NIFTY 50',
      market: 'Indian Equities',
      timeframe: '1D',
      analysis: 'Price swept the previous week low creating a liquidity grab into the institutional 0.618 demand zone. Clean bullish shift observed on 15m trigger timeframe.',
      entry: '22,480.00',
      stop_loss: '22,340.00',
      target: '22,820.00',
      risk_reward: '1 : 2.43',
      chart_image_url: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=1200&q=80',
      status: 'PUBLISHED',
      published_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      created_by: 'Ajay Gadhe',
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: 'chart_2',
      title: 'BANKNIFTY 15m Range Compression & Morning Session Breakout',
      slug: 'banknifty-15m-range-compression',
      instrument: 'BANKNIFTY',
      market: 'Indian Equities',
      timeframe: '15m',
      analysis: 'Prolonged consolidation near 48,200 resistance followed by clean absorption of selling volume. Breakout with strong momentum candle confirming continuation.',
      entry: '48,250.00',
      stop_loss: '48,080.00',
      target: '48,700.00',
      risk_reward: '1 : 2.65',
      chart_image_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
      status: 'PUBLISHED',
      published_at: new Date(Date.now() - 86400000 * 4).toISOString(),
      created_by: 'Ajay Gadhe',
      created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    },
    {
      id: 'chart_3',
      title: 'EURUSD 4H Fair Value Gap Mitigation & Bearish Structure Continuation',
      slug: 'eurusd-4h-fvg-mitigation',
      instrument: 'EUR/USD',
      market: 'Forex',
      timeframe: '4H',
      analysis: 'Higher-timeframe bearish orderblock respected. Clean mitigation of the 4H imbalance followed by displacement to the downside targeting sell-side liquidity.',
      entry: '1.08750',
      stop_loss: '1.09020',
      target: '1.07900',
      risk_reward: '1 : 3.15',
      chart_image_url: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=80',
      status: 'PUBLISHED',
      published_at: new Date(Date.now() - 86400000 * 6).toISOString(),
      created_by: 'Ajay Gadhe',
      created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 6).toISOString(),
    },
  ],
  trackRecords: [
    {
      id: 'tr_1',
      title: 'Official Prop Trading Milestone & Certified Performance Certificate',
      category: 'MILESTONE',
      description: 'Verified milestone certificate acknowledging completion of advanced risk parameters and structured trading rules. Redacted to ensure sensitive personal IDs and account numbers remain private.',
      document_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80',
      thumbnail_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
      document_date: '2024-11-15',
      status: 'PUBLISHED',
      redaction_confirmed: true,
      created_by: 'Ajay Gadhe',
      created_at: new Date(Date.now() - 86400000 * 15).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 15).toISOString(),
    },
    {
      id: 'tr_2',
      title: 'Trading Account Performance Summary Statement (Redacted)',
      category: 'TRADING_STATEMENT',
      description: 'Verified monthly performance audit detailing strict drawdown management, disciplined trade frequency, and risk-to-reward consistency over consecutive quarters.',
      document_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
      thumbnail_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
      document_date: '2024-09-30',
      status: 'PUBLISHED',
      redaction_confirmed: true,
      created_by: 'Ajay Gadhe',
      created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 30).toISOString(),
    },
    {
      id: 'tr_3',
      title: 'Audited Payout Confirmation Receipt Record',
      category: 'PAYOUT',
      description: 'Official verified payout confirmation statement demonstrating execution consistency. Sensitive bank identifiers and private routing codes strictly redacted.',
      document_url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80',
      thumbnail_url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80',
      document_date: '2024-07-18',
      status: 'PUBLISHED',
      redaction_confirmed: true,
      created_by: 'Ajay Gadhe',
      created_at: new Date(Date.now() - 86400000 * 60).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 60).toISOString(),
    },
  ],
  enquiries: [],
  messages: [],
  waitlist: [],
  book: {
    id: 'book_trading_master',
    title: 'AJAY TRADES ICT & SMC TRADING MASTERBOOK',
    slug: 'trading-master',
    description: 'The official ICT & SMC Price Action Masterbook by Ajay Gadhe (AjayTrades77). A complete beginner-to-advanced blueprint covering institutional Order Blocks, Liquidity Sweeps, Fair Value Gaps (FVG), Market Structure (BOS/CHoCH), and Systematic Risk Management.',
    cover_image_url: '/trading-master-cover.png',
    status: 'COMING_SOON',
    release_date: 'Coming Soon',
    waitlist_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  socialLinks: [
    {
      id: 'soc_yt',
      platform: 'YouTube',
      label: '@ajaytrades77',
      url: 'https://youtube.com/@ajaytrades77?si=3piKHv2eHqB_A_4S',
      is_active: true,
      display_order: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'soc_ig1',
      platform: 'Instagram',
      label: '@ajaytrades_77',
      url: 'https://www.instagram.com/ajaytrades_77?stkn=eHVreHA3MDQ4cHNl',
      is_active: true,
      display_order: 2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'soc_ig2',
      platform: 'Instagram',
      label: '@ajaytrades77',
      url: 'https://www.instagram.com/ajaytrades77?stkn=MW9yYm00cmh4NHc4Nw==',
      is_active: true,
      display_order: 3,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'soc_li',
      platform: 'LinkedIn',
      label: 'Ajay Gadhe',
      url: 'https://www.linkedin.com/in/ajay-gadhe-703066361',
      is_active: true,
      display_order: 4,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'soc_x',
      platform: 'X',
      label: '@AjayTrades77',
      url: 'https://x.com/AjayTrades77',
      is_active: true,
      display_order: 5,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'soc_dc',
      platform: 'Discord',
      label: 'AJT77 Official Discord',
      url: 'https://discord.gg/ESDzAbxBNZ',
      is_active: true,
      display_order: 6,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  adminUsers: [
    {
      id: 'usr_super_admin',
      email: process.env.ADMIN_EMAIL || 'ajaygadhe437@gmail.com',
      role: 'SUPER_ADMIN',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  auditLogs: [
    {
      id: 'audit_init',
      admin_user_id: 'system',
      action: 'SYSTEM_INITIALIZED',
      entity_type: 'SYSTEM',
      entity_id: 'ajt77_core',
      metadata: { initialized: true, brand: 'AJT77 / AjayTrades77' },
      ip_address: '127.0.0.1',
      user_agent: 'Server Bootstrapper',
      created_at: new Date().toISOString(),
    },
  ],
  emailLogs: [],
  siteSettings: {
    brand_name: 'AJT77',
    sub_brand: 'AjayTrades77',
    founder_name: 'Ajay Gadhe',
    canonical_url: process.env.SITE_URL || 'https://ais-pre-zxgpvmltr76ymnbu553qhr-114491070892.asia-east1.run.app',
    razorpay_status: 'ACTIVE_LIVE',
  },
  siteContent: {
    brandName: 'AJT77',
    subBrand: 'AjayTrades77',
    founderName: 'Ajay Gadhe',
    logoText: 'AJT77',
    logoBadge: '77',
    seoTitle: 'AJT77 — AjayTrades77 | Professional Price Action & Risk Architecture',
    seoDescription: 'Official education platform by Ajay Gadhe (AjayTrades77). Master market structure, institutional liquidity sweeps, and disciplined risk architecture.',
    supportEmail: 'support@ajt77.com',
    supportPhone: '+91 83908 23386',
    whatsappNumber: process.env.SUPPORT_WHATSAPP_NUMBER || '+918390823386',
    canonicalUrl: process.env.SITE_URL || 'https://ais-pre-zxgpvmltr76ymnbu553qhr-114491070892.asia-east1.run.app',
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
  },
};

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDirExists();
    this.data = this.loadData();
  }

  private ensureDirExists() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          ...INITIAL_DATA,
          ...parsed,
          waitlist: Array.isArray(parsed.waitlist) ? parsed.waitlist : [],
          emailLogs: Array.isArray(parsed.emailLogs) ? parsed.emailLogs : [],
          book: {
            ...INITIAL_DATA.book,
            ...(parsed.book || {}),
            release_date: 'Coming Soon',
          },
          courses: INITIAL_DATA.courses.map((c) => {
            const found = (parsed.courses || []).find((pc: CourseRecord) => pc.id === c.id);
            return found || c;
          }),
          siteContent: {
            ...INITIAL_DATA.siteContent,
            ...(parsed.siteContent || {}),
            sectionVisibility: {
              ...INITIAL_DATA.siteContent.sectionVisibility,
              ...(parsed.siteContent?.sectionVisibility || {}),
            },
            hero: {
              ...INITIAL_DATA.siteContent.hero,
              ...(parsed.siteContent?.hero || {}),
            },
            journey: {
              ...INITIAL_DATA.siteContent.journey,
              ...(parsed.siteContent?.journey || {}),
            },
            legal: {
              ...INITIAL_DATA.siteContent.legal,
              ...(parsed.siteContent?.legal || {}),
            },
          },
        };
      }
    } catch (err) {
      console.error('Error loading database, initializing fresh data:', err);
    }
    this.saveData(INITIAL_DATA);
    return INITIAL_DATA;
  }

  private saveData(data: DatabaseSchema) {
    try {
      const tempFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tempFile, DB_FILE);
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  // --- Orders ---
  public createOrder(order: OrderRecord): OrderRecord {
    this.data.orders.unshift(order);
    this.saveData(this.data);
    return order;
  }

  public getOrderById(id: string): OrderRecord | undefined {
    return this.data.orders.find((o) => o.id === id);
  }

  public getOrderByRazorpayOrderId(rzpOrderId: string): OrderRecord | undefined {
    return this.data.orders.find((o) => o.razorpay_order_id === rzpOrderId);
  }

  public updateOrder(id: string, updates: Partial<OrderRecord>): OrderRecord | null {
    const idx = this.data.orders.findIndex((o) => o.id === id);
    if (idx === -1) return null;
    this.data.orders[idx] = {
      ...this.data.orders[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.saveData(this.data);
    return this.data.orders[idx];
  }

  public listOrders(): OrderRecord[] {
    return [...this.data.orders];
  }

  // --- Charts ---
  public listCharts(includeAll = false): ChartRecord[] {
    if (includeAll) return [...this.data.charts];
    return this.data.charts.filter((c) => c.status === 'PUBLISHED');
  }

  public getChartBySlug(slug: string): ChartRecord | undefined {
    return this.data.charts.find((c) => c.slug === slug);
  }

  public getChartById(id: string): ChartRecord | undefined {
    return this.data.charts.find((c) => c.id === id);
  }

  public createChart(chart: ChartRecord): ChartRecord {
    this.data.charts.unshift(chart);
    this.saveData(this.data);
    return chart;
  }

  public updateChart(id: string, updates: Partial<ChartRecord>): ChartRecord | null {
    const idx = this.data.charts.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    this.data.charts[idx] = {
      ...this.data.charts[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.saveData(this.data);
    return this.data.charts[idx];
  }

  public deleteChart(id: string): boolean {
    const initialLen = this.data.charts.length;
    this.data.charts = this.data.charts.filter((c) => c.id !== id);
    if (this.data.charts.length !== initialLen) {
      this.saveData(this.data);
      return true;
    }
    return false;
  }

  // --- Track Records ---
  public listTrackRecords(includeAll = false): TrackRecordDocument[] {
    if (includeAll) return [...this.data.trackRecords];
    return this.data.trackRecords.filter((t) => t.status === 'PUBLISHED');
  }

  public createTrackRecord(record: TrackRecordDocument): TrackRecordDocument {
    this.data.trackRecords.unshift(record);
    this.saveData(this.data);
    return record;
  }

  public updateTrackRecord(id: string, updates: Partial<TrackRecordDocument>): TrackRecordDocument | null {
    const idx = this.data.trackRecords.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    this.data.trackRecords[idx] = {
      ...this.data.trackRecords[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.saveData(this.data);
    return this.data.trackRecords[idx];
  }

  public deleteTrackRecord(id: string): boolean {
    const len = this.data.trackRecords.length;
    this.data.trackRecords = this.data.trackRecords.filter((t) => t.id !== id);
    if (this.data.trackRecords.length !== len) {
      this.saveData(this.data);
      return true;
    }
    return false;
  }

  // --- Courses ---
  public listCourses(): CourseRecord[] {
    return [...this.data.courses];
  }

  public getCourseBySlug(slug: string): CourseRecord | undefined {
    return this.data.courses.find((c) => c.slug === slug);
  }

  public updateCourse(id: string, updates: Partial<CourseRecord>): CourseRecord | null {
    const idx = this.data.courses.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    this.data.courses[idx] = {
      ...this.data.courses[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.saveData(this.data);
    return this.data.courses[idx];
  }

  // --- Enquiries ---
  public createEnquiry(enquiry: CourseEnquiry): CourseEnquiry {
    this.data.enquiries.unshift(enquiry);
    this.saveData(this.data);
    return enquiry;
  }

  public listEnquiries(): CourseEnquiry[] {
    return [...this.data.enquiries];
  }

  public updateEnquiryStatus(id: string, status: CourseEnquiry['status']): CourseEnquiry | null {
    const idx = this.data.enquiries.findIndex((e) => e.id === id);
    if (idx === -1) return null;
    this.data.enquiries[idx].status = status;
    this.data.enquiries[idx].updated_at = new Date().toISOString();
    this.saveData(this.data);
    return this.data.enquiries[idx];
  }

  // --- Messages ---
  public createMessage(msg: ContactMessage): ContactMessage {
    this.data.messages.unshift(msg);
    this.saveData(this.data);
    return msg;
  }

  public listMessages(): ContactMessage[] {
    return [...this.data.messages];
  }

  public updateMessageStatus(id: string, status: ContactMessage['status']): ContactMessage | null {
    const idx = this.data.messages.findIndex((m) => m.id === id);
    if (idx === -1) return null;
    this.data.messages[idx].status = status;
    this.data.messages[idx].updated_at = new Date().toISOString();
    this.saveData(this.data);
    return this.data.messages[idx];
  }

  // --- Book (Trading Master) ---
  public getBook(): BookRecord {
    return this.data.book;
  }

  public updateBook(updates: Partial<BookRecord>): BookRecord {
    this.data.book = {
      ...this.data.book,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.saveData(this.data);
    return this.data.book;
  }

  public incrementWaitlist(): number {
    this.data.book.waitlist_count = (this.data.book.waitlist_count || 0) + 1;
    this.data.book.updated_at = new Date().toISOString();
    this.saveData(this.data);
    return this.data.book.waitlist_count;
  }

  // --- Waitlist ---
  public findWaitlistByEmail(email: string): WaitlistRecord | undefined {
    const clean = (email || '').trim().toLowerCase();
    if (!this.data.waitlist) return undefined;
    return this.data.waitlist.find((w) => w.email.toLowerCase() === clean);
  }

  public createWaitlistEntry(name: string, email: string): { entry: WaitlistRecord; isNew: boolean } {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    if (!this.data.waitlist) {
      this.data.waitlist = [];
    }

    const existing = this.findWaitlistByEmail(cleanEmail);
    if (existing) {
      return { entry: existing, isNew: false };
    }

    const entry: WaitlistRecord = {
      id: `wtl_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      name: cleanName,
      email: cleanEmail,
      status: 'CONFIRMED',
      created_at: new Date().toISOString(),
    };

    this.data.waitlist.unshift(entry);
    this.data.book.waitlist_count = this.data.waitlist.length;
    this.saveData(this.data);
    return { entry, isNew: true };
  }

  public listWaitlist(): WaitlistRecord[] {
    return this.data.waitlist || [];
  }

  // --- Social Links ---
  public listSocialLinks(): SocialLink[] {
    return [...this.data.socialLinks].sort((a, b) => a.display_order - b.display_order);
  }

  public updateSocialLink(id: string, updates: Partial<SocialLink>): SocialLink | null {
    const idx = this.data.socialLinks.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    this.data.socialLinks[idx] = {
      ...this.data.socialLinks[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.saveData(this.data);
    return this.data.socialLinks[idx];
  }

  // --- Audit Logs ---
  public logAudit(log: Omit<AuditLog, 'id' | 'created_at'>): AuditLog {
    const newLog: AuditLog = {
      ...log,
      id: `audit_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      created_at: new Date().toISOString(),
    };
    this.data.auditLogs.unshift(newLog);
    // Keep max 500 audit logs
    if (this.data.auditLogs.length > 500) {
      this.data.auditLogs = this.data.auditLogs.slice(0, 500);
    }
    this.saveData(this.data);
    return newLog;
  }

  public listAuditLogs(): AuditLog[] {
    return [...this.data.auditLogs];
  }

  // --- Email Logs ---
  public logEmail(log: Omit<EmailLog, 'id' | 'created_at'>): EmailLog {
    const newLog: EmailLog = {
      ...log,
      id: `elog_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      created_at: new Date().toISOString(),
    };
    if (!this.data.emailLogs) {
      this.data.emailLogs = [];
    }
    this.data.emailLogs.unshift(newLog);
    // Keep max 1000 email logs
    if (this.data.emailLogs.length > 1000) {
      this.data.emailLogs = this.data.emailLogs.slice(0, 1000);
    }
    this.saveData(this.data);
    return newLog;
  }

  public listEmailLogs(limit: number = 100): EmailLog[] {
    return (this.data.emailLogs || []).slice(0, limit);
  }

  // --- Site Settings ---
  public getSettings(): Record<string, string> {
    return { ...this.data.siteSettings };
  }

  public updateSettings(settings: Record<string, string>): Record<string, string> {
    this.data.siteSettings = {
      ...this.data.siteSettings,
      ...settings,
    };
    this.saveData(this.data);
    return this.data.siteSettings;
  }

  // --- Site Content (Full Website CMS) ---
  public getSiteContent(): SiteContent {
    return { ...this.data.siteContent };
  }

  public updateSiteContent(updates: Partial<SiteContent>): SiteContent {
    this.data.siteContent = {
      ...this.data.siteContent,
      ...updates,
      sectionVisibility: {
        ...this.data.siteContent.sectionVisibility,
        ...(updates.sectionVisibility || {}),
      },
      hero: {
        ...this.data.siteContent.hero,
        ...(updates.hero || {}),
      },
      journey: {
        ...this.data.siteContent.journey,
        ...(updates.journey || {}),
      },
      legal: {
        ...this.data.siteContent.legal,
        ...(updates.legal || {}),
      },
      updatedAt: new Date().toISOString(),
    };
    this.saveData(this.data);
    return this.data.siteContent;
  }
}

export const db = new Database();
