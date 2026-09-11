import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  ShieldCheck,
  MessageCircle,
  Copy,
  Check,
  ArrowLeft,
  AlertCircle,
  Clock,
  ExternalLink,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { requestApi } from '../lib/api';

interface OrderDetails {
  id: string;
  course: string;
  amount: number;
  currency: string;
  payment_status: 'CREATED' | 'PAID' | 'FAILED';
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  razorpay_order_id: string;
  razorpay_payment_id: string | null;
  created_at: string;
  verified_at?: string;
  isPaid: boolean;
}

interface PaymentSuccessPageProps {
  orderIdFromUrl?: string;
  onNavigateHome: () => void;
}

export const PaymentSuccessPage: React.FC<PaymentSuccessPageProps> = ({
  orderIdFromUrl,
  onNavigateHome,
}) => {
  const [orderId, setOrderId] = useState<string | null>(orderIdFromUrl || null);
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [whatsappNumber, setWhatsappNumber] = useState<string | null>(null);

  useEffect(() => {
    // Determine orderId from prop or window URL params / search
    const urlParams = new URLSearchParams(window.location.search);
    const id = orderIdFromUrl || urlParams.get('order_id') || urlParams.get('id');

    if (!id) {
      setError('No order identifier was found in the request. Please check your verification link or contact support.');
      setIsLoading(false);
      return;
    }

    setOrderId(id);

    // Fetch configuration for support WhatsApp number
    requestApi<{ supportWhatsAppNumber?: string }>('/api/config')
      .then((cfg) => {
        if (cfg?.supportWhatsAppNumber) {
          setWhatsappNumber(cfg.supportWhatsAppNumber);
        }
      })
      .catch((err) => {
        console.warn('Failed to load support configuration:', err);
      });

    // Fetch verified order details
    requestApi<OrderDetails>(`/api/orders/${id}`)
      .then((data) => {
        if (!data) {
          setError('Order record could not be found.');
          return;
        }

        // Strictly verify that order status is PAID
        if (data.payment_status !== 'PAID' || !data.isPaid) {
          setError('Payment Verification Required: This order has not been cryptographically verified as PAID on the server.');
          return;
        }

        setOrder(data);

        // Gentle professional confetti trigger
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#3b82f6', '#10b981', '#6366f1'],
          });
        } catch {
          // ignore confetti if unsupported
        }
      })
      .catch((err: any) => {
        console.error('Error fetching order verification status:', err);
        setError(err.message || 'Unable to retrieve verified payment details.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [orderIdFromUrl]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2500);
  };

  // WhatsApp Pre-filled message generator
  const getWhatsAppUrl = () => {
    if (!order) return '#';
    const message = `Hello AJT77,

I have successfully completed my payment.

Name: ${order.customer_name}
Email: ${order.customer_email}
Mobile Number: ${order.customer_phone}
Product: ${order.course}
Order ID: ${order.id}
Payment ID: ${order.razorpay_payment_id || 'N/A'}

I am attaching my payment screenshot for verification.

Thank you.`;

    const encodedMsg = encodeURIComponent(message);

    if (whatsappNumber) {
      // Remove any non-numeric characters for wa.me URL
      const cleanPhone = whatsappNumber.replace(/[^0-9]/g, '');
      return `https://wa.me/${cleanPhone}?text=${encodedMsg}`;
    }

    // If WhatsApp number not configured yet, direct to WhatsApp web/app prompt
    return `https://api.whatsapp.com/send?text=${encodedMsg}`;
  };

  return (
    <div id="payment-success-container" className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Navigation Bar */}
        <div className="mb-8 flex items-center justify-between">
          <button
            id="back-to-home-btn"
            onClick={onNavigateHome}
            className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-white transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to AJT77 Home
          </button>
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">
            <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
            Verified SSL & Cryptographic Checkout
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div id="payment-loading-card" className="bg-slate-900/90 border border-slate-800 rounded-2xl p-12 text-center shadow-2xl">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <h2 className="text-xl font-semibold text-white">Cryptographically Verifying Order...</h2>
            <p className="text-slate-400 text-sm mt-2">Connecting to AJT77 security server to validate payment receipt.</p>
          </div>
        )}

        {/* Error / Unauthorized Access State */}
        {!isLoading && error && (
          <div id="payment-error-card" className="bg-slate-900 border border-rose-900/50 rounded-2xl p-8 sm:p-10 shadow-2xl">
            <div className="flex items-center space-x-3 text-rose-400 mb-4">
              <AlertCircle className="w-8 h-8 flex-shrink-0" />
              <h2 className="text-2xl font-bold">Payment Verification Incomplete</h2>
            </div>
            <p className="text-slate-300 text-base mb-6 leading-relaxed">
              {error}
            </p>
            <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800/80 text-sm text-slate-400 mb-8 space-y-2">
              <p>• If you recently paid, your bank or UPI app may take up to 60 seconds to broadcast completion.</p>
              <p>• To verify manual payments or enquiries, contact our administrative desk with your transaction reference.</p>
            </div>
            <div className="flex flex-wrap gap-4">
              <button
                id="retry-check-btn"
                onClick={() => window.location.reload()}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-all"
              >
                Retry Verification
              </button>
              <button
                id="return-home-btn"
                onClick={onNavigateHome}
                className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm transition-all"
              >
                Return to Courses
              </button>
            </div>
          </div>
        )}

        {/* VERIFIED PAYMENT SUCCESS SCREEN */}
        {!isLoading && !error && order && (
          <div className="space-y-8">
            {/* Header Success Banner */}
            <div
              id="payment-success-header-card"
              className="bg-slate-900/95 border border-slate-800/90 rounded-2xl p-8 sm:p-10 shadow-2xl relative overflow-hidden text-center"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500"></div>

              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 mb-5">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <h1 id="payment-success-title" className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Payment Successful ✓
              </h1>
              <p className="text-slate-300 text-base sm:text-lg mt-3 max-w-xl mx-auto font-normal">
                Thank you for your purchase. Your payment has been successfully received.
              </p>

              <div className="mt-5 inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>STATUS: PAID & CONFIRMED</span>
              </div>
            </div>

            {/* MANDATORY / PROMINENT WHATSAPP VERIFICATION INSTRUCTION */}
            <div
              id="whatsapp-verification-instruction-card"
              className="bg-gradient-to-br from-amber-950/40 via-slate-900 to-amber-950/20 border-2 border-amber-500/50 rounded-2xl p-6 sm:p-8 shadow-2xl relative"
            >
              <div className="flex items-start space-x-4 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-amber-300 tracking-tight">
                    IMPORTANT — COMPLETE YOUR PURCHASE VERIFICATION
                  </h2>
                  <p className="text-slate-200 text-sm sm:text-base mt-1">
                    Your payment has been successfully received.
                  </p>
                </div>
              </div>

              <div className="bg-slate-950/70 border border-amber-500/30 rounded-xl p-5 mb-6 text-slate-200 text-sm sm:text-base leading-relaxed space-y-3">
                <p className="font-medium text-amber-200">
                  To complete your order verification, please send your payment screenshot on WhatsApp along with:
                </p>
                <ul className="space-y-1.5 pl-2 text-slate-300">
                  <li className="flex items-center space-x-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span><strong>Your Full Name</strong></span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span><strong>The Email Address</strong> you used on this website</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span><strong>Your Mobile Number</strong></span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span><strong>Your Payment Screenshot</strong></span>
                  </li>
                </ul>

                <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Send these details to:</span>
                  <span className="text-base font-bold text-amber-300">
                    {whatsappNumber ? (
                      whatsappNumber
                    ) : (
                      <span className="text-amber-400/90 font-mono text-xs">
                        [WhatsApp number to be configured by administrator: Set SUPPORT_WHATSAPP_NUMBER in .env]
                      </span>
                    )}
                  </span>
                </div>

                <p className="text-xs text-slate-400 italic pt-1">
                  After verification, your order/course access will be processed.
                </p>
              </div>

              {/* Action Button: Send Details on WhatsApp */}
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <a
                  id="send-details-whatsapp-btn"
                  href={getWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto flex-1 inline-flex items-center justify-center px-8 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base shadow-lg shadow-emerald-950/50 hover:shadow-emerald-900/60 transition-all duration-200 group"
                >
                  <MessageCircle className="w-5 h-5 mr-3 flex-shrink-0 text-white group-hover:scale-110 transition-transform" />
                  <span>Send Details on WhatsApp</span>
                  <ExternalLink className="w-4 h-4 ml-2 opacity-80" />
                </a>

                <button
                  id="copy-whatsapp-text-btn"
                  onClick={() => {
                    const text = `Hello AJT77,\n\nI have successfully completed my payment.\n\nName: ${order.customer_name}\nEmail: ${order.customer_email}\nMobile Number: ${order.customer_phone}\nProduct: ${order.course}\nOrder ID: ${order.id}\nPayment ID: ${order.razorpay_payment_id || 'N/A'}\n\nI am attaching my payment screenshot for verification.\n\nThank you.`;
                    copyToClipboard(text, 'whatsapp_text');
                  }}
                  className="w-full sm:w-auto px-5 py-4 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-slate-300 font-medium text-sm border border-slate-700/80 transition-all flex items-center justify-center space-x-2"
                >
                  {copiedField === 'whatsapp_text' ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">Message Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-400" />
                      <span>Copy Message Text</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* PURCHASED PRODUCT & ORDER RECEIPT DETAILS */}
            <div
              id="order-details-card"
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl"
            >
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
                <div>
                  <h3 className="text-lg font-bold text-white">Order Receipt Details</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Automated confirmation email has been dispatched to {order.customer_email}.</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-950/70 text-blue-400 border border-blue-800/50">
                  Official Receipt
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
                <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800/80">
                  <span className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">
                    Product / Course Name
                  </span>
                  <span className="text-base font-bold text-white">
                    {order.course}
                  </span>
                </div>

                <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800/80">
                  <span className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">
                    Amount Paid
                  </span>
                  <span className="text-xl font-extrabold text-emerald-400">
                    ₹{order.amount.toLocaleString('en-IN')} INR
                  </span>
                </div>

                <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800/80">
                  <span className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">
                    Customer Name
                  </span>
                  <span className="text-base font-semibold text-slate-200">
                    {order.customer_name}
                  </span>
                </div>

                <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800/80">
                  <span className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">
                    Customer Email
                  </span>
                  <span className="text-base font-mono text-slate-200 truncate block" title={order.customer_email}>
                    {order.customer_email}
                  </span>
                </div>

                <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800/80">
                  <span className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">
                    Mobile Number
                  </span>
                  <span className="text-base font-mono text-slate-200">
                    {order.customer_phone || 'N/A'}
                  </span>
                </div>

                <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800/80">
                  <span className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">
                    Payment Status
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                    PAID
                  </span>
                </div>

                <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800/80 sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">
                        AJT77 Order ID
                      </span>
                      <span className="font-mono text-xs sm:text-sm text-slate-200">
                        {order.id}
                      </span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(order.id, 'order_id')}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="Copy Order ID"
                    >
                      {copiedField === 'order_id' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800/80 sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">
                        Razorpay Payment ID
                      </span>
                      <span className="font-mono text-xs sm:text-sm text-emerald-400">
                        {order.razorpay_payment_id || 'Captured via Live Checkout'}
                      </span>
                    </div>
                    {order.razorpay_payment_id && (
                      <button
                        onClick={() => copyToClipboard(order.razorpay_payment_id!, 'payment_id')}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        title="Copy Payment ID"
                      >
                        {copiedField === 'payment_id' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom return button */}
              <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={onNavigateHome}
                  className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-1.5" />
                  Return to Main Website
                </button>
                <div className="text-xs text-slate-500 flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 mr-1" />
                  <span>Verified at {order.verified_at ? new Date(order.verified_at).toLocaleTimeString() : new Date().toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
