import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireRole } from '../middleware/requireRole';

const router = Router();

function serializeDiscography(d: {
  id: string;
  title: string;
  releaseYear: number;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isPublished: boolean;
  createdAt: Date;
}) {
  return {
    id: d.id,
    title: d.title,
    release_year: d.releaseYear,
    description: d.description,
    image_url: d.imageUrl,
    sort_order: d.sortOrder,
    is_published: d.isPublished,
    created_at: d.createdAt,
  };
}

router.get('/', async (_req, res) => {
  try {
    const rows = await prisma.discography.findMany({
      where: { isPublished: true },
      orderBy: [{ sortOrder: 'desc' }, { releaseYear: 'desc' }],
    });
    res.json(rows.map(serializeDiscography));
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const row = await prisma.discography.findFirst({
      where: { id: req.params.id, isPublished: true },
    });
    if (!row) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.json(serializeDiscography(row));
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', requireRole('ADMIN'), async (req, res) => {
  try {
    const { title, release_year, description, image_url, sort_order, is_published } = req.body;
    const row = await prisma.discography.create({
      data: {
        title,
        releaseYear: release_year,
        description,
        imageUrl: image_url,
        sortOrder: sort_order ?? 0,
        isPublished: is_published ?? true,
      },
    });
    res.status(201).json(serializeDiscography(row));
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', requireRole('ADMIN'), async (req, res) => {
  try {
    const { title, release_year, description, image_url, sort_order, is_published } = req.body;
    const row = await prisma.discography.update({
      where: { id: req.params.id },
      data: {
        title,
        releaseYear: release_year,
        description,
        imageUrl: image_url,
        sortOrder: sort_order,
        isPublished: is_published,
      },
    });
    res.json(serializeDiscography(row));
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
    await prisma.discography.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
