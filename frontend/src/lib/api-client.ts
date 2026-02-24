/**
 * API Client
 * TODO: Implement new backend API client
 */

// Types
interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: 'USER' | 'ADMIN' | 'MEMBER_FREE' | 'MEMBER_GOLD';
}

interface Subscription {
  hasSubscription: boolean;
  tier: string;
  status?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
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

// Export types
export type { User, Subscription, BlogPost };
