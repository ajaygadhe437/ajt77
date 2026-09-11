import { Resend } from 'resend';
import { db } from './db';
import { generateInvoicePdf } from './invoice';
import type { OrderRecord, EmailType } from '../src/types';

export interface EmailResult {
  sent: boolean;
  providerConfigured: boolean;
  messageId?: string;
  error?: string;
}

class EmailService {
  private resendClient: Resend | null = null;

  constructor() {
    this.getResendClient();
  }

  private getResendClient(): Resend | null {
    const apiKey = process.env.RESEND_API_KEY?.trim();
    if (!apiKey) {
      this.resendClient = null;
      return null;
    }
    if (!this.resendClient) {
      this.resendClient = new Resend(apiKey);
    }
    return this.resendClient;
  }

  public isEmailProviderConfigured(): boolean {
    return !!process.env.RESEND_API_KEY?.trim();
  }

  private getFromAddress(): string {
    const customFrom = process.env.EMAIL_FROM?.trim();
    if (customFrom) {
      return customFrom;
    }
    // Standard default format for verified Resend domains or onboarding sandbox
    return 'AJT77 <onboarding@resend.dev>';
  }

  private getAdminEmail(): string | null {
    const admin = process.env.ADMIN_EMAIL?.trim();
    return admin || null;
  }

  private getSiteUrl(): string {
    return process.env.SITE_URL?.trim() || process.env.APP_URL?.trim() || 'https://ajt77.com';
  }

  /**
   * Internal wrapper to dispatch email via Resend and write an audit log
   */
  private async dispatchEmail(params: {
    to: string;
    subject: string;
    html: string;
    text: string;
    emailType: EmailType;
    orderId?: string;
    attachments?: Array<{ filename: string; content: Buffer }>;
  }): Promise<EmailResult> {
    const client = this.getResendClient();

    if (!client) {
      const warning = 'RESEND_API_KEY not configured in environment. Transactional email logged but skipped.';
      console.warn(`[Email Service - Resend] ${warning} (Recipient: ${params.to}, Type: ${params.emailType})`);

      db.logEmail({
        recipient: params.to,
        email_type: params.emailType,
        order_id: params.orderId,
        status: 'FAILED',
        subject: params.subject,
        error: 'RESEND_API_KEY not set in environment variables',
      });

      return {
        sent: false,
        providerConfigured: false,
        error: 'RESEND_API_KEY not set. Add RESEND_API_KEY to your server environment variables.',
      };
    }

    try {
      const sendPayload: any = {
        from: this.getFromAddress(),
        to: [params.to],
        subject: params.subject,
        html: params.html,
        text: params.text,
      };

      if (params.attachments && params.attachments.length > 0) {
        sendPayload.attachments = params.attachments.map((att) => ({
          filename: att.filename,
          content: att.content,
        }));
      }

      const res = await client.emails.send(sendPayload);

      if (res.error) {
        console.error('[Email Service - Resend Error]:', res.error);
        db.logEmail({
          recipient: params.to,
          email_type: params.emailType,
          order_id: params.orderId,
          status: 'FAILED',
          subject: params.subject,
          error: res.error.message || 'Resend delivery error',
        });

        return {
          sent: false,
          providerConfigured: true,
          error: res.error.message,
        };
      }

      const messageId = res.data?.id;
      console.log(`[Email Service - Resend Success] Dispatched ${params.emailType} to ${params.to}. Message ID: ${messageId}`);

      db.logEmail({
        recipient: params.to,
        email_type: params.emailType,
        order_id: params.orderId,
        status: 'SENT',
        subject: params.subject,
        message_id: messageId,
      });

      return {
        sent: true,
        providerConfigured: true,
        messageId,
      };
    } catch (err: any) {
      console.error('[Email Service - Exception]:', err);
      db.logEmail({
        recipient: params.to,
        email_type: params.emailType,
        order_id: params.orderId,
        status: 'FAILED',
        subject: params.subject,
        error: err.message || 'Unknown network error dispatching email',
      });

      return {
        sent: false,
        providerConfigured: true,
        error: err.message || 'Exception during email dispatch',
      };
    }
  }

  // ============================================================================
  // 1. CONTACT / HELP FORM EMAILS
  // ============================================================================

  /**
   * Send automatic confirmation to visitor who submitted Help/Contact form
   */
  public async sendContactConfirmation(visitorName: string, visitorEmail: string, message: string): Promise<EmailResult> {
    const subject = 'AJT77 — We Received Your Message';
    const siteUrl = this.getSiteUrl();

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #07090e; color: #f8fafc; margin: 0; padding: 24px; }
            .container { max-width: 600px; margin: 0 auto; background-color: #0e1322; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; }
            .header { background: #0b0f19; padding: 24px 32px; border-bottom: 1px solid #1e293b; }
            .brand { font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; }
            .brand span { color: #38bdf8; }
            .content { padding: 32px; line-height: 1.6; font-size: 14px; color: #cbd5e1; }
            .quote-box { background-color: #121828; border-left: 3px solid #38bdf8; padding: 16px 20px; margin: 20px 0; border-radius: 4px; font-size: 13px; color: #94a3b8; }
            .footer { padding: 20px 32px; background: #090c15; border-top: 1px solid #1e293b; font-size: 11px; color: #64748b; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="brand">AJT<span>77</span></div>
              <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">AjayTrades77 • Institutional Price Action</div>
            </div>
            <div class="content">
              <p style="color: #ffffff; font-size: 16px; font-weight: 600;">Hello ${visitorName},</p>
              <p>Thank you for reaching out to AJT77. Your message has been received and routed directly to our support team.</p>
              
              <p style="margin-top: 16px; font-weight: 600; color: #e2e8f0;">Summary of your message:</p>
              <div class="quote-box">
                ${message.replace(/\n/g, '<br/>')}
              </div>

              <p>We review every inquiry carefully and will respond to your email address (<strong>${visitorEmail}</strong>) as soon as possible.</p>
              
              <p style="margin-top: 24px; color: #94a3b8; font-size: 13px;">
                In the meantime, feel free to review our free educational chart studies on our website.
              </p>
            </div>
            <div class="footer">
              AJT77 • Founder: Ajay Gadhe • <a href="${siteUrl}" style="color: #38bdf8; text-decoration: none;">ajt77.com</a>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `Hello ${visitorName},

Thank you for reaching out to AJT77. Your message has been received and routed directly to our support team.

Summary of your message:
${message}

We review every inquiry carefully and will respond to your email address (${visitorEmail}) as soon as possible.

Warm regards,
Ajay Gadhe
AJT77 / AjayTrades77`;

    return this.dispatchEmail({
      to: visitorEmail,
      subject,
      html,
      text,
      emailType: 'CONTACT_CONFIRMATION',
    });
  }

  /**
   * Send notification to ADMIN_EMAIL when someone submits Contact form
   */
  public async sendContactAdminNotification(visitorName: string, visitorEmail: string, phone: string | undefined, message: string): Promise<EmailResult> {
    const adminEmail = this.getAdminEmail();
    if (!adminEmail) {
      console.warn('[Email Service] ADMIN_EMAIL not configured. Skipping admin contact notification.');
      return { sent: false, providerConfigured: false, error: 'ADMIN_EMAIL not set' };
    }

    const subject = `[AJT77 Inquiry] Message from ${visitorName}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <body style="font-family: sans-serif; background: #07090e; color: #f8fafc; padding: 24px;">
          <div style="max-width: 600px; margin: 0 auto; background: #0e1322; border: 1px solid #1e293b; border-radius: 12px; padding: 24px;">
            <h2 style="margin-top: 0; color: #38bdf8;">New Contact Inquiry Received</h2>
            <table style="width: 100%; font-size: 13px; color: #cbd5e1; border-collapse: collapse;">
              <tr><td style="padding: 6px 0; color: #94a3b8; width: 100px;">Name:</td><td style="color: #ffffff; font-weight: bold;">${visitorName}</td></tr>
              <tr><td style="padding: 6px 0; color: #94a3b8;">Email:</td><td><a href="mailto:${visitorEmail}" style="color: #38bdf8;">${visitorEmail}</a></td></tr>
              <tr><td style="padding: 6px 0; color: #94a3b8;">Phone:</td><td>${phone || 'Not provided'}</td></tr>
              <tr><td style="padding: 6px 0; color: #94a3b8;">Received:</td><td>${new Date().toISOString()}</td></tr>
            </table>
            <div style="margin-top: 16px; padding: 16px; background: #121828; border-radius: 8px; border: 1px solid #1e293b; font-size: 13px; color: #e2e8f0; line-height: 1.6;">
              <strong>Message Content:</strong><br/><br/>
              ${message.replace(/\n/g, '<br/>')}
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `New Contact Inquiry Received on AJT77:

Name: ${visitorName}
Email: ${visitorEmail}
Phone: ${phone || 'Not provided'}
Time: ${new Date().toISOString()}

Message:
${message}
`;

    return this.dispatchEmail({
      to: adminEmail,
      subject,
      html,
      text,
      emailType: 'CONTACT_ADMIN_NOTIFICATION',
    });
  }

  // ============================================================================
  // 2. EARLY ACCESS WAITLIST EMAILS
  // ============================================================================

  /**
   * Send automatic confirmation to user who joined Trading Master waitlist
   */
  public async sendWaitlistUserConfirmation(name: string, email: string): Promise<EmailResult> {
    const subject = 'AJT77 — Early Access Confirmed: Trading Master';
    const siteUrl = this.getSiteUrl();

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #07090e; color: #f8fafc; margin: 0; padding: 24px; }
            .container { max-width: 600px; margin: 0 auto; background-color: #0e1322; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; }
            .header { background: #0b0f19; padding: 24px 32px; border-bottom: 1px solid #1e293b; }
            .brand { font-size: 20px; font-weight: 800; color: #ffffff; }
            .brand span { color: #38bdf8; }
            .content { padding: 32px; line-height: 1.6; font-size: 14px; color: #cbd5e1; }
            .card { background-color: #121828; border: 1px solid #1e293b; padding: 18px 20px; border-radius: 12px; margin: 20px 0; }
            .footer { padding: 20px 32px; background: #090c15; border-top: 1px solid #1e293b; font-size: 11px; color: #64748b; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="brand">AJT<span>77</span></div>
              <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">AJAY TRADES ICT & SMC TRADING MASTERBOOK</div>
            </div>
            <div class="content">
              <p style="color: #ffffff; font-size: 16px; font-weight: 600;">Hello ${name},</p>
              <p>You have been successfully added to the <strong>Priority Early Access Waitlist</strong> for the upcoming publication:</p>
              
              <div class="card">
                <div style="color: #38bdf8; font-weight: bold; font-size: 14px;">AJAY TRADES ICT & SMC TRADING MASTERBOOK</div>
                <div style="font-size: 12px; color: #94a3b8; margin-top: 4px;">Beginner to Advanced • Trade • Learn • Earn</div>
                <div style="font-size: 12px; color: #64748b; margin-top: 8px;">Author: Ajay Gadhe (AjayTrades77 / AJT77)</div>
                <div style="margin-top: 12px; display: inline-block; padding: 4px 10px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 20px; font-size: 11px; color: #34d399; font-weight: bold;">
                  PRIORITY ACCESS RESERVED
                </div>
              </div>

              <p>As a registered early-access reader, you will receive:</p>
              <ul style="color: #94a3b8; padding-left: 20px; font-size: 13px;">
                <li>Advance notification prior to public launch</li>
                <li>Exclusive pre-order access</li>
                <li>Early access to release chapters and curriculum breakdowns</li>
              </ul>

              <p style="margin-top: 24px; font-size: 13px; color: #94a3b8;">
                No action is required from you at this time. We will reach out to this email address the moment pre-orders open.
              </p>
            </div>
            <div class="footer">
              AJT77 • Founder: Ajay Gadhe • <a href="${siteUrl}" style="color: #38bdf8; text-decoration: none;">ajt77.com</a>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `Hello ${name},

You have been successfully registered on the Priority Early Access Waitlist for:
AJAY TRADES ICT & SMC TRADING MASTERBOOK by Ajay Gadhe (AJT77 / AjayTrades77).

Registered Email: ${email}
Status: Priority Access Reserved

You will receive an exclusive release notification and early-access pre-order details as soon as the book becomes available.

Warm regards,
Ajay Gadhe
AJT77 / AjayTrades77`;

    return this.dispatchEmail({
      to: email,
      subject,
      html,
      text,
      emailType: 'WAITLIST_CONFIRMATION',
    });
  }

  /**
   * Send notification to ADMIN_EMAIL when new waitlist subscriber joins
   */
  public async sendWaitlistAdminNotification(name: string, email: string, registeredAt: string, totalCount?: number): Promise<EmailResult> {
    const adminEmail = this.getAdminEmail();
    if (!adminEmail) {
      console.warn('[Email Service] ADMIN_EMAIL not configured. Skipping waitlist admin notification.');
      return { sent: false, providerConfigured: false, error: 'ADMIN_EMAIL not set' };
    }

    const subject = `[Waitlist Registration] ${name} joined Trading Master waitlist`;

    const html = `
      <!DOCTYPE html>
      <html>
        <body style="font-family: sans-serif; background: #07090e; color: #f8fafc; padding: 24px;">
          <div style="max-width: 550px; margin: 0 auto; background: #0e1322; border: 1px solid #1e293b; border-radius: 12px; padding: 24px;">
            <h3 style="margin-top: 0; color: #38bdf8;">New Early Access Registration</h3>
            <table style="width: 100%; font-size: 13px; color: #cbd5e1; border-collapse: collapse;">
              <tr><td style="padding: 6px 0; color: #94a3b8; width: 140px;">Name:</td><td style="color: #ffffff; font-weight: bold;">${name}</td></tr>
              <tr><td style="padding: 6px 0; color: #94a3b8;">Email:</td><td><a href="mailto:${email}" style="color: #38bdf8;">${email}</a></td></tr>
              <tr><td style="padding: 6px 0; color: #94a3b8;">Registered At:</td><td>${registeredAt}</td></tr>
              ${totalCount ? `<tr><td style="padding: 6px 0; color: #94a3b8;">Total Subscribers:</td><td style="color: #34d399; font-weight: bold;">${totalCount}</td></tr>` : ''}
            </table>
          </div>
        </body>
      </html>
    `;

    const text = `New Early Access Registration:
Name: ${name}
Email: ${email}
Registered At: ${registeredAt}
${totalCount ? `Total Subscribers: ${totalCount}` : ''}
`;

    return this.dispatchEmail({
      to: adminEmail,
      subject,
      html,
      text,
      emailType: 'WAITLIST_ADMIN_NOTIFICATION',
    });
  }

  // ============================================================================
  // 3 & 4. VERIFIED COURSE & MEMBERSHIP PURCHASE CONFIRMATION + PDF INVOICE
  // ============================================================================

  /**
   * Send verified purchase confirmation email + PDF invoice attachment to customer.
   *
   * SECURITY RULE:
   * Only called AFTER server-side Razorpay verification succeeds (status: PAID).
   */
  public async sendPaymentConfirmationEmail(order: OrderRecord): Promise<EmailResult> {
    const customerName = order.customer_name || 'Valued Trader';
    const productName = order.course;
    const orderId = order.id;
    const paymentId = order.razorpay_payment_id || 'VERIFIED';
    const amountFormatted = `₹${order.amount.toLocaleString('en-IN')}`;
    const dateFormatted = order.created_at
      ? new Date(order.created_at).toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          timeZone: 'Asia/Kolkata',
        })
      : new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });

    const isMembership = productName.toLowerCase().includes('membership');
    const emailType: EmailType = isMembership
      ? 'MEMBERSHIP_PURCHASE_CONFIRMATION'
      : 'COURSE_PURCHASE_CONFIRMATION';

    const subject = `AJT77 — Payment Confirmed & Receipt: ${productName} (Order ${orderId})`;
    const siteUrl = this.getSiteUrl();

    // Generate high quality official vector PDF invoice in memory
    let pdfBuffer: Buffer | null = null;
    try {
      pdfBuffer = await generateInvoicePdf(order);
    } catch (pdfErr) {
      console.error('[Email Service] Failed to generate PDF invoice:', pdfErr);
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #07090e; color: #f8fafc; margin: 0; padding: 24px; }
            .container { max-width: 600px; margin: 0 auto; background-color: #0e1322; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; }
            .header { background: #0b0f19; padding: 24px 32px; border-bottom: 1px solid #1e293b; }
            .brand { font-size: 22px; font-weight: 800; color: #ffffff; }
            .brand span { color: #38bdf8; }
            .content { padding: 32px; line-height: 1.6; font-size: 14px; color: #cbd5e1; }
            .receipt-box { background-color: #121828; border: 1px solid #1e293b; border-radius: 12px; padding: 20px; margin: 20px 0; }
            .table-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #1e293b; font-size: 13px; }
            .table-row:last-child { border-bottom: none; }
            .badge { display: inline-block; padding: 4px 10px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 20px; font-size: 11px; color: #34d399; font-weight: bold; }
            .footer { padding: 20px 32px; background: #090c15; border-top: 1px solid #1e293b; font-size: 11px; color: #64748b; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="brand">AJT<span>77</span></div>
              <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">OFFICIAL PURCHASE CONFIRMATION & PAYMENT RECEIPT</div>
            </div>
            <div class="content">
              <p style="color: #ffffff; font-size: 16px; font-weight: 600;">Congratulations ${customerName},</p>
              <p>Your payment has been successfully processed and verified server-side. Your enrollment in <strong>${productName}</strong> is confirmed.</p>
              
              <div class="receipt-box">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                  <span style="font-size: 12px; color: #94a3b8; font-weight: bold; text-transform: uppercase;">Payment Summary</span>
                  <span class="badge">PAID & VERIFIED</span>
                </div>
                <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #cbd5e1;">
                  <tr style="border-bottom: 1px solid #1e293b;"><td style="padding: 8px 0; color: #94a3b8;">Product / Course:</td><td style="padding: 8px 0; text-align: right; color: #ffffff; font-weight: bold;">${productName}</td></tr>
                  <tr style="border-bottom: 1px solid #1e293b;"><td style="padding: 8px 0; color: #94a3b8;">Order ID:</td><td style="padding: 8px 0; text-align: right; font-family: monospace; color: #38bdf8;">${orderId}</td></tr>
                  <tr style="border-bottom: 1px solid #1e293b;"><td style="padding: 8px 0; color: #94a3b8;">Razorpay Payment ID:</td><td style="padding: 8px 0; text-align: right; font-family: monospace; color: #e2e8f0;">${paymentId}</td></tr>
                  <tr style="border-bottom: 1px solid #1e293b;"><td style="padding: 8px 0; color: #94a3b8;">Date:</td><td style="padding: 8px 0; text-align: right;">${dateFormatted}</td></tr>
                  <tr style="border-bottom: 1px solid #1e293b;"><td style="padding: 8px 0; color: #94a3b8;">Amount Paid:</td><td style="padding: 8px 0; text-align: right; color: #38bdf8; font-size: 15px; font-weight: bold;">${amountFormatted}</td></tr>
                  <tr><td style="padding: 8px 0; color: #94a3b8;">Payment Status:</td><td style="padding: 8px 0; text-align: right; color: #34d399; font-weight: bold;">PAID</td></tr>
                </table>
              </div>

              <p style="font-size: 13px; color: #e2e8f0;">
                <strong>Attached Invoice:</strong> An official PDF tax invoice and transaction receipt has been generated and attached to this email for your records (<code>invoice-${orderId}.pdf</code>).
              </p>

              <div style="background: #101626; border-left: 3px solid #38bdf8; padding: 14px 16px; margin: 20px 0; border-radius: 4px; font-size: 12.5px; color: #cbd5e1;">
                <strong>Next Steps:</strong><br/>
                Please keep your Order ID handy. Our student onboarding team will guide you through curriculum access, study notes, and private community entry.
              </div>

              <p style="margin-top: 24px; font-size: 13px; color: #94a3b8;">
                Welcome to AJT77. We look forward to supporting your path in disciplined price action trading.
              </p>
            </div>
            <div class="footer">
              AJT77 • Founder: Ajay Gadhe • <a href="${siteUrl}" style="color: #38bdf8; text-decoration: none;">ajt77.com</a>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `Congratulations ${customerName},

Your payment for ${productName} has been successfully verified server-side.

Payment Details:
• Product / Course: ${productName}
• Order ID: ${orderId}
• Payment ID: ${paymentId}
• Amount Paid: ${amountFormatted}
• Date: ${dateFormatted}
• Payment Status: PAID (CONFIRMED)

An official PDF invoice is attached to this email for your financial records.

Thank you for choosing AJT77,
Ajay Gadhe
AJT77 / AjayTrades77`;

    const attachments = pdfBuffer
      ? [
          {
            filename: `invoice-${orderId}.pdf`,
            content: pdfBuffer,
          },
        ]
      : undefined;

    return this.dispatchEmail({
      to: order.customer_email,
      subject,
      html,
      text,
      emailType,
      orderId,
      attachments,
    });
  }

  /**
   * Send notification to ADMIN_EMAIL when a payment is verified
   */
  public async sendSaleAdminNotification(order: OrderRecord): Promise<EmailResult> {
    const adminEmail = this.getAdminEmail();
    if (!adminEmail) {
      console.warn('[Email Service] ADMIN_EMAIL not configured. Skipping sale admin notification.');
      return { sent: false, providerConfigured: false, error: 'ADMIN_EMAIL not set' };
    }

    const amountFormatted = `₹${order.amount.toLocaleString('en-IN')}`;
    const subject = `[AJT77 SALE CONFIRMED] ${order.course} - ${amountFormatted} (${order.customer_name})`;

    const html = `
      <!DOCTYPE html>
      <html>
        <body style="font-family: sans-serif; background: #07090e; color: #f8fafc; padding: 24px;">
          <div style="max-width: 600px; margin: 0 auto; background: #0e1322; border: 1px solid #1e293b; border-radius: 12px; padding: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 12px; margin-bottom: 16px;">
              <h3 style="margin: 0; color: #34d399;">New Verified Payment Received</h3>
              <span style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; font-weight: bold; font-size: 12px; padding: 4px 10px; border-radius: 20px;">${order.course}</span>
            </div>

            <table style="width: 100%; font-size: 13px; color: #cbd5e1; border-collapse: collapse;">
              <tr><td style="padding: 6px 0; color: #94a3b8; width: 140px;">Customer Name:</td><td style="color: #ffffff; font-weight: bold;">${order.customer_name}</td></tr>
              <tr><td style="padding: 6px 0; color: #94a3b8;">Customer Email:</td><td><a href="mailto:${order.customer_email}" style="color: #38bdf8;">${order.customer_email}</a></td></tr>
              <tr><td style="padding: 6px 0; color: #94a3b8;">Customer Phone:</td><td style="color: #ffffff;">${order.customer_phone || 'N/A'}</td></tr>
              <tr><td style="padding: 6px 0; color: #94a3b8;">Product:</td><td style="color: #ffffff; font-weight: bold;">${order.course}</td></tr>
              <tr><td style="padding: 6px 0; color: #94a3b8;">Amount Paid:</td><td style="color: #34d399; font-size: 15px; font-weight: bold;">${amountFormatted}</td></tr>
              <tr><td style="padding: 6px 0; color: #94a3b8;">Order ID:</td><td style="font-family: monospace;">${order.id}</td></tr>
              <tr><td style="padding: 6px 0; color: #94a3b8;">Razorpay Payment ID:</td><td style="font-family: monospace;">${order.razorpay_payment_id || 'N/A'}</td></tr>
              <tr><td style="padding: 6px 0; color: #94a3b8;">Verification Method:</td><td>${order.verification_method || 'SIGNATURE'}</td></tr>
              <tr><td style="padding: 6px 0; color: #94a3b8;">Timestamp:</td><td>${new Date().toISOString()}</td></tr>
            </table>
          </div>
        </body>
      </html>
    `;

    const text = `AJT77 Sale Confirmed:

Customer Name: ${order.customer_name}
Customer Email: ${order.customer_email}
Customer Phone: ${order.customer_phone || 'N/A'}
Product: ${order.course}
Amount: ${amountFormatted}
Order ID: ${order.id}
Payment ID: ${order.razorpay_payment_id || 'N/A'}
Verification Method: ${order.verification_method || 'SIGNATURE'}
Timestamp: ${new Date().toISOString()}
`;

    return this.dispatchEmail({
      to: adminEmail,
      subject,
      html,
      text,
      emailType: 'SALE_ADMIN_NOTIFICATION',
      orderId: order.id,
    });
  }
}

export const emailService = new EmailService();
