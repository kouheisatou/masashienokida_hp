import { Router } from 'express';
import { query, queryOne } from '../db';
import { requireRole } from '../middleware/requireRole';

const router = Router();

// List concerts
router.get('/', async (req, res) => {
  try {
    const upcomingParam = req.query.upcoming;
    let sql = `SELECT id, title, date, time, venue, address, image_url, program,
                      price, ticket_url, note, is_upcoming, created_at
               FROM concerts WHERE is_published = TRUE`;
    const params: unknown[] = [];

    if (upcomingParam === 'true') {
      sql += ' AND is_upcoming = TRUE';
    } else if (upcomingParam === 'false') {
      sql += ' AND is_upcoming = FALSE';
    }

    sql += ' ORDER BY date DESC';
    const rows = await query(sql, params);
    res.json(rows);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Single concert
router.get('/:id', async (req, res) => {
  try {
    const row = await queryOne(
      `SELECT id, title, date, time, venue, address, image_url, program,
              price, ticket_url, note, is_upcoming
       FROM concerts WHERE id = $1 AND is_published = TRUE`,
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
    const { title, date, time, venue, address, image_url, program, price, ticket_url, note, is_upcoming, is_published } = req.body;
    const rows = await query(
      `INSERT INTO concerts (title, date, time, venue, address, image_url, program, price, ticket_url, note, is_upcoming, is_published)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [title, date, time, venue, address, image_url, program, price, ticket_url, note, is_upcoming ?? true, is_published ?? true]
    );
    res.status(201).json(rows[0]);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update (ADMIN)
router.put('/:id', requireRole('ADMIN'), async (req, res) => {
  try {
    const { title, date, time, venue, address, image_url, program, price, ticket_url, note, is_upcoming, is_published } = req.body;
    const rows = await query(
      `UPDATE concerts SET title=$1, date=$2, time=$3, venue=$4, address=$5, image_url=$6,
       program=$7, price=$8, ticket_url=$9, note=$10, is_upcoming=$11, is_published=$12, updated_at=NOW()
       WHERE id=$13 RETURNING *`,
      [title, date, time, venue, address, image_url, program, price, ticket_url, note, is_upcoming, is_published, req.params.id]
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
    await query('DELETE FROM concerts WHERE id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
