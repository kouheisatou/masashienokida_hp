import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireRole } from '../middleware/requireRole';
import {
  discographyCreateSchema,
  discographyUpdateSchema,
  reorderSchema,
  parseBody,
} from '../lib/validators';

const router = Router();

function serializeDiscography(d: {
  id: string;
  title: string;
  releaseYear: number;
  description: string | null;
  imageUrl: string | null;
  purchaseUrl: string | null;
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
    purchase_url: d.purchaseUrl,
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
    const data = parseBody(req, res, discographyCreateSchema);
    if (!data) return;
    const { title, release_year, description, image_url, purchase_url, sort_order, is_published } = data;
    const row = await prisma.discography.create({
      data: {
        title,
        releaseYear: release_year,
        description: description ?? null,
        imageUrl: image_url ?? null,
        purchaseUrl: purchase_url ?? null,
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
    const data = parseBody(req, res, discographyUpdateSchema);
    if (!data) return;
    const { title, release_year, description, image_url, purchase_url, sort_order, is_published } = data;
    const row = await prisma.discography.update({
      where: { id: req.params.id },
      data: {
        title,
        releaseYear: release_year,
        description: description ?? undefined,
        imageUrl: image_url ?? undefined,
        purchaseUrl: purchase_url ?? undefined,
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

router.put('/reorder', requireRole('ADMIN'), async (req, res) => {
  try {
    const result = reorderSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: 'Validation failed', details: result.error.issues });
      return;
    }
    const items = result.data;
    await prisma.$transaction(
      items.map((item) =>
        prisma.discography.update({
          where: { id: item.id },
          data: { sortOrder: item.sort_order },
        })
      )
    );
    res.json({ ok: true });
  } catch {
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
