import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendPasswordResetEmail } from '@/lib/email';
import { z } from 'zod';
import crypto from 'crypto';

const forgotPasswordSchema = z.object({
  email: z.string().email('Email invalide'),
});

/**
 * POST /api/auth/forgot-password
 * Envoie un email de réinitialisation de mot de passe
 *
 * @body { email: string }
 * @returns { success: boolean, message: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation avec Zod
    const validation = forgotPasswordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email } = validation.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Recherche de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    // On retourne toujours succès pour éviter l'énumération des comptes
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.',
      });
    }

    // Génération d'un token sécurisé
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Expire dans 1 heure

    // Suppression des anciens tokens non utilisés
    await prisma.otpCode.deleteMany({
      where: {
        email: normalizedEmail,
        verified: false,
      }
    });

    // Stockage du token (on utilise le modèle OtpCode pour simplifier)
    await prisma.otpCode.create({
      data: {
        email: normalizedEmail,
        code: resetToken,
        expiresAt,
      }
    });

    // Envoi de l'email
    const emailResult = await sendPasswordResetEmail(normalizedEmail, resetToken);

    if (!emailResult.success) {
      console.error('Erreur email:', emailResult.error);
      return NextResponse.json(
        { error: 'Erreur lors de l\'envoi de l\'email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.',
    });

  } catch (error) {
    console.error('Erreur lors de la demande de réinitialisation:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
