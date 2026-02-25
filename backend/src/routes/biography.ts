import { Router } from 'express';
import { query } from '../db';
import { requireRole } from '../middleware/requireRole';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const rows = await query(
      'SELECT id, year, description, sort_order FROM biography ORDER BY sort_order ASC, year ASC'
    );
    res.json(rows);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', requireRole('ADMIN'), async (req, res) => {
  try {
    const { year, description, sort_order } = req.body;
    const rows = await query(
      'INSERT INTO biography (year, description, sort_order) VALUES ($1,$2,$3) RETURNING *',
      [year, description, sort_order ?? 0]
    );
    res.status(201).json(rows[0]);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', requireRole('ADMIN'), async (req, res) => {
  try {
    const { year, description, sort_order } = req.body;
    const rows = await query(
      'UPDATE biography SET year=$1, description=$2, sort_order=$3, updated_at=NOW() WHERE id=$4 RETURNING *',
      [year, description, sort_order, req.params.id]
    );
    if (!rows.length) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.json(rows[0]);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', requireRole('ADMIN'), async (req, res) => {
  try {
    await query('DELETE FROM biography WHERE id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
