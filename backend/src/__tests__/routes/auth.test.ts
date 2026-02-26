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

const FAKE_USER = {
  id: '00000000-0000-4000-8000-000000000001',
  email: 'test-user@example.com',
  name: 'Test User',
  image: null,
  role: 'USER' as const,
  googleId: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

const FAKE_SUBSCRIPTION = {
  id: '00000000-0000-4000-8000-000000000099',
  userId: FAKE_USER.id,
  tier: 'MEMBER_FREE' as const,
  status: 'ACTIVE' as const,
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /auth/me', () => {
  it('認証なし → 401', async () => {
    const res = await request(app).get('/auth/me');
    expect(res.status).toBe(401);
  });

  it('有効な JWT → ユーザー情報を返し openapi スキーマに一致する', async () => {
    prismaMock.user.findUnique.mockResolvedValue(FAKE_USER);
    prismaMock.subscription.findUnique.mockResolvedValue(FAKE_SUBSCRIPTION);

    const res = await request(app)
      .get('/auth/me')
      .set(authHeader('USER'));

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(FAKE_USER.email);
    expect(res.body.user.role).toBe('USER');
    expect(res.body.subscription).toBeDefined();
    validateResponse('getAuthMe', 200, res.body);
  });

  it('DB にユーザーが存在しない → 404', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .get('/auth/me')
      .set(authHeader('USER'));

    expect(res.status).toBe(404);
  });

  it('サブスクリプションなし → hasSubscription: false', async () => {
    prismaMock.user.findUnique.mockResolvedValue(FAKE_USER);
    prismaMock.subscription.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .get('/auth/me')
      .set(authHeader('USER'));

    expect(res.status).toBe(200);
    expect(res.body.subscription.hasSubscription).toBe(false);
    expect(res.body.subscription.tier).toBe('USER');
  });
});

describe('POST /auth/signout', () => {
  it('認証なし → 401', async () => {
    const res = await request(app).post('/auth/signout');
    expect(res.status).toBe(401);
  });

  it('有効な JWT → { ok: true }', async () => {
    const res = await request(app)
      .post('/auth/signout')
      .set(authHeader('USER'));

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
    validateResponse('postAuthSignout', 200, res.body);
  });
});

describe('DELETE /auth/account', () => {
  it('認証なし → 401', async () => {
    const res = await request(app).delete('/auth/account');
    expect(res.status).toBe(401);
  });

  it('有効な JWT → アカウント削除して { ok: true }', async () => {
    prismaMock.user.delete.mockResolvedValue(FAKE_USER);

    const res = await request(app)
      .delete('/auth/account')
      .set(authHeader('USER'));

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
    validateResponse('deleteAuthAccount', 200, res.body);
  });
});
