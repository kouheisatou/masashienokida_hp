import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app';
import { prismaMock } from '../mocks/prisma';
import { validateResponse } from '../utils/openApiValidator';
import { authHeader } from '../utils/testAuth';

vi.mock('../../lib/prisma', async () => {
  const { prismaMock } = await import('../mocks/prisma');
  return { prisma: prismaMock };
});

// sharp/multer はアップロードルートで使用されるが、テストではモックしない（不要なルートのみ除外）
vi.mock('sharp', () => ({
  default: vi.fn().mockReturnValue({
    resize: vi.fn().mockReturnThis(),
    webp: vi.fn().mockReturnThis(),
    toFile: vi.fn().mockResolvedValue(undefined),
  }),
}));

// ── テストフィクスチャ ────────────────────────────────────────────

const ADMIN_ID = '00000000-0000-4000-8000-000000000001';

const FAKE_CONTACT = {
  id: '00000000-0000-4000-8000-000000000010',
  name: '問い合わせ太郎',
  email: 'contact@example.com',
  phone: null,
  category: null,
  subject: 'ご質問',
  message: 'メッセージ本文',
  status: 'unread' as const,
  createdAt: new Date('2024-06-01T00:00:00Z'),
  updatedAt: new Date('2024-06-01T00:00:00Z'),
};

const FAKE_USER = {
  id: '00000000-0000-4000-8000-000000000020',
  name: 'メンバー一郎',
  email: 'member@example.com',
  image: null,
  role: 'MEMBER_FREE' as const,
  googleId: null,
  createdAt: new Date('2024-06-01T00:00:00Z'),
  updatedAt: new Date('2024-06-01T00:00:00Z'),
  subscription: null,
};

const FAKE_NEWS = {
  id: '00000000-0000-4000-8000-000000000002',
  title: '管理者向けニュース',
  body: '本文',
  imageUrl: null,
  category: null,
  publishedAt: new Date('2024-06-01T00:00:00Z'),
  isPublished: false,
  createdAt: new Date('2024-06-01T00:00:00Z'),
  updatedAt: new Date('2024-06-01T00:00:00Z'),
};

const FAKE_CONCERT = {
  id: '00000000-0000-4000-8000-000000000003',
  title: '管理者向けコンサート',
  date: new Date('2024-09-01'),
  time: '14:00',
  venue: 'サントリーホール',
  address: null,
  imageUrl: null,
  program: [],
  price: null,
  ticketUrl: null,
  note: null,
  isUpcoming: true,
  isPublished: false,
  createdAt: new Date('2024-06-01T00:00:00Z'),
  updatedAt: new Date('2024-06-01T00:00:00Z'),
};

const FAKE_DISC = {
  id: '00000000-0000-4000-8000-000000000004',
  title: '非公開アルバム',
  releaseYear: 2023,
  description: null,
  imageUrl: null,
  sortOrder: 0,
  isPublished: false,
  createdAt: new Date('2024-06-01T00:00:00Z'),
  updatedAt: new Date('2024-06-01T00:00:00Z'),
};

const FAKE_BIO = {
  id: '00000000-0000-4000-8000-000000000005',
  year: '2010',
  description: '入学',
  sortOrder: 1,
  createdAt: new Date('2024-06-01T00:00:00Z'),
  updatedAt: new Date('2024-06-01T00:00:00Z'),
};

const FAKE_BLOG_POST = {
  id: '00000000-0000-4000-8000-000000000007',
  title: '下書きブログ',
  content: '本文',
  excerpt: null,
  thumbnailUrl: null,
  category: null,
  membersOnly: false,
  isPublished: false,
  publishedAt: null,
  createdAt: new Date('2024-06-01T00:00:00Z'),
  updatedAt: new Date('2024-06-01T00:00:00Z'),
};

beforeEach(() => {
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

// ── 全 admin エンドポイント共通: 非 ADMIN は拒否 ──────────────────

describe('Admin 認可ガード', () => {
  it('未認証 → 401', async () => {
    const res = await request(app).get('/admin/stats');
    expect(res.status).toBe(401);
  });

  it('USER ロール → 403', async () => {
    const res = await request(app)
      .get('/admin/stats')
      .set(authHeader('USER'));
    expect(res.status).toBe(403);
  });

  it('MEMBER_GOLD ロール → 403', async () => {
    const res = await request(app)
      .get('/admin/stats')
      .set(authHeader('MEMBER_GOLD'));
    expect(res.status).toBe(403);
  });
});

// ── GET /admin/stats ───────────────────────────────────────────────

describe('GET /admin/stats', () => {
  it('ADMIN → ダッシュボード統計を返し openapi スキーマに一致する', async () => {
    // admin/stats は Promise.all で 6 つの Prisma クエリを並列実行する
    // mockResolvedValueOnce で順番に返り値を設定する
    prismaMock.user.count
      .mockResolvedValueOnce(10)  // totalMembers
      .mockResolvedValueOnce(3)   // goldMembers (where: { role: 'MEMBER_GOLD' })
      .mockResolvedValueOnce(5);  // freeMembers (where: { role: 'MEMBER_FREE' })
    prismaMock.contact.count.mockResolvedValue(2);  // unreadContacts
    prismaMock.contact.findMany.mockResolvedValue([FAKE_CONTACT]);  // recentContacts
    prismaMock.user.findMany.mockResolvedValue([FAKE_USER]);  // recentMembers

    const res = await request(app)
      .get('/admin/stats')
      .set(authHeader('ADMIN'));

    expect(res.status).toBe(200);
    expect(res.body.stats.totalMembers).toBe(10);
    expect(res.body.stats.goldMembers).toBe(3);
    expect(res.body.stats.freeMembers).toBe(5);
    expect(res.body.stats.unreadContacts).toBe(2);
    expect(res.body.recentContacts).toHaveLength(1);
    expect(res.body.recentMembers).toHaveLength(1);
    validateResponse('getAdminStats', 200, res.body);
  });
});

// ── GET /admin/contacts ────────────────────────────────────────────

describe('GET /admin/contacts', () => {
  it('ADMIN → お問い合わせ一覧を返し openapi スキーマに一致する', async () => {
    prismaMock.$transaction.mockResolvedValue([1, [FAKE_CONTACT]]);

    const res = await request(app)
      .get('/admin/contacts')
      .set(authHeader('ADMIN'));

    expect(res.status).toBe(200);
    expect(res.body.contacts).toHaveLength(1);
    expect(res.body.total).toBe(1);
    expect(res.body.totalPages).toBe(1);
    validateResponse('getAdminContacts', 200, res.body);
  });

  it('status フィルタが適用される', async () => {
    prismaMock.$transaction.mockResolvedValue([0, []]);

    await request(app)
      .get('/admin/contacts?status=unread')
      .set(authHeader('ADMIN'));

    expect(prismaMock.$transaction).toHaveBeenCalled();
  });

  it('search クエリが適用される', async () => {
    prismaMock.$transaction.mockResolvedValue([0, []]);

    await request(app)
      .get('/admin/contacts?search=田中')
      .set(authHeader('ADMIN'));

    expect(prismaMock.$transaction).toHaveBeenCalled();
  });
});

// ── PUT /admin/contacts/:id ────────────────────────────────────────

describe('PUT /admin/contacts/:id', () => {
  it('ADMIN → ステータス更新して返す', async () => {
    const updated = { ...FAKE_CONTACT, status: 'read' as const };
    prismaMock.contact.update.mockResolvedValue(updated);

    const res = await request(app)
      .put(`/admin/contacts/${FAKE_CONTACT.id}`)
      .set(authHeader('ADMIN'))
      .send({ status: 'read' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('read');
    validateResponse('updateAdminContact', 200, res.body);
  });

  it('無効なステータス → 400', async () => {
    const res = await request(app)
      .put(`/admin/contacts/${FAKE_CONTACT.id}`)
      .set(authHeader('ADMIN'))
      .send({ status: 'invalid_status' });

    expect(res.status).toBe(400);
  });

  it('存在しない ID → 404', async () => {
    prismaMock.contact.update.mockRejectedValue({ code: 'P2025' });

    const res = await request(app)
      .put('/admin/contacts/non-existent-id')
      .set(authHeader('ADMIN'))
      .send({ status: 'read' });

    expect(res.status).toBe(404);
  });
});

// ── GET /admin/members ─────────────────────────────────────────────

describe('GET /admin/members', () => {
  it('ADMIN → メンバー一覧を返し openapi スキーマに一致する', async () => {
    prismaMock.$transaction.mockResolvedValue([1, [FAKE_USER]]);

    const res = await request(app)
      .get('/admin/members')
      .set(authHeader('ADMIN'));

    expect(res.status).toBe(200);
    expect(res.body.members).toHaveLength(1);
    expect(res.body.total).toBe(1);
    validateResponse('getAdminMembers', 200, res.body);
  });

  it('role フィルタが適用される', async () => {
    prismaMock.$transaction.mockResolvedValue([0, []]);

    await request(app)
      .get('/admin/members?role=MEMBER_GOLD')
      .set(authHeader('ADMIN'));

    expect(prismaMock.$transaction).toHaveBeenCalled();
  });
});

// ── Admin News ─────────────────────────────────────────────────────

describe('GET /admin/news', () => {
  it('ADMIN → 非公開含む全ニュースを返し openapi スキーマに一致する', async () => {
    prismaMock.news.findMany.mockResolvedValue([FAKE_NEWS]);

    const res = await request(app)
      .get('/admin/news')
      .set(authHeader('ADMIN'));

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].is_published).toBe(false);
    validateResponse('getAdminNews', 200, res.body);
  });
});

describe('GET /admin/news/:id', () => {
  it('ADMIN → 単一ニュースを返す', async () => {
    prismaMock.news.findUnique.mockResolvedValue(FAKE_NEWS);

    const res = await request(app)
      .get(`/admin/news/${FAKE_NEWS.id}`)
      .set(authHeader('ADMIN'));

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(FAKE_NEWS.id);
    validateResponse('getAdminNewsById', 200, res.body);
  });

  it('存在しない ID → 404', async () => {
    prismaMock.news.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .get('/admin/news/non-existent-id')
      .set(authHeader('ADMIN'));

    expect(res.status).toBe(404);
  });
});

// ── Admin Concerts ─────────────────────────────────────────────────

describe('GET /admin/concerts', () => {
  it('ADMIN → 非公開含む全コンサートを返し openapi スキーマに一致する', async () => {
    prismaMock.concert.findMany.mockResolvedValue([FAKE_CONCERT]);

    const res = await request(app)
      .get('/admin/concerts')
      .set(authHeader('ADMIN'));

    expect(res.status).toBe(200);
    expect(res.body[0].is_published).toBe(false);
    validateResponse('getAdminConcerts', 200, res.body);
  });
});

describe('GET /admin/concerts/:id', () => {
  it('ADMIN → 単一コンサートを返す', async () => {
    prismaMock.concert.findUnique.mockResolvedValue(FAKE_CONCERT);

    const res = await request(app)
      .get(`/admin/concerts/${FAKE_CONCERT.id}`)
      .set(authHeader('ADMIN'));

    expect(res.status).toBe(200);
    validateResponse('getAdminConcertById', 200, res.body);
  });
});

// ── Admin Discography ──────────────────────────────────────────────

describe('GET /admin/discography', () => {
  it('ADMIN → 非公開含む全ディスコグラフィーを返し openapi スキーマに一致する', async () => {
    prismaMock.discography.findMany.mockResolvedValue([FAKE_DISC]);

    const res = await request(app)
      .get('/admin/discography')
      .set(authHeader('ADMIN'));

    expect(res.status).toBe(200);
    expect(res.body[0].is_published).toBe(false);
    validateResponse('getAdminDiscography', 200, res.body);
  });
});

describe('GET /admin/discography/:id', () => {
  it('ADMIN → 単一ディスコグラフィーを返す', async () => {
    prismaMock.discography.findUnique.mockResolvedValue(FAKE_DISC);

    const res = await request(app)
      .get(`/admin/discography/${FAKE_DISC.id}`)
      .set(authHeader('ADMIN'));

    expect(res.status).toBe(200);
    validateResponse('getAdminDiscographyById', 200, res.body);
  });
});

// ── Admin Biography ────────────────────────────────────────────────

describe('GET /admin/biography', () => {
  it('ADMIN → 全略歴を返し openapi スキーマに一致する', async () => {
    prismaMock.biography.findMany.mockResolvedValue([FAKE_BIO]);

    const res = await request(app)
      .get('/admin/biography')
      .set(authHeader('ADMIN'));

    expect(res.status).toBe(200);
    validateResponse('getAdminBiography', 200, res.body);
  });
});

describe('GET /admin/biography/:id', () => {
  it('ADMIN → 単一略歴を返す', async () => {
    prismaMock.biography.findUnique.mockResolvedValue(FAKE_BIO);

    const res = await request(app)
      .get(`/admin/biography/${FAKE_BIO.id}`)
      .set(authHeader('ADMIN'));

    expect(res.status).toBe(200);
    validateResponse('getAdminBiographyById', 200, res.body);
  });
});

// ── Admin Blog CRUD ────────────────────────────────────────────────

describe('GET /admin/blog', () => {
  it('ADMIN → 下書き含む全ブログ記事を返し openapi スキーマに一致する', async () => {
    prismaMock.$transaction.mockResolvedValue([1, [FAKE_BLOG_POST]]);

    const res = await request(app)
      .get('/admin/blog')
      .set(authHeader('ADMIN'));

    expect(res.status).toBe(200);
    expect(res.body.posts[0].is_published).toBe(false);
    validateResponse('getAdminBlog', 200, res.body);
  });

  it('search クエリが適用される', async () => {
    prismaMock.$transaction.mockResolvedValue([0, []]);

    await request(app)
      .get('/admin/blog?search=ショパン')
      .set(authHeader('ADMIN'));

    expect(prismaMock.$transaction).toHaveBeenCalled();
  });
});

describe('POST /admin/blog', () => {
  it('ADMIN → 201 でブログ記事を作成し openapi スキーマに一致する', async () => {
    prismaMock.blogPost.create.mockResolvedValue(FAKE_BLOG_POST);

    const res = await request(app)
      .post('/admin/blog')
      .set(authHeader('ADMIN'))
      .send({ title: '下書きブログ', content: '本文', is_published: false });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe(FAKE_BLOG_POST.title);
    expect(res.body.is_published).toBe(false);
    validateResponse('createAdminBlogPost', 201, res.body);
  });
});

describe('GET /admin/blog/:id', () => {
  it('ADMIN → 単一ブログ記事を返す', async () => {
    prismaMock.blogPost.findUnique.mockResolvedValue(FAKE_BLOG_POST);

    const res = await request(app)
      .get(`/admin/blog/${FAKE_BLOG_POST.id}`)
      .set(authHeader('ADMIN'));

    expect(res.status).toBe(200);
    validateResponse('getAdminBlogPost', 200, res.body);
  });

  it('存在しない ID → 404', async () => {
    prismaMock.blogPost.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .get('/admin/blog/non-existent-id')
      .set(authHeader('ADMIN'));

    expect(res.status).toBe(404);
  });
});

describe('PUT /admin/blog/:id', () => {
  it('ADMIN → ブログ記事を更新して返す', async () => {
    const updated = { ...FAKE_BLOG_POST, title: '更新後', isPublished: true };
    prismaMock.blogPost.update.mockResolvedValue(updated);

    const res = await request(app)
      .put(`/admin/blog/${FAKE_BLOG_POST.id}`)
      .set(authHeader('ADMIN'))
      .send({ title: '更新後', content: '本文', is_published: true });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('更新後');
    validateResponse('updateAdminBlogPost', 200, res.body);
  });

  it('存在しない ID → 404', async () => {
    prismaMock.blogPost.update.mockRejectedValue({ code: 'P2025' });

    const res = await request(app)
      .put('/admin/blog/non-existent-id')
      .set(authHeader('ADMIN'))
      .send({ title: 'x', content: 'y' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /admin/blog/:id', () => {
  it('ADMIN → { ok: true }', async () => {
    prismaMock.blogPost.delete.mockResolvedValue(FAKE_BLOG_POST);

    const res = await request(app)
      .delete(`/admin/blog/${FAKE_BLOG_POST.id}`)
      .set(authHeader('ADMIN'));

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
    validateResponse('deleteAdminBlogPost', 200, res.body);
  });

  it('存在しない ID → 404', async () => {
    prismaMock.blogPost.delete.mockRejectedValue({ code: 'P2025' });

    const res = await request(app)
      .delete('/admin/blog/non-existent-id')
      .set(authHeader('ADMIN'));

    expect(res.status).toBe(404);
  });
});
