import { Router } from 'express';
import { query, queryOne } from '../db';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';

const router = Router();

// Profile + subscription info
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await queryOne<{
      id: string; email: string; name: string | null; image: string | null; role: string;
    }>(
      'SELECT id, email, name, image, role FROM users WHERE id = $1',
      [req.user!.userId]
    );
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const sub = await queryOne<{
      tier: string; status: string; current_period_end: string | null; cancel_at_period_end: boolean;
    }>(
      'SELECT tier, status, current_period_end, cancel_at_period_end FROM subscriptions WHERE user_id = $1',
      [user.id]
    );

    res.json({
      user,
      subscription: sub
        ? {
            hasSubscription: sub.tier === 'MEMBER_GOLD',
            tier: sub.tier,
            status: sub.status,
            currentPeriodEnd: sub.current_period_end,
            cancelAtPeriodEnd: sub.cancel_at_period_end,
          }
        : { hasSubscription: false, tier: 'USER' },
    });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update name
router.put('/me', requireAuth, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== 'string') {
      res.status(400).json({ error: 'name is required' });
      return;
    }
    const rows = await query<{ id: string; email: string; name: string; image: string | null; role: string }>(
      'UPDATE users SET name=$1, updated_at=NOW() WHERE id=$2 RETURNING id, email, name, image, role',
      [name.trim(), req.user!.userId]
    );
    res.json(rows[0]);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Member-only content (MEMBER_FREE and above)
router.get('/content', requireRole('MEMBER_FREE'), async (req, res) => {
  try {
    const role = req.user!.role;
    const isGold = ['MEMBER_GOLD', 'ADMIN'].includes(role);

    // Fetch members-only blog posts as articles
    const articles = await query(
      `SELECT id, title, excerpt, thumbnail_url, category, published_at
       FROM blog_posts
       WHERE is_published = TRUE AND members_only = TRUE AND published_at <= NOW()
       ORDER BY published_at DESC LIMIT 20`
    );

    res.json({
      tier: role,
      content: {
        videos: [], // future: video content table
        articles: articles.map((a: Record<string, unknown>) => ({
          id: a.id,
          title: a.title,
          excerpt: a.excerpt,
          thumbnail: a.thumbnail_url ? { url: a.thumbnail_url } : undefined,
          category: a.category,
          publishedAt: a.published_at,
          locked: !isGold && false, // all MEMBER_FREE+ can read members_only posts
        })),
      },
    });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
