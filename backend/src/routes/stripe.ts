import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { query, queryOne } from '../db';
import { requireAuth } from '../middleware/auth';

const router = Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
});

// Create Stripe Checkout session for MEMBER_GOLD
router.post('/checkout', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    // Get or create Stripe customer
    let stripeCustomerId: string | null = null;
    const sub = await queryOne<{ stripe_customer_id: string | null }>(
      'SELECT stripe_customer_id FROM subscriptions WHERE user_id = $1',
      [userId]
    );

    if (sub?.stripe_customer_id) {
      stripeCustomerId = sub.stripe_customer_id;
    } else {
      const user = await queryOne<{ email: string; name: string | null }>(
        'SELECT email, name FROM users WHERE id = $1',
        [userId]
      );
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
      await query(
        'UPDATE subscriptions SET stripe_customer_id=$1, updated_at=NOW() WHERE user_id=$2',
        [stripeCustomerId, userId]
      );
    }

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: process.env.STRIPE_GOLD_PRICE_ID!,
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/members?checkout=success`,
      cancel_url: `${process.env.FRONTEND_URL}/supporters`,
      metadata: { userId },
    });

    res.json({ url: session.url });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Stripe customer portal
router.get('/portal', requireAuth, async (req: Request, res: Response) => {
  try {
    const sub = await queryOne<{ stripe_customer_id: string | null }>(
      'SELECT stripe_customer_id FROM subscriptions WHERE user_id = $1',
      [req.user!.userId]
    );

    if (!sub?.stripe_customer_id) {
      res.status(400).json({ error: 'No Stripe customer found' });
      return;
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${process.env.FRONTEND_URL}/members/profile`,
    });

    res.json({ url: session.url });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Stripe webhook
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

        await query(
          `UPDATE subscriptions
           SET stripe_subscription_id=$1, tier='MEMBER_GOLD', status='ACTIVE',
               current_period_end=$2, cancel_at_period_end=$3, updated_at=NOW()
           WHERE user_id=$4`,
          [
            subscription.id,
            new Date(subscription.current_period_end * 1000),
            subscription.cancel_at_period_end,
            userId,
          ]
        );
        await query(
          `UPDATE users SET role='MEMBER_GOLD', updated_at=NOW() WHERE id=$1`,
          [userId]
        );
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;
        const active = sub.status === 'active' || sub.status === 'trialing';

        await query(
          `UPDATE subscriptions
           SET status=$1, tier=$2, current_period_end=$3, cancel_at_period_end=$4, updated_at=NOW()
           WHERE stripe_customer_id=$5`,
          [
            sub.status.toUpperCase(),
            active ? 'MEMBER_GOLD' : 'MEMBER_FREE',
            new Date(sub.current_period_end * 1000),
            sub.cancel_at_period_end,
            customerId,
          ]
        );

        // Sync user role
        const userRow = await queryOne<{ user_id: string }>(
          'SELECT user_id FROM subscriptions WHERE stripe_customer_id = $1',
          [customerId]
        );
        if (userRow) {
          await query(
            `UPDATE users SET role=$1, updated_at=NOW() WHERE id=$2`,
            [active ? 'MEMBER_GOLD' : 'MEMBER_FREE', userRow.user_id]
          );
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;

        await query(
          `UPDATE subscriptions
           SET status='CANCELED', tier='MEMBER_FREE', cancel_at_period_end=FALSE, updated_at=NOW()
           WHERE stripe_customer_id=$1`,
          [customerId]
        );
        const userRow = await queryOne<{ user_id: string }>(
          'SELECT user_id FROM subscriptions WHERE stripe_customer_id = $1',
          [customerId]
        );
        if (userRow) {
          await query(
            `UPDATE users SET role='MEMBER_FREE', updated_at=NOW() WHERE id=$1`,
            [userRow.user_id]
          );
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
