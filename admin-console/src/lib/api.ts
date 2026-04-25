import createClient from 'openapi-fetch';
import type { paths, components } from '@/generated/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

// 認証は httpOnly Cookie (auth_token) ベース。localStorage には触れない。
// 旧バージョンの残骸を起動時に消去する。
export function migrateLegacyToken() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('admin_token');
  } catch {
    /* noop */
  }
}

// httpOnly cookie は JS から見えないため、並行して立てている auth_present cookie で
// ログイン状態を即時判定する。
export function isAuthenticated(): boolean {
  if (typeof document === 'undefined') return false;
  return document.cookie.split('; ').some((c) => c.startsWith('auth_present='));
}

export const api = createClient<paths>({
  baseUrl: API_BASE,
  credentials: 'include',
});

export function getAdminGoogleSignInUrl(): string {
  return `${API_BASE}/auth/admin/google`;
}

export type { paths, components };
