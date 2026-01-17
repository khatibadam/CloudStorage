import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/jwt';
import { ArgonHash, ArgonVerify } from '@/lib/argon2i';
import { z } from 'zod';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Mot de passe actuel requis'),
  newPassword: z.string().min(8, 'Le nouveau mot de passe doit contenir au moins 8 caractères'),
  confirmPassword: z.string().min(1, 'Confirmation requise'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

/**
 * POST /api/users/password
 * Change le mot de passe de l'utilisateur connecté
 *
 * @body { currentPassword: string, newPassword: string, confirmPassword: string }
 */
export async function POST(request: NextRequest) {
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
    const validation = changePasswordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = validation.data;

    // Récupération de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id_user: authUser.userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur introuvable' },
        { status: 404 }
      );
    }

    // Vérification du mot de passe actuel
    const isPasswordValid = await ArgonVerify(user.password, currentPassword);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Mot de passe actuel incorrect' },
        { status: 401 }
      );
    }

    // Vérification que le nouveau mot de passe est différent
    const isSamePassword = await ArgonVerify(user.password, newPassword);

    if (isSamePassword) {
      return NextResponse.json(
        { error: 'Le nouveau mot de passe doit être différent de l\'ancien' },
        { status: 400 }
      );
    }

    // Hash du nouveau mot de passe
    const hashedPassword = await ArgonHash(newPassword);

    if (!hashedPassword) {
      return NextResponse.json(
        { error: 'Erreur lors du hashage du mot de passe' },
        { status: 500 }
      );
    }

    // Mise à jour du mot de passe
    await prisma.user.update({
      where: { id_user: authUser.userId },
      data: { password: hashedPassword },
    });

    return NextResponse.json({
      success: true,
      message: 'Mot de passe modifié avec succès',
    });

  } catch (error) {
    console.error('Erreur lors du changement de mot de passe:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
