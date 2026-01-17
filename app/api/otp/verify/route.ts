import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateAccessToken, generateRefreshToken, setAuthCookies } from '@/lib/jwt';
import { z } from 'zod';

const verifyOtpSchema = z.object({
  email: z.string().email('Email invalide'),
  code: z.string()
    .length(6, 'Le code doit contenir 6 chiffres')
    .regex(/^\d+$/, 'Le code doit contenir uniquement des chiffres'),
});

/**
 * POST /api/otp/verify
 * Vérifie le code OTP et authentifie l'utilisateur avec JWT
 *
 * @body { email: string, code: string }
 * @returns { success: boolean, message: string, user: object }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation avec Zod
    const validation = verifyOtpSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, code } = validation.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Recherche du code OTP le plus récent
    const otpRecord = await prisma.otpCode.findFirst({
      where: {
        email: normalizedEmail,
        code,
        verified: false
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: 'Code invalide' },
        { status: 401 }
      );
    }

    // Vérification de l'expiration
    if (new Date() > otpRecord.expiresAt) {
      return NextResponse.json(
        { error: 'Code expiré' },
        { status: 401 }
      );
    }

    // Marquer le code comme vérifié
    await prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { verified: true }
    });

    // Récupération de l'utilisateur avec son abonnement
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { subscription: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur introuvable' },
        { status: 404 }
      );
    }

    // Génération des tokens JWT
    const accessToken = await generateAccessToken({
      userId: user.id_user,
      email: user.email,
    });

    const refreshToken = await generateRefreshToken({
      userId: user.id_user,
      email: user.email,
    });

    // Définition des cookies httpOnly
    await setAuthCookies(accessToken, refreshToken);

    return NextResponse.json({
      success: true,
      message: 'Code vérifié avec succès',
      user: {
        id_user: user.id_user,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname
      },
      subscription: user.subscription ? {
        planType: user.subscription.planType,
        status: user.subscription.status,
      } : null,
    });

  } catch (error) {
    console.error('Erreur lors de la vérification de l\'OTP:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
