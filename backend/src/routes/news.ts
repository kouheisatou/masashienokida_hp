import { Router } from 'express';
import { query, queryOne } from '../db';
import { requireRole } from '../middleware/requireRole';

const router = Router();

// List published news
router.get('/', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit ?? 20), 100);
    const offset = Number(req.query.offset ?? 0);
    const rows = await query(
      `SELECT id, title, body, image_url, category, published_at, created_at
       FROM news
       WHERE is_published = TRUE
       ORDER BY published_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    res.json(rows);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Single news item
router.get('/:id', async (req, res) => {
  try {
    const row = await queryOne(
      'SELECT id, title, body, image_url, category, published_at FROM news WHERE id = $1 AND is_published = TRUE',
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

// Create (ADMIN)
router.post('/', requireRole('ADMIN'), async (req, res) => {
  try {
    const { title, body, image_url, category, published_at, is_published } = req.body;
    const rows = await query(
      `INSERT INTO news (title, body, image_url, category, published_at, is_published)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [title, body, image_url, category, published_at ?? new Date(), is_published ?? true]
    );
    res.status(201).json(rows[0]);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update (ADMIN)
router.put('/:id', requireRole('ADMIN'), async (req, res) => {
  try {
    const { title, body, image_url, category, published_at, is_published } = req.body;
    const rows = await query(
      `UPDATE news SET title=$1, body=$2, image_url=$3, category=$4,
       published_at=$5, is_published=$6, updated_at=NOW()
       WHERE id=$7 RETURNING *`,
      [title, body, image_url, category, published_at, is_published, req.params.id]
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

// Delete (ADMIN)
router.delete('/:id', requireRole('ADMIN'), async (req, res) => {
  try {
    await query('DELETE FROM news WHERE id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
