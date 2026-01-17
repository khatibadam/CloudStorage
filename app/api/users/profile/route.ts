import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/jwt';
import { z } from 'zod';

const updateProfileSchema = z.object({
  firstname: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères').optional(),
  lastname: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').optional(),
});

/**
 * GET /api/users/profile
 * Récupère le profil de l'utilisateur connecté
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
      select: {
        id_user: true,
        email: true,
        firstname: true,
        lastname: true,
        createdAt: true,
        updatedAt: true,
        subscription: {
          select: {
            planType: true,
            status: true,
            storageLimit: true,
            storageUsed: true,
            stripeCurrentPeriodEnd: true,
            cancelAtPeriodEnd: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur introuvable' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        ...user,
        subscription: user.subscription ? {
          ...user.subscription,
          storageLimit: user.subscription.storageLimit.toString(),
          storageUsed: user.subscription.storageUsed.toString(),
        } : null,
      },
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/users/profile
 * Met à jour le profil de l'utilisateur connecté
 *
 * @body { firstname?: string, lastname?: string }
 */
export async function PATCH(request: NextRequest) {
  try {
    const authUser = await getAuthUser();

    if (!authUser) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validation avec Zod
    const validation = updateProfileSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { firstname, lastname } = validation.data;

    // Mise à jour du profil
    const updatedUser = await prisma.user.update({
      where: { id_user: authUser.userId },
      data: {
        ...(firstname && { firstname }),
        ...(lastname && { lastname }),
      },
      select: {
        id_user: true,
        email: true,
        firstname: true,
        lastname: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Profil mis à jour avec succès',
      user: updatedUser,
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
