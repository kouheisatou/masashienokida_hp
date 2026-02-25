import createClient from 'openapi-fetch';
import type { paths, components } from '@/generated/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('admin_token');
}

export function setToken(token: string) {
  localStorage.setItem('admin_token', token);
}

export function clearToken() {
  localStorage.removeItem('admin_token');
}

export const api = createClient<paths>({ baseUrl: API_BASE });

api.use({
  async onRequest({ request }) {
    const token = getToken();
    if (token) request.headers.set('Authorization', `Bearer ${token}`);
    return request;
  },
});

export function getAdminGoogleSignInUrl(): string {
  return `${API_BASE}/auth/admin/google`;
}

export type { paths, components };
