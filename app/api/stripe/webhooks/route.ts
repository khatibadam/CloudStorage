import { NextRequest, NextResponse } from 'next/server';
import { stripe, SUBSCRIPTION_PLANS } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Signature manquante' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err: any) {
    console.error('Erreur webhook:', err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentSucceeded(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Événement non géré: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Erreur traitement webhook:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const planType = session.metadata?.planType as keyof typeof SUBSCRIPTION_PLANS;

  if (!userId || !planType) {
    console.error('Métadonnées manquantes dans la session');
    return;
  }

  const plan = SUBSCRIPTION_PLANS[planType];

  // Créer ou mettre à jour l'abonnement
  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: session.subscription as string,
      stripePriceId: plan.priceId,
      planType,
      status: 'ACTIVE',
      storageLimit: BigInt(plan.storageLimit),
      storageUsed: BigInt(0),
    },
    update: {
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: session.subscription as string,
      stripePriceId: plan.priceId,
      planType,
      status: 'ACTIVE',
      storageLimit: BigInt(plan.storageLimit),
    },
  });
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;
  const planType = subscription.metadata?.planType as keyof typeof SUBSCRIPTION_PLANS;

  if (!userId) {
    console.error('userId manquant dans les métadonnées');
    return;
  }

  const plan = planType ? SUBSCRIPTION_PLANS[planType] : null;

  let status: 'ACTIVE' | 'INACTIVE' | 'PAST_DUE' | 'CANCELED' | 'TRIALING' = 'INACTIVE';
  
  switch (subscription.status) {
    case 'active':
      status = 'ACTIVE';
      break;
    case 'past_due':
      status = 'PAST_DUE';
      break;
    case 'canceled':
      status = 'CANCELED';
      break;
    case 'trialing':
      status = 'TRIALING';
      break;
    default:
      status = 'INACTIVE';
  }

  const currentPeriodEnd = (subscription as any).current_period_end 
    ? new Date((subscription as any).current_period_end * 1000) 
    : null;
  const cancelAtPeriodEnd = (subscription as any).cancel_at_period_end || false;

  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      stripeCustomerId: subscription.customer as string,
      stripeSubscriptionId: subscription.id,
      stripePriceId: subscription.items.data[0].price.id,
      planType: planType || 'FREE',
      status,
      storageLimit: plan ? BigInt(plan.storageLimit) : BigInt(SUBSCRIPTION_PLANS.FREE.storageLimit),
      storageUsed: BigInt(0),
      stripeCurrentPeriodEnd: currentPeriodEnd,
      cancelAtPeriodEnd: cancelAtPeriodEnd,
    },
    update: {
      stripeSubscriptionId: subscription.id,
      stripePriceId: subscription.items.data[0].price.id,
      status,
      stripeCurrentPeriodEnd: currentPeriodEnd,
      cancelAtPeriodEnd: cancelAtPeriodEnd,
      ...(plan && { 
        planType,
        storageLimit: BigInt(plan.storageLimit) 
      }),
    },
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;

  if (!userId) {
    console.error('userId manquant');
    return;
  }

  // Retour au plan gratuit
  await prisma.subscription.update({
    where: { userId },
    data: {
      stripeSubscriptionId: null,
      planType: 'FREE',
      status: 'CANCELED',
      storageLimit: BigInt(SUBSCRIPTION_PLANS.FREE.storageLimit),
      cancelAtPeriodEnd: false,
    },
  });
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscriptionId = (invoice as any).subscription;
  if (!subscriptionId) return;

  const subscription = await stripe.subscriptions.retrieve(
    subscriptionId as string
  );

  await handleSubscriptionUpdate(subscription);
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  const user = await prisma.user.findUnique({
    where: { stripeCustomerId: customerId },
  });

  if (user) {
    await prisma.subscription.update({
      where: { userId: user.id_user },
      data: { status: 'PAST_DUE' },
    });
  }
}


