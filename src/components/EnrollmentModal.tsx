import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, CheckCircle, AlertCircle, Loader2, Sparkles, CreditCard, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { requestApi, loadRazorpayScript, ApiError } from '../lib/api';
import type { RazorpayCreateOrderResponse, OrderRecord } from '../types';

interface EnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCourse?: 'AJT77 Basic' | 'AJT77 Pro';
  courseName?: 'AJT77 Basic' | 'AJT77 Pro';
  onPaymentSuccess?: (orderId: string) => void;
}

export const EnrollmentModal: React.FC<EnrollmentModalProps> = ({
  isOpen,
  onClose,
  defaultCourse = 'AJT77 Basic',
  courseName,
  onPaymentSuccess,
}) => {
  const initialCourse = courseName || defaultCourse;
  const [selectedCourse, setSelectedCourse] = useState<'AJT77 Basic' | 'AJT77 Pro'>(initialCourse);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<OrderRecord | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedCourse(courseName || defaultCourse || 'AJT77 Basic');
      setErrorMessage(null);
      setStatusMessage(null);
      setCompletedOrder(null);
    }
  }, [isOpen, courseName, defaultCourse]);

  if (!isOpen) return null;

  const currentPriceINR = selectedCourse === 'AJT77 Basic' ? 6000 : 10000;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setStatusMessage(null);

    // Form validation
    if (!customerName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!customerEmail.trim() || !customerEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address for receiving course access.');
      return;
    }
    const cleanPhone = customerPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number for order receipt and SMS confirmation.');
      return;
    }

    setIsProcessing(true);
    setStatusMessage('Connecting to Razorpay Orders API server-side...');

    try {
      // 1. Ensure Razorpay checkout script is loaded
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        throw new Error('Razorpay Checkout SDK failed to load. Please check your internet connection.');
      }

      // 2. Call server-side endpoint to create Razorpay Order
      setStatusMessage('Creating verified order with Razorpay Orders API...');
      const orderPayload = await requestApi<RazorpayCreateOrderResponse>('/api/payments/create-order', {
        method: 'POST',
        body: JSON.stringify({
          course: selectedCourse,
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim().toLowerCase(),
          customerPhone: cleanPhone,
        }),
      });

      setStatusMessage('Launching Razorpay Standard Checkout...');

      // 3. Configure Razorpay Standard Checkout options
      const options = {
        key: orderPayload.keyId, // Only public Key ID is passed
        amount: orderPayload.amount, // in paise
        currency: orderPayload.currency || 'INR',
        name: 'AJT77 — AjayTrades77',
        description: `Enrollment: ${orderPayload.course}`,
        image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=200&q=80',
        order_id: orderPayload.razorpayOrderId,
        prefill: {
          name: orderPayload.customer.name,
          email: orderPayload.customer.email,
          contact: orderPayload.customer.phone,
        },
        notes: {
          course: orderPayload.course,
          internal_order_id: orderPayload.orderId,
        },
        theme: {
          color: '#0284c7', // Electric blue
          backdrop_color: '#07090e',
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            setStatusMessage(null);
          },
        },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          // 4. Server-Side Signature Verification
          setStatusMessage('Verifying Razorpay payment signature server-side...');
          try {
            const verificationResult = await requestApi<{
              order: OrderRecord;
              enrollmentConfirmed: boolean;
              message: string;
            }>('/api/payments/verify', {
              method: 'POST',
              body: JSON.stringify({
                internalOrderId: orderPayload.orderId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });

            setIsProcessing(false);
            setStatusMessage(null);
            onClose();

            // ONLY AFTER successful server-side verification:
            // Redirect customer to dedicated /payment-success page
            if (onPaymentSuccess) {
              onPaymentSuccess(verificationResult.order.id);
            } else {
              window.location.href = `/payment-success?order_id=${verificationResult.order.id}`;
            }
          } catch (verifyErr: any) {
            console.error('Verification failed:', verifyErr);
            setIsProcessing(false);
            setStatusMessage(null);
            setErrorMessage(
              verifyErr instanceof ApiError
                ? `Verification Failed: ${verifyErr.message}`
                : 'Server signature verification failed. Please contact support.'
            );
          }
        },
      };

      const razorpayInstance = new (window as any).Razorpay(options);

      // Handle checkout payment failure
      razorpayInstance.on('payment.failed', function (response: any) {
        console.error('Razorpay payment failed:', response.error);
        setIsProcessing(false);
        setStatusMessage(null);
        setErrorMessage(`Payment Failed: ${response.error.description} (Reason: ${response.error.reason})`);
      });

      razorpayInstance.open();
    } catch (err: any) {
      console.error('Order creation error:', err);
      setIsProcessing(false);
      setStatusMessage(null);
      setErrorMessage(
        err instanceof ApiError
          ? err.message
          : err.message || 'Failed to initiate Razorpay checkout. Please check server connectivity.'
      );
    }
  };

  const handleReset = () => {
    setCompletedOrder(null);
    setErrorMessage(null);
    setStatusMessage(null);
    setIsProcessing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div
        id="enrollment-modal-container"
        className="relative w-full max-w-xl bg-[#0b0f19] border border-slate-700/80 rounded-2xl shadow-2xl shadow-sky-950/60 overflow-hidden text-slate-100"
      >
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0e1320]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">AJT77 Course Enrollment</h3>
              <p className="text-xs text-slate-400">Razorpay Standard Checkout • Instant Verification</p>
            </div>
          </div>
          <button
            id="close-enrollment-modal-btn"
            onClick={handleReset}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* SUCCESS STATE */}
          {completedOrder ? (
            <div className="text-center py-4 space-y-5">
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto text-emerald-400 shadow-lg shadow-emerald-500/10">
                <CheckCircle className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs font-mono font-semibold uppercase px-2.5 py-1 bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">
                  Payment Verified • Enrollment Active
                </span>
                <h2 className="text-2xl font-extrabold text-white mt-3">Welcome to {completedOrder.course}!</h2>
                <p className="text-sm text-slate-300 mt-1 max-w-md mx-auto">
                  Your payment has been cryptographically verified and recorded in the AJT77 database.
                </p>
              </div>

              {/* Order Receipt Box */}
              <div className="bg-[#111726] border border-slate-800 rounded-xl p-4 text-left space-y-2.5 text-xs font-mono">
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Internal Order ID:</span>
                  <span className="text-sky-300 font-semibold">{completedOrder.id}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Razorpay Payment ID:</span>
                  <span className="text-emerald-400 font-semibold">{completedOrder.razorpay_payment_id}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Razorpay Order ID:</span>
                  <span className="text-slate-200">{completedOrder.razorpay_order_id}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Enrolled Student:</span>
                  <span className="text-white">{completedOrder.customer_name} ({completedOrder.customer_email})</span>
                </div>
                <div className="flex justify-between pt-1 text-sm font-sans">
                  <span className="text-slate-300 font-semibold">Total Paid:</span>
                  <span className="text-emerald-400 font-extrabold">₹{completedOrder.amount.toLocaleString('en-IN')} INR</span>
                </div>
              </div>

              <div className="bg-sky-500/10 border border-sky-500/20 rounded-xl p-3 text-xs text-sky-200">
                A confirmation copy and student portal credentials have been logged for <strong className="text-white">{completedOrder.customer_email}</strong>.
              </div>

              <button
                id="finish-enrollment-btn"
                onClick={handleReset}
                className="w-full py-3 px-4 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Close & Return to Website
              </button>
            </div>
          ) : (
            /* CHECKOUT FORM */
            <form onSubmit={handleCheckout} className="space-y-5">
              {/* Course Selection Cards */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Select Educational Program
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {/* AJT77 Basic */}
                  <button
                    type="button"
                    onClick={() => setSelectedCourse('AJT77 Basic')}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedCourse === 'AJT77 Basic'
                        ? 'border-sky-500 bg-sky-500/10 shadow-md shadow-sky-500/10'
                        : 'border-slate-800 bg-[#101522] hover:border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-sm text-white">AJT77 Basic</span>
                      <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300">
                        Zero to 100
                      </span>
                    </div>
                    <div className="mt-2 flex items-baseline space-x-1">
                      <span className="text-lg font-extrabold text-white">₹6,000</span>
                      <span className="text-[10px] text-slate-400 uppercase">INR</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">Foundation to Advanced Price Action</p>
                  </button>

                  {/* AJT77 Pro */}
                  <button
                    type="button"
                    onClick={() => setSelectedCourse('AJT77 Pro')}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative ${
                      selectedCourse === 'AJT77 Pro'
                        ? 'border-indigo-500 bg-indigo-500/10 shadow-md shadow-indigo-500/10'
                        : 'border-slate-800 bg-[#101522] hover:border-slate-700'
                    }`}
                  >
                    <div className="absolute -top-2 right-3">
                      <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow">
                        Mastery Tier
                      </span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-sm text-white">AJT77 Pro</span>
                    </div>
                    <div className="mt-2 flex items-baseline space-x-1">
                      <span className="text-lg font-extrabold text-white">₹10,000</span>
                      <span className="text-[10px] text-slate-400 uppercase">INR</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">Execution + 1-2 Daily Setup Ideas</p>
                  </button>
                </div>
              </div>

              {/* Student Details Inputs */}
              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Full Legal Name</label>
                  <input
                    id="student-name-input"
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Ajay Gadhe"
                    className="w-full px-3.5 py-2.5 bg-[#121827] border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                    <input
                      id="student-email-input"
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="you@domain.com"
                      className="w-full px-3.5 py-2.5 bg-[#121827] border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Mobile / WhatsApp</label>
                    <input
                      id="student-phone-input"
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full px-3.5 py-2.5 bg-[#121827] border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Status / Error feedback */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {statusMessage && (
                <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
                  <span>{statusMessage}</span>
                </div>
              )}

              {/* Security & Payment Methods Banner */}
              <div className="rounded-xl bg-[#0f1422] border border-slate-800 p-3 space-y-2 text-xs text-slate-400">
                <div className="flex items-center justify-between text-slate-300">
                  <div className="flex items-center space-x-1.5">
                    <Lock className="w-3.5 h-3.5 text-sky-400" />
                    <span className="font-semibold">Razorpay Standard Checkout</span>
                  </div>
                  <span className="font-mono text-emerald-400 font-semibold">
                    ₹{currentPriceINR.toLocaleString('en-IN')} INR
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-slate-400">
                  <span className="px-2 py-0.5 bg-slate-800/80 rounded text-slate-300">UPI / QR (GPay, PhonePe, Paytm)</span>
                  <span className="px-2 py-0.5 bg-slate-800/80 rounded text-slate-300">Credit / Debit Cards</span>
                  <span className="px-2 py-0.5 bg-slate-800/80 rounded text-slate-300">Net Banking</span>
                  <span className="px-2 py-0.5 bg-slate-800/80 rounded text-slate-300">EMI & Wallets</span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                id="submit-razorpay-checkout-btn"
                type="submit"
                disabled={isProcessing}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-sky-600 via-sky-500 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-sky-600/30 transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing Secure Checkout...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    <span>Pay ₹{currentPriceINR.toLocaleString('en-IN')} via Razorpay</span>
                  </>
                )}
              </button>

              <p className="text-[11px] text-center text-slate-400 leading-relaxed">
                By clicking pay, an official Razorpay Order is generated server-side. Payments are processed securely over 256-bit TLS encryption with server-side signature verification.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
