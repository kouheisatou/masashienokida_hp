import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireRole } from '../middleware/requireRole';
import { sendNewsNotification } from '../utils/email';

const router = Router();

function serializeNews(n: {
  id: string;
  title: string;
  body: string | null;
  imageUrl: string | null;
  category: string | null;
  publishedAt: Date;
  isPublished: boolean;
  createdAt: Date;
}) {
  return {
    id: n.id,
    title: n.title,
    body: n.body,
    image_url: n.imageUrl,
    category: n.category,
    published_at: n.publishedAt,
    is_published: n.isPublished,
    created_at: n.createdAt,
  };
}

router.get('/', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit ?? 20), 100);
    const offset = Number(req.query.offset ?? 0);

    const rows = await prisma.news.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: 'desc' },
      take: limit,
      skip: offset,
    });

    res.json(rows.map(serializeNews));
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const row = await prisma.news.findFirst({
      where: { id: req.params.id, isPublished: true },
    });
    if (!row) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.json(serializeNews(row));
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', requireRole('ADMIN'), async (req, res) => {
  try {
    const { title, body, image_url, category, published_at, is_published } = req.body;
    const row = await prisma.news.create({
      data: {
        title,
        body,
        imageUrl: image_url,
        category,
        publishedAt: published_at ? new Date(published_at) : new Date(),
        isPublished: is_published ?? true,
      },
    });

    if (row.isPublished) {
      sendNewsNotification({ id: row.id, title: row.title, body: row.body }).catch(
        (err) => console.error('Failed to send news notification:', err),
      );
    }

    res.status(201).json(serializeNews(row));
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', requireRole('ADMIN'), async (req, res) => {
  try {
    const { title, body, image_url, category, published_at, is_published } = req.body;

    const before = await prisma.news.findUnique({ where: { id: req.params.id }, select: { isPublished: true } });

    const row = await prisma.news.update({
      where: { id: req.params.id },
      data: {
        title,
        body,
        imageUrl: image_url,
        category,
        publishedAt: published_at ? new Date(published_at) : undefined,
        isPublished: is_published,
      },
    });

    if (!before?.isPublished && row.isPublished) {
      sendNewsNotification({ id: row.id, title: row.title, body: row.body }).catch(
        (err) => console.error('Failed to send news notification:', err),
      );
    }

    res.json(serializeNews(row));
  } catch (err: unknown) {
    if ((err as { code?: string }).code === 'P2025') {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', requireRole('ADMIN'), async (req, res) => {
  try {
    await prisma.news.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
