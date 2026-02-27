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

// Stripe SDK モック:
// vi.mock はホイストされるが、ファクトリ内の vi.fn() は実行時に生成されるため
// モジュールエクスポートとして公開し、テストから参照できるようにする
vi.mock('stripe', () => {
  const checkoutCreate = vi.fn();
  const billingPortalCreate = vi.fn();
  const customersCreate = vi.fn();
  const subscriptionsRetrieve = vi.fn();
  const webhooksConstructEvent = vi.fn();

  function StripeClass() {
    return {
      checkout: { sessions: { create: checkoutCreate } },
      billingPortal: { sessions: { create: billingPortalCreate } },
      customers: { create: customersCreate },
      subscriptions: { retrieve: subscriptionsRetrieve },
      webhooks: { constructEvent: webhooksConstructEvent },
    };
  }

  return {
    default: StripeClass,
    // テストから参照するために公開
    __mocks: { checkoutCreate, billingPortalCreate, customersCreate, subscriptionsRetrieve, webhooksConstructEvent },
  };
});

// 型補助: stripe モジュールのモック関数にアクセスするヘルパー
async function stripeMocks() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (await import('stripe') as any).__mocks as {
    checkoutCreate: ReturnType<typeof vi.fn>;
    billingPortalCreate: ReturnType<typeof vi.fn>;
    customersCreate: ReturnType<typeof vi.fn>;
    subscriptionsRetrieve: ReturnType<typeof vi.fn>;
    webhooksConstructEvent: ReturnType<typeof vi.fn>;
  };
}

const USER_ID = '00000000-0000-4000-8000-000000000001';

const FAKE_USER = {
  id: USER_ID,
  email: 'test@example.com',
  name: 'Test User',
  image: null,
  role: 'USER' as const,
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

// ── POST /stripe/checkout ──────────────────────────────────────────

describe('POST /stripe/checkout', () => {
  it('未認証 → 401', async () => {
    const res = await request(app).post('/stripe/checkout');
    expect(res.status).toBe(401);
  });

  it('不正な JWT → 401', async () => {
    const res = await request(app)
      .post('/stripe/checkout')
      .set(invalidTokenHeader());
    expect(res.status).toBe(401);
  });

  it('Stripe Customer 未作成の場合 → 新規作成してチェックアウト URL を返す', async () => {
    const m = await stripeMocks();
    prismaMock.subscription.findUnique.mockResolvedValue(FAKE_SUBSCRIPTION);
    prismaMock.user.findUnique.mockResolvedValue(FAKE_USER);
    m.customersCreate.mockResolvedValue({ id: 'cus_new' });
    prismaMock.subscription.update.mockResolvedValue({
      ...FAKE_SUBSCRIPTION,
      stripeCustomerId: 'cus_new',
    });
    m.checkoutCreate.mockResolvedValue({ url: 'https://checkout.stripe.com/pay/cs_test_123' });

    const res = await request(app)
      .post('/stripe/checkout')
      .set(authHeader('USER'));

    expect(res.status).toBe(200);
    expect(res.body.url).toContain('checkout.stripe.com');
    expect(m.customersCreate).toHaveBeenCalledWith(
      expect.objectContaining({ email: FAKE_USER.email })
    );
    validateResponse('postStripeCheckout', 200, res.body);
  });

  it('Stripe Customer 既存の場合 → 既存 ID を使いチェックアウト URL を返す', async () => {
    const m = await stripeMocks();
    prismaMock.subscription.findUnique.mockResolvedValue({
      ...FAKE_SUBSCRIPTION,
      stripeCustomerId: 'cus_existing',
    });
    m.checkoutCreate.mockResolvedValue({ url: 'https://checkout.stripe.com/pay/cs_test_456' });

    const res = await request(app)
      .post('/stripe/checkout')
      .set(authHeader('USER'));

    expect(res.status).toBe(200);
    expect(m.customersCreate).not.toHaveBeenCalled();
    expect(res.body.url).toBeDefined();
  });
});

// ── GET /stripe/portal ─────────────────────────────────────────────

describe('GET /stripe/portal', () => {
  it('未認証 → 401', async () => {
    const res = await request(app).get('/stripe/portal');
    expect(res.status).toBe(401);
  });

  it('不正な JWT → 401', async () => {
    const res = await request(app)
      .get('/stripe/portal')
      .set(invalidTokenHeader());
    expect(res.status).toBe(401);
  });

  it('Stripe Customer 未登録 → 400', async () => {
    prismaMock.subscription.findUnique.mockResolvedValue(FAKE_SUBSCRIPTION);

    const res = await request(app)
      .get('/stripe/portal')
      .set(authHeader('MEMBER_GOLD'));

    expect(res.status).toBe(400);
  });

  it('Stripe Customer 登録済み → ポータル URL を返す', async () => {
    const m = await stripeMocks();
    prismaMock.subscription.findUnique.mockResolvedValue({
      ...FAKE_SUBSCRIPTION,
      stripeCustomerId: 'cus_existing',
    });
    m.billingPortalCreate.mockResolvedValue({ url: 'https://billing.stripe.com/session/bps_test_123' });

    const res = await request(app)
      .get('/stripe/portal')
      .set(authHeader('MEMBER_GOLD'));

    expect(res.status).toBe(200);
    expect(res.body.url).toContain('billing.stripe.com');
    validateResponse('getStripePortal', 200, res.body);
  });
});

// ── POST /stripe/webhook ───────────────────────────────────────────

describe('POST /stripe/webhook', () => {
  it('署名ヘッダーなし → 400', async () => {
    const res = await request(app)
      .post('/stripe/webhook')
      .set('Content-Type', 'application/json')
      .send('{}');

    expect(res.status).toBe(400);
  });

  it('署名検証失敗 → 400', async () => {
    const m = await stripeMocks();
    m.webhooksConstructEvent.mockImplementation(() => {
      throw new Error('signature mismatch');
    });

    const res = await request(app)
      .post('/stripe/webhook')
      .set('stripe-signature', 'invalid_sig')
      .set('Content-Type', 'application/json')
      .send('{}');

    expect(res.status).toBe(400);
  });

  it('checkout.session.completed → ユーザーを MEMBER_GOLD に昇格する', async () => {
    const m = await stripeMocks();
    m.webhooksConstructEvent.mockReturnValue({
      type: 'checkout.session.completed',
      data: {
        object: {
          metadata: { userId: USER_ID },
          subscription: 'sub_test_123',
        },
      },
    });
    m.subscriptionsRetrieve.mockResolvedValue({
      id: 'sub_test_123',
      current_period_end: Math.floor(Date.now() / 1000) + 86400 * 365,
      cancel_at_period_end: false,
    });
    prismaMock.subscription.update.mockResolvedValue(FAKE_SUBSCRIPTION);
    prismaMock.user.update.mockResolvedValue({ ...FAKE_USER, role: 'MEMBER_GOLD' as const });

    const res = await request(app)
      .post('/stripe/webhook')
      .set('stripe-signature', 'valid_sig')
      .set('Content-Type', 'application/json')
      .send('{}');

    expect(res.status).toBe(200);
    expect(res.body.received).toBe(true);
    expect(prismaMock.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: USER_ID },
        data: { role: 'MEMBER_GOLD' },
      })
    );
  });

  it('customer.subscription.updated (active) → MEMBER_GOLD に更新', async () => {
    const m = await stripeMocks();
    m.webhooksConstructEvent.mockReturnValue({
      type: 'customer.subscription.updated',
      data: {
        object: {
          status: 'active',
          customer: 'cus_test',
          current_period_end: Math.floor(Date.now() / 1000) + 86400 * 365,
          cancel_at_period_end: false,
        },
      },
    });
    prismaMock.subscription.updateMany.mockResolvedValue({ count: 1 });
    prismaMock.subscription.findFirst.mockResolvedValue({ userId: USER_ID } as never);
    prismaMock.user.update.mockResolvedValue({ ...FAKE_USER, role: 'MEMBER_GOLD' as const });

    const res = await request(app)
      .post('/stripe/webhook')
      .set('stripe-signature', 'valid_sig')
      .set('Content-Type', 'application/json')
      .send('{}');

    expect(res.status).toBe(200);
    expect(prismaMock.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { role: 'MEMBER_GOLD' } })
    );
  });

  it('customer.subscription.deleted → MEMBER_FREE にダウングレード', async () => {
    const m = await stripeMocks();
    m.webhooksConstructEvent.mockReturnValue({
      type: 'customer.subscription.deleted',
      data: {
        object: {
          status: 'canceled',
          customer: 'cus_test',
          current_period_end: Math.floor(Date.now() / 1000) - 86400,
          cancel_at_period_end: false,
        },
      },
    });
    prismaMock.subscription.updateMany.mockResolvedValue({ count: 1 });
    prismaMock.subscription.findFirst.mockResolvedValue({ userId: USER_ID } as never);
    prismaMock.user.update.mockResolvedValue({ ...FAKE_USER, role: 'MEMBER_FREE' as const });

    const res = await request(app)
      .post('/stripe/webhook')
      .set('stripe-signature', 'valid_sig')
      .set('Content-Type', 'application/json')
      .send('{}');

    expect(res.status).toBe(200);
    expect(prismaMock.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { role: 'MEMBER_FREE' } })
    );
  });

  it('未知のイベントタイプ → 200 (無視)', async () => {
    const m = await stripeMocks();
    m.webhooksConstructEvent.mockReturnValue({
      type: 'payment_intent.succeeded',
      data: { object: {} },
    });

    const res = await request(app)
      .post('/stripe/webhook')
      .set('stripe-signature', 'valid_sig')
      .set('Content-Type', 'application/json')
      .send('{}');

    expect(res.status).toBe(200);
    expect(res.body.received).toBe(true);
  });
});
