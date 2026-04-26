import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import rateLimit from 'express-rate-limit';
import { Prisma, SubscriptionStatus, SubscriptionTier } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { sendGoldWelcomeEmail, sendNewGoldMemberToAdmin, sendPaymentFailedEmail } from '../utils/email';
import { logger, mask } from '../lib/logger';

const router = Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const STRIPE_STATUS_MAP: Record<string, SubscriptionStatus> = {
  active: 'ACTIVE',
  trialing: 'TRIALING',
  canceled: 'CANCELED',
  past_due: 'PAST_DUE',
};

function toSubscriptionStatus(stripeStatus: string): SubscriptionStatus {
  return STRIPE_STATUS_MAP[stripeStatus] ?? 'ACTIVE';
}

// ── Checkout ────────────────────────────────────────────────────────

router.post('/checkout', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    const sub = await prisma.subscription.findUnique({
      where: { userId },
      select: { stripeCustomerId: true, tier: true, status: true },
    });

    // #3: 既にアクティブなサブスクリプションがある場合はエラー
    if (sub?.tier === 'MEMBER_GOLD' && sub?.status === 'ACTIVE') {
      res.status(400).json({ error: '既にゴールド会員です' });
      return;
    }

    let stripeCustomerId = sub?.stripeCustomerId ?? null;

    if (!stripeCustomerId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, name: true },
      });
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name ?? undefined,
        metadata: { userId },
      });
      stripeCustomerId = customer.id;
      // #9: update → upsert に変更（レコードがない場合も安全）
      await prisma.subscription.upsert({
        where: { userId },
        create: { userId, stripeCustomerId },
        update: { stripeCustomerId },
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{ price: process.env.STRIPE_GOLD_PRICE_ID!, quantity: 1 }],
      success_url: `${process.env.FRONTEND_URL}/members?checkout=success`,
      cancel_url: `${process.env.FRONTEND_URL}/supporters`,
      metadata: { userId },
    });

    res.json({ url: session.url });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── Portal ──────────────────────────────────────────────────────────

router.get('/portal', requireAuth, async (req: Request, res: Response) => {
  try {
    const sub = await prisma.subscription.findUnique({
      where: { userId: req.user!.userId },
      select: { stripeCustomerId: true },
    });

    if (!sub?.stripeCustomerId) {
      res.status(400).json({ error: 'No Stripe customer found' });
      return;
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripeCustomerId,
      return_url: `${process.env.FRONTEND_URL}/members/profile`,
    });

    res.json({ url: session.url });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── Stripe → DB 同期（共通関数）───────────────────────────────────

export async function syncSubscriptionFromStripe(userId: string): Promise<void> {
  const sub = await prisma.subscription.findUnique({
    where: { userId },
    select: { stripeCustomerId: true, tier: true },
  });

  if (!sub?.stripeCustomerId) return;

  const subscriptions = await stripe.subscriptions.list({
    customer: sub.stripeCustomerId,
    limit: 1,
  });

  const activeSub = subscriptions.data.find(
    (s) => s.status === 'active' || s.status === 'trialing'
  );

  if (activeSub) {
    const wasGold = sub.tier === 'MEMBER_GOLD';

    // #2: トランザクションで subscription と user を同時更新
    const [, updatedUser] = await prisma.$transaction([
      prisma.subscription.update({
        where: { userId },
        data: {
          stripeSubscriptionId: activeSub.id,
          tier: SubscriptionTier.MEMBER_GOLD,
          status: toSubscriptionStatus(activeSub.status),
          currentPeriodEnd: new Date(activeSub.current_period_end * 1000),
          cancelAtPeriodEnd: activeSub.cancel_at_period_end,
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { role: 'MEMBER_GOLD' },
      }),
    ]);

    if (!wasGold) {
      sendGoldWelcomeEmail(updatedUser.email, updatedUser.name ?? updatedUser.email).catch(
        (err) => console.error('Failed to send gold welcome email:', err),
      );
      sendNewGoldMemberToAdmin({ name: updatedUser.name, email: updatedUser.email }).catch(
        (err) => console.error('Failed to send new gold member admin notification:', err),
      );
    }
  } else {
    const canceledSub = subscriptions.data[0];

    // #2: トランザクション
    await prisma.$transaction([
      prisma.subscription.update({
        where: { userId },
        data: {
          tier: SubscriptionTier.MEMBER_FREE,
          status: canceledSub ? toSubscriptionStatus(canceledSub.status) : SubscriptionStatus.CANCELED,
          cancelAtPeriodEnd: false,
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { role: 'MEMBER_FREE' },
      }),
    ]);
  }
}

// ── 手動同期エンドポイント ───────────────────────────────────────

// #7: ユーザー単位で1分に1回のレート制限
const syncLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  keyGenerator: (req) => req.user?.userId ?? req.ip ?? 'unknown',
  message: { error: 'Too many sync requests. Please try again later.' },
});

router.post('/sync', requireAuth, syncLimiter, async (req: Request, res: Response) => {
  try {
    await syncSubscriptionFromStripe(req.user!.userId);
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { role: true },
    });
    res.json({ role: user?.role ?? 'MEMBER_FREE' });
  } catch (err) {
    console.error('stripe sync error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── Webhook ─────────────────────────────────────────────────────────

router.post('/webhook', async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];
  if (!sig) {
    res.status(400).json({ error: 'Missing signature' });
    return;
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body as Buffer,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    res.status(400).json({ error: 'Webhook signature verification failed' });
    return;
  }

  // Idempotency: 同一 event.id の二重処理を抑止 (Stripe はリトライで再送する)
  try {
    await prisma.stripeWebhookEvent.create({
      data: { id: event.id, type: event.type },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      res.json({ received: true, duplicate: true });
      return;
    }
    throw err;
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        if (!userId || !session.subscription) break;

        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );

        // #2: トランザクション
        const [, goldUser] = await prisma.$transaction([
          prisma.subscription.update({
            where: { userId },
            data: {
              stripeSubscriptionId: subscription.id,
              tier: SubscriptionTier.MEMBER_GOLD,
              status: SubscriptionStatus.ACTIVE,
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
              cancelAtPeriodEnd: subscription.cancel_at_period_end,
            },
          }),
          prisma.user.update({
            where: { id: userId },
            data: { role: 'MEMBER_GOLD' },
          }),
        ]);

        logger.info('stripe.checkout.completed', {
          userId: mask.id(goldUser.id),
          email: mask.email(goldUser.email),
        });

        sendGoldWelcomeEmail(goldUser.email, goldUser.name ?? goldUser.email).catch(
          (err) => logger.error('email.gold_welcome.failed', {
            userId: mask.id(goldUser.id),
            error: (err as Error).message,
          }),
        );
        sendNewGoldMemberToAdmin({ name: goldUser.name, email: goldUser.email }).catch(
          (err) => logger.error('email.gold_admin_notify.failed', {
            error: (err as Error).message,
          }),
        );
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;
        const active = sub.status === 'active' || sub.status === 'trialing';
        const tier: SubscriptionTier = active ? 'MEMBER_GOLD' : 'MEMBER_FREE';
        const status = toSubscriptionStatus(sub.status);

        const userSub = await prisma.subscription.findFirst({
          where: { stripeCustomerId: customerId },
          select: { userId: true },
        });

        if (userSub) {
          // #2: トランザクション
          await prisma.$transaction([
            prisma.subscription.updateMany({
              where: { stripeCustomerId: customerId },
              data: {
                status,
                tier,
                currentPeriodEnd: new Date(sub.current_period_end * 1000),
                cancelAtPeriodEnd: sub.cancel_at_period_end,
              },
            }),
            prisma.user.update({
              where: { id: userSub.userId },
              data: { role: active ? 'MEMBER_GOLD' : 'MEMBER_FREE' },
            }),
          ]);
          logger.info('stripe.subscription.updated', {
            userId: mask.id(userSub.userId),
            tier,
            status,
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;

        // #13: 別のアクティブなサブスクリプションがないか確認
        const otherActive = await stripe.subscriptions.list({
          customer: customerId,
          status: 'active',
          limit: 1,
        });
        if (otherActive.data.length > 0) {
          // 別のアクティブなサブスクリプションがあるのでダウングレードしない
          break;
        }

        const userSub = await prisma.subscription.findFirst({
          where: { stripeCustomerId: customerId },
          select: { userId: true },
        });

        if (userSub) {
          // #2: トランザクション
          await prisma.$transaction([
            prisma.subscription.updateMany({
              where: { stripeCustomerId: customerId },
              data: {
                status: SubscriptionStatus.CANCELED,
                tier: SubscriptionTier.MEMBER_FREE,
                cancelAtPeriodEnd: false,
              },
            }),
            prisma.user.update({
              where: { id: userSub.userId },
              data: { role: 'MEMBER_FREE' },
            }),
          ]);
          logger.info('stripe.subscription.deleted', {
            userId: mask.id(userSub.userId),
          });
        }
        break;
      }

      // #6: 支払い失敗ハンドリング
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        const userSub = await prisma.subscription.findFirst({
          where: { stripeCustomerId: customerId },
          include: { user: { select: { email: true, name: true } } },
        });

        if (userSub?.user) {
          sendPaymentFailedEmail(userSub.user.email, userSub.user.name ?? userSub.user.email).catch(
            (err) => logger.error('payment_failed email send error', { error: (err as Error).message }),
          );
        }
        break;
      }
    }

    res.json({ received: true });
  } catch (err) {
    logger.error('stripe.webhook.failed', {
      eventType: event?.type,
      error: (err as Error).message,
    });
    res.status(500).json({ error: 'Webhook processing error' });
  }
});

// ── バッチ処理 ──────────────────────────────────────────────────────

export async function syncExpiringSubscriptions(): Promise<{ checked: number; updated: number }> {
  const now = new Date();
  const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const expiringSubs = await prisma.subscription.findMany({
    where: {
      tier: 'MEMBER_GOLD',
      stripeCustomerId: { not: null },
      currentPeriodEnd: {
        gte: now,
        lte: oneWeekLater,
      },
    },
    include: { user: true },
  });

  let updated = 0;

  for (const sub of expiringSubs) {
    try {
      if (!sub.stripeCustomerId) continue;

      const subscriptions = await stripe.subscriptions.list({
        customer: sub.stripeCustomerId,
        limit: 1,
      });

      const stripeSub = subscriptions.data.find(
        (s) => s.status === 'active' || s.status === 'trialing'
      );

      if (stripeSub) {
        const changed =
          sub.cancelAtPeriodEnd !== stripeSub.cancel_at_period_end ||
          sub.currentPeriodEnd?.getTime() !== stripeSub.current_period_end * 1000;

        if (changed) {
          await prisma.subscription.update({
            where: { id: sub.id },
            data: {
              currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
              cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
              status: toSubscriptionStatus(stripeSub.status),
            },
          });
          updated++;
          console.log(`[batch] Updated subscription for ${sub.user.email}: cancelAtPeriodEnd=${stripeSub.cancel_at_period_end}`);
        }
      } else {
        // #2: トランザクション
        await prisma.$transaction([
          prisma.subscription.update({
            where: { id: sub.id },
            data: {
              tier: SubscriptionTier.MEMBER_FREE,
              status: SubscriptionStatus.CANCELED,
              cancelAtPeriodEnd: false,
            },
          }),
          prisma.user.update({
            where: { id: sub.userId },
            data: { role: 'MEMBER_FREE' },
          }),
        ]);
        updated++;
        console.log(`[batch] Downgraded user ${sub.user.email} to MEMBER_FREE`);
      }
    } catch (err) {
      console.error(`[batch] Failed to sync subscription for user ${sub.userId}:`, err);
    }
  }

  console.log(`[batch] Checked ${expiringSubs.length} expiring subscriptions, updated ${updated}`);
  return { checked: expiringSubs.length, updated };
}

export default router;
