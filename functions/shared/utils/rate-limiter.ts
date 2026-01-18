/**
 * Rate Limiter for Bot Protection
 * IP-based rate limiting with configurable windows and limits
 */

import { executeQuery } from '../db/connection';

// Rate limit configuration
interface RateLimitConfig {
  windowMs: number;       // Time window in milliseconds
  maxRequests: number;    // Maximum requests per window
  keyPrefix: string;      // Prefix for the rate limit key
}

// Default configurations
export const RATE_LIMITS = {
  // Contact form: 3 requests per 5 minutes per IP
  contact: {
    windowMs: 5 * 60 * 1000,
    maxRequests: 3,
    keyPrefix: 'contact',
  },
  // Auth endpoints: 10 requests per minute per IP
  auth: {
    windowMs: 60 * 1000,
    maxRequests: 10,
    keyPrefix: 'auth',
  },
  // General API: 60 requests per minute per IP
  general: {
    windowMs: 60 * 1000,
    maxRequests: 60,
    keyPrefix: 'general',
  },
} as const;

// Rate limit entry from database
interface RateLimitEntry {
  IP_ADDRESS: string;
  REQUEST_COUNT: number;
  WINDOW_START: Date;
}

/**
 * Check and update rate limit for a given IP
 * Returns true if the request is allowed, false if rate limited
 */
export async function checkRateLimit(
  ipAddress: string,
  config: RateLimitConfig
): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
  const key = `${config.keyPrefix}:${ipAddress}`;
  const now = new Date();
  const windowStart = new Date(now.getTime() - config.windowMs);

  try {
    // Get current rate limit entry
    const entries = await executeQuery<RateLimitEntry>(
      `SELECT ip_address, request_count, window_start
       FROM rate_limits
       WHERE key = :key AND window_start > :windowStart`,
      { key, windowStart }
    );

    if (entries.length === 0) {
      // No entry or expired, create new one
      await executeQuery(
        `MERGE INTO rate_limits rl
         USING (SELECT :key AS key FROM DUAL) src
         ON (rl.key = src.key)
         WHEN MATCHED THEN
           UPDATE SET request_count = 1, window_start = :now, ip_address = :ip
         WHEN NOT MATCHED THEN
           INSERT (id, key, ip_address, request_count, window_start)
           VALUES (SYS_GUID(), :key, :ip, 1, :now)`,
        { key, ip: ipAddress, now }
      );

      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetAt: new Date(now.getTime() + config.windowMs),
      };
    }

    const entry = entries[0];
    const requestCount = entry.REQUEST_COUNT + 1;

    if (requestCount > config.maxRequests) {
      // Rate limit exceeded
      const resetAt = new Date(new Date(entry.WINDOW_START).getTime() + config.windowMs);
      return {
        allowed: false,
        remaining: 0,
        resetAt,
      };
    }

    // Update request count
    await executeQuery(
      `UPDATE rate_limits SET request_count = :count WHERE key = :key`,
      { count: requestCount, key }
    );

    return {
      allowed: true,
      remaining: config.maxRequests - requestCount,
      resetAt: new Date(new Date(entry.WINDOW_START).getTime() + config.windowMs),
    };
  } catch (error) {
    console.error('Rate limit check error:', error);
    // On error, allow the request but log it
    return {
      allowed: true,
      remaining: config.maxRequests,
      resetAt: new Date(now.getTime() + config.windowMs),
    };
  }
}

/**
 * Get client IP from OCI Function context
 * Handles X-Forwarded-For header from API Gateway
 */
export function getClientIP(headers: Record<string, string>): string {
  // X-Forwarded-For may contain multiple IPs, take the first one
  const forwardedFor =
    headers['x-forwarded-for'] ||
    headers['X-Forwarded-For'] ||
    headers['X-FORWARDED-FOR'];

  if (forwardedFor) {
    const ips = forwardedFor.split(',').map((ip) => ip.trim());
    return ips[0];
  }

  // Fallback to X-Real-IP
  const realIP =
    headers['x-real-ip'] ||
    headers['X-Real-IP'] ||
    headers['X-REAL-IP'];

  if (realIP) {
    return realIP;
  }

  // Default fallback
  return 'unknown';
}

/**
 * Clean up old rate limit entries (maintenance task)
 */
export async function cleanupRateLimits(): Promise<number> {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago

  const result = await executeQuery<{ DELETED_COUNT: number }>(
    `DELETE FROM rate_limits WHERE window_start < :cutoff`,
    { cutoff }
  );

  return result.length;
}

/**
 * Rate limit middleware wrapper
 */
export function withRateLimit(
  config: RateLimitConfig,
  handler: (ctx: unknown, data: string) => Promise<unknown>
) {
  return async (ctx: { httpGateway: { headers: Record<string, string> } }, data: string) => {
    const ip = getClientIP(ctx.httpGateway.headers);
    const { allowed, remaining, resetAt } = await checkRateLimit(ip, config);

    if (!allowed) {
      const retryAfter = Math.ceil((resetAt.getTime() - Date.now()) / 1000);
      return {
        statusCode: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(retryAfter),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': resetAt.toISOString(),
        },
        body: JSON.stringify({
          error: 'Too Many Requests',
          message: 'リクエストが多すぎます。しばらく待ってから再度お試しください。',
          retryAfter,
        }),
      };
    }

    // Add rate limit headers to response
    const response = await handler(ctx, data);
    const resp = response as { headers?: Record<string, string> };

    if (resp && typeof resp === 'object') {
      resp.headers = {
        ...resp.headers,
        'X-RateLimit-Remaining': String(remaining),
        'X-RateLimit-Reset': resetAt.toISOString(),
      };
    }

    return response;
  };
}
