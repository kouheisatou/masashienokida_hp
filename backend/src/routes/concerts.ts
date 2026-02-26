import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireRole } from '../middleware/requireRole';

const router = Router();

function serializeConcert(c: {
  id: string;
  title: string;
  date: Date;
  time: string | null;
  venue: string;
  address: string | null;
  imageUrl: string | null;
  program: string[];
  price: string | null;
  ticketUrl: string | null;
  note: string | null;
  isUpcoming: boolean;
  isPublished: boolean;
  createdAt: Date;
}) {
  return {
    id: c.id,
    title: c.title,
    date: c.date,
    time: c.time,
    venue: c.venue,
    address: c.address,
    image_url: c.imageUrl,
    program: c.program,
    price: c.price,
    ticket_url: c.ticketUrl,
    note: c.note,
    is_upcoming: c.isUpcoming,
    is_published: c.isPublished,
    created_at: c.createdAt,
  };
}

router.get('/', async (req, res) => {
  try {
    const upcomingParam = req.query.upcoming;
    const where: { isPublished: boolean; isUpcoming?: boolean } = { isPublished: true };
    if (upcomingParam === 'true') where.isUpcoming = true;
    else if (upcomingParam === 'false') where.isUpcoming = false;

    const rows = await prisma.concert.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    res.json(rows.map(serializeConcert));
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const row = await prisma.concert.findFirst({
      where: { id: req.params.id, isPublished: true },
    });
    if (!row) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.json(serializeConcert(row));
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', requireRole('ADMIN'), async (req, res) => {
  try {
    const { title, date, time, venue, address, image_url, program, price, ticket_url, note, is_upcoming, is_published } = req.body;
    const row = await prisma.concert.create({
      data: {
        title,
        date: new Date(date),
        time,
        venue,
        address,
        imageUrl: image_url,
        program: Array.isArray(program) ? program : program ? [program] : [],
        price,
        ticketUrl: ticket_url,
        note,
        isUpcoming: is_upcoming ?? true,
        isPublished: is_published ?? true,
      },
    });
    res.status(201).json(serializeConcert(row));
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', requireRole('ADMIN'), async (req, res) => {
  try {
    const { title, date, time, venue, address, image_url, program, price, ticket_url, note, is_upcoming, is_published } = req.body;
    const row = await prisma.concert.update({
      where: { id: req.params.id },
      data: {
        title,
        date: date ? new Date(date) : undefined,
        time,
        venue,
        address,
        imageUrl: image_url,
        program: Array.isArray(program) ? program : program ? [program] : undefined,
        price,
        ticketUrl: ticket_url,
        note,
        isUpcoming: is_upcoming,
        isPublished: is_published,
      },
    });
    res.json(serializeConcert(row));
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
    await prisma.concert.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
