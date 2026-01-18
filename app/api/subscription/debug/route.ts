import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

    return NextResponse.json({
      user: {
        id_user: user.id_user,
        email: user.email,
        stripeCustomerId: user.stripeCustomerId,
      },
      subscription: user.subscription ? {
        id: user.subscription.id,
        planType: user.subscription.planType,
        status: user.subscription.status,
        stripeSubscriptionId: user.subscription.stripeSubscriptionId,
        stripeCustomerId: user.subscription.stripeCustomerId,
        stripePriceId: user.subscription.stripePriceId,
        storageLimit: user.subscription.storageLimit.toString(),
        storageUsed: user.subscription.storageUsed.toString(),
        stripeCurrentPeriodEnd: user.subscription.stripeCurrentPeriodEnd,
        cancelAtPeriodEnd: user.subscription.cancelAtPeriodEnd,
      } : null,
    });
  } catch (error: any) {
    console.error('Erreur debug:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}




