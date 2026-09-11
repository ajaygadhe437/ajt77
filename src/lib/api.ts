import type { ApiResponse, SuccessResponse, ErrorResponse } from '../types';

export class ApiError extends Error {
  public code: string;
  public details: unknown;
  public requestId: string;
  public statusCode: number;

  constructor(errorPayload: ErrorResponse['error'], requestId: string, statusCode: number) {
    super(errorPayload.message);
    this.name = 'ApiError';
    this.code = errorPayload.code;
    this.details = errorPayload.details;
    this.requestId = requestId;
    this.statusCode = statusCode;
  }
}

export async function requestApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('ajt77_admin_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(endpoint, {
    ...options,
    headers,
  });

  const rawJson = await res.json().catch(() => ({
    success: false,
    error: {
      code: 'PARSER_ERROR',
      message: 'Failed to parse server response',
      details: null,
    },
    requestId: 'req_local_fallback',
  })) as ApiResponse<T>;

  if (!rawJson.success) {
    const errObj = (rawJson as ErrorResponse).error;
    throw new ApiError(
      errObj || { code: 'UNKNOWN_ERROR', message: 'An unknown error occurred', details: null },
      rawJson.requestId || 'req_unknown',
      res.status
    );
  }

  return (rawJson as SuccessResponse<T>).data;
}

// Razorpay SDK Loader
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      return resolve(true);
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}
