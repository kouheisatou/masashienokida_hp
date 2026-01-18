/**
 * Authentication Middleware for OCI Functions
 * Handles JWT verification and session management
 */

import jwt from 'jsonwebtoken';
import { executeQuery } from '../db/connection';

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRY = '30d';

// User roles
export type UserRole = 'USER' | 'ADMIN' | 'MEMBER_FREE' | 'MEMBER_GOLD';

// JWT payload interface
export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

// Authenticated user interface
export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  stripeCustomerId?: string;
}

// Database user row interface
interface UserRow {
  ID: string;
  NAME: string;
  EMAIL: string;
  ROLE: UserRole;
  STRIPE_CUSTOMER_ID: string | null;
}

/**
 * Sign a new JWT token
 */
export function signJWT(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRY,
  });
}

/**
 * Verify and decode a JWT token
 */
export function verifyJWT(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

/**
 * Extract Bearer token from Authorization header
 */
export function extractBearerToken(authHeader: string | undefined): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

/**
 * Verify authentication from request headers
 * Returns the authenticated user or null if not authenticated
 */
export async function verifyAuth(
  headers: Record<string, string>
): Promise<AuthenticatedUser | null> {
  // Get authorization header (case-insensitive)
  const authHeader =
    headers['authorization'] ||
    headers['Authorization'] ||
    headers['AUTHORIZATION'];

  const token = extractBearerToken(authHeader);
  if (!token) {
    return null;
  }

  // Verify JWT
  const payload = verifyJWT(token);
  if (!payload) {
    return null;
  }

  try {
    // Verify session exists and is not expired
    const sessions = await executeQuery<{ USER_ID: string }>(
      `SELECT user_id FROM sessions
       WHERE session_token = :token AND expires > CURRENT_TIMESTAMP`,
      { token }
    );

    if (sessions.length === 0) {
      return null;
    }

    // Get user details
    const users = await executeQuery<UserRow>(
      `SELECT id, name, email, role, stripe_customer_id
       FROM users WHERE id = :userId`,
      { userId: payload.userId }
    );

    if (users.length === 0) {
      return null;
    }

    const user = users[0];
    return {
      id: user.ID,
      name: user.NAME,
      email: user.EMAIL,
      role: user.ROLE,
      stripeCustomerId: user.STRIPE_CUSTOMER_ID || undefined,
    };
  } catch (error) {
    console.error('Auth verification error:', error);
    return null;
  }
}

/**
 * Check if user has required role(s)
 */
export function requireRole(
  user: AuthenticatedUser | null,
  requiredRoles: UserRole[]
): boolean {
  if (!user) {
    return false;
  }
  return requiredRoles.includes(user.role);
}

/**
 * Check if user is an admin
 */
export function isAdmin(user: AuthenticatedUser | null): boolean {
  return requireRole(user, ['ADMIN']);
}

/**
 * Check if user is a member (any tier)
 */
export function isMember(user: AuthenticatedUser | null): boolean {
  return requireRole(user, ['MEMBER_FREE', 'MEMBER_GOLD', 'ADMIN']);
}

/**
 * Check if user is a gold member
 */
export function isGoldMember(user: AuthenticatedUser | null): boolean {
  return requireRole(user, ['MEMBER_GOLD', 'ADMIN']);
}

/**
 * Create a new session for a user
 */
export async function createSession(
  userId: string,
  email: string,
  role: UserRole
): Promise<string> {
  const token = signJWT({ userId, email, role });
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  await executeQuery(
    `INSERT INTO sessions (id, session_token, user_id, expires)
     VALUES (SYS_GUID(), :token, :userId, :expires)`,
    { token, userId, expires }
  );

  return token;
}

/**
 * Delete a session (logout)
 */
export async function deleteSession(token: string): Promise<void> {
  await executeQuery(
    `DELETE FROM sessions WHERE session_token = :token`,
    { token }
  );
}

/**
 * Clean up expired sessions (maintenance task)
 */
export async function cleanupExpiredSessions(): Promise<number> {
  const result = await executeQuery<{ DELETED_COUNT: number }>(
    `DELETE FROM sessions WHERE expires < CURRENT_TIMESTAMP`
  );
  return result.length;
}

/**
 * Middleware wrapper for protected routes
 */
export function withAuth(
  handler: (
    user: AuthenticatedUser,
    ctx: unknown,
    data: string
  ) => Promise<unknown>,
  requiredRoles?: UserRole[]
) {
  return async (ctx: { httpGateway: { headers: Record<string, string> } }, data: string) => {
    const user = await verifyAuth(ctx.httpGateway.headers);

    if (!user) {
      return {
        statusCode: 401,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Unauthorized' }),
      };
    }

    if (requiredRoles && !requireRole(user, requiredRoles)) {
      return {
        statusCode: 403,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Forbidden' }),
      };
    }

    return handler(user, ctx, data);
  };
}
