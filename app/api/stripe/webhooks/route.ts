import { NextRequest, NextResponse } from 'next/server';
import { stripe, SUBSCRIPTION_PLANS } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

// Store pour l'idempotence des webhooks (en production, utiliser Redis)
const processedEvents = new Set<string>();

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
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
    console.error('Erreur webhook:', errorMessage);
    return NextResponse.json(
      { error: `Webhook Error: ${errorMessage}` },
      { status: 400 }
    );
  }

  // Vérification d'idempotence pour éviter le double traitement
  if (processedEvents.has(event.id)) {
    console.log(`Événement déjà traité: ${event.id}`);
    return NextResponse.json({ received: true, duplicate: true });
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

      // Gestion des factures - GÉNÉRATION
      case 'invoice.finalized': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoiceCreated(invoice);
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

      // Gestion des factures - ANNULATION
      case 'invoice.voided': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoiceVoided(invoice);
        break;
      }

      // Gestion des avoirs (credit notes)
      case 'credit_note.created': {
        const creditNote = event.data.object as Stripe.CreditNote;
        await handleCreditNoteCreated(creditNote);
        break;
      }

      default:
        console.log(`Événement non géré: ${event.type}`);
    }

    // Marquer l'événement comme traité
    processedEvents.add(event.id);

    // Nettoyage des anciens événements (garder les 1000 derniers)
    if (processedEvents.size > 1000) {
      const iterator = processedEvents.values();
      processedEvents.delete(iterator.next().value as string);
    }

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    console.error('Erreur traitement webhook:', errorMessage);
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

    // Mettre à jour le statut de la facture en BDD
    await prisma.invoice.updateMany({
      where: { stripeInvoiceId: invoice.id },
      data: { status: 'OPEN' }, // Reste ouverte car paiement échoué
    });
  }
}

/**
 * Gestion de la création/finalisation d'une facture
 * Appelé quand une facture est finalisée et prête à être payée
 */
async function handleInvoiceCreated(invoice: Stripe.Invoice) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const invoiceData = invoice as any;
  const customerId = typeof invoiceData.customer === 'string'
    ? invoiceData.customer
    : invoiceData.customer?.id || '';
  const subscriptionId = invoiceData.subscription
    ? (typeof invoiceData.subscription === 'string'
        ? invoiceData.subscription
        : invoiceData.subscription?.id || null)
    : null;

  const user = await prisma.user.findUnique({
    where: { stripeCustomerId: customerId },
  });

  if (!user) {
    console.error('Utilisateur non trouvé pour le customer:', customerId);
    return;
  }

  // Créer ou mettre à jour la facture en BDD
  await prisma.invoice.upsert({
    where: { stripeInvoiceId: invoice.id },
    create: {
      userId: user.id_user,
      stripeInvoiceId: invoice.id,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      amountDue: invoice.amount_due,
      amountPaid: invoice.amount_paid,
      currency: invoice.currency,
      status: 'OPEN',
      invoiceUrl: invoice.invoice_pdf || null,
      hostedInvoiceUrl: invoice.hosted_invoice_url || null,
      periodStart: invoice.period_start ? new Date(invoice.period_start * 1000) : null,
      periodEnd: invoice.period_end ? new Date(invoice.period_end * 1000) : null,
      dueDate: invoice.due_date ? new Date(invoice.due_date * 1000) : null,
      description: invoice.description || `Facture ${invoice.number || invoice.id}`,
    },
    update: {
      amountDue: invoice.amount_due,
      amountPaid: invoice.amount_paid,
      status: 'OPEN',
      invoiceUrl: invoice.invoice_pdf || null,
      hostedInvoiceUrl: invoice.hosted_invoice_url || null,
    },
  });

  console.log(`Facture créée/mise à jour: ${invoice.id} pour l'utilisateur ${user.id_user}`);
}

/**
 * Gestion de l'annulation d'une facture
 */
async function handleInvoiceVoided(invoice: Stripe.Invoice) {
  const voidedAt = invoice.status_transitions?.voided_at
    ? new Date(invoice.status_transitions.voided_at * 1000)
    : new Date();

  await prisma.invoice.updateMany({
    where: { stripeInvoiceId: invoice.id },
    data: {
      status: 'VOID',
      voidedAt,
    },
  });

  console.log(`Facture annulée: ${invoice.id}`);
}

/**
 * Gestion de la création d'un avoir (credit note)
 */
async function handleCreditNoteCreated(creditNote: Stripe.CreditNote) {
  // Marquer la facture associée comme ayant un avoir
  const invoiceId = creditNote.invoice as string;

  if (invoiceId) {
    // On pourrait créer une table CreditNote séparée si nécessaire
    // Pour l'instant, on marque juste la facture comme remboursée
    await prisma.invoice.updateMany({
      where: { stripeInvoiceId: invoiceId },
      data: {
        status: 'VOID',
        voidedAt: new Date(),
      },
    });

    console.log(`Avoir créé pour la facture: ${invoiceId}, montant: ${creditNote.amount / 100}€`);
  }
}
