/**
 * Blog Function - OCI Function for Blog Content
 * Fetches blog posts from MicroCMS with member-only filtering
 */

import { createClient } from 'microcms-js-sdk';
import {
  createResponse,
  handleCors,
  unauthorized,
  forbidden,
  notFound,
  serverError,
  verifyAuth,
  isMember,
  isGoldMember,
} from '@enokida/shared';

// Initialize MicroCMS client
const microcms = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN || '',
  apiKey: process.env.MICROCMS_API_KEY || '',
});

// OCI Function context
interface FunctionContext {
  httpGateway: {
    requestURL: string;
    headers: Record<string, string>;
    method: string;
  };
}

// MicroCMS image type
interface MicroCMSImage {
  url: string;
  height?: number;
  width?: number;
}

// MicroCMS category type
interface Category {
  id: string;
  name: string;
  slug: string;
}

// Blog post type from MicroCMS
interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  thumbnail?: MicroCMSImage;
  category?: Category;
  tags?: string[];
  membersOnly: boolean;
  requiredTier?: 'MEMBER_FREE' | 'MEMBER_GOLD';
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Main function handler
 */
export async function handler(
  ctx: FunctionContext,
  _data: string
): Promise<{ statusCode: number; headers: Record<string, string>; body: string }> {
  const { requestURL, headers, method } = ctx.httpGateway;

  if (method === 'OPTIONS') {
    return handleCors();
  }

  if (method !== 'GET') {
    return createResponse(405, { error: 'Method not allowed' });
  }

  const url = new URL(requestURL);
  const path = url.pathname.replace(/^\/api\/blog/, '');

  try {
    // Get user for member content filtering (optional)
    const user = await verifyAuth(headers);

    if (path === '' || path === '/') {
      return await handleListPosts(url.searchParams, user);
    }

    // Get single post by ID
    const postId = path.substring(1); // Remove leading slash
    return await handleGetPost(postId, user);
  } catch (error) {
    console.error('Blog function error:', error);
    return serverError('ブログの取得に失敗しました');
  }
}

/**
 * List blog posts with pagination and filtering
 */
async function handleListPosts(
  params: URLSearchParams,
  user: { id: string; role: string } | null
): Promise<ReturnType<typeof createResponse>> {
  const page = parseInt(params.get('page') || '1', 10);
  const limit = Math.min(parseInt(params.get('limit') || '10', 10), 50);
  const category = params.get('category');
  const tag = params.get('tag');

  // Build filters
  const filters: string[] = [];

  // Filter out members-only posts for non-members
  const authUser = user ? { ...user, name: '', email: '' } : null;
  if (!isMember(authUser)) {
    filters.push('membersOnly[equals]false');
  }

  // Category filter
  if (category) {
    filters.push(`category[equals]${category}`);
  }

  // Tag filter
  if (tag) {
    filters.push(`tags[contains]${tag}`);
  }

  try {
    const response = await microcms.getList<BlogPost>({
      endpoint: 'posts',
      queries: {
        limit,
        offset: (page - 1) * limit,
        filters: filters.length > 0 ? filters.join('[and]') : undefined,
        orders: '-publishedAt',
        fields: [
          'id',
          'title',
          'excerpt',
          'thumbnail',
          'category',
          'tags',
          'membersOnly',
          'requiredTier',
          'publishedAt',
        ],
      },
    });

    // Process posts for access control
    const posts = response.contents.map((post) => {
      const canAccess = canAccessPost(post, authUser);

      return {
        id: post.id,
        title: post.title,
        excerpt: canAccess
          ? post.excerpt
          : post.membersOnly
          ? '会員限定の記事です'
          : post.excerpt,
        thumbnail: post.thumbnail,
        category: post.category,
        tags: post.tags,
        membersOnly: post.membersOnly,
        requiredTier: post.requiredTier,
        publishedAt: post.publishedAt,
        isLocked: !canAccess,
      };
    });

    return createResponse(200, {
      posts,
      totalCount: response.totalCount,
      page,
      limit,
      totalPages: Math.ceil(response.totalCount / limit),
    });
  } catch (error) {
    console.error('MicroCMS error:', error);
    return serverError('ブログの取得に失敗しました');
  }
}

/**
 * Get single blog post
 */
async function handleGetPost(
  postId: string,
  user: { id: string; role: string } | null
): Promise<ReturnType<typeof createResponse>> {
  try {
    const post = await microcms.get<BlogPost>({
      endpoint: 'posts',
      contentId: postId,
    });

    const authUser = user ? { ...user, name: '', email: '' } : null;

    // Check access permissions
    if (post.membersOnly) {
      if (!user) {
        return unauthorized('この記事を読むにはログインが必要です', {
          loginUrl: '/api/auth/signin',
        } as Record<string, unknown>);
      }

      if (!canAccessPost(post, authUser)) {
        return forbidden('この記事はゴールド会員限定です', {
          upgradeUrl: '/supporters',
          excerpt: post.excerpt,
        });
      }
    }

    // Get related posts (same category, not the current post)
    let relatedPosts: Array<{
      id: string;
      title: string;
      thumbnail?: MicroCMSImage;
      publishedAt: string;
    }> = [];

    if (post.category) {
      const related = await microcms.getList<BlogPost>({
        endpoint: 'posts',
        queries: {
          limit: 3,
          filters: `category[equals]${post.category.id}[and]id[not_equals]${postId}`,
          orders: '-publishedAt',
          fields: ['id', 'title', 'thumbnail', 'publishedAt'],
        },
      });
      relatedPosts = related.contents;
    }

    return createResponse(200, {
      ...post,
      relatedPosts,
    });
  } catch (error: unknown) {
    const err = error as { status?: number };
    if (err.status === 404) {
      return notFound('記事が見つかりません');
    }
    throw error;
  }
}

/**
 * Check if user can access a post
 */
function canAccessPost(
  post: BlogPost,
  user: { id: string; role: string; name: string; email: string } | null
): boolean {
  if (!post.membersOnly) {
    return true;
  }

  if (!user) {
    return false;
  }

  // Gold-only content
  if (post.requiredTier === 'MEMBER_GOLD') {
    return isGoldMember(user);
  }

  // Any member can access
  return isMember(user);
}

module.exports = { handler };
