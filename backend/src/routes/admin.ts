import { Router } from 'express';
import { Prisma, ContactStatus } from '@prisma/client';
import multer from 'multer';
import sharp from 'sharp';
import { prisma } from '../lib/prisma';
import { requireRole } from '../middleware/requireRole';
import { uploadImage } from '../lib/storage';
import { sendBlogPostNotification } from '../utils/email';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Images only'));
  },
});

const router = Router();

router.use(requireRole('ADMIN'));

// ── Dashboard stats ──────────────────────────────────────────────

router.get('/stats', async (_req, res) => {
  try {
    const [totalMembers, goldMembers, freeMembers, unreadContacts, recentContacts, recentMembers] =
      await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { role: 'MEMBER_GOLD' } }),
        prisma.user.count({ where: { role: 'MEMBER_FREE' } }),
        prisma.contact.count({ where: { status: 'unread' } }),
        prisma.contact.findMany({
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: { id: true, name: true, email: true, category: true, subject: true, status: true, createdAt: true },
        }),
        prisma.user.findMany({
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: { id: true, name: true, email: true, role: true, createdAt: true },
        }),
      ]);

    res.json({
      stats: { totalMembers, goldMembers, freeMembers, unreadContacts },
      recentContacts: recentContacts.map((c) => ({
        id: c.id, name: c.name, email: c.email, category: c.category,
        subject: c.subject, status: c.status, created_at: c.createdAt,
      })),
      recentMembers: recentMembers.map((u) => ({
        id: u.id, name: u.name, email: u.email, role: u.role, created_at: u.createdAt,
      })),
    });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── Contacts ──────────────────────────────────────────────────────

router.get('/contacts', async (req, res) => {
  try {
    const status = req.query.status as string | undefined;
    const search = req.query.search as string | undefined;
    const page = Math.max(Number(req.query.page ?? 1), 1);
    const limit = 20;
    const offset = (page - 1) * limit;

    const where: Prisma.ContactWhereInput = {
      ...(status && status !== 'all' ? { status: status as ContactStatus } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
              { subject: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [total, contacts] = await prisma.$transaction([
      prisma.contact.count({ where }),
      prisma.contact.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
    ]);

    res.json({
      contacts: contacts.map((c) => ({
        id: c.id, name: c.name, email: c.email, phone: c.phone,
        category: c.category, subject: c.subject, message: c.message,
        status: c.status, created_at: c.createdAt,
      })),
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/contacts/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses: ContactStatus[] = ['unread', 'read', 'replied', 'archived'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }
    const contact = await prisma.contact.update({
      where: { id: req.params.id },
      data: { status },
    });
    res.json({
      id: contact.id, name: contact.name, email: contact.email, phone: contact.phone,
      category: contact.category, subject: contact.subject, message: contact.message,
      status: contact.status, created_at: contact.createdAt, updated_at: contact.updatedAt,
    });
  } catch (err: unknown) {
    if ((err as { code?: string }).code === 'P2025') {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── Members ───────────────────────────────────────────────────────

router.get('/members', async (req, res) => {
  try {
    const role = req.query.role as string | undefined;
    const search = req.query.search as string | undefined;
    const page = Math.max(Number(req.query.page ?? 1), 1);
    const limit = 20;
    const offset = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      ...(role && role !== 'all' ? { role: role as Prisma.EnumRoleFilter } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [total, members] = await prisma.$transaction([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        include: { subscription: true },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
    ]);

    res.json({
      members: members.map((u) => ({
        id: u.id, name: u.name, email: u.email, image: u.image, role: u.role,
        created_at: u.createdAt,
        tier: u.subscription?.tier ?? null,
        subscription_status: u.subscription?.status ?? null,
        current_period_end: u.subscription?.currentPeriodEnd ?? null,
      })),
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── Concerts (admin read, includes unpublished) ───────────────────

router.get('/concerts', async (_req, res) => {
  try {
    const rows = await prisma.concert.findMany({ orderBy: { date: 'desc' } });
    res.json(
      rows.map((c) => ({
        id: c.id, title: c.title, date: c.date, time: c.time, venue: c.venue,
        address: c.address, image_url: c.imageUrl, program: c.program,
        price: c.price, ticket_url: c.ticketUrl, note: c.note,
        is_upcoming: c.isUpcoming, is_published: c.isPublished, created_at: c.createdAt,
      }))
    );
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/concerts/:id', async (req, res) => {
  try {
    const row = await prisma.concert.findUnique({ where: { id: req.params.id } });
    if (!row) { res.status(404).json({ error: 'Not found' }); return; }
    res.json({
      id: row.id, title: row.title, date: row.date, time: row.time, venue: row.venue,
      address: row.address, image_url: row.imageUrl, program: row.program,
      price: row.price, ticket_url: row.ticketUrl, note: row.note,
      is_upcoming: row.isUpcoming, is_published: row.isPublished,
      created_at: row.createdAt, updated_at: row.updatedAt,
    });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── Discography (admin read, includes unpublished) ────────────────

router.get('/discography', async (_req, res) => {
  try {
    const rows = await prisma.discography.findMany({
      orderBy: [{ sortOrder: 'desc' }, { releaseYear: 'desc' }],
    });
    res.json(
      rows.map((d) => ({
        id: d.id, title: d.title, release_year: d.releaseYear,
        description: d.description, image_url: d.imageUrl,
        sort_order: d.sortOrder, is_published: d.isPublished, created_at: d.createdAt,
      }))
    );
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/discography/:id', async (req, res) => {
  try {
    const row = await prisma.discography.findUnique({ where: { id: req.params.id } });
    if (!row) { res.status(404).json({ error: 'Not found' }); return; }
    res.json({
      id: row.id, title: row.title, release_year: row.releaseYear,
      description: row.description, image_url: row.imageUrl,
      sort_order: row.sortOrder, is_published: row.isPublished,
      created_at: row.createdAt, updated_at: row.updatedAt,
    });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── Biography (admin read) ────────────────────────────────────────

router.get('/biography', async (_req, res) => {
  try {
    const rows = await prisma.biography.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    res.json(
      rows.map((b) => ({
        id: b.id, year: b.year, description: b.description,
        sort_order: b.sortOrder, created_at: b.createdAt,
      }))
    );
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/biography/:id', async (req, res) => {
  try {
    const row = await prisma.biography.findUnique({ where: { id: req.params.id } });
    if (!row) { res.status(404).json({ error: 'Not found' }); return; }
    res.json({
      id: row.id, year: row.year, description: row.description,
      sort_order: row.sortOrder, created_at: row.createdAt, updated_at: row.updatedAt,
    });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── Image upload ──────────────────────────────────────────────────

router.post('/upload/image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.webp`;
    const webpBuffer = await sharp(req.file.buffer)
      .resize(1200, null, { withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer();
    const url = await uploadImage(webpBuffer, filename);
    res.json({ url });
  } catch {
    res.status(500).json({ error: 'Upload failed' });
  }
});

// ── Blog categories admin CRUD ────────────────────────────────────

router.get('/blog/categories', async (_req, res) => {
  try {
    const categories = await prisma.blogCategory.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { posts: true } } },
    });
    res.json(
      categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        sort_order: c.sortOrder,
        post_count: c._count.posts,
        created_at: c.createdAt,
      }))
    );
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/blog/categories', async (req, res) => {
  try {
    const { name, slug, sort_order } = req.body;
    if (!name || !slug) {
      res.status(400).json({ error: 'name and slug are required' });
      return;
    }
    const cat = await prisma.blogCategory.create({
      data: { name, slug, sortOrder: sort_order ?? 0 },
    });
    res.status(201).json({
      id: cat.id, name: cat.name, slug: cat.slug,
      sort_order: cat.sortOrder, post_count: 0, created_at: cat.createdAt,
    });
  } catch (err: unknown) {
    if ((err as { code?: string }).code === 'P2002') {
      res.status(409).json({ error: 'Category with this name or slug already exists' });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/blog/categories/:id', async (req, res) => {
  try {
    const { name, slug, sort_order } = req.body;
    const cat = await prisma.blogCategory.update({
      where: { id: req.params.id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(slug !== undefined ? { slug } : {}),
        ...(sort_order !== undefined ? { sortOrder: sort_order } : {}),
      },
      include: { _count: { select: { posts: true } } },
    });
    res.json({
      id: cat.id, name: cat.name, slug: cat.slug,
      sort_order: cat.sortOrder, post_count: cat._count.posts, created_at: cat.createdAt,
    });
  } catch (err: unknown) {
    if ((err as { code?: string }).code === 'P2025') {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    if ((err as { code?: string }).code === 'P2002') {
      res.status(409).json({ error: 'Category with this name or slug already exists' });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/blog/categories/:id', async (req, res) => {
  try {
    const postCount = await prisma.blogPost.count({ where: { categoryId: req.params.id } });
    if (postCount > 0) {
      res.status(409).json({ error: 'Cannot delete category with associated posts', post_count: postCount });
      return;
    }
    await prisma.blogCategory.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err: unknown) {
    if ((err as { code?: string }).code === 'P2025') {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── Blog admin CRUD ───────────────────────────────────────────────

router.get('/blog', async (req, res) => {
  try {
    const search = req.query.search as string | undefined;
    const page = Math.max(Number(req.query.page ?? 1), 1);
    const limit = 20;
    const offset = (page - 1) * limit;

    const where: Prisma.BlogPostWhereInput = search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { category: { name: { contains: search, mode: 'insensitive' } } },
          ],
        }
      : {};

    const [total, posts] = await prisma.$transaction([
      prisma.blogPost.count({ where }),
      prisma.blogPost.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
        select: {
          id: true, title: true, excerpt: true,
          category: { select: { id: true, name: true, slug: true } },
          membersOnly: true, isPublished: true, publishedAt: true, createdAt: true,
        },
      }),
    ]);

    res.json({
      posts: posts.map((p) => ({
        id: p.id, title: p.title, excerpt: p.excerpt,
        category: p.category?.name ?? null,
        category_id: p.category?.id ?? null,
        members_only: p.membersOnly, is_published: p.isPublished,
        published_at: p.publishedAt, created_at: p.createdAt,
      })),
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/blog/:id', async (req, res) => {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { id: req.params.id },
      include: { category: { select: { id: true, name: true, slug: true } } },
    });
    if (!post) { res.status(404).json({ error: 'Not found' }); return; }
    res.json({
      id: post.id, title: post.title, content: post.content, excerpt: post.excerpt,
      thumbnail_url: post.thumbnailUrl, category: post.category?.name ?? null,
      category_id: post.categoryId,
      members_only: post.membersOnly, is_published: post.isPublished,
      published_at: post.publishedAt, created_at: post.createdAt, updated_at: post.updatedAt,
    });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/blog', async (req, res) => {
  try {
    const { title, content, excerpt, thumbnail_url, category_id, members_only, is_published, published_at } = req.body;
    const post = await prisma.blogPost.create({
      data: {
        title,
        content: content ?? null,
        excerpt: excerpt ?? null,
        thumbnailUrl: thumbnail_url ?? null,
        categoryId: category_id ?? null,
        membersOnly: members_only ?? false,
        isPublished: is_published ?? false,
        publishedAt: published_at ? new Date(published_at) : null,
      },
      include: { category: { select: { id: true, name: true, slug: true } } },
    });

    const pubDate = post.publishedAt ? new Date(post.publishedAt) : null;
    if (post.isPublished && pubDate && pubDate <= new Date()) {
      sendBlogPostNotification({ id: post.id, title: post.title, excerpt: post.excerpt }).catch(
        (err) => console.error('Failed to send blog notification:', err),
      );
    }

    res.status(201).json({
      id: post.id, title: post.title, content: post.content, excerpt: post.excerpt,
      thumbnail_url: post.thumbnailUrl, category: post.category?.name ?? null,
      category_id: post.categoryId,
      members_only: post.membersOnly, is_published: post.isPublished,
      published_at: post.publishedAt, created_at: post.createdAt,
    });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/blog/:id', async (req, res) => {
  try {
    const { title, content, excerpt, thumbnail_url, category_id, members_only, is_published, published_at } = req.body;

    const before = await prisma.blogPost.findUnique({ where: { id: req.params.id }, select: { isPublished: true } });

    const post = await prisma.blogPost.update({
      where: { id: req.params.id },
      data: {
        title,
        content: content ?? null,
        excerpt: excerpt ?? null,
        thumbnailUrl: thumbnail_url ?? null,
        categoryId: category_id ?? null,
        membersOnly: members_only ?? false,
        isPublished: is_published ?? false,
        publishedAt: published_at ? new Date(published_at) : null,
      },
      include: { category: { select: { id: true, name: true, slug: true } } },
    });

    const pubDate = post.publishedAt ? new Date(post.publishedAt) : null;
    const justPublished = !before?.isPublished && post.isPublished && pubDate && pubDate <= new Date();
    if (justPublished) {
      sendBlogPostNotification({ id: post.id, title: post.title, excerpt: post.excerpt }).catch(
        (err) => console.error('Failed to send blog notification:', err),
      );
    }

    res.json({
      id: post.id, title: post.title, content: post.content, excerpt: post.excerpt,
      thumbnail_url: post.thumbnailUrl, category: post.category?.name ?? null,
      category_id: post.categoryId,
      members_only: post.membersOnly, is_published: post.isPublished,
      published_at: post.publishedAt, created_at: post.createdAt, updated_at: post.updatedAt,
    });
  } catch (err: unknown) {
    if ((err as { code?: string }).code === 'P2025') {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/blog/:id', async (req, res) => {
  try {
    await prisma.blogPost.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err: unknown) {
    if ((err as { code?: string }).code === 'P2025') {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
