import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { CoursesSection } from './components/CoursesSection';
import { AboutSection } from './components/AboutSection';
import { TradingMasterSection } from './components/TradingMasterSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { EnrollmentModal } from './components/EnrollmentModal';
import { AdminPortal } from './components/AdminPortal';
import { LegalModal } from './components/LegalModals';
import { PaymentSuccessPage } from './components/PaymentSuccessPage';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [enrollmentOpen, setEnrollmentOpen] = useState(false);
  const [enrollmentCourse, setEnrollmentCourse] = useState<'AJT77 Basic' | 'AJT77 Pro'>('AJT77 Basic');
  const [adminOpen, setAdminOpen] = useState(false);
  const [legalModalType, setLegalModalType] = useState<'DISCLAIMER' | 'TERMS' | 'PRIVACY' | null>(null);

  // Dedicated Payment Success View routing
  const [paymentSuccessOrderId, setPaymentSuccessOrderId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    const path = window.location.pathname;
    const urlParams = new URLSearchParams(window.location.search);
    if (path === '/payment-success' || path.startsWith('/payment-success')) {
      return urlParams.get('order_id') || urlParams.get('id') || 'verified';
    }
    return null;
  });

  // Handle URL changes (popstate & hashchange)
  useEffect(() => {
    const handleUrlRouting = () => {
      const path = window.location.pathname;
      const urlParams = new URLSearchParams(window.location.search);

      if (path === '/payment-success' || path.startsWith('/payment-success')) {
        setPaymentSuccessOrderId(urlParams.get('order_id') || urlParams.get('id') || 'verified');
        return;
      } else {
        setPaymentSuccessOrderId(null);
      }

      const hash = window.location.hash.replace('#', '');
      if (hash === 'admin') {
        setAdminOpen(true);
      } else if (hash) {
        setActiveTab(hash);
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };

    handleUrlRouting();
    window.addEventListener('popstate', handleUrlRouting);
    window.addEventListener('hashchange', handleUrlRouting);

    return () => {
      window.removeEventListener('popstate', handleUrlRouting);
      window.removeEventListener('hashchange', handleUrlRouting);
    };
  }, []);

  const handleNavigate = (tab: string) => {
    // If currently on payment success page, transition back to main layout
    if (paymentSuccessOrderId) {
      setPaymentSuccessOrderId(null);
      window.history.pushState(null, '', '/');
    }

    setActiveTab(tab);
    if (tab === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      window.history.pushState(null, '', '/');
    } else {
      window.history.pushState(null, '', `#${tab}`);
      const element = document.getElementById(tab);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleOpenEnrollment = (course: 'AJT77 Basic' | 'AJT77 Pro' = 'AJT77 Basic') => {
    setEnrollmentCourse(course);
    setEnrollmentOpen(true);
  };

  const handlePaymentSuccessRedirect = (orderId: string) => {
    setEnrollmentOpen(false);
    setPaymentSuccessOrderId(orderId);
    window.history.pushState(null, '', `/payment-success?order_id=${encodeURIComponent(orderId)}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReturnHomeFromPayment = () => {
    setPaymentSuccessOrderId(null);
    window.history.pushState(null, '', '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If user is on /payment-success, render the dedicated payment success confirmation screen
  if (paymentSuccessOrderId) {
    return (
      <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans selection:bg-sky-500/30 selection:text-sky-200">
        <Navbar
          activeTab={activeTab}
          currentTab={activeTab}
          onNavigate={handleNavigate}
          setCurrentTab={handleNavigate}
          onOpenEnroll={(course) => handleOpenEnrollment(course || 'AJT77 Basic')}
          onOpenAdmin={() => setAdminOpen(true)}
        />

        <main className="flex-1">
          <PaymentSuccessPage
            orderIdFromUrl={paymentSuccessOrderId === 'verified' ? undefined : paymentSuccessOrderId}
            onNavigateHome={handleReturnHomeFromPayment}
          />
        </main>

        <Footer onNavigate={handleNavigate} onOpenLegal={(type) => setLegalModalType(type)} />
        <AdminPortal isOpen={adminOpen} onClose={() => setAdminOpen(false)} />
        <LegalModal type={legalModalType} onClose={() => setLegalModalType(null)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans selection:bg-sky-500/30 selection:text-sky-200">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        currentTab={activeTab}
        onNavigate={handleNavigate}
        setCurrentTab={handleNavigate}
        onOpenEnroll={(course) => handleOpenEnrollment(course || 'AJT77 Basic')}
        onOpenAdmin={() => setAdminOpen(true)}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* Section 1: Hero */}
        <Hero
          onExploreCourses={() => handleNavigate('courses')}
          onViewJourney={() => handleNavigate('journey')}
          onViewBook={() => handleNavigate('trading-master')}
        />

        {/* Section 2: Courses (AJT77 Basic ₹6,000 / AJT77 Pro ₹10,000) */}
        <CoursesSection onEnroll={handleOpenEnrollment} />

        {/* Section 3: About Ajay Gadhe & Trading Journey (Redesigned) */}
        <AboutSection />

        {/* Section 4: Trading Master Book & Early Access Waitlist (Coming Soon) */}
        <TradingMasterSection />

        {/* Section 5: Contact & Official Community Links */}
        <ContactSection />
      </main>

      {/* Footer & Risk Disclaimers */}
      <Footer onNavigate={handleNavigate} onOpenLegal={(type) => setLegalModalType(type)} />

      {/* Razorpay Standard Checkout Enrollment Modal */}
      <EnrollmentModal
        isOpen={enrollmentOpen}
        defaultCourse={enrollmentCourse}
        courseName={enrollmentCourse}
        onClose={() => setEnrollmentOpen(false)}
        onPaymentSuccess={handlePaymentSuccessRedirect}
      />

      {/* Admin Portal */}
      <AdminPortal isOpen={adminOpen} onClose={() => setAdminOpen(false)} />

      {/* Regulatory & Legal Modals */}
      <LegalModal type={legalModalType} onClose={() => setLegalModalType(null)} />
    </div>
  );
}
