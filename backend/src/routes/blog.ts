import { Router } from 'express';
import { query, queryOne } from '../db';

const router = Router();

const ITEMS_PER_PAGE = 9;

// List posts (members-only posts returned as locked for non-members)
router.get('/', async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page ?? 1), 1);
    const category = req.query.category as string | undefined;
    const offset = (page - 1) * ITEMS_PER_PAGE;

    const params: unknown[] = [];
    let where = 'WHERE is_published = TRUE AND published_at <= NOW()';
    if (category) {
      params.push(category);
      where += ` AND category = $${params.length}`;
    }

    const countRows = await query<{ count: string }>(
      `SELECT COUNT(*) AS count FROM blog_posts ${where}`,
      params
    );
    const total = Number(countRows[0]?.count ?? 0);
    const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

    params.push(ITEMS_PER_PAGE, offset);
    const posts = await query(
      `SELECT id, title, excerpt, thumbnail_url, category, members_only, published_at
       FROM blog_posts ${where}
       ORDER BY published_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    // Gate content for non-members
    const role = req.user?.role ?? 'GUEST';
    const isMember = ['MEMBER_FREE', 'MEMBER_GOLD', 'ADMIN'].includes(role);

    const result = posts.map((p: Record<string, unknown>) => ({
      id: p.id,
      title: p.title,
      excerpt: p.excerpt,
      thumbnail: p.thumbnail_url ? { url: p.thumbnail_url as string } : undefined,
      category: p.category ? { id: p.category as string, name: p.category as string } : undefined,
      publishedAt: p.published_at,
      membersOnly: p.members_only,
      isLocked: p.members_only && !isMember,
    }));

    res.json({ posts: result, totalPages, total });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Single post
router.get('/:id', async (req, res) => {
  try {
    const post = await queryOne<Record<string, unknown>>(
      `SELECT id, title, content, excerpt, thumbnail_url, category, members_only, published_at
       FROM blog_posts WHERE id = $1 AND is_published = TRUE AND published_at <= NOW()`,
      [req.params.id]
    );

    if (!post) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    const role = req.user?.role ?? 'GUEST';
    const isMember = ['MEMBER_FREE', 'MEMBER_GOLD', 'ADMIN'].includes(role);
    const isLocked = (post.members_only as boolean) && !isMember;

    res.json({
      id: post.id,
      title: post.title,
      content: isLocked ? null : post.content,
      excerpt: post.excerpt,
      thumbnail: post.thumbnail_url ? { url: post.thumbnail_url as string } : undefined,
      category: post.category ? { id: post.category as string, name: post.category as string } : undefined,
      publishedAt: post.published_at,
      membersOnly: post.members_only,
      isLocked,
    });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
