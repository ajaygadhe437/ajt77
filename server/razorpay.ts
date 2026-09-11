import crypto from 'crypto';

export class RazorpayService {
  private getKeyId(): string {
    const keyId = process.env.RAZORPAY_KEY_ID;
    if (!keyId) {
      throw new Error('RAZORPAY_KEY_ID environment variable is missing');
    }
    return keyId;
  }

  private getKeySecret(): string {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      throw new Error('RAZORPAY_KEY_SECRET environment variable is missing');
    }
    return keySecret;
  }

  public getPublicKey(): string {
    return this.getKeyId();
  }

  private getAuthHeader(): string {
    const keyId = this.getKeyId();
    const keySecret = this.getKeySecret();
    return 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');
  }

  /**
   * Creates a live/standard order using the official Razorpay Orders REST API
   * Amount must be passed in smallest currency unit (paise for INR, e.g. 600000 for ₹6,000)
   */
  public async createOrder(params: {
    amountInPaise: number;
    currency: string;
    receipt: string;
    notes?: Record<string, string>;
  }): Promise<{
    id: string;
    entity: string;
    amount: number;
    currency: string;
    receipt: string;
    status: string;
    attempts: number;
    notes: Record<string, string>;
    created_at: number;
  }> {
    const url = 'https://api.razorpay.com/v1/orders';
    const payload = {
      amount: params.amountInPaise,
      currency: params.currency || 'INR',
      receipt: params.receipt,
      notes: params.notes || {},
      payment_capture: 1, // Automatically capture authorized payments
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': this.getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const responseData = await response.json() as any;

    if (!response.ok) {
      const errorMsg = responseData?.error?.description || responseData?.message || 'Razorpay order creation failed';
      throw new Error(`Razorpay API Error [${response.status}]: ${errorMsg}`);
    }

    return responseData;
  }

  /**
   * Verifies Razorpay checkout payment signature server-side
   * Formula: HMAC_SHA256(order_id + "|" + razorpay_payment_id, secret)
   */
  public verifyPaymentSignature(params: {
    orderId: string;
    paymentId: string;
    signature: string;
  }): boolean {
    const keySecret = this.getKeySecret();
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${params.orderId}|${params.paymentId}`)
      .digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature, 'utf-8');
    const actualBuffer = Buffer.from(params.signature, 'utf-8');

    if (expectedBuffer.length !== actualBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
  }

  /**
   * Verifies webhook payload signature sent in `x-razorpay-signature`
   */
  public verifyWebhookSignature(rawBody: string | Buffer, signature: string): boolean {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || this.getKeySecret();
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature, 'utf-8');
    const actualBuffer = Buffer.from(signature, 'utf-8');

    if (expectedBuffer.length !== actualBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
  }

  /**
   * Fetches the payment entity directly from Razorpay API to confirm capture status and payment method
   */
  public async getPaymentDetails(paymentId: string): Promise<any> {
    const url = `https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': this.getAuthHeader(),
      },
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(`Failed to fetch payment details: ${(err as any)?.error?.description || response.statusText}`);
    }

    return await response.json();
  }
}

export const razorpayService = new RazorpayService();
