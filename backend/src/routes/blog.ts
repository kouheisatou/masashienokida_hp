import { Router } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';

const router = Router();

const ITEMS_PER_PAGE = 9;

// ── Public: list blog categories ─────────────────────────────────
router.get('/categories', async (_req, res) => {
  try {
    const categories = await prisma.blogCategory.findMany({
      orderBy: { sortOrder: 'asc' },
      select: { id: true, name: true, slug: true, sortOrder: true },
    });
    res.json(categories);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── Public: list blog posts ──────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page ?? 1), 1);
    const categorySlug = req.query.category as string | undefined;
    const offset = (page - 1) * ITEMS_PER_PAGE;

    const where: Prisma.BlogPostWhereInput = {
      isPublished: true,
      publishedAt: { lte: new Date() },
      ...(categorySlug ? { category: { slug: categorySlug } } : {}),
    };

    const [total, posts] = await prisma.$transaction([
      prisma.blogPost.count({ where }),
      prisma.blogPost.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip: offset,
        take: ITEMS_PER_PAGE,
        select: {
          id: true,
          title: true,
          excerpt: true,
          thumbnailUrl: true,
          category: { select: { id: true, name: true, slug: true } },
          membersOnly: true,
          publishedAt: true,
        },
      }),
    ]);

    const role = req.user?.role ?? 'GUEST';
    const isMember = ['MEMBER_FREE', 'MEMBER_GOLD', 'ADMIN'].includes(role);
    const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

    res.json({
      posts: posts.map((p) => ({
        id: p.id,
        title: p.title,
        excerpt: p.excerpt,
        thumbnail: p.thumbnailUrl ? { url: p.thumbnailUrl } : undefined,
        category: p.category ? { id: p.category.slug, name: p.category.name } : undefined,
        publishedAt: p.publishedAt,
        membersOnly: p.membersOnly,
        isLocked: p.membersOnly && !isMember,
      })),
      totalPages,
      total,
    });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── Public: get single blog post ─────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const post = await prisma.blogPost.findFirst({
      where: {
        id: req.params.id,
        isPublished: true,
        publishedAt: { lte: new Date() },
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    if (!post) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    const role = req.user?.role ?? 'GUEST';
    const isMember = ['MEMBER_FREE', 'MEMBER_GOLD', 'ADMIN'].includes(role);
    const isLocked = post.membersOnly && !isMember;

    res.json({
      id: post.id,
      title: post.title,
      content: isLocked ? null : post.content,
      excerpt: post.excerpt,
      thumbnail: post.thumbnailUrl ? { url: post.thumbnailUrl } : undefined,
      category: post.category ? { id: post.category.slug, name: post.category.name } : undefined,
      publishedAt: post.publishedAt,
      membersOnly: post.membersOnly,
      isLocked,
    });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
