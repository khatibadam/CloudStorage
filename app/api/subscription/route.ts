import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SUBSCRIPTION_PLANS } from '@/lib/stripe';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId manquant' },
        { status: 400 }
      );
    }

    let subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    // Si pas d'abonnement, créer un abonnement gratuit par défaut
    if (!subscription) {
      subscription = await prisma.subscription.create({
        data: {
          userId,
          stripeCustomerId: '',
          stripePriceId: '',
          planType: 'FREE',
          status: 'ACTIVE',
          storageLimit: BigInt(SUBSCRIPTION_PLANS.FREE.storageLimit),
          storageUsed: BigInt(0),
        },
      });
    }

    // Convertir les BigInt en string pour JSON
    const subscriptionData = {
      ...subscription,
      storageLimit: subscription.storageLimit.toString(),
      storageUsed: subscription.storageUsed.toString(),
    };

    return NextResponse.json(subscriptionData);
  } catch (error: any) {
    console.error('Erreur récupération abonnement:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}


