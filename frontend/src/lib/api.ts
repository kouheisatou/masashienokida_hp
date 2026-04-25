import createClient from 'openapi-fetch';
import type { paths, components } from '@/generated/api';
import { showSnackbar } from '@/lib/snackbar';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

// 認証は httpOnly Cookie (auth_token) ベース。localStorage には触れない。
// 残置: 過去バージョンが localStorage に書いた値を起動時に消去する。
export function migrateLegacyToken() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('auth_token');
  } catch {
    /* noop */
  }
}

// httpOnly cookie は JS から見えないため、並行して立てている
// auth_present フラグ cookie の有無でログイン状態を即時判定する。
export function isAuthenticated(): boolean {
  if (typeof document === 'undefined') return false;
  return document.cookie.split('; ').some((c) => c.startsWith('auth_present='));
}

export const api = createClient<paths>({
  baseUrl: API_BASE,
  credentials: 'include',
});

api.use({
  async onResponse({ response }) {
    if (response.status === 429) {
      showSnackbar('リクエストが多すぎます。しばらくお待ちください。', 'error');
    }
  },
});

export function getGoogleSignInUrl(): string {
  return `${API_BASE}/auth/google`;
}

export type { paths, components };
