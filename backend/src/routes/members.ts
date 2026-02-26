import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';

const router = Router();

router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
    });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const sub = await prisma.subscription.findUnique({
      where: { userId: user.id },
    });

    res.json({
      user: { id: user.id, email: user.email, name: user.name, image: user.image, role: user.role },
      subscription: sub
        ? {
            hasSubscription: sub.tier === 'MEMBER_GOLD',
            tier: sub.tier,
            status: sub.status,
            currentPeriodEnd: sub.currentPeriodEnd,
            cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
          }
        : { hasSubscription: false, tier: 'USER' },
    });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/me', requireAuth, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== 'string') {
      res.status(400).json({ error: 'name is required' });
      return;
    }
    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: { name: name.trim() },
    });
    res.json({ id: user.id, email: user.email, name: user.name, image: user.image, role: user.role });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/content', requireRole('MEMBER_FREE'), async (req, res) => {
  try {
    const role = req.user!.role;

    const articles = await prisma.blogPost.findMany({
      where: {
        isPublished: true,
        membersOnly: true,
        publishedAt: { lte: new Date() },
      },
      orderBy: { publishedAt: 'desc' },
      take: 20,
      select: {
        id: true,
        title: true,
        excerpt: true,
        thumbnailUrl: true,
        category: true,
        publishedAt: true,
      },
    });

    res.json({
      tier: role,
      content: {
        videos: [],
        articles: articles.map((a) => ({
          id: a.id,
          title: a.title,
          excerpt: a.excerpt,
          thumbnail: a.thumbnailUrl ? { url: a.thumbnailUrl } : undefined,
          category: a.category,
          publishedAt: a.publishedAt,
          locked: false,
        })),
      },
    });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
