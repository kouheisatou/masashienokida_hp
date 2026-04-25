import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app';
import { prismaMock } from '../mocks/prisma';
import { validateResponse } from '../utils/openApiValidator';
import { authHeader, invalidTokenHeader } from '../utils/testAuth';

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

beforeEach(() => {
  vi.clearAllMocks();
});

// ── GET /members/me ────────────────────────────────────────────────

describe('GET /members/me', () => {
  it('未認証 → 401', async () => {
    const res = await request(app).get('/members/me');
    expect(res.status).toBe(401);
  });

  it('不正な JWT → 401', async () => {
    const res = await request(app)
      .get('/members/me')
      .set(invalidTokenHeader());
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
      .set(authHeader('MEMBER_FREE'));

    expect(res.status).toBe(404);
  });
});


