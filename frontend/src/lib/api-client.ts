const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

// ── Token helpers ────────────────────────────────────────────
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

// ── Base fetch wrapper ────────────────────────────────────────
async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  auth = false
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (auth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error ?? 'API error');
  }
  return res.json() as Promise<T>;
}

// ── Types ─────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string | null;
  email: string;
  image?: string;
  role: 'USER' | 'ADMIN' | 'MEMBER_FREE' | 'MEMBER_GOLD';
}

export interface Subscription {
  hasSubscription: boolean;
  tier: string;
  status?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
}

export interface BlogPost {
  id: string;
  title: string;
  content?: string | null;
  excerpt?: string;
  thumbnail?: { url: string };
  category?: { id: string; name: string };
  publishedAt: string;
  membersOnly: boolean;
  isLocked?: boolean;
}

export interface NewsItem {
  id: string;
  title: string;
  body?: string;
  image_url?: string;
  category?: string;
  published_at: string;
}

export interface Concert {
  id: string;
  title: string;
  date: string;
  time?: string;
  venue: string;
  address?: string;
  image_url?: string;
  program?: string[];
  price?: string;
  ticket_url?: string;
  note?: string;
  is_upcoming: boolean;
}

export interface DiscographyItem {
  id: string;
  title: string;
  release_year: number;
  description?: string;
  image_url?: string;
  sort_order: number;
}

export interface BiographyEntry {
  id: string;
  year: string;
  description: string;
  sort_order: number;
}

export interface ContactInput {
  name: string;
  email: string;
  phone?: string;
  category?: string;
  subject: string;
  message: string;
}

// ── Auth ──────────────────────────────────────────────────────
export function getGoogleSignInUrl(): string {
  return `${API_BASE}/auth/google`;
}

export async function getMe(): Promise<{ user: User; subscription: Subscription } | null> {
  try {
    return await apiFetch<{ user: User; subscription: Subscription }>('/auth/me', {}, true);
  } catch {
    return null;
  }
}

export async function signOut(): Promise<void> {
  await apiFetch('/auth/signout', { method: 'POST' }, true).catch(() => {});
  clearToken();
}

export async function deleteAccount(): Promise<void> {
  await apiFetch('/auth/account', { method: 'DELETE' }, true);
  clearToken();
}

// ── Profile ──────────────────────────────────────────────────
export async function updateProfile(name: string): Promise<User> {
  return apiFetch<User>('/members/me', {
    method: 'PUT',
    body: JSON.stringify({ name }),
  }, true);
}

// ── News ──────────────────────────────────────────────────────
export async function getNews(limit = 3): Promise<NewsItem[]> {
  return apiFetch<NewsItem[]>(`/news?limit=${limit}`);
}

// ── Concerts ─────────────────────────────────────────────────
export async function getUpcomingConcerts(): Promise<Concert[]> {
  return apiFetch<Concert[]>('/concerts?upcoming=true');
}

export async function getAllConcerts(): Promise<Concert[]> {
  return apiFetch<Concert[]>('/concerts');
}

// ── Discography ──────────────────────────────────────────────
export async function getDiscography(): Promise<DiscographyItem[]> {
  return apiFetch<DiscographyItem[]>('/discography');
}

// ── Biography ────────────────────────────────────────────────
export async function getBiography(): Promise<BiographyEntry[]> {
  return apiFetch<BiographyEntry[]>('/biography');
}

// ── Blog ─────────────────────────────────────────────────────
export async function getBlogPosts(params: {
  page?: number;
  category?: string;
}): Promise<{ posts: BlogPost[]; totalPages: number; total: number }> {
  const qs = new URLSearchParams();
  if (params.page) qs.set('page', String(params.page));
  if (params.category) qs.set('category', params.category);
  return apiFetch<{ posts: BlogPost[]; totalPages: number; total: number }>(
    `/blog?${qs.toString()}`,
    {},
    true
  );
}

export async function getBlogPost(id: string): Promise<BlogPost | null> {
  try {
    return await apiFetch<BlogPost>(`/blog/${id}`, {}, true);
  } catch {
    return null;
  }
}

// ── Members ─────────────────────────────────────────────────
export async function getMemberContent(): Promise<{
  tier: string;
  content: { videos: unknown[]; articles: unknown[] };
}> {
  return apiFetch('/members/content', {}, true);
}

// ── Stripe ───────────────────────────────────────────────────
export async function createCheckoutSession(): Promise<{ url: string }> {
  return apiFetch<{ url: string }>('/stripe/checkout', { method: 'POST' }, true);
}

export async function createPortalSession(): Promise<{ url: string }> {
  return apiFetch<{ url: string }>('/stripe/portal', {}, true);
}

// ── Contact ──────────────────────────────────────────────────
export async function submitContact(data: ContactInput): Promise<void> {
  await apiFetch('/contact', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ── Admin ────────────────────────────────────────────────────
export async function getAdminStats(): Promise<{
  stats: {
    totalMembers: number;
    goldMembers: number;
    freeMembers: number;
    unreadContacts: number;
  };
  recentContacts: unknown[];
  recentMembers: unknown[];
}> {
  return apiFetch('/admin/stats', {}, true);
}

export async function getAdminContacts(params?: {
  status?: string;
  search?: string;
  page?: number;
}): Promise<{ contacts: unknown[]; total: number; totalPages: number }> {
  const qs = new URLSearchParams();
  if (params?.status) qs.set('status', params.status);
  if (params?.search) qs.set('search', params.search);
  if (params?.page) qs.set('page', String(params.page));
  return apiFetch(`/admin/contacts?${qs.toString()}`, {}, true);
}

export async function updateContactStatus(id: string, status: string): Promise<void> {
  await apiFetch(`/admin/contacts/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  }, true);
}

export async function getAdminMembers(params?: {
  role?: string;
  search?: string;
  page?: number;
}): Promise<{ members: unknown[]; total: number; totalPages: number }> {
  const qs = new URLSearchParams();
  if (params?.role) qs.set('role', params.role);
  if (params?.search) qs.set('search', params.search);
  if (params?.page) qs.set('page', String(params.page));
  return apiFetch(`/admin/members?${qs.toString()}`, {}, true);
}
