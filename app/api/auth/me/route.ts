import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/jwt';

/**
 * GET /api/auth/me
 * Récupère les informations de l'utilisateur authentifié
 *
 * @returns { user: object, subscription: object | null }
 */
export async function GET() {
  try {
    const authUser = await getAuthUser();

    if (!authUser) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id_user: authUser.userId },
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
        firstname: user.firstname,
        lastname: user.lastname,
        createdAt: user.createdAt,
      },
      subscription: user.subscription ? {
        id: user.subscription.id,
        planType: user.subscription.planType,
        status: user.subscription.status,
        storageLimit: user.subscription.storageLimit.toString(),
        storageUsed: user.subscription.storageUsed.toString(),
        stripeCurrentPeriodEnd: user.subscription.stripeCurrentPeriodEnd,
        cancelAtPeriodEnd: user.subscription.cancelAtPeriodEnd,
      } : null,
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
