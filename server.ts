import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db';
import { razorpayService } from './server/razorpay';
import { emailService } from './server/email';
import { sendSuccess, sendError } from './server/response';
import {
  createAdminToken,
  requireAdminAuth,
  type AuthenticatedRequest,
} from './server/auth';
import type { OrderRecord } from './src/types';

const PORT = 3000;

async function startServer() {
  const app = express();

  // Capture raw body for Razorpay webhook HMAC verification
  app.use(
    express.json({
      verify: (req: any, _res, buf) => {
        req.rawBody = buf;
      },
      limit: '10mb',
    })
  );
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request logger & security headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  // ==========================================
  // PUBLIC & CONFIG API ROUTES
  // ==========================================

  app.get('/api/health', (_req, res) => {
    return sendSuccess(res, {
      status: 'healthy',
      brand: 'AJT77',
      subBrand: 'AjayTrades77',
      founder: 'Ajay Gadhe',
      timestamp: new Date().toISOString(),
      razorpayConfigured: !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
      emailProviderConfigured: emailService.isEmailProviderConfigured(),
      supportWhatsAppConfigured: !!process.env.SUPPORT_WHATSAPP_NUMBER,
    }, 'AJT77 Core API is healthy');
  });

  /**
   * Public configuration:
   * Exposes ONLY public Key ID, NEVER the Key Secret.
   */
  app.get('/api/config', (_req, res) => {
    try {
      const keyId = razorpayService.getPublicKey();
      const siteUrl = process.env.SITE_URL || process.env.APP_URL || 'https://ais-pre-zxgpvmltr76ymnbu553qhr-114491070892.asia-east1.run.app';
      const supportWhatsAppNumber = process.env.SUPPORT_WHATSAPP_NUMBER?.trim() || null;
      return sendSuccess(res, {
        razorpayKeyId: keyId,
        siteUrl,
        brand: 'AJT77',
        subBrand: 'AjayTrades77',
        founder: 'Ajay Gadhe',
        currency: 'INR',
        supportWhatsAppNumber,
        courses: {
          basic: { name: 'AJT77 Basic', price: 6000 },
          pro: { name: 'AJT77 Pro', price: 10000 },
        },
      }, 'Configuration retrieved successfully');
    } catch (err: any) {
      return sendError(res, 'CONFIG_ERROR', err.message || 'Configuration error', 500);
    }
  });

  // ==========================================
  // RAZORPAY ORDERS & PAYMENT VERIFICATION
  // ==========================================

  /**
   * Create Razorpay Order Server-Side
   * - Enforces exact prices: AJT77 Basic = ₹6,000 | AJT77 Pro = ₹10,000
   * - Creates order via official Razorpay Orders API
   * - Persists record in Database before checkout opens
   */
  app.post('/api/payments/create-order', async (req, res) => {
    try {
      const { course, customerName, customerEmail, customerPhone } = req.body;

      // Validation
      if (!course || (course !== 'AJT77 Basic' && course !== 'AJT77 Pro')) {
        return sendError(res, 'VALIDATION_ERROR', 'Invalid course selection. Must be AJT77 Basic or AJT77 Pro.', 422, {
          field: 'course',
          allowed: ['AJT77 Basic', 'AJT77 Pro'],
        });
      }

      if (!customerName || typeof customerName !== 'string' || customerName.trim().length < 2) {
        return sendError(res, 'VALIDATION_ERROR', 'Please enter your full name.', 422, { field: 'customerName' });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!customerEmail || !emailRegex.test(customerEmail.trim())) {
        return sendError(res, 'VALIDATION_ERROR', 'Please provide a valid email address.', 422, { field: 'customerEmail' });
      }

      const phoneClean = (customerPhone || '').replace(/[^0-9+]/g, '');
      if (!phoneClean || phoneClean.length < 10) {
        return sendError(res, 'VALIDATION_ERROR', 'Please provide a valid 10-digit mobile number.', 422, { field: 'customerPhone' });
      }

      // Exact pricing rules
      const amountInINR = course === 'AJT77 Basic' ? 6000 : 10000;
      const amountInPaise = amountInINR * 100; // Razorpay amounts are in paise

      // Generate unique internal order ID
      const internalOrderId = `ord_ajt77_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;

      // Call Razorpay Orders REST API server-side using secure Live credentials
      let rzpOrder;
      try {
        rzpOrder = await razorpayService.createOrder({
          amountInPaise,
          currency: 'INR',
          receipt: internalOrderId,
          notes: {
            course,
            customer_name: customerName.trim(),
            customer_email: customerEmail.trim(),
            customer_phone: phoneClean,
            platform: 'AJT77 Official Website',
          },
        });
      } catch (rzpErr: any) {
        console.error('Razorpay Orders API failure:', rzpErr);
        return sendError(res, 'RAZORPAY_ORDER_CREATION_FAILED', `Failed to create Razorpay Order: ${rzpErr.message}`, 502);
      }

      // Persist order record in database with initial status CREATED
      const newOrder: OrderRecord = {
        id: internalOrderId,
        course,
        amount: amountInINR,
        currency: 'INR',
        razorpay_order_id: rzpOrder.id,
        razorpay_payment_id: null,
        payment_status: 'CREATED',
        customer_name: customerName.trim(),
        customer_email: customerEmail.trim().toLowerCase(),
        customer_phone: phoneClean,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {
          razorpay_order_status: rzpOrder.status,
          attempts: rzpOrder.attempts,
        },
      };

      db.createOrder(newOrder);

      db.logAudit({
        admin_user_id: 'customer',
        action: 'ORDER_CREATED',
        entity_type: 'ORDER',
        entity_id: internalOrderId,
        metadata: {
          course,
          amount: amountInINR,
          razorpay_order_id: rzpOrder.id,
          email: customerEmail,
        },
        ip_address: req.ip || 'unknown',
        user_agent: req.headers['user-agent'] || 'unknown',
      });

      // Send canonical success response
      // Only public keyId is provided to client for Standard Checkout
      return sendSuccess(res, {
        orderId: internalOrderId,
        razorpayOrderId: rzpOrder.id,
        amount: rzpOrder.amount, // in paise
        currency: rzpOrder.currency,
        keyId: razorpayService.getPublicKey(),
        course,
        customer: {
          name: customerName.trim(),
          email: customerEmail.trim().toLowerCase(),
          phone: phoneClean,
        },
      }, 'Razorpay order created successfully. Ready for Standard Checkout.', 201);
    } catch (err: any) {
      console.error('Create order error:', err);
      return sendError(res, 'INTERNAL_SERVER_ERROR', err.message || 'Internal server error', 500);
    }
  });

  /**
   * Server-Side Payment Signature Verification
   * Formula: HMAC_SHA256(order_id + "|" + razorpay_payment_id, RAZORPAY_KEY_SECRET)
   * Only after cryptographic verification does the order become PAID!
   */
  app.post('/api/payments/verify', async (req, res) => {
    try {
      const { internalOrderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

      if (!internalOrderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        return sendError(res, 'VALIDATION_ERROR', 'Missing required payment verification parameters.', 422, {
          required: ['internalOrderId', 'razorpayOrderId', 'razorpayPaymentId', 'razorpaySignature'],
        });
      }

      // Check order exists in database
      const order = db.getOrderById(internalOrderId);
      if (!order) {
        return sendError(res, 'ORDER_NOT_FOUND', `Order ${internalOrderId} not found in database`, 404);
      }

      // Ensure razorpay_order_id matches database record
      if (order.razorpay_order_id !== razorpayOrderId) {
        return sendError(res, 'BAD_REQUEST', 'Order ID mismatch between client and server record', 400);
      }

      // Verify HMAC SHA256 Signature using Razorpay Key Secret server-side
      const isSignatureValid = razorpayService.verifyPaymentSignature({
        orderId: razorpayOrderId,
        paymentId: razorpayPaymentId,
        signature: razorpaySignature,
      });

      if (!isSignatureValid) {
        // Record failed attempt
        db.updateOrder(internalOrderId, {
          payment_status: 'FAILED',
          razorpay_payment_id: razorpayPaymentId,
          metadata: {
            ...order.metadata,
            failure_reason: 'Cryptographic signature mismatch',
          },
        });

        db.logAudit({
          admin_user_id: 'system',
          action: 'PAYMENT_SIGNATURE_FAILED',
          entity_type: 'ORDER',
          entity_id: internalOrderId,
          metadata: {
            razorpayOrderId,
            razorpayPaymentId,
          },
          ip_address: req.ip || 'unknown',
          user_agent: req.headers['user-agent'] || 'unknown',
        });

        return sendError(res, 'PAYMENT_SIGNATURE_MISMATCH', 'Cryptographic verification of Razorpay payment signature failed. Order marked as FAILED.', 422);
      }

      // Signature is mathematically valid! Double check live payment details with Razorpay API
      let paymentDetails: any = null;
      try {
        paymentDetails = await razorpayService.getPaymentDetails(razorpayPaymentId);
      } catch (fetchErr) {
        console.warn('Could not fetch live payment entity, continuing with verified signature:', fetchErr);
      }

      // Mark order as PAID in database
      const updatedOrder = db.updateOrder(internalOrderId, {
        payment_status: 'PAID',
        razorpay_payment_id: razorpayPaymentId,
        verification_method: 'SIGNATURE',
        metadata: {
          ...order.metadata,
          payment_method: paymentDetails?.method || 'Standard Checkout',
          bank: paymentDetails?.bank || null,
          vpa: paymentDetails?.vpa || null,
          verified_at: new Date().toISOString(),
        },
      });

      // Dispatch automated confirmation email if not yet sent
      if (updatedOrder && !updatedOrder.email_confirmation_sent) {
        db.updateOrder(updatedOrder.id, {
          email_confirmation_sent: true,
          email_confirmation_sent_at: new Date().toISOString(),
        });
        emailService.sendPaymentConfirmationEmail(updatedOrder).catch((e) => {
          console.error('[Email Service] Failed to send payment confirmation email:', e);
        });
        emailService.sendSaleAdminNotification(updatedOrder).catch((e) => {
          console.error('[Email Service] Failed to send sale notification to admin:', e);
        });
      }

      db.logAudit({
        admin_user_id: 'system',
        action: 'PAYMENT_VERIFIED_SUCCESSFUL',
        entity_type: 'ORDER',
        entity_id: internalOrderId,
        metadata: {
          course: order.course,
          amount: order.amount,
          razorpayPaymentId,
          method: paymentDetails?.method,
        },
        ip_address: req.ip || 'unknown',
        user_agent: req.headers['user-agent'] || 'unknown',
      });

      return sendSuccess(res, {
        order: updatedOrder,
        enrollmentConfirmed: true,
        message: `Congratulations ${order.customer_name}! Your enrollment in ${order.course} has been successfully confirmed.`,
      }, 'Payment signature verified successfully. Course enrollment confirmed.');
    } catch (err: any) {
      console.error('Payment verification error:', err);
      return sendError(res, 'INTERNAL_SERVER_ERROR', err.message || 'Error during payment verification', 500);
    }
  });

  /**
   * Razorpay Webhook Handler
   * Secure endpoint to receive real-time updates from Razorpay
   * Signature verified via HMAC SHA256 of raw body
   */
  const handleRazorpayWebhook = async (req: AuthenticatedRequest, res: any) => {
    try {
      const signature = req.headers['x-razorpay-signature'] as string;
      if (!signature) {
        return sendError(res, 'UNAUTHORIZED', 'Missing x-razorpay-signature header', 401);
      }

      const rawBody = req.rawBody || Buffer.from(JSON.stringify(req.body));
      const isValid = razorpayService.verifyWebhookSignature(rawBody, signature);

      if (!isValid) {
        console.warn('Invalid Razorpay webhook signature attempt');
        return sendError(res, 'FORBIDDEN', 'Invalid webhook signature', 403);
      }

      const event = req.body;
      const eventType = event?.event;
      const payload = event?.payload;

      console.log(`[Razorpay Webhook] Received verified event: ${eventType}`);

      if (eventType === 'order.paid' || eventType === 'payment.captured') {
        const paymentEntity = payload?.payment?.entity;
        const orderEntity = payload?.order?.entity;
        const razorpayOrderId = orderEntity?.id || paymentEntity?.order_id;
        const razorpayPaymentId = paymentEntity?.id;

        if (razorpayOrderId) {
          const existingOrder = db.getOrderByRazorpayOrderId(razorpayOrderId);
          if (existingOrder && existingOrder.payment_status !== 'PAID') {
            const updated = db.updateOrder(existingOrder.id, {
              payment_status: 'PAID',
              razorpay_payment_id: razorpayPaymentId || existingOrder.razorpay_payment_id,
              verification_method: 'WEBHOOK',
              metadata: {
                ...existingOrder.metadata,
                webhook_event: eventType,
                method: paymentEntity?.method,
                verified_at: new Date().toISOString(),
              },
            });

            // Send confirmation email if not yet sent
            if (updated && !updated.email_confirmation_sent) {
              db.updateOrder(updated.id, {
                email_confirmation_sent: true,
                email_confirmation_sent_at: new Date().toISOString(),
              });
              emailService.sendPaymentConfirmationEmail(updated).catch((e) => {
                console.error('[Email Service Webhook] Error dispatching confirmation email:', e);
              });
              emailService.sendSaleAdminNotification(updated).catch((e) => {
                console.error('[Email Service Webhook] Error dispatching sale admin notification:', e);
              });
            }

            db.logAudit({
              admin_user_id: 'webhook',
              action: 'ORDER_PAID_VIA_WEBHOOK',
              entity_type: 'ORDER',
              entity_id: existingOrder.id,
              metadata: { eventType, razorpayOrderId, razorpayPaymentId },
              ip_address: req.ip || 'webhook',
              user_agent: 'Razorpay-Webhook',
            });
          }
        }
      } else if (eventType === 'payment.failed') {
        const paymentEntity = payload?.payment?.entity;
        const razorpayOrderId = paymentEntity?.order_id;
        if (razorpayOrderId) {
          const existingOrder = db.getOrderByRazorpayOrderId(razorpayOrderId);
          if (existingOrder && existingOrder.payment_status !== 'PAID') {
            db.updateOrder(existingOrder.id, {
              payment_status: 'FAILED',
              metadata: {
                ...existingOrder.metadata,
                webhook_failure: paymentEntity?.error_description,
              },
            });
          }
        }
      }

      return sendSuccess(res, { received: true, event: eventType }, 'Webhook processed successfully');
    } catch (err: any) {
      console.error('Webhook error:', err);
      return sendError(res, 'INTERNAL_SERVER_ERROR', err.message, 500);
    }
  };

  app.post('/api/webhook/razorpay', handleRazorpayWebhook);
  app.post('/api/razorpay/webhook', handleRazorpayWebhook);

  /**
   * Get verified status of an order for /payment-success page
   */
  app.get('/api/orders/:id', (req, res) => {
    const order = db.getOrderById(req.params.id);
    if (!order) {
      return sendError(res, 'ORDER_NOT_FOUND', 'Order not found', 404);
    }
    // Return verified order confirmation details
    return sendSuccess(res, {
      id: order.id,
      course: order.course,
      amount: order.amount,
      currency: order.currency,
      payment_status: order.payment_status,
      customer_name: order.customer_name,
      customer_email: order.customer_email,
      customer_phone: order.customer_phone,
      razorpay_order_id: order.razorpay_order_id,
      razorpay_payment_id: order.razorpay_payment_id,
      created_at: order.created_at,
      verified_at: (order.metadata as any)?.verified_at || order.updated_at,
      isPaid: order.payment_status === 'PAID',
    }, 'Order details retrieved');
  });

  // ==========================================
  // PUBLIC CONTENT ENDPOINTS
  // ==========================================

  // Charts
  app.get('/api/charts', (_req, res) => {
    const charts = db.listCharts(false);
    return sendSuccess(res, charts, 'Published charts retrieved');
  });

  app.get('/api/charts/:slug', (req, res) => {
    const chart = db.getChartBySlug(req.params.slug);
    if (!chart || chart.status !== 'PUBLISHED') {
      return sendError(res, 'CHART_NOT_FOUND', 'Chart not found or not published', 404);
    }
    return sendSuccess(res, chart, 'Chart retrieved');
  });

  // Track Records
  app.get('/api/track-records', (_req, res) => {
    const records = db.listTrackRecords(false);
    return sendSuccess(res, records, 'Published track records retrieved');
  });

  // Courses
  app.get('/api/courses', (_req, res) => {
    const courses = db.listCourses();
    return sendSuccess(res, courses, 'Courses retrieved');
  });

  app.get('/api/courses/:slug', (req, res) => {
    const course = db.getCourseBySlug(req.params.slug);
    if (!course) {
      return sendError(res, 'COURSE_NOT_FOUND', 'Course not found', 404);
    }
    return sendSuccess(res, course, 'Course retrieved');
  });

  // Trading Master Book
  app.get('/api/book', (_req, res) => {
    const book = db.getBook();
    return sendSuccess(res, book, 'Trading Master book status retrieved');
  });

  app.post('/api/book/waitlist', async (req, res) => {
    try {
      const { name, email } = req.body;
      const cleanName = (name || '').trim();
      const cleanEmail = (email || '').trim().toLowerCase();

      if (!cleanName || cleanName.length < 2) {
        return sendError(res, 'VALIDATION_ERROR', 'Please enter your full name', 422, { field: 'name' });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!cleanEmail || !emailRegex.test(cleanEmail)) {
        return sendError(res, 'VALIDATION_ERROR', 'Please enter a valid email address', 422, { field: 'email' });
      }

      const existing = db.findWaitlistByEmail(cleanEmail);
      if (existing) {
        return sendSuccess(res, {
          isNew: false,
          alreadyRegistered: true,
          waitlistCount: db.getBook().waitlist_count,
        }, 'You are already registered on the Trading Master priority waitlist!');
      }

      const { entry } = db.createWaitlistEntry(cleanName, cleanEmail);

      emailService.sendWaitlistUserConfirmation(cleanName, cleanEmail).catch((err) => {
        console.error('[Waitlist Email] Error sending user confirmation:', err);
      });
      emailService.sendWaitlistAdminNotification(cleanName, cleanEmail, entry.created_at).catch((err) => {
        console.error('[Waitlist Email] Error sending admin alert:', err);
      });

      return sendSuccess(res, {
        isNew: true,
        alreadyRegistered: false,
        entry,
        waitlistCount: db.getBook().waitlist_count,
      }, 'Thank you for registering for early access to Trading Master by Ajay Gadhe.', 201);
    } catch (err: any) {
      console.error('Book waitlist error:', err);
      return sendError(res, 'INTERNAL_SERVER_ERROR', err.message, 500);
    }
  });

  // Public Configuration
  app.get('/api/config', (_req, res) => {
    return sendSuccess(res, {
      supportWhatsAppNumber: process.env.SUPPORT_WHATSAPP_NUMBER || '',
      appName: 'AJT77',
      currency: 'INR',
    }, 'Public configuration retrieved');
  });

  // Social Links
  app.get('/api/social-links', (_req, res) => {
    const links = db.listSocialLinks().filter((s) => s.is_active);
    return sendSuccess(res, links, 'Social links retrieved');
  });

  // Course Enquiry
  app.post('/api/course-enquiry', (req, res) => {
    const { name, email, phone, courseId, message } = req.body;
    if (!name || !email || !message) {
      return sendError(res, 'ENQUIRY_VALIDATION_ERROR', 'Name, email, and message are required', 422);
    }
    const newEnquiry = db.createEnquiry({
      id: `enq_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: (phone || '').trim(),
      course_id: courseId || 'General Enquiry',
      message: message.trim(),
      status: 'NEW',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    return sendSuccess(res, newEnquiry, 'Thank you! Your course enquiry has been submitted. Our team will contact you shortly.', 201);
  });

  // Contact Message
  app.post('/api/contact', async (req, res) => {
    const { name, email, phone, message } = req.body;
    if (!name || !email || !message) {
      return sendError(res, 'CONTACT_VALIDATION_ERROR', 'Name, email, and message are required', 422);
    }
    const cleanName = String(name).trim();
    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPhone = phone ? String(phone).trim() : undefined;
    const cleanMessage = String(message).trim();

    const newMsg = db.createMessage({
      id: `msg_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      message: cleanMessage,
      status: 'UNREAD',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // 1. Send automatic confirmation email to visitor's submitted email
    emailService.sendContactConfirmation(cleanName, cleanEmail, cleanMessage).catch((err) => {
      console.error('[Contact Email] Error sending visitor confirmation email:', err);
    });

    // 2. Send notification email to ADMIN_EMAIL containing visitor details and complete message
    emailService.sendContactAdminNotification(cleanName, cleanEmail, cleanPhone, cleanMessage).catch((err) => {
      console.error('[Contact Email] Error sending admin alert email:', err);
    });

    return sendSuccess(res, newMsg, 'Your message has been sent to Ajay Gadhe / AJT77 team.', 201);
  });

  // Book Early Access Waitlist
  app.post('/api/waitlist', async (req, res) => {
    try {
      const { name, email } = req.body;
      const cleanName = (name || '').trim();
      const cleanEmail = (email || '').trim().toLowerCase();

      if (!cleanName || cleanName.length < 2) {
        return sendError(res, 'VALIDATION_ERROR', 'Please enter your full name', 422, { field: 'name' });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!cleanEmail || !emailRegex.test(cleanEmail)) {
        return sendError(res, 'VALIDATION_ERROR', 'Please enter a valid email address', 422, { field: 'email' });
      }

      const existing = db.findWaitlistByEmail(cleanEmail);
      if (existing) {
        return sendSuccess(res, {
          isNew: false,
          alreadyRegistered: true,
          entry: existing,
          totalWaitlist: db.getBook().waitlist_count,
        }, 'You are already registered on the Trading Master priority waitlist!');
      }

      const { entry } = db.createWaitlistEntry(cleanName, cleanEmail);

      // Trigger automated transactional emails (user confirmation & admin notification)
      emailService.sendWaitlistUserConfirmation(cleanName, cleanEmail).catch((err) => {
        console.error('[Waitlist Email] Error sending user confirmation:', err);
      });
      emailService.sendWaitlistAdminNotification(cleanName, cleanEmail, entry.created_at).catch((err) => {
        console.error('[Waitlist Email] Error sending admin alert:', err);
      });

      db.logAudit({
        admin_user_id: 'public',
        action: 'WAITLIST_ENTRY_CREATED',
        entity_type: 'BOOK',
        entity_id: entry.id,
        metadata: { name: cleanName, email: cleanEmail },
        ip_address: req.ip || 'unknown',
        user_agent: req.headers['user-agent'] || 'unknown',
      });

      return sendSuccess(res, {
        isNew: true,
        alreadyRegistered: false,
        entry,
        totalWaitlist: db.getBook().waitlist_count,
      }, 'Thank you! You are officially registered for early access to Trading Master.', 201);
    } catch (err: any) {
      console.error('Waitlist registration error:', err);
      return sendError(res, 'INTERNAL_SERVER_ERROR', err.message || 'Waitlist registration failed', 500);
    }
  });

  // ==========================================
  // SECURE ADMIN ENDPOINTS
  // ==========================================

  // Admin Login - Environment variables are the strict single source of truth
  app.post('/api/admin/login', (req, res) => {
    const { email, password } = req.body;
    const configuredAdminEmail = (process.env.ADMIN_EMAIL || '').trim();
    const configuredAdminPassword = (process.env.ADMIN_PASSWORD || '').trim();

    if (!configuredAdminEmail || !configuredAdminPassword) {
      console.error('[Admin Auth] Error: ADMIN_EMAIL or ADMIN_PASSWORD not configured in environment variables');
      return sendError(res, 'SERVER_CONFIG_ERROR', 'Administrative credentials are not configured in server environment variables.', 500);
    }

    if (!email || !password) {
      return sendError(res, 'VALIDATION_ERROR', 'Email and password are required', 422);
    }

    const inputEmail = String(email).trim().toLowerCase();
    const inputPassword = String(password).trim();

    const isEmailMatch = inputEmail === configuredAdminEmail.toLowerCase();
    const isPasswordMatch = inputPassword === configuredAdminPassword;

    if (!isEmailMatch || !isPasswordMatch) {
      db.logAudit({
        admin_user_id: 'anonymous',
        action: 'ADMIN_LOGIN_FAILED',
        entity_type: 'AUTH',
        entity_id: inputEmail,
        metadata: { ip: req.ip },
        ip_address: req.ip || 'unknown',
        user_agent: req.headers['user-agent'] || 'unknown',
      });
      return sendError(res, 'INVALID_CREDENTIALS', 'Invalid administrative credentials', 401);
    }

    const token = createAdminToken({
      userId: 'usr_super_admin',
      email: configuredAdminEmail,
      role: 'SUPER_ADMIN',
    });

    db.logAudit({
      admin_user_id: 'usr_super_admin',
      action: 'ADMIN_LOGIN_SUCCESS',
      entity_type: 'AUTH',
      entity_id: 'usr_super_admin',
      metadata: { email: configuredAdminEmail },
      ip_address: req.ip || 'unknown',
      user_agent: req.headers['user-agent'] || 'unknown',
    });

    return sendSuccess(res, {
      token,
      user: {
        id: 'usr_super_admin',
        email: configuredAdminEmail,
        role: 'SUPER_ADMIN',
      },
    }, 'Admin login successful');
  });

  app.post('/api/admin/logout', requireAdminAuth, (req: AuthenticatedRequest, res) => {
    db.logAudit({
      admin_user_id: req.admin?.userId || 'admin',
      action: 'ADMIN_LOGOUT',
      entity_type: 'AUTH',
      entity_id: req.admin?.userId || 'admin',
      metadata: {},
      ip_address: req.ip || 'unknown',
      user_agent: req.headers['user-agent'] || 'unknown',
    });
    return sendSuccess(res, { loggedOut: true }, 'Logged out successfully');
  });

  app.get('/api/admin/me', requireAdminAuth, (req: AuthenticatedRequest, res) => {
    return sendSuccess(res, {
      user: req.admin,
    }, 'Admin identity verified');
  });

  // Admin Dashboard Overview
  app.get('/api/admin/overview', requireAdminAuth, (_req, res) => {
    const orders = db.listOrders();
    const paidOrders = orders.filter((o) => o.payment_status === 'PAID');
    const totalRevenueINR = paidOrders.reduce((sum, o) => sum + o.amount, 0);

    const charts = db.listCharts(true);
    const publishedCharts = charts.filter((c) => c.status === 'PUBLISHED').length;
    const draftCharts = charts.filter((c) => c.status === 'DRAFT').length;

    const trackRecords = db.listTrackRecords(true).length;
    const enquiries = db.listEnquiries();
    const newEnquiries = enquiries.filter((e) => e.status === 'NEW').length;

    const messages = db.listMessages();
    const unreadMessages = messages.filter((m) => m.status === 'UNREAD').length;

    const book = db.getBook();

    return sendSuccess(res, {
      metrics: {
        totalRevenueINR,
        totalOrdersCount: orders.length,
        paidOrdersCount: paidOrders.length,
        publishedChartsCount: publishedCharts,
        draftChartsCount: draftCharts,
        trackRecordsCount: trackRecords,
        newEnquiriesCount: newEnquiries,
        unreadMessagesCount: unreadMessages,
        bookWaitlistCount: book.waitlist_count,
      },
      recentOrders: orders.slice(0, 10),
      recentAuditLogs: db.listAuditLogs().slice(0, 8),
      razorpayLiveStatus: {
        keyIdMasked: process.env.RAZORPAY_KEY_ID ? `${process.env.RAZORPAY_KEY_ID.slice(0, 8)}...${process.env.RAZORPAY_KEY_ID.slice(-4)}` : 'NOT_CONFIGURED',
        secretConfigured: !!process.env.RAZORPAY_KEY_SECRET,
        mode: 'LIVE',
      },
    }, 'Admin overview statistics retrieved');
  });

  // Orders Management
  app.get('/api/admin/orders', requireAdminAuth, (_req, res) => {
    const orders = db.listOrders();
    return sendSuccess(res, orders, 'All orders retrieved');
  });

  // Waitlist Management
  app.get('/api/admin/waitlist', requireAdminAuth, (_req, res) => {
    const waitlist = db.listWaitlist();
    return sendSuccess(res, waitlist, 'All waitlist registrations retrieved');
  });

  // Sync / Re-verify an order directly with Razorpay API
  app.post('/api/admin/orders/:id/sync', requireAdminAuth, async (req: AuthenticatedRequest, res) => {
    const order = db.getOrderById(req.params.id);
    if (!order) {
      return sendError(res, 'ORDER_NOT_FOUND', 'Order not found', 404);
    }

    try {
      if (order.razorpay_payment_id) {
        const paymentData = await razorpayService.getPaymentDetails(order.razorpay_payment_id);
        const isPaid = paymentData.status === 'captured' || paymentData.status === 'authorized';
        const updated = db.updateOrder(order.id, {
          payment_status: isPaid ? 'PAID' : order.payment_status,
          metadata: {
            ...order.metadata,
            sync_payment_status: paymentData.status,
            synced_at: new Date().toISOString(),
          },
        });
        return sendSuccess(res, updated, `Order synced with Razorpay: ${paymentData.status}`);
      } else {
        return sendSuccess(res, order, 'No payment ID associated yet with this order');
      }
    } catch (err: any) {
      return sendError(res, 'RAZORPAY_SYNC_FAILED', err.message || 'Failed to sync with Razorpay', 502);
    }
  });

  // Charts Admin CRUD
  app.get('/api/admin/charts', requireAdminAuth, (_req, res) => {
    return sendSuccess(res, db.listCharts(true), 'All charts retrieved');
  });

  app.post('/api/admin/charts', requireAdminAuth, (req: AuthenticatedRequest, res) => {
    const { title, instrument, market, timeframe, analysis, entry, stop_loss, target, risk_reward, chart_image_url, status } = req.body;
    if (!title || !instrument || !analysis) {
      return sendError(res, 'VALIDATION_ERROR', 'Title, instrument, and analysis are required', 422);
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') + `-${Date.now().toString().slice(-4)}`;

    const newChart = db.createChart({
      id: `chart_${Date.now()}`,
      title,
      slug,
      instrument,
      market: market || 'Forex',
      timeframe: timeframe || '1H',
      analysis,
      entry: entry || '',
      stop_loss: stop_loss || '',
      target: target || '',
      risk_reward: risk_reward || '1:2',
      chart_image_url: chart_image_url || 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=1200&q=80',
      status: status || 'PUBLISHED',
      published_at: status === 'PUBLISHED' ? new Date().toISOString() : null,
      created_by: 'Ajay Gadhe',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    db.logAudit({
      admin_user_id: req.admin?.userId || 'admin',
      action: 'CHART_CREATED',
      entity_type: 'CHART',
      entity_id: newChart.id,
      metadata: { title, status },
      ip_address: req.ip || 'unknown',
      user_agent: req.headers['user-agent'] || 'unknown',
    });

    return sendSuccess(res, newChart, 'Chart created successfully', 201);
  });

  app.patch('/api/admin/charts/:id', requireAdminAuth, (req: AuthenticatedRequest, res) => {
    const updated = db.updateChart(req.params.id, req.body);
    if (!updated) {
      return sendError(res, 'CHART_NOT_FOUND', 'Chart not found', 404);
    }
    db.logAudit({
      admin_user_id: req.admin?.userId || 'admin',
      action: 'CHART_UPDATED',
      entity_type: 'CHART',
      entity_id: req.params.id,
      metadata: req.body,
      ip_address: req.ip || 'unknown',
      user_agent: req.headers['user-agent'] || 'unknown',
    });
    return sendSuccess(res, updated, 'Chart updated successfully');
  });

  app.delete('/api/admin/charts/:id', requireAdminAuth, (req: AuthenticatedRequest, res) => {
    const deleted = db.deleteChart(req.params.id);
    if (!deleted) {
      return sendError(res, 'CHART_NOT_FOUND', 'Chart not found', 404);
    }
    db.logAudit({
      admin_user_id: req.admin?.userId || 'admin',
      action: 'CHART_DELETED',
      entity_type: 'CHART',
      entity_id: req.params.id,
      metadata: {},
      ip_address: req.ip || 'unknown',
      user_agent: req.headers['user-agent'] || 'unknown',
    });
    return sendSuccess(res, { id: req.params.id }, 'Chart deleted successfully');
  });

  // Track Record Admin CRUD
  app.get('/api/admin/track-record', requireAdminAuth, (_req, res) => {
    return sendSuccess(res, db.listTrackRecords(true), 'All track records retrieved');
  });

  app.post('/api/admin/track-record', requireAdminAuth, (req: AuthenticatedRequest, res) => {
    const { title, category, description, document_url, thumbnail_url, document_date, status, redaction_confirmed } = req.body;

    if (!title || !category || !description) {
      return sendError(res, 'VALIDATION_ERROR', 'Title, category, and description are required', 422);
    }

    // Explicit redaction confirmation check requirement from Prompt Section 15
    if (status === 'PUBLISHED' && !redaction_confirmed) {
      return sendError(res, 'TRACK_RECORD_REDACTION_REQUIRED', 'Explicit confirmation of sensitive data redaction is required before publishing.', 422);
    }

    const record = db.createTrackRecord({
      id: `tr_${Date.now()}`,
      title,
      category,
      description,
      document_url: document_url || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80',
      thumbnail_url: thumbnail_url || document_url || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
      document_date: document_date || new Date().toISOString().split('T')[0],
      status: status || 'PUBLISHED',
      redaction_confirmed: !!redaction_confirmed,
      created_by: 'Ajay Gadhe',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    db.logAudit({
      admin_user_id: req.admin?.userId || 'admin',
      action: 'TRACK_RECORD_CREATED',
      entity_type: 'TRACK_RECORD',
      entity_id: record.id,
      metadata: { title, category, status },
      ip_address: req.ip || 'unknown',
      user_agent: req.headers['user-agent'] || 'unknown',
    });

    return sendSuccess(res, record, 'Track record created successfully', 201);
  });

  app.patch('/api/admin/track-record/:id', requireAdminAuth, (req: AuthenticatedRequest, res) => {
    const updated = db.updateTrackRecord(req.params.id, req.body);
    if (!updated) {
      return sendError(res, 'TRACK_RECORD_NOT_FOUND', 'Track record not found', 404);
    }
    return sendSuccess(res, updated, 'Track record updated successfully');
  });

  app.delete('/api/admin/track-record/:id', requireAdminAuth, (req: AuthenticatedRequest, res) => {
    const deleted = db.deleteTrackRecord(req.params.id);
    if (!deleted) {
      return sendError(res, 'TRACK_RECORD_NOT_FOUND', 'Track record not found', 404);
    }
    return sendSuccess(res, { id: req.params.id }, 'Track record deleted successfully');
  });

  // Courses Admin
  app.get('/api/admin/courses', requireAdminAuth, (_req, res) => {
    return sendSuccess(res, db.listCourses(), 'Courses retrieved');
  });

  app.patch('/api/admin/courses/:id', requireAdminAuth, (req: AuthenticatedRequest, res) => {
    const updated = db.updateCourse(req.params.id, req.body);
    if (!updated) {
      return sendError(res, 'COURSE_NOT_FOUND', 'Course not found', 404);
    }
    db.logAudit({
      admin_user_id: req.admin?.userId || 'admin',
      action: 'COURSE_UPDATED',
      entity_type: 'COURSE',
      entity_id: req.params.id,
      metadata: req.body,
      ip_address: req.ip || 'unknown',
      user_agent: req.headers['user-agent'] || 'unknown',
    });
    return sendSuccess(res, updated, 'Course updated successfully');
  });

  // Enquiries Admin
  app.get('/api/admin/enquiries', requireAdminAuth, (_req, res) => {
    return sendSuccess(res, db.listEnquiries(), 'All course enquiries retrieved');
  });

  app.patch('/api/admin/enquiries/:id', requireAdminAuth, (req: AuthenticatedRequest, res) => {
    const { status } = req.body;
    const updated = db.updateEnquiryStatus(req.params.id, status);
    if (!updated) {
      return sendError(res, 'ENQUIRY_NOT_FOUND', 'Enquiry not found', 404);
    }
    return sendSuccess(res, updated, 'Enquiry status updated');
  });

  // Contact Messages Admin
  app.get('/api/admin/messages', requireAdminAuth, (_req, res) => {
    return sendSuccess(res, db.listMessages(), 'All contact messages retrieved');
  });

  app.patch('/api/admin/messages/:id', requireAdminAuth, (req: AuthenticatedRequest, res) => {
    const { status } = req.body;
    const updated = db.updateMessageStatus(req.params.id, status);
    if (!updated) {
      return sendError(res, 'MESSAGE_NOT_FOUND', 'Message not found', 404);
    }
    return sendSuccess(res, updated, 'Message status updated');
  });

  // Book Admin
  app.get('/api/admin/book', requireAdminAuth, (_req, res) => {
    return sendSuccess(res, db.getBook(), 'Trading Master book settings retrieved');
  });

  app.patch('/api/admin/book', requireAdminAuth, (req: AuthenticatedRequest, res) => {
    const updated = db.updateBook(req.body);
    db.logAudit({
      admin_user_id: req.admin?.userId || 'admin',
      action: 'BOOK_UPDATED',
      entity_type: 'BOOK',
      entity_id: updated.id,
      metadata: req.body,
      ip_address: req.ip || 'unknown',
      user_agent: req.headers['user-agent'] || 'unknown',
    });
    return sendSuccess(res, updated, 'Trading Master settings updated');
  });

  // Book Cover Direct Upload Handler
  const handleCoverUpload = (req: express.Request, res: express.Response) => {
    try {
      const { dataUrl, imageBase64 } = req.body;
      const rawData = dataUrl || imageBase64;
      if (!rawData || typeof rawData !== 'string') {
        return sendError(res, 'INVALID_PAYLOAD', 'Please provide an image as a dataUrl or imageBase64 string', 400);
      }

      const matches = rawData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      const buffer = matches && matches[2]
        ? Buffer.from(matches[2], 'base64')
        : Buffer.from(rawData.replace(/^data:[^;]+;base64,/, ''), 'base64');

      if (!buffer || buffer.length === 0) {
        return sendError(res, 'INVALID_IMAGE_DATA', 'Invalid image data received', 400);
      }

      // Ensure public directory exists
      const publicDir = path.join(process.cwd(), 'public');
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }

      const targetPath = path.join(publicDir, 'trading-master-cover.png');
      fs.writeFileSync(targetPath, buffer);

      // Also copy to dist if dist exists
      const distDir = path.join(process.cwd(), 'dist');
      if (fs.existsSync(distDir)) {
        fs.writeFileSync(path.join(distDir, 'trading-master-cover.png'), buffer);
      }

      // Update database
      const updated = db.updateBook({
        cover_image_url: '/trading-master-cover.png',
        updated_at: new Date().toISOString(),
      });

      return sendSuccess(res, {
        book: updated,
        cover_url: '/trading-master-cover.png',
        size_bytes: buffer.length,
      }, 'Official Trading Master cover image saved successfully');
    } catch (err: any) {
      console.error('Failed to save cover image:', err);
      return sendError(res, 'COVER_SAVE_FAILED', err.message || 'Failed to save cover image', 500);
    }
  };

  app.post('/api/admin/book/upload-cover', requireAdminAuth, handleCoverUpload);
  app.post('/api/book/upload-cover', handleCoverUpload);

  // Social Links Admin
  app.get('/api/admin/social-links', requireAdminAuth, (_req, res) => {
    return sendSuccess(res, db.listSocialLinks(), 'Social links retrieved');
  });

  app.patch('/api/admin/social-links/:id', requireAdminAuth, (req: AuthenticatedRequest, res) => {
    const updated = db.updateSocialLink(req.params.id, req.body);
    if (!updated) {
      return sendError(res, 'SOCIAL_LINK_NOT_FOUND', 'Social link not found', 404);
    }
    return sendSuccess(res, updated, 'Social link updated');
  });

  // Audit Logs Admin
  app.get('/api/admin/audit-logs', requireAdminAuth, (_req, res) => {
    return sendSuccess(res, db.listAuditLogs(), 'Audit logs retrieved');
  });

  // Email Logs Admin (Resend Transactional Automation)
  app.get('/api/admin/email-logs', requireAdminAuth, (_req, res) => {
    const logs = db.listEmailLogs();
    const isConfigured = emailService.isEmailProviderConfigured();
    return sendSuccess(res, {
      logs,
      provider: 'Resend',
      resendConfigured: isConfigured,
      adminEmailConfigured: !!process.env.ADMIN_EMAIL,
      fromAddress: process.env.EMAIL_FROM || 'AJT77 <onboarding@resend.dev>',
    }, 'Email logs retrieved');
  });

  // Resend Invoice & Confirmation Email for a verified order
  app.post('/api/admin/orders/:id/resend-email', requireAdminAuth, async (req: AuthenticatedRequest, res) => {
    const order = db.getOrderById(req.params.id);
    if (!order) {
      return sendError(res, 'ORDER_NOT_FOUND', 'Order not found', 404);
    }
    if (order.payment_status !== 'PAID') {
      return sendError(res, 'ORDER_NOT_PAID', 'Confirmation emails and invoices can only be dispatched for PAID orders', 400);
    }

    try {
      const result = await emailService.sendPaymentConfirmationEmail(order);
      // Also send alert to admin
      emailService.sendSaleAdminNotification(order).catch(() => {});

      db.logAudit({
        admin_user_id: req.admin?.email || 'admin',
        action: 'ORDER_EMAIL_RESENT',
        entity_type: 'ORDER',
        entity_id: order.id,
        metadata: {
          recipient: order.customer_email,
          sent: result.sent,
          error: result.error,
        },
        ip_address: req.ip || 'admin',
        user_agent: req.headers['user-agent'] || 'admin',
      });

      if (!result.sent) {
        return sendError(res, 'EMAIL_DISPATCH_FAILED', result.error || 'Failed to dispatch email via Resend', 500, {
          providerConfigured: result.providerConfigured,
        });
      }

      return sendSuccess(res, { sent: true, messageId: result.messageId }, `Invoice & confirmation email successfully resent to ${order.customer_email}`);
    } catch (err: any) {
      return sendError(res, 'INTERNAL_SERVER_ERROR', err.message, 500);
    }
  });

  // Test Email Endpoint for Admin
  app.post('/api/admin/email/test', requireAdminAuth, async (req: AuthenticatedRequest, res) => {
    const targetEmail = req.body.email || process.env.ADMIN_EMAIL || req.admin?.email;
    if (!targetEmail) {
      return sendError(res, 'VALIDATION_ERROR', 'Target email address required', 422);
    }

    try {
      const result = await emailService.sendContactConfirmation('AJT77 Admin Test', targetEmail, 'This is a test notification confirming that Resend transactional email automation is actively working on AJT77.');
      if (!result.sent) {
        return sendError(res, 'EMAIL_DISPATCH_FAILED', result.error || 'Failed to send test email', 500, {
          providerConfigured: result.providerConfigured,
        });
      }
      return sendSuccess(res, { sent: true, messageId: result.messageId, recipient: targetEmail }, `Test email dispatched to ${targetEmail} via Resend`);
    } catch (err: any) {
      return sendError(res, 'INTERNAL_SERVER_ERROR', err.message, 500);
    }
  });

  // Settings Admin
  app.get('/api/admin/settings', requireAdminAuth, (_req, res) => {
    const settings = db.getSettings();
    return sendSuccess(res, {
      ...settings,
      razorpay_key_id_masked: process.env.RAZORPAY_KEY_ID ? `${process.env.RAZORPAY_KEY_ID.slice(0, 8)}...` : 'NONE',
      razorpay_secret_status: process.env.RAZORPAY_KEY_SECRET ? 'SECURE_ACTIVE' : 'MISSING',
      webhook_endpoint_url: `${process.env.SITE_URL || process.env.APP_URL || ''}/api/webhook/razorpay`,
    }, 'Site settings retrieved');
  });

  app.patch('/api/admin/settings', requireAdminAuth, (req: AuthenticatedRequest, res) => {
    const updated = db.updateSettings(req.body);
    return sendSuccess(res, updated, 'Site settings updated');
  });

  // ==========================================
  // VITE DEV & PRODUCTION STATIC ASSETS
  // ==========================================

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=============================================`);
    console.log(` AJT77 Server running on http://0.0.0.0:${PORT}`);
    console.log(` Razorpay Live Key ID: ${process.env.RAZORPAY_KEY_ID?.slice(0, 10)}...`);
    console.log(` Webhook URL: /api/webhook/razorpay`);
    console.log(`=============================================`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
