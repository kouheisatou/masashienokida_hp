import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireRole } from '../middleware/requireRole';

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
      orderBy: [{ sortOrder: 'asc' }, { year: 'asc' }],
    });
    res.json(rows.map(serializeBiography));
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', requireRole('ADMIN'), async (req, res) => {
  try {
    const { year, description, sort_order } = req.body;
    const row = await prisma.biography.create({
      data: { year, description, sortOrder: sort_order ?? 0 },
    });
    res.status(201).json(serializeBiography(row));
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', requireRole('ADMIN'), async (req, res) => {
  try {
    const { year, description, sort_order } = req.body;
    const row = await prisma.biography.update({
      where: { id: req.params.id },
      data: { year, description, sortOrder: sort_order },
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
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
