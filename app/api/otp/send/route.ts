import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendOTPEmail } from '@/lib/email';
import { ArgonVerify } from '@/lib/argon2i';
import { z } from 'zod';

const sendOtpSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
});

/**
 * POST /api/otp/send
 * Vérifie les credentials et envoie un code OTP par email
 *
 * @body { email: string, password: string }
 * @returns { success: boolean, message: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation avec Zod
    const validation = sendOtpSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Recherche de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (!user) {
      // Message générique pour éviter l'énumération des comptes
      return NextResponse.json(
        { error: 'Identifiants invalides' },
        { status: 401 }
      );
    }

    // Vérification du mot de passe avec Argon2
    const isPasswordValid = await ArgonVerify(user.password, password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Identifiants invalides' },
        { status: 401 }
      );
    }

    // Envoi de l'email OTP
    const emailResult = await sendOTPEmail(normalizedEmail);

    if (!emailResult.success) {
      console.error('Erreur email:', emailResult.error);

      const errorMessage = emailResult.error instanceof Error &&
        emailResult.error.message.includes('Missing credentials')
        ? 'Configuration email manquante'
        : 'Erreur lors de l\'envoi de l\'email';

      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }

    const token = emailResult.token;

    // Expiration dans 10 minutes
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    // Suppression des anciens codes non vérifiés
    await prisma.otpCode.deleteMany({
      where: {
        email: normalizedEmail,
        verified: false
      }
    });

    // Création du nouveau code OTP
    await prisma.otpCode.create({
      data: {
        email: normalizedEmail,
        code: token,
        expiresAt,
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Code OTP envoyé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la génération de l\'OTP:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
