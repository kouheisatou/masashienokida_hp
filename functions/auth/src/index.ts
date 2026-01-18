/**
 * Auth Function - OCI Function for Authentication
 * Handles Google OAuth, session management, and JWT tokens
 */

import {
  executeQuery,
  executeInsert,
  createResponse,
  handleCors,
  unauthorized,
  badRequest,
  serverError,
  signJWT,
  verifyJWT,
  parseBody,
} from '@enokida/shared';
import {
  getAuthorizationUrl,
  exchangeCodeForTokens,
  getUserInfo,
  generateState,
  type GoogleUserInfo,
} from './lib/oauth';

// OCI Function context interface
interface FunctionContext {
  httpGateway: {
    requestURL: string;
    headers: Record<string, string>;
    method: string;
  };
}

// Database row interfaces
interface UserRow {
  ID: string;
  NAME: string;
  EMAIL: string;
  IMAGE: string | null;
  ROLE: string;
  STRIPE_CUSTOMER_ID: string | null;
}

interface AccountRow {
  ID: string;
  USER_ID: string;
  PROVIDER_ACCOUNT_ID: string;
  ACCESS_TOKEN: string | null;
  REFRESH_TOKEN: string | null;
}

/**
 * Main function handler
 */
export async function handler(
  ctx: FunctionContext,
  data: string
): Promise<{ statusCode: number; headers: Record<string, string>; body: string }> {
  const { requestURL, headers, method } = ctx.httpGateway;

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    return handleCors();
  }

  // Parse path
  const url = new URL(requestURL);
  const path = url.pathname.replace(/^\/api\/auth/, '');

  try {
    switch (path) {
      case '/signin':
      case '/signin/google':
        return await handleSignIn();

      case '/callback/google':
        return await handleCallback(data);

      case '/session':
        return await handleSession(headers);

      case '/signout':
        return await handleSignOut(headers);

      case '/csrf':
        return await handleCsrf();

      default:
        return createResponse(404, { error: 'Not found' });
    }
  } catch (error) {
    console.error('Auth function error:', error);
    return serverError('Authentication error');
  }
}

/**
 * Handle sign in request - return OAuth URL
 */
async function handleSignIn(): Promise<ReturnType<typeof createResponse>> {
  const state = generateState();
  const url = getAuthorizationUrl(state);

  // Store state for CSRF validation (in production, use Redis or DB)
  // For simplicity, we're encoding it in the URL

  return createResponse(200, {
    url,
    state,
  });
}

/**
 * Handle OAuth callback
 */
async function handleCallback(
  data: string
): Promise<ReturnType<typeof createResponse>> {
  const body = parseBody<{ code?: string; state?: string; error?: string }>(data);

  if (!body) {
    return badRequest('Invalid request body');
  }

  if (body.error) {
    return createResponse(400, {
      error: 'OAuth error',
      message: body.error,
    });
  }

  if (!body.code) {
    return badRequest('Authorization code is required');
  }

  try {
    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(body.code);

    // Get user info from Google
    const userInfo = await getUserInfo(tokens.access_token);

    // Find or create user
    const { user, isNewUser } = await findOrCreateUser(userInfo, tokens);

    // Create session token
    const sessionToken = signJWT({
      userId: user.ID,
      email: user.EMAIL,
      role: user.ROLE as 'USER' | 'ADMIN' | 'MEMBER_FREE' | 'MEMBER_GOLD',
    });

    // Store session in database
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    await executeQuery(
      `INSERT INTO sessions (id, session_token, user_id, expires)
       VALUES (SYS_GUID(), :token, :userId, :expires)`,
      { token: sessionToken, userId: user.ID, expires }
    );

    return createResponse(200, {
      sessionToken,
      user: {
        id: user.ID,
        name: user.NAME,
        email: user.EMAIL,
        image: user.IMAGE,
        role: user.ROLE,
      },
      isNewUser,
    });
  } catch (error) {
    console.error('Callback error:', error);
    return serverError('Failed to complete authentication');
  }
}

/**
 * Find existing user or create new one
 */
async function findOrCreateUser(
  userInfo: GoogleUserInfo,
  tokens: { access_token: string; refresh_token?: string }
): Promise<{ user: UserRow; isNewUser: boolean }> {
  // Check if account exists
  const accounts = await executeQuery<AccountRow>(
    `SELECT a.*, u.id AS USER_ID
     FROM accounts a
     JOIN users u ON a.user_id = u.id
     WHERE a.provider = 'google' AND a.provider_account_id = :providerId`,
    { providerId: userInfo.id }
  );

  if (accounts.length > 0) {
    // Update tokens
    await executeQuery(
      `UPDATE accounts
       SET access_token = :accessToken,
           refresh_token = NVL(:refreshToken, refresh_token)
       WHERE provider = 'google' AND provider_account_id = :providerId`,
      {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || null,
        providerId: userInfo.id,
      }
    );

    // Get user
    const users = await executeQuery<UserRow>(
      `SELECT id, name, email, image, role, stripe_customer_id
       FROM users WHERE id = :userId`,
      { userId: accounts[0].USER_ID }
    );

    return { user: users[0], isNewUser: false };
  }

  // Check if user exists with same email
  const existingUsers = await executeQuery<UserRow>(
    `SELECT id, name, email, image, role, stripe_customer_id
     FROM users WHERE email = :email`,
    { email: userInfo.email }
  );

  let userId: string;

  if (existingUsers.length > 0) {
    userId = existingUsers[0].ID;

    // Update user info
    await executeQuery(
      `UPDATE users
       SET name = :name, image = :image, email_verified = CURRENT_TIMESTAMP
       WHERE id = :userId`,
      { name: userInfo.name, image: userInfo.picture || null, userId }
    );
  } else {
    // Create new user
    const result = await executeInsert(
      `INSERT INTO users (id, name, email, image, role, email_verified)
       VALUES (SYS_GUID(), :name, :email, :image, 'MEMBER_FREE', CURRENT_TIMESTAMP)`,
      {
        name: userInfo.name,
        email: userInfo.email,
        image: userInfo.picture || null,
      }
    );
    userId = result.id;
  }

  // Create account link
  await executeQuery(
    `INSERT INTO accounts (id, user_id, type, provider, provider_account_id, access_token, refresh_token)
     VALUES (SYS_GUID(), :userId, 'oauth', 'google', :providerId, :accessToken, :refreshToken)`,
    {
      userId,
      providerId: userInfo.id,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token || null,
    }
  );

  // Get the created/updated user
  const users = await executeQuery<UserRow>(
    `SELECT id, name, email, image, role, stripe_customer_id
     FROM users WHERE id = :userId`,
    { userId }
  );

  return { user: users[0], isNewUser: existingUsers.length === 0 };
}

/**
 * Handle session check
 */
async function handleSession(
  headers: Record<string, string>
): Promise<ReturnType<typeof createResponse>> {
  const authHeader =
    headers['authorization'] || headers['Authorization'] || '';

  if (!authHeader.startsWith('Bearer ')) {
    return unauthorized('No valid session');
  }

  const token = authHeader.substring(7);
  const payload = verifyJWT(token);

  if (!payload) {
    return unauthorized('Invalid or expired session');
  }

  // Verify session exists in database
  const sessions = await executeQuery<{ USER_ID: string }>(
    `SELECT user_id FROM sessions
     WHERE session_token = :token AND expires > CURRENT_TIMESTAMP`,
    { token }
  );

  if (sessions.length === 0) {
    return unauthorized('Session expired');
  }

  // Get user details
  const users = await executeQuery<UserRow>(
    `SELECT id, name, email, image, role, stripe_customer_id
     FROM users WHERE id = :userId`,
    { userId: payload.userId }
  );

  if (users.length === 0) {
    return unauthorized('User not found');
  }

  const user = users[0];

  return createResponse(200, {
    user: {
      id: user.ID,
      name: user.NAME,
      email: user.EMAIL,
      image: user.IMAGE,
      role: user.ROLE,
    },
  });
}

/**
 * Handle sign out
 */
async function handleSignOut(
  headers: Record<string, string>
): Promise<ReturnType<typeof createResponse>> {
  const authHeader =
    headers['authorization'] || headers['Authorization'] || '';

  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);

    // Delete session from database
    await executeQuery(
      `DELETE FROM sessions WHERE session_token = :token`,
      { token }
    );
  }

  return createResponse(200, { success: true });
}

/**
 * Handle CSRF token request
 */
async function handleCsrf(): Promise<ReturnType<typeof createResponse>> {
  const token = generateState();

  return createResponse(200, { csrfToken: token });
}

// For OCI Functions, export the handler
module.exports = { handler };
