import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireRole } from '../middleware/requireRole';
import {
  biographyCreateSchema,
  biographyUpdateSchema,
  reorderSchema,
  parseBody,
} from '../lib/validators';

const router = Router();

function serializeBiography(b: {
  id: string;
  year: string;
  description: string;
  sortOrder: number;
  createdAt: Date;
}) {
  return {
    id: b.id,
    year: b.year,
    description: b.description,
    sort_order: b.sortOrder,
    created_at: b.createdAt,
  };
}

router.get('/', async (_req, res) => {
  try {
    const rows = await prisma.biography.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    res.json(rows.map(serializeBiography));
  } catch (err) {
    console.error('[biography] handler error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', requireRole('ADMIN'), async (req, res) => {
  try {
    const data = parseBody(req, res, biographyCreateSchema);
    if (!data) return;
    const { year, description, sort_order } = data;
    const row = await prisma.biography.create({
      data: { year, description, sortOrder: sort_order ?? 0 },
    });
    res.status(201).json(serializeBiography(row));
  } catch (err) {
    console.error('[biography] handler error:', err);
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
        prisma.biography.update({
          where: { id: item.id },
          data: { sortOrder: item.sort_order },
        })
      )
    );
    res.json({ ok: true });
  } catch (err) {
    console.error('[biography] handler error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', requireRole('ADMIN'), async (req, res) => {
  try {
    const data = parseBody(req, res, biographyUpdateSchema);
    if (!data) return;
    const { year, description, sort_order } = data;
    const updateData: { year?: string; description?: string; sortOrder?: number } = {};
    if (year !== undefined) updateData.year = year;
    if (description !== undefined) updateData.description = description;
    if (sort_order !== undefined) updateData.sortOrder = sort_order;
    const row = await prisma.biography.update({
      where: { id: req.params.id },
      data: updateData,
    });
    res.json(serializeBiography(row));
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
    await prisma.biography.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err) {
    console.error('[biography] handler error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
