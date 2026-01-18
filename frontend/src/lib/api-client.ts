/**
 * API Client for OCI Functions via API Gateway
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Types
interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: 'USER' | 'ADMIN' | 'MEMBER_FREE' | 'MEMBER_GOLD';
}

interface AuthResponse {
  sessionToken: string;
  user: User;
  isNewUser?: boolean;
}

interface Subscription {
  hasSubscription: boolean;
  tier: string;
  status?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
}

interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  category?: string;
  message: string;
  recaptchaToken?: string;
}

interface BlogPost {
  id: string;
  title: string;
  content?: string;
  excerpt?: string;
  thumbnail?: { url: string };
  category?: { id: string; name: string };
  publishedAt: string;
  membersOnly: boolean;
  isLocked?: boolean;
}

interface BlogListResponse {
  posts: BlogPost[];
  totalCount: number;
  page: number;
  totalPages: number;
}

// Helper function to get auth token from localStorage
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('sessionToken');
}

// Helper function to set auth token
function setAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('sessionToken', token);
  }
}

// Helper function to clear auth token
function clearAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('sessionToken');
  }
}

// Base fetch function with error handling
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        error: data.error || 'An error occurred',
        message: data.message,
      };
    }

    return { data };
  } catch (error) {
    console.error('API Error:', error);
    return { error: 'Network error' };
  }
}

// ============================================================
// Auth API
// ============================================================
export const authApi = {
  /**
   * Get sign-in URL for OAuth
   */
  async getSignInUrl(): Promise<ApiResponse<{ url: string; state: string }>> {
    return apiFetch('/auth/signin');
  },

  /**
   * Handle OAuth callback
   */
  async handleCallback(
    code: string,
    state?: string
  ): Promise<ApiResponse<AuthResponse>> {
    const result = await apiFetch<AuthResponse>('/auth/callback/google', {
      method: 'POST',
      body: JSON.stringify({ code, state }),
    });

    if (result.data?.sessionToken) {
      setAuthToken(result.data.sessionToken);
    }

    return result;
  },

  /**
   * Get current session
   */
  async getSession(): Promise<ApiResponse<{ user: User }>> {
    return apiFetch('/auth/session');
  },

  /**
   * Sign out
   */
  async signOut(): Promise<ApiResponse<{ success: boolean }>> {
    const result = await apiFetch<{ success: boolean }>('/auth/signout', {
      method: 'POST',
    });
    clearAuthToken();
    return result;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return getAuthToken() !== null;
  },
};

// ============================================================
// Stripe API
// ============================================================
export const stripeApi = {
  /**
   * Create checkout session for subscription
   */
  async createCheckout(
    priceId?: string
  ): Promise<ApiResponse<{ sessionId: string; url: string }>> {
    return apiFetch('/stripe/create-checkout', {
      method: 'POST',
      body: JSON.stringify({ priceId }),
    });
  },

  /**
   * Get customer portal URL
   */
  async getPortalUrl(): Promise<ApiResponse<{ url: string }>> {
    return apiFetch('/stripe/portal');
  },

  /**
   * Get subscription status
   */
  async getSubscription(): Promise<ApiResponse<Subscription>> {
    return apiFetch('/stripe/subscription');
  },
};

// ============================================================
// Contact API
// ============================================================
export const contactApi = {
  /**
   * Submit contact form
   */
  async submit(
    data: ContactFormData
  ): Promise<ApiResponse<{ success: boolean; message: string; id: string }>> {
    return apiFetch('/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// ============================================================
// Members API
// ============================================================
export const membersApi = {
  /**
   * Get profile
   */
  async getProfile(): Promise<ApiResponse<User & { subscription?: Subscription }>> {
    return apiFetch('/members/profile');
  },

  /**
   * Update profile
   */
  async updateProfile(name: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiFetch('/members/profile', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  },

  /**
   * Get member-only content
   */
  async getContent(): Promise<
    ApiResponse<{
      tier: string;
      content: {
        videos: Array<{
          id: string;
          title: string;
          description: string;
          tier: string;
          available: boolean;
        }>;
        articles: Array<{
          id: string;
          title: string;
          tier: string;
          available: boolean;
        }>;
      };
    }>
  > {
    return apiFetch('/members/content');
  },

  /**
   * Get benefits
   */
  async getBenefits(): Promise<
    ApiResponse<{
      free: Array<{ title: string; description: string }>;
      gold: Array<{ title: string; description: string }>;
      current: string;
      upgradeUrl?: string;
    }>
  > {
    return apiFetch('/members/benefits');
  },
};

// ============================================================
// Blog API
// ============================================================
export const blogApi = {
  /**
   * Get blog posts
   */
  async getPosts(params?: {
    page?: number;
    limit?: number;
    category?: string;
  }): Promise<ApiResponse<BlogListResponse>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.category) searchParams.set('category', params.category);

    const query = searchParams.toString();
    return apiFetch(`/blog${query ? `?${query}` : ''}`);
  },

  /**
   * Get single blog post
   */
  async getPost(id: string): Promise<ApiResponse<BlogPost>> {
    return apiFetch(`/blog/${id}`);
  },
};

// Export types
export type { User, AuthResponse, Subscription, ContactFormData, BlogPost };
