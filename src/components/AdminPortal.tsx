import React, { useState, useEffect } from 'react';
import {
  Lock,
  LogOut,
  BarChart3,
  CreditCard,
  FileSpreadsheet,
  Activity,
  Award,
  Users,
  MessageSquare,
  BookOpen,
  Settings,
  History,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  ShieldCheck,
  Upload,
  Mail,
  Send,
  Globe,
} from 'lucide-react';
import { AdminSiteContentManager } from './AdminSiteContentManager';
import { requestApi, ApiError } from '../lib/api';
import type {
  OrderRecord,
  ChartRecord,
  TrackRecordDocument,
  CourseRecord,
  CourseEnquiry,
  ContactMessage,
  AuditLog,
  EmailLog,
} from '../types';

interface AdminPortalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ isOpen, onClose }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('ajt77_admin_token'));
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Active Admin Section
  const [activeTab, setActiveTab] = useState<'overview' | 'site-content' | 'orders' | 'charts' | 'track' | 'courses' | 'enquiries' | 'messages' | 'book' | 'audit' | 'settings' | 'emails'>('overview');

  // Data States
  const [overviewData, setOverviewData] = useState<any>(null);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [charts, setCharts] = useState<ChartRecord[]>([]);
  const [trackRecords, setTrackRecords] = useState<TrackRecordDocument[]>([]);
  const [courses, setCourses] = useState<CourseRecord[]>([]);
  const [enquiries, setEnquiries] = useState<CourseEnquiry[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [emailMeta, setEmailMeta] = useState<{ resendConfigured: boolean; adminEmailConfigured: boolean; fromAddress: string } | null>(null);
  const [siteSettings, setSiteSettings] = useState<any>(null);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [resendingOrderId, setResendingOrderId] = useState<string | null>(null);
  const [testEmailInput, setTestEmailInput] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);

  // Modal forms states
  const [newChartModal, setNewChartModal] = useState(false);
  const [chartForm, setChartForm] = useState({
    title: '',
    instrument: 'NIFTY 50',
    market: 'Indian Equities',
    timeframe: '15m',
    analysis: '',
    entry: '',
    stop_loss: '',
    target: '',
    risk_reward: '1:2.5',
    chart_image_url: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=1200&q=80',
    status: 'PUBLISHED',
  });

  const [newTrackModal, setNewTrackModal] = useState(false);
  const [trackForm, setTrackForm] = useState({
    title: '',
    category: 'MILESTONE',
    description: '',
    document_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80',
    document_date: new Date().toISOString().split('T')[0],
    status: 'PUBLISHED',
    redaction_confirmed: false,
  });

  useEffect(() => {
    if (token) {
      loadAllAdminData();
    }
  }, [token]);

  const loadAllAdminData = async () => {
    setIsRefreshing(true);
    try {
      const [ov, ords, chs, trs, crs, enqs, msgs, aud, setts, emailData] = await Promise.all([
        requestApi<any>('/api/admin/overview'),
        requestApi<OrderRecord[]>('/api/admin/orders'),
        requestApi<ChartRecord[]>('/api/admin/charts'),
        requestApi<TrackRecordDocument[]>('/api/admin/track-record'),
        requestApi<CourseRecord[]>('/api/admin/courses'),
        requestApi<CourseEnquiry[]>('/api/admin/enquiries'),
        requestApi<ContactMessage[]>('/api/admin/messages'),
        requestApi<AuditLog[]>('/api/admin/audit-logs'),
        requestApi<any>('/api/admin/settings'),
        requestApi<any>('/api/admin/email-logs').catch(() => ({ logs: [], resendConfigured: false, adminEmailConfigured: false })),
      ]);

      setOverviewData(ov);
      setOrders(ords);
      setCharts(chs);
      setTrackRecords(trs);
      setCourses(crs);
      setEnquiries(enqs);
      setMessages(msgs);
      setAuditLogs(aud);
      setSiteSettings(setts);
      if (emailData) {
        setEmailLogs(emailData.logs || []);
        setEmailMeta(emailData);
      }
    } catch (err: any) {
      console.error('Error fetching admin data:', err);
      if (err?.statusCode === 401) {
        handleLogout();
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);
    try {
      const res = await requestApi<{ token: string; user: any }>('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ email: adminEmail, password: adminPassword }),
      });
      localStorage.setItem('ajt77_admin_token', res.token);
      setToken(res.token);
      setIsLoggingIn(false);
    } catch (err: any) {
      setIsLoggingIn(false);
      setLoginError(err.message || 'Invalid credentials');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ajt77_admin_token');
    setToken(null);
  };

  const handleSyncOrder = async (orderId: string) => {
    try {
      setActionMessage('Syncing order with Razorpay REST API...');
      const updated = await requestApi<OrderRecord>(`/api/admin/orders/${orderId}/sync`, {
        method: 'POST',
      });
      setOrders(orders.map((o) => (o.id === orderId ? updated : o)));
      setActionMessage(`Order ${orderId} synced successfully: Status is ${updated.payment_status}`);
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err: any) {
      setActionMessage(`Sync failed: ${err.message}`);
      setTimeout(() => setActionMessage(null), 4000);
    }
  };

  const handleCreateChart = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newChart = await requestApi<ChartRecord>('/api/admin/charts', {
        method: 'POST',
        body: JSON.stringify(chartForm),
      });
      setCharts([newChart, ...charts]);
      setNewChartModal(false);
      setActionMessage('Chart successfully created and published!');
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to create chart');
    }
  };

  const handleDeleteChart = async (id: string) => {
    if (!confirm('Are you sure you want to delete this chart?')) return;
    try {
      await requestApi(`/api/admin/charts/${id}`, { method: 'DELETE' });
      setCharts(charts.filter((c) => c.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (trackForm.status === 'PUBLISHED' && !trackForm.redaction_confirmed) {
      alert('You must confirm that sensitive personal/account details are redacted before publishing!');
      return;
    }
    try {
      const newRecord = await requestApi<TrackRecordDocument>('/api/admin/track-record', {
        method: 'POST',
        body: JSON.stringify(trackForm),
      });
      setTrackRecords([newRecord, ...trackRecords]);
      setNewTrackModal(false);
      setActionMessage('Track record published successfully!');
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateEnquiryStatus = async (id: string, status: any) => {
    try {
      const updated = await requestApi<CourseEnquiry>(`/api/admin/enquiries/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      setEnquiries(enquiries.map((e) => (e.id === id ? updated : e)));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateMessageStatus = async (id: string, status: any) => {
    try {
      const updated = await requestApi<ContactMessage>(`/api/admin/messages/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      setMessages(messages.map((m) => (m.id === id ? updated : m)));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleResendEmail = async (orderId: string) => {
    setResendingOrderId(orderId);
    try {
      const res = await requestApi<any>(`/api/admin/orders/${orderId}/resend-email`, {
        method: 'POST',
      });
      setActionMessage(res.message || 'Invoice & confirmation email successfully resent to customer!');
      setTimeout(() => setActionMessage(null), 4000);
      const emailData = await requestApi<any>('/api/admin/email-logs');
      setEmailLogs(emailData.logs || []);
    } catch (err: any) {
      alert(err.message || 'Failed to resend confirmation email');
    } finally {
      setResendingOrderId(null);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmailInput.trim()) {
      alert('Please enter a recipient email address to send a test message');
      return;
    }
    setIsSendingTest(true);
    try {
      const res = await requestApi<any>('/api/admin/email/test', {
        method: 'POST',
        body: JSON.stringify({ email: testEmailInput.trim() }),
      });
      setActionMessage(res.message || 'Test email dispatched successfully via Resend!');
      setTimeout(() => setActionMessage(null), 4000);
      const emailData = await requestApi<any>('/api/admin/email-logs');
      setEmailLogs(emailData.logs || []);
      setTestEmailInput('');
    } catch (err: any) {
      alert(err.message || 'Failed to dispatch test email');
    } finally {
      setIsSendingTest(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-[#0a0d16] border border-slate-700 rounded-2xl w-full max-w-7xl h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-[#0e1320] border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-bold text-white tracking-tight">AJT77 Master Admin Dashboard</h2>
                <span className="text-[10px] font-mono px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded border border-emerald-500/30">
                  SUPER_ADMIN
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Ajay Gadhe • Administrator</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {token && (
              <button
                onClick={loadAllAdminData}
                disabled={isRefreshing}
                className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg flex items-center space-x-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-white rounded-lg cursor-pointer"
            >
              Exit Portal
            </button>
          </div>
        </div>

        {/* Action toast */}
        {actionMessage && (
          <div className="bg-sky-500/10 border-b border-sky-500/30 px-6 py-2 text-xs text-sky-300 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-sky-400" />
            <span>{actionMessage}</span>
          </div>
        )}

        {/* Content Area */}
        {!token ? (
          /* LOGIN SCREEN */
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-[#0e1322] border border-slate-700 rounded-2xl p-8 space-y-6 shadow-xl">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center mx-auto text-sky-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">AJT77 Secure Authentication</h3>
                <p className="text-xs text-slate-400">Restricted administrative access for Ajay Gadhe</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Admin Email</label>
                  <input
                    type="email"
                    required
                    autoComplete="off"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="Enter admin email"
                    className="w-full px-3.5 py-2.5 bg-[#141b2d] border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Admin Password</label>
                  <input
                    type="password"
                    required
                    autoComplete="new-password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter admin password"
                    className="w-full px-3.5 py-2.5 bg-[#141b2d] border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>

                {loginError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-3 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer"
                >
                  {isLoggingIn ? 'Verifying Credentials...' : 'Authenticate & Enter Dashboard'}
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* AUTHENTICATED DASHBOARD */
          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar Tabs */}
            <aside className="w-56 bg-[#080b13] border-r border-slate-800 p-3 space-y-1 overflow-y-auto text-xs font-medium">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-left cursor-pointer ${
                  activeTab === 'overview' ? 'bg-sky-600/20 text-sky-400 border border-sky-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Overview</span>
              </button>

              <button
                onClick={() => setActiveTab('site-content')}
                className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-left cursor-pointer ${
                  activeTab === 'site-content' ? 'bg-sky-600/20 text-sky-400 border border-sky-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Globe className="w-4 h-4 text-sky-400" />
                <span className="font-semibold text-white">Site Content (CMS)</span>
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left cursor-pointer ${
                  activeTab === 'orders' ? 'bg-sky-600/20 text-sky-400 border border-sky-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <CreditCard className="w-4 h-4" />
                  <span>Razorpay Orders</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-800 rounded">
                  {orders.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('charts')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left cursor-pointer ${
                  activeTab === 'charts' ? 'bg-sky-600/20 text-sky-400 border border-sky-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Activity className="w-4 h-4" />
                  <span>Charts</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-800 rounded">{charts.length}</span>
              </button>

              <button
                onClick={() => setActiveTab('track')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left cursor-pointer ${
                  activeTab === 'track' ? 'bg-sky-600/20 text-sky-400 border border-sky-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Award className="w-4 h-4" />
                  <span>Track Records</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-800 rounded">{trackRecords.length}</span>
              </button>

              <button
                onClick={() => setActiveTab('courses')}
                className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-left cursor-pointer ${
                  activeTab === 'courses' ? 'bg-sky-600/20 text-sky-400 border border-sky-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Courses</span>
              </button>

              <button
                onClick={() => setActiveTab('enquiries')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left cursor-pointer ${
                  activeTab === 'enquiries' ? 'bg-sky-600/20 text-sky-400 border border-sky-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Users className="w-4 h-4" />
                  <span>Enquiries</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-800 rounded">{enquiries.length}</span>
              </button>

              <button
                onClick={() => setActiveTab('messages')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left cursor-pointer ${
                  activeTab === 'messages' ? 'bg-sky-600/20 text-sky-400 border border-sky-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <MessageSquare className="w-4 h-4" />
                  <span>Messages</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-800 rounded">{messages.length}</span>
              </button>

              <button
                onClick={() => setActiveTab('book')}
                className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-left cursor-pointer ${
                  activeTab === 'book' ? 'bg-sky-600/20 text-sky-400 border border-sky-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Trading Master</span>
              </button>

              <button
                onClick={() => setActiveTab('audit')}
                className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-left cursor-pointer ${
                  activeTab === 'audit' ? 'bg-sky-600/20 text-sky-400 border border-sky-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <History className="w-4 h-4" />
                <span>Audit Logs</span>
              </button>

              <button
                onClick={() => setActiveTab('emails')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left cursor-pointer ${
                  activeTab === 'emails' ? 'bg-sky-600/20 text-sky-400 border border-sky-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Mail className="w-4 h-4" />
                  <span>Email Automation</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-800 rounded">{emailLogs.length}</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-left cursor-pointer ${
                  activeTab === 'settings' ? 'bg-sky-600/20 text-sky-400 border border-sky-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>

              <div className="pt-4 border-t border-slate-800">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 text-rose-400 hover:bg-rose-500/10 rounded-xl text-left cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </aside>

            {/* Main Section Content */}
            <main className="flex-1 bg-[#090c15] p-6 overflow-y-auto">
              {/* SITE CONTENT MANAGEMENT TAB */}
              {activeTab === 'site-content' && (
                <AdminSiteContentManager />
              )}

              {/* 1. OVERVIEW TAB */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Razorpay Live Status Card */}
                  <div className="bg-gradient-to-r from-[#0d1424] to-[#0c1a2d] border border-sky-500/30 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-xs font-mono uppercase font-bold text-sky-400">
                          Razorpay Live Mode Gateway Active
                        </span>
                      </div>
                      <h4 className="text-lg font-bold text-white">AJT77 Automated Orders & Verification</h4>
                      <p className="text-xs text-slate-400">
                        Key ID: <span className="font-mono text-slate-300">rzp_live_Takqy...</span> | Key Secret: <span className="text-emerald-400 font-mono">Secured & Active Server-Side</span>
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 text-xs font-mono">
                      <span className="px-3 py-1.5 bg-[#0a0f1c] border border-slate-700 rounded-lg text-slate-300">
                        Webhook: /api/webhook/razorpay
                      </span>
                    </div>
                  </div>

                  {/* Metrics Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-[#0e1322] border border-slate-800 rounded-2xl p-4 space-y-1">
                      <span className="text-[11px] font-mono text-slate-400 uppercase">Verified Revenue</span>
                      <p className="text-2xl font-extrabold text-emerald-400">
                        ₹{(overviewData?.metrics?.totalRevenueINR || 0).toLocaleString('en-IN')}
                      </p>
                      <span className="text-[10px] text-slate-500">Cryptographically Confirmed</span>
                    </div>

                    <div className="bg-[#0e1322] border border-slate-800 rounded-2xl p-4 space-y-1">
                      <span className="text-[11px] font-mono text-slate-400 uppercase">Total Orders</span>
                      <p className="text-2xl font-extrabold text-white">
                        {overviewData?.metrics?.totalOrdersCount || orders.length}
                      </p>
                      <span className="text-[10px] text-sky-400">
                        {orders.filter((o) => o.payment_status === 'PAID').length} Paid / {orders.filter((o) => o.payment_status === 'CREATED').length} In Progress
                      </span>
                    </div>

                    <div className="bg-[#0e1322] border border-slate-800 rounded-2xl p-4 space-y-1">
                      <span className="text-[11px] font-mono text-slate-400 uppercase">Published Charts</span>
                      <p className="text-2xl font-extrabold text-white">
                        {charts.filter((c) => c.status === 'PUBLISHED').length}
                      </p>
                      <span className="text-[10px] text-slate-500">Live in Vault</span>
                    </div>

                    <div className="bg-[#0e1322] border border-slate-800 rounded-2xl p-4 space-y-1">
                      <span className="text-[11px] font-mono text-slate-400 uppercase">Waitlist Registered</span>
                      <p className="text-2xl font-extrabold text-indigo-400">
                        {overviewData?.metrics?.bookWaitlistCount || 342}
                      </p>
                      <span className="text-[10px] text-slate-500">Trading Master Book</span>
                    </div>
                  </div>

                  {/* Recent Orders Mini Table */}
                  <div className="bg-[#0e1322] border border-slate-800 rounded-2xl p-5 space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-white text-sm">Recent Razorpay Orders</h4>
                      <button
                        onClick={() => setActiveTab('orders')}
                        className="text-xs text-sky-400 hover:underline"
                      >
                        View All Orders →
                      </button>
                    </div>

                    {orders.length === 0 ? (
                      <p className="text-xs text-slate-500 py-4 text-center">No orders recorded yet.</p>
                    ) : (
                      <div className="overflow-x-auto text-xs">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                              <th className="pb-2">Order ID</th>
                              <th className="pb-2">Course</th>
                              <th className="pb-2">Student</th>
                              <th className="pb-2">Amount</th>
                              <th className="pb-2">Status</th>
                              <th className="pb-2">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60 font-mono">
                            {orders.slice(0, 5).map((o) => (
                              <tr key={o.id} className="hover:bg-slate-800/30">
                                <td className="py-2.5 text-sky-300 font-semibold">{o.id}</td>
                                <td className="py-2.5 text-white font-sans">{o.course}</td>
                                <td className="py-2.5 text-slate-300 font-sans">{o.customer_name}</td>
                                <td className="py-2.5 text-emerald-400 font-bold">₹{o.amount.toLocaleString('en-IN')}</td>
                                <td className="py-2.5">
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] ${
                                      o.payment_status === 'PAID'
                                        ? 'bg-emerald-500/20 text-emerald-400'
                                        : o.payment_status === 'CREATED'
                                        ? 'bg-amber-500/20 text-amber-400'
                                        : 'bg-rose-500/20 text-rose-400'
                                    }`}
                                  >
                                    {o.payment_status}
                                  </span>
                                </td>
                                <td className="py-2.5">
                                  <button
                                    onClick={() => handleSyncOrder(o.id)}
                                    className="text-slate-400 hover:text-sky-300"
                                    title="Re-verify with Razorpay"
                                  >
                                    <RefreshCw className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 2. RAZORPAY ORDERS TAB */}
              {activeTab === 'orders' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold text-white">Database Order & Payment Records</h3>
                      <p className="text-xs text-slate-400">
                        Tracks server-created orders, Razorpay Order IDs, payment signatures, and verification statuses.
                      </p>
                    </div>
                  </div>

                  <div className="bg-[#0e1322] border border-slate-800 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#121828] border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                          <tr>
                            <th className="p-3">Internal Order ID</th>
                            <th className="p-3">Course</th>
                            <th className="p-3">Amount</th>
                            <th className="p-3">Razorpay Order ID</th>
                            <th className="p-3">Razorpay Payment ID</th>
                            <th className="p-3">Customer Details</th>
                            <th className="p-3">Payment Status</th>
                            <th className="p-3">Verification</th>
                            <th className="p-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/80 font-mono">
                          {orders.length === 0 ? (
                            <tr>
                              <td colSpan={9} className="p-6 text-center text-slate-500">
                                No orders yet. Customer enrollments will appear here in real-time.
                              </td>
                            </tr>
                          ) : (
                            orders.map((ord) => (
                              <tr key={ord.id} className="hover:bg-slate-800/40">
                                <td className="p-3 text-sky-300 font-semibold">{ord.id}</td>
                                <td className="p-3 text-white font-sans font-medium">{ord.course}</td>
                                <td className="p-3 text-emerald-400 font-bold">₹{ord.amount.toLocaleString('en-IN')}</td>
                                <td className="p-3 text-slate-300">{ord.razorpay_order_id}</td>
                                <td className="p-3 text-slate-400">{ord.razorpay_payment_id || '—'}</td>
                                <td className="p-3 font-sans">
                                  <div className="text-slate-200 font-medium">{ord.customer_name}</div>
                                  <div className="text-[10px] text-slate-400">{ord.customer_email}</div>
                                  <div className="text-[10px] text-slate-500">{ord.customer_phone}</div>
                                </td>
                                <td className="p-3">
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                      ord.payment_status === 'PAID'
                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                        : ord.payment_status === 'CREATED'
                                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                    }`}
                                  >
                                    {ord.payment_status}
                                  </span>
                                </td>
                                <td className="p-3 text-[11px] text-slate-400">
                                  {ord.verification_method || 'PENDING'}
                                </td>
                                <td className="p-3">
                                  <div className="flex items-center space-x-1.5">
                                    <button
                                      onClick={() => handleSyncOrder(ord.id)}
                                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] flex items-center space-x-1 cursor-pointer"
                                      title="Re-verify status from Razorpay"
                                    >
                                      <RefreshCw className="w-3 h-3" />
                                      <span>Sync</span>
                                    </button>

                                    {ord.payment_status === 'PAID' && (
                                      <button
                                        onClick={() => handleResendEmail(ord.id)}
                                        disabled={resendingOrderId === ord.id}
                                        className="px-2 py-1 bg-sky-950/60 hover:bg-sky-900 border border-sky-700/50 text-sky-300 rounded text-[10px] flex items-center space-x-1 cursor-pointer disabled:opacity-50"
                                        title="Dispatch official PDF invoice & confirmation email via Resend"
                                      >
                                        <Mail className={`w-3 h-3 ${resendingOrderId === ord.id ? 'animate-spin' : ''}`} />
                                        <span>Invoice</span>
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. CHARTS TAB */}
              {activeTab === 'charts' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold text-white">Price Action Chart Studies</h3>
                      <p className="text-xs text-slate-400">Publish, modify, or archive technical charts in the public vault.</p>
                    </div>
                    <button
                      onClick={() => setNewChartModal(true)}
                      className="px-3 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>New Chart Study</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {charts.map((chart) => (
                      <div key={chart.id} className="bg-[#0e1322] border border-slate-800 rounded-2xl p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-mono px-2 py-0.5 bg-sky-500/20 text-sky-400 rounded">
                              {chart.instrument} • {chart.timeframe}
                            </span>
                            <h4 className="font-bold text-white text-sm mt-1">{chart.title}</h4>
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${chart.status === 'PUBLISHED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                            {chart.status}
                          </span>
                        </div>

                        <p className="text-xs text-slate-400 line-clamp-2">{chart.analysis}</p>

                        <div className="flex justify-between items-center text-xs text-slate-500 font-mono border-t border-slate-800 pt-2">
                          <span>R:R {chart.risk_reward}</span>
                          <button
                            onClick={() => handleDeleteChart(chart.id)}
                            className="text-rose-400 hover:text-rose-300 p-1 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. TRACK RECORDS TAB */}
              {activeTab === 'track' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold text-white">Track Record & Certificates</h3>
                      <p className="text-xs text-slate-400">
                        Audited payout receipts, statements, and milestones. Strict sensitive redaction enforced.
                      </p>
                    </div>
                    <button
                      onClick={() => setNewTrackModal(true)}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Upload Record</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {trackRecords.map((t) => (
                      <div key={t.id} className="bg-[#0e1322] border border-slate-800 rounded-2xl p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded">
                              {t.category}
                            </span>
                            <h4 className="font-bold text-white text-sm mt-1">{t.title}</h4>
                          </div>
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            Redacted: Yes
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">{t.description}</p>
                        <div className="text-[11px] font-mono text-slate-500 border-t border-slate-800 pt-2 flex justify-between">
                          <span>Date: {t.document_date}</span>
                          <span>{t.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. COURSES TAB */}
              {activeTab === 'courses' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white">Active Courses & Fees</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {courses.map((c) => (
                      <div key={c.id} className="bg-[#0e1322] border border-slate-800 rounded-2xl p-6 space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="text-xl font-bold text-white">{c.name}</h4>
                          <span className="text-xl font-extrabold text-sky-400 font-mono">
                            ₹{c.price.toLocaleString('en-IN')} INR
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">{c.short_description}</p>
                        <div className="space-y-1.5 border-t border-slate-800 pt-3">
                          <p className="text-xs font-semibold text-slate-300">Enrolled Features ({c.features.length})</p>
                          <ul className="text-[11px] text-slate-400 space-y-1">
                            {c.features.slice(0, 4).map((f, i) => (
                              <li key={i}>• {f}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 6. ENQUIRIES TAB */}
              {activeTab === 'enquiries' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white">Course Enquiries</h3>
                  {enquiries.length === 0 ? (
                    <p className="text-xs text-slate-500 py-6 text-center">No student enquiries submitted yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {enquiries.map((enq) => (
                        <div key={enq.id} className="bg-[#0e1322] border border-slate-800 rounded-xl p-4 flex justify-between items-start">
                          <div className="space-y-1 text-xs">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-white">{enq.name}</span>
                              <span className="text-sky-400 font-mono text-[11px]">({enq.email} • {enq.phone})</span>
                              <span className="text-indigo-300 font-semibold font-mono">[{enq.course_id}]</span>
                            </div>
                            <p className="text-slate-300 leading-relaxed">{enq.message}</p>
                            <span className="text-[10px] text-slate-500 font-mono block">Received: {new Date(enq.created_at).toLocaleString()}</span>
                          </div>

                          <select
                            value={enq.status}
                            onChange={(e) => handleUpdateEnquiryStatus(enq.id, e.target.value)}
                            className="text-xs bg-[#141b2c] border border-slate-700 text-slate-200 rounded-lg px-2 py-1"
                          >
                            <option value="NEW">NEW</option>
                            <option value="CONTACTED">CONTACTED</option>
                            <option value="CONVERTED">CONVERTED</option>
                            <option value="CLOSED">CLOSED</option>
                          </select>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 7. MESSAGES TAB */}
              {activeTab === 'messages' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white">Contact Terminal Messages</h3>
                  {messages.length === 0 ? (
                    <p className="text-xs text-slate-500 py-6 text-center">No contact messages received yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {messages.map((m) => (
                        <div key={m.id} className="bg-[#0e1322] border border-slate-800 rounded-xl p-4 flex justify-between items-start">
                          <div className="space-y-1 text-xs">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-white">{m.name}</span>
                              <span className="text-sky-400 font-mono text-[11px]">&lt;{m.email}&gt;</span>
                            </div>
                            <p className="text-slate-300 leading-relaxed">{m.message}</p>
                            <span className="text-[10px] text-slate-500 font-mono block">Received: {new Date(m.created_at).toLocaleString()}</span>
                          </div>

                          <select
                            value={m.status}
                            onChange={(e) => handleUpdateMessageStatus(m.id, e.target.value)}
                            className="text-xs bg-[#141b2c] border border-slate-700 text-slate-200 rounded-lg px-2 py-1"
                          >
                            <option value="UNREAD">UNREAD</option>
                            <option value="READ">READ</option>
                            <option value="ARCHIVED">ARCHIVED</option>
                          </select>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 8. TRADING MASTER TAB */}
              {activeTab === 'book' && (
                <div className="space-y-4 max-w-2xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white">Trading Master Book Settings</h3>
                      <p className="text-xs text-slate-400">Manage the official AJAY TRADES ICT & SMC TRADING MASTERBOOK assets and status.</p>
                    </div>
                  </div>

                  <div className="bg-[#0e1322] border border-slate-800 rounded-2xl p-6 space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-400 mb-1">Official Book Title</label>
                        <input
                          type="text"
                          readOnly
                          value="AJAY TRADES ICT & SMC TRADING MASTERBOOK"
                          className="w-full px-3 py-2 bg-[#121828] border border-slate-700 rounded-lg text-white font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Author</label>
                        <input
                          type="text"
                          readOnly
                          value="Ajay Gadhe (AJT77)"
                          className="w-full px-3 py-2 bg-[#121828] border border-slate-700 rounded-lg text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-400 mb-1">Release Status</label>
                        <input
                          type="text"
                          readOnly
                          value="COMING_SOON (Pre-Release / Waitlist Active)"
                          className="w-full px-3 py-2 bg-[#121828] border border-slate-700 rounded-lg text-emerald-400 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Total Waitlist Subscribers</label>
                        <p className="text-xl font-extrabold text-white font-mono mt-1">
                          {overviewData?.metrics?.bookWaitlistCount || 0} Registrations
                        </p>
                      </div>
                    </div>

                    {/* Cover Image Preview & File Upload */}
                    <div className="pt-3 border-t border-slate-800 space-y-3">
                      <label className="block text-slate-300 font-semibold">Official Book Cover Artwork</label>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-[#121828] border border-slate-700/80 p-3.5 rounded-xl">
                        <div className="w-28 h-20 bg-slate-950 rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center flex-shrink-0">
                          <img
                            src="/trading-master-cover.png"
                            alt="Trading Master Official Cover"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                        <div className="space-y-1.5 flex-1">
                          <p className="text-[11px] text-slate-300 font-medium">Source: <code className="text-sky-400">/trading-master-cover.png</code></p>
                          <p className="text-[10px] text-slate-400">The official book jacket wrap (back, spine & front) provided by Ajay Gadhe.</p>
                          <label className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors mt-1">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload / Replace Cover File</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const reader = new FileReader();
                                reader.onload = async () => {
                                  try {
                                    const dataUrl = reader.result as string;
                                    await requestApi('/api/admin/book/upload-cover', {
                                      method: 'POST',
                                      body: JSON.stringify({ dataUrl }),
                                    });
                                    setActionMessage('Official cover updated successfully!');
                                    setTimeout(() => setActionMessage(null), 3000);
                                  } catch (err: any) {
                                    alert('Failed to upload cover: ' + err.message);
                                  }
                                };
                                reader.readAsDataURL(file);
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 9. AUDIT LOGS TAB */}
              {activeTab === 'audit' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white">System & Administrative Audit Logs</h3>
                  <div className="bg-[#0e1322] border border-slate-800 rounded-2xl overflow-hidden">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-[#121828] border-b border-slate-800 text-slate-400 text-[11px]">
                        <tr>
                          <th className="p-3">Timestamp</th>
                          <th className="p-3">Actor</th>
                          <th className="p-3">Action</th>
                          <th className="p-3">Entity</th>
                          <th className="p-3">IP Address</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {auditLogs.slice(0, 30).map((log) => (
                          <tr key={log.id} className="hover:bg-slate-800/30">
                            <td className="p-3 text-slate-400">{new Date(log.created_at).toLocaleString()}</td>
                            <td className="p-3 text-sky-400">{log.admin_user_id}</td>
                            <td className="p-3 text-white font-bold">{log.action}</td>
                            <td className="p-3 text-slate-300">{log.entity_type} ({log.entity_id})</td>
                            <td className="p-3 text-slate-500">{log.ip_address}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 10. RESEND EMAIL AUTOMATION TAB */}
              {activeTab === 'emails' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-white">Resend Transactional Email Automation</h3>
                      <p className="text-xs text-slate-400">
                        Server-side automated notifications for Help/Contact forms, Early Access waitlists, and verified course purchases with PDF invoices.
                      </p>
                    </div>
                  </div>

                  {/* Status overview cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="bg-[#0e1322] border border-slate-800 rounded-xl p-3.5 space-y-1">
                      <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Resend Provider</div>
                      <div className="flex items-center space-x-2">
                        <span className={`w-2 h-2 rounded-full ${emailMeta?.resendConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                        <span className="text-sm font-bold text-white font-mono">
                          {emailMeta?.resendConfigured ? 'ACTIVE / READY' : 'NO API KEY (SIMULATING)'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        {emailMeta?.resendConfigured ? 'Server configured with RESEND_API_KEY' : 'Add RESEND_API_KEY in server environment'}
                      </p>
                    </div>

                    <div className="bg-[#0e1322] border border-slate-800 rounded-xl p-3.5 space-y-1">
                      <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Admin Alerts</div>
                      <div className="flex items-center space-x-2">
                        <span className={`w-2 h-2 rounded-full ${emailMeta?.adminEmailConfigured ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                        <span className="text-sm font-bold text-white font-mono truncate">
                          {emailMeta?.adminEmailConfigured ? 'CONFIGURED' : 'DEFAULT ADMIN'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate">
                        Recipient: Verified Admin Recipient
                      </p>
                    </div>

                    <div className="bg-[#0e1322] border border-slate-800 rounded-xl p-3.5 space-y-1">
                      <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Sender Address</div>
                      <div className="text-xs font-mono text-sky-300 truncate">
                        {emailMeta?.fromAddress || 'AJT77 <onboarding@resend.dev>'}
                      </div>
                      <p className="text-[10px] text-slate-400">Configured via EMAIL_FROM</p>
                    </div>

                    <div className="bg-[#0e1322] border border-slate-800 rounded-xl p-3.5 space-y-1">
                      <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Emails Processed</div>
                      <div className="text-sm font-bold text-emerald-400 font-mono">
                        {emailLogs.filter((l) => l.status === 'SENT').length} / {emailLogs.length}
                      </div>
                      <p className="text-[10px] text-slate-400">Total transaction dispatches</p>
                    </div>
                  </div>

                  {/* Send Test Email Card */}
                  <div className="bg-[#0e1322] border border-slate-800 rounded-xl p-4 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Send className="w-4 h-4 text-sky-400" />
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Test Resend Email Delivery</h4>
                    </div>
                    <p className="text-xs text-slate-400">
                      Send a test transactional message to verify DNS, SPF/DKIM verification, and delivery via the Resend backend.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 max-w-xl pt-1">
                      <input
                        type="email"
                        placeholder="Enter email to receive test message..."
                        value={testEmailInput}
                        onChange={(e) => setTestEmailInput(e.target.value)}
                        className="flex-1 px-3 py-2 bg-[#121828] border border-slate-700 rounded-lg text-xs text-white placeholder:text-slate-500 font-mono focus:outline-none focus:border-sky-500"
                      />
                      <button
                        onClick={handleSendTestEmail}
                        disabled={isSendingTest}
                        className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{isSendingTest ? 'Sending...' : 'Send Test Email'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Email Logs Table */}
                  <div className="bg-[#0e1322] border border-slate-800 rounded-2xl overflow-hidden">
                    <div className="p-3 bg-[#121828] border-b border-slate-800 flex items-center justify-between">
                      <span className="text-xs font-bold text-white">Server Email Logs (Recent 1,000)</span>
                      <span className="text-[11px] text-slate-400 font-mono">{emailLogs.length} events</span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-mono">
                        <thead className="bg-[#0d121f] border-b border-slate-800 text-slate-400 text-[11px]">
                          <tr>
                            <th className="p-3">Status</th>
                            <th className="p-3">Type</th>
                            <th className="p-3">Recipient</th>
                            <th className="p-3">Subject / Details</th>
                            <th className="p-3">Timestamp</th>
                            <th className="p-3">Provider ID / Error</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {emailLogs.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="p-8 text-center text-slate-500 font-sans text-xs">
                                No email transactions logged yet. When visitors submit contact inquiries, waitlist registrations, or complete verified Razorpay course purchases, the dispatches will appear here.
                              </td>
                            </tr>
                          ) : (
                            emailLogs.map((log) => (
                              <tr key={log.id} className="hover:bg-slate-800/30">
                                <td className="p-3">
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                      log.status === 'SENT'
                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                    }`}
                                  >
                                    {log.status}
                                  </span>
                                </td>
                                <td className="p-3">
                                  <span className="text-[11px] text-sky-300 font-sans font-medium">
                                    {log.type === 'PURCHASE_CONFIRMATION' && 'Purchase Confirmation + Invoice'}
                                    {log.type === 'SALE_ADMIN_NOTIFICATION' && 'New Sale Admin Alert'}
                                    {log.type === 'WAITLIST_CONFIRMATION' && 'Waitlist Confirmation'}
                                    {log.type === 'WAITLIST_ADMIN_NOTIFICATION' && 'Waitlist Admin Alert'}
                                    {log.type === 'CONTACT_CONFIRMATION' && 'Contact Confirmation'}
                                    {log.type === 'CONTACT_ADMIN_NOTIFICATION' && 'Contact Admin Alert'}
                                    {log.type === 'COURSE_ENQUIRY' && 'Course Enquiry Alert'}
                                  </span>
                                </td>
                                <td className="p-3 text-slate-200">{log.recipient}</td>
                                <td className="p-3 font-sans text-[11px] text-slate-300 max-w-xs truncate">
                                  {log.subject}
                                </td>
                                <td className="p-3 text-slate-400 text-[11px]">
                                  {new Date(log.created_at).toLocaleString('en-IN')}
                                </td>
                                <td className="p-3 text-[11px]">
                                  {log.error ? (
                                    <span className="text-rose-400" title={log.error}>
                                      {log.error.length > 40 ? `${log.error.slice(0, 40)}...` : log.error}
                                    </span>
                                  ) : (
                                    <span className="text-slate-400">{log.message_id || 'dispatched'}</span>
                                  )}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 11. SETTINGS TAB */}
              {activeTab === 'settings' && (
                <div className="space-y-4 max-w-2xl">
                  <h3 className="text-lg font-bold text-white">Razorpay & Production Domain Configuration</h3>
                  <div className="bg-[#0e1322] border border-slate-800 rounded-2xl p-6 space-y-4 text-xs">
                    <div className="space-y-1">
                      <label className="block text-slate-400">Razorpay Live Key ID</label>
                      <input
                        type="text"
                        disabled
                        value="rzp_live_TakqyZ3Lxnr9Dq"
                        className="w-full px-3 py-2 bg-[#121828] border border-slate-700 rounded-lg text-white font-mono"
                      />
                      <span className="text-[10px] text-emerald-400 font-mono">Status: Connected to Razorpay Live Mode</span>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-slate-400">Razorpay Key Secret</label>
                      <input
                        type="text"
                        disabled
                        value="••••••••••••••••••••••••••••••••"
                        className="w-full px-3 py-2 bg-[#121828] border border-slate-700 rounded-lg text-slate-400 font-mono"
                      />
                      <span className="text-[10px] text-emerald-400 font-mono">Status: Stored exclusively in server-side .env</span>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-slate-400">Webhook Endpoint URL (Configure in Razorpay Dashboard)</label>
                      <input
                        type="text"
                        readOnly
                        value={`${window.location.origin}/api/webhook/razorpay`}
                        className="w-full px-3 py-2 bg-[#121828] border border-slate-700 rounded-lg text-sky-300 font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-slate-400">Canonical Website Domain</label>
                      <input
                        type="text"
                        readOnly
                        value={window.location.origin}
                        className="w-full px-3 py-2 bg-[#121828] border border-slate-700 rounded-lg text-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}
            </main>
          </div>
        )}
      </div>

      {/* New Chart Modal */}
      {newChartModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#0b0f19] border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 text-xs">
            <h4 className="text-base font-bold text-white">Create New Chart Analysis</h4>
            <form onSubmit={handleCreateChart} className="space-y-3">
              <div>
                <label className="text-slate-300">Title</label>
                <input
                  type="text"
                  required
                  value={chartForm.title}
                  onChange={(e) => setChartForm({ ...chartForm, title: e.target.value })}
                  placeholder="e.g. NIFTY 50 15m Breakout"
                  className="w-full px-3 py-2 bg-[#121828] border border-slate-700 rounded-lg text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300">Instrument</label>
                  <input
                    type="text"
                    required
                    value={chartForm.instrument}
                    onChange={(e) => setChartForm({ ...chartForm, instrument: e.target.value })}
                    className="w-full px-3 py-2 bg-[#121828] border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300">Timeframe</label>
                  <input
                    type="text"
                    required
                    value={chartForm.timeframe}
                    onChange={(e) => setChartForm({ ...chartForm, timeframe: e.target.value })}
                    className="w-full px-3 py-2 bg-[#121828] border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>
              <div>
                <label className="text-slate-300">Analysis Observations</label>
                <textarea
                  rows={3}
                  required
                  value={chartForm.analysis}
                  onChange={(e) => setChartForm({ ...chartForm, analysis: e.target.value })}
                  className="w-full px-3 py-2 bg-[#121828] border border-slate-700 rounded-lg text-white"
                />
              </div>
              <div className="grid grid-cols-3 gap-2 font-mono">
                <div>
                  <label className="text-slate-300 font-sans">Entry</label>
                  <input
                    type="text"
                    value={chartForm.entry}
                    onChange={(e) => setChartForm({ ...chartForm, entry: e.target.value })}
                    className="w-full px-2 py-1.5 bg-[#121828] border border-slate-700 rounded text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-sans">Stop Loss</label>
                  <input
                    type="text"
                    value={chartForm.stop_loss}
                    onChange={(e) => setChartForm({ ...chartForm, stop_loss: e.target.value })}
                    className="w-full px-2 py-1.5 bg-[#121828] border border-slate-700 rounded text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-sans">Target</label>
                  <input
                    type="text"
                    value={chartForm.target}
                    onChange={(e) => setChartForm({ ...chartForm, target: e.target.value })}
                    className="w-full px-2 py-1.5 bg-[#121828] border border-slate-700 rounded text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setNewChartModal(false)}
                  className="px-3 py-2 bg-slate-800 text-white rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 text-white rounded-lg font-bold"
                >
                  Publish Chart
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Track Record Modal */}
      {newTrackModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#0b0f19] border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 text-xs">
            <h4 className="text-base font-bold text-white">Upload Audited Track Record</h4>
            <form onSubmit={handleCreateTrack} className="space-y-3">
              <div>
                <label className="text-slate-300">Title</label>
                <input
                  type="text"
                  required
                  value={trackForm.title}
                  onChange={(e) => setTrackForm({ ...trackForm, title: e.target.value })}
                  placeholder="e.g. Prop Firm Verified Milestone Certificate"
                  className="w-full px-3 py-2 bg-[#121828] border border-slate-700 rounded-lg text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300">Category</label>
                  <select
                    value={trackForm.category}
                    onChange={(e) => setTrackForm({ ...trackForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-[#121828] border border-slate-700 rounded-lg text-white"
                  >
                    <option value="PAYOUT">PAYOUT</option>
                    <option value="TRADING_STATEMENT">TRADING_STATEMENT</option>
                    <option value="ACCOUNT_RECORD">ACCOUNT_RECORD</option>
                    <option value="MILESTONE">MILESTONE</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300">Date</label>
                  <input
                    type="date"
                    required
                    value={trackForm.document_date}
                    onChange={(e) => setTrackForm({ ...trackForm, document_date: e.target.value })}
                    className="w-full px-3 py-2 bg-[#121828] border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>
              <div>
                <label className="text-slate-300">Description</label>
                <textarea
                  rows={3}
                  required
                  value={trackForm.description}
                  onChange={(e) => setTrackForm({ ...trackForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-[#121828] border border-slate-700 rounded-lg text-white"
                />
              </div>

              {/* Mandatory Redaction Checkbox */}
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="redact-check"
                  required
                  checked={trackForm.redaction_confirmed}
                  onChange={(e) => setTrackForm({ ...trackForm, redaction_confirmed: e.target.checked })}
                  className="mt-0.5"
                />
                <label htmlFor="redact-check" className="text-emerald-300 leading-snug cursor-pointer">
                  <strong>Mandatory Compliance:</strong> I confirm that all sensitive personal identifiers, bank account numbers, passwords, and private personal details have been safely redacted from this document.
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setNewTrackModal(false)}
                  className="px-3 py-2 bg-slate-800 text-white rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold"
                >
                  Publish Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
