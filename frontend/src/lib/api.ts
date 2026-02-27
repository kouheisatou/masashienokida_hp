import createClient from 'openapi-fetch';
import type { paths, components } from '@/generated/api';
import { showSnackbar } from '@/lib/snackbar';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

export function setToken(token: string) {
  localStorage.setItem('auth_token', token);
}

export function clearToken() {
  localStorage.removeItem('auth_token');
}

export const api = createClient<paths>({ baseUrl: API_BASE });

api.use({
  async onRequest({ request }) {
    const token = getToken();
    if (token) request.headers.set('Authorization', `Bearer ${token}`);
    return request;
  },
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
