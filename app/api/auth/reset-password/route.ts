import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ArgonHash } from '@/lib/argon2i';
import { z } from 'zod';

const resetPasswordSchema = z.object({
  email: z.string().email('Email invalide'),
  token: z.string().min(1, 'Token requis'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  confirmPassword: z.string().min(1, 'Confirmation requise'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

/**
 * POST /api/auth/reset-password
 * Réinitialise le mot de passe avec un token valide
 *
 * @body { email: string, token: string, password: string, confirmPassword: string }
 * @returns { success: boolean, message: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation avec Zod
    const validation = resetPasswordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, token, password } = validation.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Recherche du token
    const resetRecord = await prisma.otpCode.findFirst({
      where: {
        email: normalizedEmail,
        code: token,
        verified: false,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!resetRecord) {
      return NextResponse.json(
        { error: 'Lien invalide ou expiré' },
        { status: 401 }
      );
    }

    // Vérification de l'expiration
    if (new Date() > resetRecord.expiresAt) {
      return NextResponse.json(
        { error: 'Lien expiré. Veuillez faire une nouvelle demande.' },
        { status: 401 }
      );
    }

    // Hashage du nouveau mot de passe
    const hashedPassword = await ArgonHash(password);

    if (!hashedPassword) {
      return NextResponse.json(
        { error: 'Erreur lors du hashage du mot de passe' },
        { status: 500 }
      );
    }

    // Mise à jour du mot de passe
    await prisma.user.update({
      where: { email: normalizedEmail },
      data: { password: hashedPassword },
    });

    // Marquer le token comme utilisé
    await prisma.otpCode.update({
      where: { id: resetRecord.id },
      data: { verified: true },
    });

    return NextResponse.json({
      success: true,
      message: 'Mot de passe modifié avec succès',
    });

  } catch (error) {
    console.error('Erreur lors de la réinitialisation du mot de passe:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
