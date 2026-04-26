import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app';
import { prismaMock } from '../mocks/prisma';
import { validateResponse } from '../utils/openApiValidator';
import { authHeader, invalidTokenHeader, wrongSignatureTokenHeader, expiredTokenHeader } from '../utils/testAuth';

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
  // デフォルトでは失効済みトークンは存在しない
  prismaMock.revokedToken.findUnique.mockResolvedValue(null);
});

describe('GET /auth/me', () => {
  it('認証なし → 401', async () => {
    const res = await request(app).get('/auth/me');
    expect(res.status).toBe(401);
  });

  it('不正なトークン形式 → 401', async () => {
    const res = await request(app)
      .get('/auth/me')
      .set(invalidTokenHeader());
    expect(res.status).toBe(401);
  });

  it('署名が間違った JWT → 401', async () => {
    const res = await request(app)
      .get('/auth/me')
      .set(wrongSignatureTokenHeader('USER'));
    expect(res.status).toBe(401);
  });

  it('期限切れ JWT → 401', async () => {
    const res = await request(app)
      .get('/auth/me')
      .set(expiredTokenHeader('USER'));
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

  it('失効済みトークン (M-02) → 401', async () => {
    // jti 付きトークンで一度サインアウト後の再利用シミュレーション
    prismaMock.revokedToken.findUnique.mockResolvedValue({
      id: 'rev-1',
      jti: 'whatever',
      expiresAt: new Date(Date.now() + 60_000),
      createdAt: new Date(),
    });

    // testAuth の makeToken は jti を含まないので、ここでは jti を含むトークンを直接生成
    const jwt = (await import('jsonwebtoken')).default;
    const token = jwt.sign(
      {
        userId: FAKE_USER.id,
        email: FAKE_USER.email,
        role: 'USER',
        jti: 'revoked-jti-uuid',
      },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' },
    );

    const res = await request(app)
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(401);
  });
});

describe('POST /auth/signout', () => {
  it('認証なし → 401', async () => {
    const res = await request(app).post('/auth/signout');
    expect(res.status).toBe(401);
  });

  it('不正なトークン → 401', async () => {
    const res = await request(app)
      .post('/auth/signout')
      .set(invalidTokenHeader());
    expect(res.status).toBe(401);
  });

  it('有効な JWT → { ok: true }', async () => {
    prismaMock.revokedToken.create.mockResolvedValue({
      id: 'rev-1',
      jti: 'jti-1',
      expiresAt: new Date(),
      createdAt: new Date(),
    });
    const res = await request(app)
      .post('/auth/signout')
      .set(authHeader('USER'));

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
    validateResponse('postAuthSignout', 200, res.body);
  });

  it('jti 付き JWT で signout すると revokedToken.create が呼ばれる', async () => {
    prismaMock.revokedToken.create.mockResolvedValue({
      id: 'rev-1',
      jti: 'jti-from-token',
      expiresAt: new Date(),
      createdAt: new Date(),
    });

    const jwt = (await import('jsonwebtoken')).default;
    const token = jwt.sign(
      {
        userId: FAKE_USER.id,
        email: FAKE_USER.email,
        role: 'USER',
        jti: 'jti-from-token',
      },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' },
    );

    const res = await request(app)
      .post('/auth/signout')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(prismaMock.revokedToken.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ jti: 'jti-from-token' }),
      }),
    );
  });
});

describe('DELETE /auth/account', () => {
  it('認証なし → 401', async () => {
    const res = await request(app).delete('/auth/account');
    expect(res.status).toBe(401);
  });

  it('期限切れ JWT → 401', async () => {
    const res = await request(app)
      .delete('/auth/account')
      .set(expiredTokenHeader('USER'));
    expect(res.status).toBe(401);
  });

  it('confirmation 無し → 400', async () => {
    const res = await request(app)
      .delete('/auth/account')
      .set(authHeader('USER'))
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('confirmation required');
  });

  it('confirmation の値が不正 → 400', async () => {
    const res = await request(app)
      .delete('/auth/account')
      .set(authHeader('USER'))
      .send({ confirmation: 'yes' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('confirmation required');
  });

  it('confirmation 正しい → アカウント削除して { ok: true }', async () => {
    prismaMock.user.delete.mockResolvedValue(FAKE_USER);
    prismaMock.revokedToken.create.mockResolvedValue({
      id: 'rev-1',
      jti: 'jti-1',
      expiresAt: new Date(),
      createdAt: new Date(),
    });

    const res = await request(app)
      .delete('/auth/account')
      .set(authHeader('USER'))
      .send({ confirmation: 'DELETE_MY_ACCOUNT' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
    validateResponse('deleteAuthAccount', 200, res.body);
  });
});
