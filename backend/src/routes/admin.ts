import { Router } from 'express';
import { query, queryOne } from '../db';
import { requireRole } from '../middleware/requireRole';

const router = Router();

// All admin routes require ADMIN role
router.use(requireRole('ADMIN'));

// Dashboard stats
router.get('/stats', async (_req, res) => {
  try {
    const [totalMembers, goldMembers, freeMembers, unreadContacts, recentContacts, recentMembers] =
      await Promise.all([
        queryOne<{ count: string }>('SELECT COUNT(*) AS count FROM users'),
        queryOne<{ count: string }>(
          "SELECT COUNT(*) AS count FROM users WHERE role = 'MEMBER_GOLD'"
        ),
        queryOne<{ count: string }>(
          "SELECT COUNT(*) AS count FROM users WHERE role = 'MEMBER_FREE'"
        ),
        queryOne<{ count: string }>(
          "SELECT COUNT(*) AS count FROM contacts WHERE status = 'unread'"
        ),
        query(
          `SELECT id, name, email, category, subject, status, created_at
           FROM contacts ORDER BY created_at DESC LIMIT 5`
        ),
        query(
          `SELECT id, name, email, role, created_at
           FROM users ORDER BY created_at DESC LIMIT 5`
        ),
      ]);

    res.json({
      stats: {
        totalMembers: Number(totalMembers?.count ?? 0),
        goldMembers: Number(goldMembers?.count ?? 0),
        freeMembers: Number(freeMembers?.count ?? 0),
        unreadContacts: Number(unreadContacts?.count ?? 0),
      },
      recentContacts,
      recentMembers,
    });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// List contacts
router.get('/contacts', async (req, res) => {
  try {
    const status = req.query.status as string | undefined;
    const search = req.query.search as string | undefined;
    const page = Math.max(Number(req.query.page ?? 1), 1);
    const limit = 20;
    const offset = (page - 1) * limit;

    const params: unknown[] = [];
    let where = 'WHERE 1=1';

    if (status && status !== 'all') {
      params.push(status);
      where += ` AND status = $${params.length}`;
    }
    if (search) {
      params.push(`%${search}%`);
      where += ` AND (name ILIKE $${params.length} OR email ILIKE $${params.length} OR subject ILIKE $${params.length})`;
    }

    const countRow = await queryOne<{ count: string }>(
      `SELECT COUNT(*) AS count FROM contacts ${where}`,
      params
    );
    const total = Number(countRow?.count ?? 0);

    params.push(limit, offset);
    const contacts = await query(
      `SELECT id, name, email, phone, category, subject, message, status, created_at
       FROM contacts ${where}
       ORDER BY created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    res.json({ contacts, total, totalPages: Math.ceil(total / limit) });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update contact status
router.put('/contacts/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['unread', 'read', 'replied', 'archived'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }
    const rows = await query(
      'UPDATE contacts SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *',
      [status, req.params.id]
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

// List members
router.get('/members', async (req, res) => {
  try {
    const role = req.query.role as string | undefined;
    const search = req.query.search as string | undefined;
    const page = Math.max(Number(req.query.page ?? 1), 1);
    const limit = 20;
    const offset = (page - 1) * limit;

    const params: unknown[] = [];
    let where = 'WHERE 1=1';

    if (role && role !== 'all') {
      params.push(role);
      where += ` AND u.role = $${params.length}`;
    }
    if (search) {
      params.push(`%${search}%`);
      where += ` AND (u.name ILIKE $${params.length} OR u.email ILIKE $${params.length})`;
    }

    const countRow = await queryOne<{ count: string }>(
      `SELECT COUNT(*) AS count FROM users u ${where}`,
      params
    );
    const total = Number(countRow?.count ?? 0);

    params.push(limit, offset);
    const members = await query(
      `SELECT u.id, u.name, u.email, u.image, u.role, u.created_at,
              s.tier, s.status AS subscription_status, s.current_period_end
       FROM users u
       LEFT JOIN subscriptions s ON s.user_id = u.id
       ${where}
       ORDER BY u.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    res.json({ members, total, totalPages: Math.ceil(total / limit) });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
