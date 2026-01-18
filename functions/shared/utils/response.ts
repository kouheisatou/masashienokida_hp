/**
 * Response Utilities for OCI Functions
 * Provides consistent response formatting and CORS handling
 */

// Standard CORS headers
export const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Stripe-Signature',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '3600',
};

// Response interface for OCI Functions
export interface FunctionResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}

/**
 * Create a standardized JSON response
 */
export function createResponse(
  statusCode: number,
  data: unknown,
  additionalHeaders: Record<string, string> = {}
): FunctionResponse {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json; charset=utf-8',
    ...corsHeaders,
    ...additionalHeaders,
  };

  return {
    statusCode,
    headers,
    body: data !== null ? JSON.stringify(data) : '',
  };
}

/**
 * Create a success response (200)
 */
export function success<T>(data: T, headers?: Record<string, string>): FunctionResponse {
  return createResponse(200, data, headers);
}

/**
 * Create a created response (201)
 */
export function created<T>(data: T, headers?: Record<string, string>): FunctionResponse {
  return createResponse(201, data, headers);
}

/**
 * Create a no content response (204)
 */
export function noContent(): FunctionResponse {
  return createResponse(204, null);
}

/**
 * Create a bad request response (400)
 */
export function badRequest(
  message: string = 'Bad Request',
  details?: Record<string, unknown>
): FunctionResponse {
  return createResponse(400, {
    error: message,
    ...details,
  });
}

/**
 * Create an unauthorized response (401)
 */
export function unauthorized(message: string = 'Unauthorized'): FunctionResponse {
  return createResponse(401, { error: message });
}

/**
 * Create a forbidden response (403)
 */
export function forbidden(
  message: string = 'Forbidden',
  details?: Record<string, unknown>
): FunctionResponse {
  return createResponse(403, {
    error: message,
    ...details,
  });
}

/**
 * Create a not found response (404)
 */
export function notFound(message: string = 'Not Found'): FunctionResponse {
  return createResponse(404, { error: message });
}

/**
 * Create a method not allowed response (405)
 */
export function methodNotAllowed(allowedMethods: string[]): FunctionResponse {
  return createResponse(
    405,
    { error: 'Method Not Allowed' },
    { Allow: allowedMethods.join(', ') }
  );
}

/**
 * Create a rate limit exceeded response (429)
 */
export function rateLimitExceeded(
  retryAfter: number = 60,
  message: string = 'Too Many Requests'
): FunctionResponse {
  return createResponse(
    429,
    { error: message, retryAfter },
    { 'Retry-After': String(retryAfter) }
  );
}

/**
 * Create an internal server error response (500)
 */
export function serverError(
  message: string = 'Internal Server Error',
  error?: Error
): FunctionResponse {
  // Log error for debugging (will appear in OCI Logging)
  if (error) {
    console.error('Server Error:', error);
  }

  return createResponse(500, { error: message });
}

/**
 * Handle CORS preflight requests
 */
export function handleCors(): FunctionResponse {
  return {
    statusCode: 204,
    headers: corsHeaders,
    body: '',
  };
}

/**
 * Redirect response
 */
export function redirect(url: string, permanent: boolean = false): FunctionResponse {
  return {
    statusCode: permanent ? 301 : 302,
    headers: {
      ...corsHeaders,
      Location: url,
    },
    body: '',
  };
}

/**
 * Parse JSON body safely
 */
export function parseBody<T = Record<string, unknown>>(body: string): T | null {
  if (!body || body.trim() === '') {
    return null;
  }

  try {
    return JSON.parse(body) as T;
  } catch {
    return null;
  }
}

/**
 * Validate required fields in request body
 */
export function validateRequired(
  body: Record<string, unknown>,
  requiredFields: string[]
): { valid: boolean; missing: string[] } {
  const missing = requiredFields.filter(
    (field) => body[field] === undefined || body[field] === null || body[field] === ''
  );

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Sanitize input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .trim()
    .substring(0, 10000);
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}
