/**
 * Stripe Function - OCI Function for Payment Processing
 * Handles checkout sessions, webhooks, and customer portal
 */

import Stripe from 'stripe';
import {
  executeQuery,
  createResponse,
  handleCors,
  unauthorized,
  badRequest,
  serverError,
  verifyAuth,
  parseBody,
} from '@enokida/shared';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
});

// OCI Function context
interface FunctionContext {
  httpGateway: {
    requestURL: string;
    headers: Record<string, string>;
    method: string;
  };
}

// Price ID for Gold membership (3,000 JPY/year)
const GOLD_PRICE_ID = process.env.STRIPE_GOLD_PRICE_ID || '';

/**
 * Main function handler
 */
export async function handler(
  ctx: FunctionContext,
  data: string
): Promise<{ statusCode: number; headers: Record<string, string>; body: string }> {
  const { requestURL, headers, method } = ctx.httpGateway;

  if (method === 'OPTIONS') {
    return handleCors();
  }

  const url = new URL(requestURL);
  const path = url.pathname.replace(/^\/api\/stripe/, '');

  try {
    switch (path) {
      case '/webhook':
        return await handleWebhook(headers, data);

      case '/create-checkout':
        return await handleCreateCheckout(headers, data);

      case '/portal':
        return await handlePortal(headers);

      case '/subscription':
        return await handleGetSubscription(headers);

      default:
        return createResponse(404, { error: 'Not found' });
    }
  } catch (error) {
    console.error('Stripe function error:', error);
    return serverError('Payment processing error');
  }
}

/**
 * Handle Stripe webhook events
 */
async function handleWebhook(
  headers: Record<string, string>,
  data: string
): Promise<ReturnType<typeof createResponse>> {
  const signature =
    headers['stripe-signature'] || headers['Stripe-Signature'] || '';

  if (!signature) {
    return badRequest('Missing Stripe signature');
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      data,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return badRequest('Invalid webhook signature');
  }

  // Handle specific event types
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
      break;

    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
      break;

    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
      break;

    case 'invoice.paid':
      await handleInvoicePaid(event.data.object as Stripe.Invoice);
      break;

    case 'invoice.payment_failed':
      await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return createResponse(200, { received: true });
}

/**
 * Handle checkout.session.completed
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
  const userId = session.metadata?.userId;

  if (!userId || !session.subscription) {
    console.log('Missing userId or subscription in checkout session');
    return;
  }

  // Get subscription details
  const subscription = await stripe.subscriptions.retrieve(
    session.subscription as string
  );

  // Create subscription record
  await executeQuery(
    `INSERT INTO subscriptions
     (id, user_id, stripe_subscription_id, stripe_price_id, status, tier,
      current_period_start, current_period_end)
     VALUES (SYS_GUID(), :userId, :subId, :priceId, 'ACTIVE', 'MEMBER_GOLD',
             :periodStart, :periodEnd)`,
    {
      userId,
      subId: subscription.id,
      priceId: subscription.items.data[0]?.price.id,
      periodStart: new Date(subscription.current_period_start * 1000),
      periodEnd: new Date(subscription.current_period_end * 1000),
    }
  );

  // Update user role to MEMBER_GOLD
  await executeQuery(
    `UPDATE users SET role = 'MEMBER_GOLD' WHERE id = :userId`,
    { userId }
  );

  console.log(`User ${userId} upgraded to MEMBER_GOLD`);
}

/**
 * Handle subscription updates
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
  const status = mapStripeStatus(subscription.status);

  await executeQuery(
    `UPDATE subscriptions
     SET status = :status,
         current_period_start = :periodStart,
         current_period_end = :periodEnd,
         cancel_at_period_end = :cancelAt
     WHERE stripe_subscription_id = :subId`,
    {
      status,
      periodStart: new Date(subscription.current_period_start * 1000),
      periodEnd: new Date(subscription.current_period_end * 1000),
      cancelAt: subscription.cancel_at_period_end ? 1 : 0,
      subId: subscription.id,
    }
  );
}

/**
 * Handle subscription deletion (cancellation)
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
  // Update subscription status
  await executeQuery(
    `UPDATE subscriptions
     SET status = 'CANCELED', canceled_at = CURRENT_TIMESTAMP
     WHERE stripe_subscription_id = :subId`,
    { subId: subscription.id }
  );

  // Get user ID from subscription
  const subs = await executeQuery<{ USER_ID: string }>(
    `SELECT user_id FROM subscriptions WHERE stripe_subscription_id = :subId`,
    { subId: subscription.id }
  );

  if (subs.length > 0) {
    // Downgrade user to MEMBER_FREE
    await executeQuery(
      `UPDATE users SET role = 'MEMBER_FREE' WHERE id = :userId`,
      { userId: subs[0].USER_ID }
    );

    console.log(`User ${subs[0].USER_ID} downgraded to MEMBER_FREE`);
  }
}

/**
 * Handle successful invoice payment
 */
async function handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
  if (!invoice.subscription) return;

  const subscription = await stripe.subscriptions.retrieve(
    invoice.subscription as string
  );

  await executeQuery(
    `UPDATE subscriptions
     SET status = 'ACTIVE',
         current_period_start = :periodStart,
         current_period_end = :periodEnd
     WHERE stripe_subscription_id = :subId`,
    {
      periodStart: new Date(subscription.current_period_start * 1000),
      periodEnd: new Date(subscription.current_period_end * 1000),
      subId: subscription.id,
    }
  );
}

/**
 * Handle failed invoice payment
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  if (!invoice.subscription) return;

  await executeQuery(
    `UPDATE subscriptions SET status = 'PAST_DUE' WHERE stripe_subscription_id = :subId`,
    { subId: invoice.subscription as string }
  );
}

/**
 * Map Stripe status to our status
 */
function mapStripeStatus(status: Stripe.Subscription.Status): string {
  const statusMap: Record<string, string> = {
    active: 'ACTIVE',
    canceled: 'CANCELED',
    past_due: 'PAST_DUE',
    trialing: 'TRIALING',
    incomplete: 'INCOMPLETE',
    incomplete_expired: 'INCOMPLETE_EXPIRED',
    unpaid: 'UNPAID',
    paused: 'PAUSED',
  };
  return statusMap[status] || 'ACTIVE';
}

/**
 * Create checkout session
 */
async function handleCreateCheckout(
  headers: Record<string, string>,
  data: string
): Promise<ReturnType<typeof createResponse>> {
  const user = await verifyAuth(headers);

  if (!user) {
    return unauthorized('Authentication required');
  }

  const body = parseBody<{ priceId?: string }>(data);

  // Get or create Stripe customer
  let customerId = user.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: { userId: user.id },
    });

    customerId = customer.id;

    await executeQuery(
      `UPDATE users SET stripe_customer_id = :customerId WHERE id = :userId`,
      { customerId, userId: user.id }
    );
  }

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: body?.priceId || GOLD_PRICE_ID,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${process.env.NEXTAUTH_URL}/supporters/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXTAUTH_URL}/supporters`,
    metadata: {
      userId: user.id,
    },
    locale: 'ja',
    allow_promotion_codes: true,
  });

  return createResponse(200, {
    sessionId: session.id,
    url: session.url,
  });
}

/**
 * Create customer portal session
 */
async function handlePortal(
  headers: Record<string, string>
): Promise<ReturnType<typeof createResponse>> {
  const user = await verifyAuth(headers);

  if (!user || !user.stripeCustomerId) {
    return unauthorized('No subscription found');
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${process.env.NEXTAUTH_URL}/members`,
  });

  return createResponse(200, { url: session.url });
}

/**
 * Get user's subscription status
 */
async function handleGetSubscription(
  headers: Record<string, string>
): Promise<ReturnType<typeof createResponse>> {
  const user = await verifyAuth(headers);

  if (!user) {
    return unauthorized('Authentication required');
  }

  const subs = await executeQuery<{
    TIER: string;
    STATUS: string;
    CURRENT_PERIOD_END: Date;
    CANCEL_AT_PERIOD_END: number;
  }>(
    `SELECT tier, status, current_period_end, cancel_at_period_end
     FROM subscriptions
     WHERE user_id = :userId AND status = 'ACTIVE'
     ORDER BY created_at DESC
     FETCH FIRST 1 ROW ONLY`,
    { userId: user.id }
  );

  if (subs.length === 0) {
    return createResponse(200, {
      hasSubscription: false,
      tier: 'MEMBER_FREE',
    });
  }

  const sub = subs[0];

  return createResponse(200, {
    hasSubscription: true,
    tier: sub.TIER,
    status: sub.STATUS,
    currentPeriodEnd: sub.CURRENT_PERIOD_END,
    cancelAtPeriodEnd: sub.CANCEL_AT_PERIOD_END === 1,
  });
}

module.exports = { handler };
