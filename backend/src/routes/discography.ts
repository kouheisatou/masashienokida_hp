import { Router } from 'express';
import { query, queryOne } from '../db';
import { requireRole } from '../middleware/requireRole';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const rows = await query(
      `SELECT id, title, release_year, description, image_url, sort_order
       FROM discography
       WHERE is_published = TRUE
       ORDER BY sort_order DESC, release_year DESC`
    );
    res.json(rows);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const row = await queryOne(
      'SELECT id, title, release_year, description, image_url, sort_order FROM discography WHERE id = $1 AND is_published = TRUE',
      [req.params.id]
    );
    if (!row) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.json(row);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', requireRole('ADMIN'), async (req, res) => {
  try {
    const { title, release_year, description, image_url, sort_order, is_published } = req.body;
    const rows = await query(
      `INSERT INTO discography (title, release_year, description, image_url, sort_order, is_published)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [title, release_year, description, image_url, sort_order ?? 0, is_published ?? true]
    );
    res.status(201).json(rows[0]);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', requireRole('ADMIN'), async (req, res) => {
  try {
    const { title, release_year, description, image_url, sort_order, is_published } = req.body;
    const rows = await query(
      `UPDATE discography SET title=$1, release_year=$2, description=$3, image_url=$4,
       sort_order=$5, is_published=$6, updated_at=NOW() WHERE id=$7 RETURNING *`,
      [title, release_year, description, image_url, sort_order, is_published, req.params.id]
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
    await query('DELETE FROM discography WHERE id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
