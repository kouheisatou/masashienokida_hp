import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { SubscriptionStatus, SubscriptionTier } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { sendGoldWelcomeEmail, sendNewGoldMemberToAdmin } from '../utils/email';

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

router.post('/checkout', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    const sub = await prisma.subscription.findUnique({
      where: { userId },
      select: { stripeCustomerId: true },
    });

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
      await prisma.subscription.update({
        where: { userId },
        data: { stripeCustomerId },
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

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        if (!userId || !session.subscription) break;

        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );

        await prisma.subscription.update({
          where: { userId },
          data: {
            stripeSubscriptionId: subscription.id,
            tier: SubscriptionTier.MEMBER_GOLD,
            status: SubscriptionStatus.ACTIVE,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          },
        });
        const goldUser = await prisma.user.update({
          where: { id: userId },
          data: { role: 'MEMBER_GOLD' },
        });

        sendGoldWelcomeEmail(goldUser.email, goldUser.name ?? goldUser.email).catch(
          (err) => console.error('Failed to send gold welcome email:', err),
        );
        sendNewGoldMemberToAdmin({ name: goldUser.name, email: goldUser.email }).catch(
          (err) => console.error('Failed to send new gold member admin notification:', err),
        );
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;
        const active = sub.status === 'active' || sub.status === 'trialing';
        const tier: SubscriptionTier = active ? 'MEMBER_GOLD' : 'MEMBER_FREE';
        const status = toSubscriptionStatus(sub.status);

        await prisma.subscription.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            status,
            tier,
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
            cancelAtPeriodEnd: sub.cancel_at_period_end,
          },
        });

        const userSub = await prisma.subscription.findFirst({
          where: { stripeCustomerId: customerId },
          select: { userId: true },
        });
        if (userSub) {
          await prisma.user.update({
            where: { id: userSub.userId },
            data: { role: active ? 'MEMBER_GOLD' : 'MEMBER_FREE' },
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;

        await prisma.subscription.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            status: SubscriptionStatus.CANCELED,
            tier: SubscriptionTier.MEMBER_FREE,
            cancelAtPeriodEnd: false,
          },
        });

        const userSub = await prisma.subscription.findFirst({
          where: { stripeCustomerId: customerId },
          select: { userId: true },
        });
        if (userSub) {
          await prisma.user.update({
            where: { id: userSub.userId },
            data: { role: 'MEMBER_FREE' },
          });
        }
        break;
      }
    }

    res.json({ received: true });
  } catch {
    res.status(500).json({ error: 'Webhook processing error' });
  }
});

export default router;
