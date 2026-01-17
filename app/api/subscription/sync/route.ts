import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stripe, SUBSCRIPTION_PLANS } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'userId manquant' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id_user: userId },
      include: { subscription: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur introuvable' },
        { status: 404 }
      );
    }

    if (!user.stripeCustomerId) {
      return NextResponse.json(
        { error: 'Aucun client Stripe associé' },
        { status: 404 }
      );
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      limit: 1,
      status: 'all',
    });

    if (subscriptions.data.length === 0) {
      if (user.subscription) {
        await prisma.subscription.update({
          where: { userId },
          data: {
            planType: 'FREE',
            status: 'ACTIVE',
            storageLimit: BigInt(SUBSCRIPTION_PLANS.FREE.storageLimit),
            stripeSubscriptionId: null,
          },
        });
      }

      return NextResponse.json({
        message: 'Aucun abonnement Stripe trouvé, retour au plan gratuit',
        planType: 'FREE',
      });
    }

    const stripeSubscription = subscriptions.data[0];
    const planType = (stripeSubscription.metadata?.planType as 'STANDARD' | 'PRO') || 'STANDARD';
    const plan = SUBSCRIPTION_PLANS[planType];

    let status: 'ACTIVE' | 'INACTIVE' | 'PAST_DUE' | 'CANCELED' | 'TRIALING' = 'INACTIVE';
    
    switch (stripeSubscription.status) {
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

    const currentPeriodEnd = (stripeSubscription as any).current_period_end 
      ? new Date((stripeSubscription as any).current_period_end * 1000) 
      : null;

    await prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        stripeCustomerId: user.stripeCustomerId,
        stripeSubscriptionId: stripeSubscription.id,
        stripePriceId: stripeSubscription.items.data[0].price.id,
        planType,
        status,
        storageLimit: BigInt(plan.storageLimit),
        storageUsed: user.subscription?.storageUsed || BigInt(0),
        stripeCurrentPeriodEnd: currentPeriodEnd,
        cancelAtPeriodEnd: (stripeSubscription as any).cancel_at_period_end || false,
      },
      update: {
        stripeSubscriptionId: stripeSubscription.id,
        stripePriceId: stripeSubscription.items.data[0].price.id,
        planType,
        status,
        storageLimit: BigInt(plan.storageLimit),
        stripeCurrentPeriodEnd: currentPeriodEnd,
        cancelAtPeriodEnd: (stripeSubscription as any).cancel_at_period_end || false,
      },
    });

    return NextResponse.json({
      message: 'Abonnement synchronisé avec succès',
      planType,
      status,
    });
  } catch (error: any) {
    console.error('Erreur synchronisation:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}



