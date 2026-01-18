/**
 * Shared utilities for OCI Functions
 * @module @enokida/shared
 */

// Database utilities
export {
  getConnection,
  executeQuery,
  executeInsert,
  executeUpdate,
  executeTransaction,
  closePool,
} from './db/connection';

// Response utilities
export {
  corsHeaders,
  createResponse,
  success,
  created,
  noContent,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  methodNotAllowed,
  rateLimitExceeded,
  serverError,
  handleCors,
  redirect,
  parseBody,
  validateRequired,
  sanitizeInput,
  validateEmail,
} from './utils/response';

// Auth utilities
export {
  signJWT,
  verifyJWT,
  extractBearerToken,
  verifyAuth,
  requireRole,
  isAdmin,
  isMember,
  isGoldMember,
  createSession,
  deleteSession,
  cleanupExpiredSessions,
  withAuth,
} from './utils/auth-middleware';

export type {
  UserRole,
  JWTPayload,
  AuthenticatedUser,
} from './utils/auth-middleware';

// Rate limiting utilities
export {
  RATE_LIMITS,
  checkRateLimit,
  getClientIP,
  cleanupRateLimits,
  withRateLimit,
} from './utils/rate-limiter';

// reCAPTCHA utilities
export {
  verifyRecaptcha,
  withRecaptcha,
  detectSpamContent,
  validateFormInput,
} from './utils/recaptcha';
