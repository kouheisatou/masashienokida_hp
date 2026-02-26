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

const USER_ID = '00000000-0000-4000-8000-000000000001';

const FAKE_USER = {
  id: USER_ID,
  email: 'test-user@example.com',
  name: 'Test User',
  image: null,
  role: 'MEMBER_FREE' as const,
  googleId: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

const FAKE_SUBSCRIPTION = {
  id: '00000000-0000-4000-8000-000000000099',
  userId: USER_ID,
  tier: 'MEMBER_FREE' as const,
  status: 'ACTIVE' as const,
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

const FAKE_ARTICLE = {
  id: '00000000-0000-4000-8000-000000000020',
  title: 'メンバー限定記事',
  content: '本文',
  excerpt: '要約',
  thumbnailUrl: null,
  category: null,
  membersOnly: true,
  isPublished: true,
  publishedAt: new Date('2024-06-01T00:00:00Z'),
  createdAt: new Date('2024-06-01T00:00:00Z'),
  updatedAt: new Date('2024-06-01T00:00:00Z'),
};

beforeEach(() => {
  vi.clearAllMocks();
});

// ── GET /members/me ────────────────────────────────────────────────

describe('GET /members/me', () => {
  it('未認証 → 401', async () => {
    const res = await request(app).get('/members/me');
    expect(res.status).toBe(401);
  });

  it('MEMBER_FREE → プロフィールとサブスクリプションを返し openapi スキーマに一致する', async () => {
    prismaMock.user.findUnique.mockResolvedValue(FAKE_USER);
    prismaMock.subscription.findUnique.mockResolvedValue(FAKE_SUBSCRIPTION);

    const res = await request(app)
      .get('/members/me')
      .set(authHeader('MEMBER_FREE'));

    expect(res.status).toBe(200);
    expect(res.body.user.id).toBe(USER_ID);
    expect(res.body.subscription.tier).toBe('MEMBER_FREE');
    validateResponse('getMembersMe', 200, res.body);
  });

  it('MEMBER_GOLD → hasSubscription: true', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      ...FAKE_USER,
      role: 'MEMBER_GOLD' as const,
    });
    prismaMock.subscription.findUnique.mockResolvedValue({
      ...FAKE_SUBSCRIPTION,
      tier: 'MEMBER_GOLD' as const,
      stripeCustomerId: 'cus_test',
      stripeSubscriptionId: 'sub_test',
      currentPeriodEnd: new Date('2025-01-01'),
    });

    const res = await request(app)
      .get('/members/me')
      .set(authHeader('MEMBER_GOLD'));

    expect(res.status).toBe(200);
    expect(res.body.subscription.hasSubscription).toBe(true);
    expect(res.body.subscription.tier).toBe('MEMBER_GOLD');
  });

  it('DB にユーザーが存在しない → 404', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .get('/members/me')
      .set(authHeader('USER'));

    expect(res.status).toBe(404);
  });
});

// ── PUT /members/me ────────────────────────────────────────────────

describe('PUT /members/me', () => {
  it('未認証 → 401', async () => {
    const res = await request(app)
      .put('/members/me')
      .send({ name: '新しい名前' });
    expect(res.status).toBe(401);
  });

  it('name なし → 400', async () => {
    const res = await request(app)
      .put('/members/me')
      .set(authHeader('USER'))
      .send({});
    expect(res.status).toBe(400);
  });

  it('有効なリクエスト → ユーザー情報を更新して返す', async () => {
    const updated = { ...FAKE_USER, name: '新しい名前' };
    prismaMock.user.update.mockResolvedValue(updated);

    const res = await request(app)
      .put('/members/me')
      .set(authHeader('MEMBER_FREE'))
      .send({ name: '新しい名前' });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('新しい名前');
    validateResponse('updateMembersMe', 200, res.body);
  });
});

// ── GET /members/content ───────────────────────────────────────────

describe('GET /members/content', () => {
  it('未認証 → 401', async () => {
    const res = await request(app).get('/members/content');
    expect(res.status).toBe(401);
  });

  it('USER ロール → 403 (MEMBER_FREE 以上が必要)', async () => {
    const res = await request(app)
      .get('/members/content')
      .set(authHeader('USER'));
    expect(res.status).toBe(403);
  });

  it('MEMBER_FREE → コンテンツを返し openapi スキーマに一致する', async () => {
    prismaMock.blogPost.findMany.mockResolvedValue([FAKE_ARTICLE]);

    const res = await request(app)
      .get('/members/content')
      .set(authHeader('MEMBER_FREE'));

    expect(res.status).toBe(200);
    expect(res.body.tier).toBe('MEMBER_FREE');
    expect(res.body.content.articles).toHaveLength(1);
    expect(res.body.content.videos).toEqual([]);
    // locked: false (サーバーが付与するフィールド)
    expect(res.body.content.articles[0].locked).toBe(false);
    validateResponse('getMembersContent', 200, res.body);
  });

  it('MEMBER_GOLD → tier が MEMBER_GOLD で返る', async () => {
    prismaMock.blogPost.findMany.mockResolvedValue([FAKE_ARTICLE]);

    const res = await request(app)
      .get('/members/content')
      .set(authHeader('MEMBER_GOLD'));

    expect(res.status).toBe(200);
    expect(res.body.tier).toBe('MEMBER_GOLD');
  });

  it('ADMIN → tier が ADMIN で返る', async () => {
    prismaMock.blogPost.findMany.mockResolvedValue([]);

    const res = await request(app)
      .get('/members/content')
      .set(authHeader('ADMIN'));

    expect(res.status).toBe(200);
    expect(res.body.tier).toBe('ADMIN');
  });
});
