/**
 * Google reCAPTCHA v3 Verification
 * Bot protection for forms
 */

// reCAPTCHA verification response
interface RecaptchaResponse {
  success: boolean;
  score: number;
  action: string;
  challenge_ts: string;
  hostname: string;
  'error-codes'?: string[];
}

// Verification result
interface VerificationResult {
  success: boolean;
  score: number;
  error?: string;
}

// Minimum score threshold (0.0 - 1.0)
// Higher = more strict, 0.5 is recommended for most forms
const MIN_SCORE_THRESHOLD = 0.5;

/**
 * Verify reCAPTCHA token with Google's API
 */
export async function verifyRecaptcha(
  token: string,
  expectedAction?: string
): Promise<VerificationResult> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  if (!secretKey) {
    console.warn('RECAPTCHA_SECRET_KEY not configured, skipping verification');
    return { success: true, score: 1.0 };
  }

  if (!token) {
    return {
      success: false,
      score: 0,
      error: 'reCAPTCHA token is required',
    };
  }

  try {
    const response = await fetch(
      'https://www.google.com/recaptcha/api/siteverify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          secret: secretKey,
          response: token,
        }),
      }
    );

    if (!response.ok) {
      console.error('reCAPTCHA API error:', response.status);
      return {
        success: false,
        score: 0,
        error: 'reCAPTCHA verification failed',
      };
    }

    const data = (await response.json()) as RecaptchaResponse;

    // Check if verification was successful
    if (!data.success) {
      console.warn('reCAPTCHA verification failed:', data['error-codes']);
      return {
        success: false,
        score: 0,
        error: `reCAPTCHA error: ${data['error-codes']?.join(', ')}`,
      };
    }

    // Check action if expected
    if (expectedAction && data.action !== expectedAction) {
      console.warn(
        `reCAPTCHA action mismatch: expected ${expectedAction}, got ${data.action}`
      );
      return {
        success: false,
        score: data.score,
        error: 'reCAPTCHA action mismatch',
      };
    }

    // Check score threshold
    if (data.score < MIN_SCORE_THRESHOLD) {
      console.warn(`reCAPTCHA score too low: ${data.score}`);
      return {
        success: false,
        score: data.score,
        error: 'Bot activity detected',
      };
    }

    return {
      success: true,
      score: data.score,
    };
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return {
      success: false,
      score: 0,
      error: 'reCAPTCHA verification failed',
    };
  }
}

/**
 * Middleware wrapper for reCAPTCHA protected routes
 */
export function withRecaptcha(
  action: string,
  handler: (ctx: unknown, data: string) => Promise<unknown>
) {
  return async (ctx: unknown, data: string) => {
    // Parse request body
    let body: { recaptchaToken?: string } = {};
    try {
      body = JSON.parse(data || '{}');
    } catch {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Invalid request body' }),
      };
    }

    // Verify reCAPTCHA
    const result = await verifyRecaptcha(body.recaptchaToken || '', action);

    if (!result.success) {
      return {
        statusCode: 403,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Bot protection failed',
          message: result.error || 'Please verify you are not a robot',
        }),
      };
    }

    // Continue with handler
    return handler(ctx, data);
  };
}

/**
 * Simple spam content detection
 * Checks for common spam patterns
 */
export function detectSpamContent(content: string): boolean {
  const spamPatterns = [
    // Common spam phrases
    /\b(buy now|click here|free money|act now|limited time)\b/i,
    // Excessive URLs
    /(https?:\/\/[^\s]+){3,}/i,
    // Excessive special characters
    /[!@#$%^&*()]{5,}/,
    // All caps words (more than 5)
    /\b[A-Z]{5,}\b.*\b[A-Z]{5,}\b.*\b[A-Z]{5,}\b/,
    // Known spam email patterns
    /@(mail|inbox|temp|fake)\./i,
    // Crypto/pharma spam
    /\b(bitcoin|crypto|viagra|cialis|pharmacy)\b/i,
  ];

  return spamPatterns.some((pattern) => pattern.test(content));
}

/**
 * Validate and sanitize form input
 */
export function validateFormInput(input: {
  name?: string;
  email?: string;
  message?: string;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Name validation
  if (!input.name || input.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  }

  // Email validation
  if (!input.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
    errors.push('Valid email address is required');
  }

  // Message validation
  if (!input.message || input.message.trim().length < 10) {
    errors.push('Message must be at least 10 characters');
  }

  // Spam content check
  if (input.message && detectSpamContent(input.message)) {
    errors.push('Message contains prohibited content');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
