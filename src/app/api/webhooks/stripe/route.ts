import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/db';
import Stripe from 'stripe';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get('Stripe-Signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (event.type === 'checkout.session.completed') {
    // Handle successful checkout
    // Retrieve the subscription details
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );

    // Update user in DB (This assumes you pass userId in metadata)
    const userId = session.metadata?.userId;
    if (userId) {
      await prisma.subscription.create({
        data: {
            userId: userId,
            stripeSubscriptionId: subscription.id,
            status: 'ACTIVE', // simplified
            tier: 'MEMBER_GOLD', // simplified logic
            currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
            currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
        }
      });
       
      // Also update User role
      await prisma.user.update({
        where: { id: userId },
        data: { role: 'MEMBER_GOLD' }
      });
    }
  }

  return new NextResponse(null, { status: 200 });
}
