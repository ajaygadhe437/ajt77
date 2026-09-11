import crypto from 'crypto';
import type { Response } from 'express';
import type { SuccessResponse, ErrorResponse } from '../src/types';

export function makeRequestId(): string {
  return `req_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  message = 'Operation completed successfully.',
  statusCode = 200,
  requestId?: string
) {
  const payload: SuccessResponse<T> = {
    success: true,
    data,
    message,
    requestId: requestId || makeRequestId(),
  };
  return res.status(statusCode).json(payload);
}

export function sendError(
  res: Response,
  code: string,
  message: string,
  statusCode = 400,
  details: unknown = null,
  requestId?: string
) {
  const payload: ErrorResponse = {
    success: false,
    error: {
      code,
      message,
      details,
    },
    requestId: requestId || makeRequestId(),
  };
  return res.status(statusCode).json(payload);
}
