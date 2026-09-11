// Canonical API Responses and Shared Types for AJT77

export type SuccessResponse<T> = {
  success: true;
  data: T;
  message: string;
  requestId: string;
};

export type ErrorResponse = {
  success: false;
  error: {
    code: string;
    message: string;
    details: unknown;
  };
  requestId: string;
};

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

export type PaymentStatus = 'CREATED' | 'PAID' | 'FAILED';

export interface OrderRecord {
  id: string; // internal order ID (e.g. ord_ajt77_1741234567890_abc)
  course: 'AJT77 Basic' | 'AJT77 Pro';
  amount: number; // in INR (6000 or 10000)
  currency: 'INR';
  razorpay_order_id: string;
  razorpay_payment_id: string | null;
  payment_status: PaymentStatus;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  created_at: string;
  updated_at: string;
  verification_method?: 'SIGNATURE' | 'WEBHOOK';
  email_confirmation_sent?: boolean;
  email_confirmation_sent_at?: string;
  metadata?: Record<string, unknown>;
}

export interface WaitlistRecord {
  id: string;
  name: string;
  email: string;
  created_at: string;
  status: 'CONFIRMED';
  user_email_sent?: boolean;
  admin_email_sent?: boolean;
}

export interface ChartRecord {
  id: string;
  title: string;
  slug: string;
  instrument: string;
  market: string;
  timeframe: string;
  analysis: string;
  entry: string;
  stop_loss: string;
  target: string;
  risk_reward: string;
  chart_image_url: string;
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  published_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface TrackRecordDocument {
  id: string;
  title: string;
  category: 'PAYOUT' | 'TRADING_STATEMENT' | 'ACCOUNT_RECORD' | 'MILESTONE' | 'OTHER';
  description: string;
  document_url: string;
  thumbnail_url: string;
  document_date: string;
  status: 'PUBLISHED' | 'PRIVATE' | 'ARCHIVED';
  redaction_confirmed: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CourseRecord {
  id: string;
  name: 'AJT77 Basic' | 'AJT77 Pro' | string;
  slug: string;
  short_description: string;
  description: string;
  price: number;
  currency: 'INR';
  level: string;
  features: string[];
  is_featured: boolean;
  is_active: boolean;
  payment_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CourseEnquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  course_id: string;
  message: string;
  status: 'NEW' | 'CONTACTED' | 'CONVERTED' | 'CLOSED';
  created_at: string;
  updated_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: 'UNREAD' | 'READ' | 'ARCHIVED';
  created_at: string;
  updated_at: string;
}

export interface BookRecord {
  id: string;
  title: string;
  slug: string;
  description: string;
  cover_image_url: string;
  status: 'COMING_SOON' | 'AVAILABLE';
  release_date: string;
  waitlist_count: number;
  created_at: string;
  updated_at: string;
}

export interface SocialLink {
  id: string;
  platform: string;
  label: string;
  url: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  admin_user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  metadata: Record<string, unknown>;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  role: 'SUPER_ADMIN' | 'EDITOR' | 'MODERATOR';
  is_active: boolean;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

export interface RazorpayCreateOrderResponse {
  orderId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  keyId: string;
  course: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
}

export interface RazorpayVerifyPaymentPayload {
  internalOrderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export type EmailType =
  | 'CONTACT_CONFIRMATION'
  | 'CONTACT_ADMIN_NOTIFICATION'
  | 'WAITLIST_CONFIRMATION'
  | 'WAITLIST_ADMIN_NOTIFICATION'
  | 'COURSE_PURCHASE_CONFIRMATION'
  | 'MEMBERSHIP_PURCHASE_CONFIRMATION'
  | 'SALE_ADMIN_NOTIFICATION';

export interface EmailLog {
  id: string;
  recipient: string;
  email_type: EmailType;
  order_id?: string;
  status: 'SENT' | 'FAILED';
  subject: string;
  message_id?: string;
  error?: string;
  created_at: string;
}

