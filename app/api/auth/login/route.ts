import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ArgonVerify } from '@/lib/argon2i';
import { generateAccessToken, generateRefreshToken } from '@/lib/jwt';
import { z } from 'zod';
import { checkRateLimit, RATE_LIMITS, getClientIp } from '@/lib/rate-limit';

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
});

/**
 * POST /api/auth/login
 * Authentifie l'utilisateur et génère les tokens JWT
 *
 * @body { email: string, password: string }
 * @returns { success: boolean, user: object, requireOtp: boolean }
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting pour éviter les attaques par brute force
    const clientIp = getClientIp(request);
    const rateLimitResult = await checkRateLimit(`login:${clientIp}`, RATE_LIMITS.LOGIN);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: `Trop de tentatives de connexion. Réessayez dans ${rateLimitResult.retryAfter} secondes.`,
          retryAfter: rateLimitResult.retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimitResult.retryAfter),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(rateLimitResult.resetAt),
          },
        }
      );
    }

    const body = await request.json();

    // Validation avec Zod
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    // Recherche de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { subscription: true },
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

    // Génération des tokens JWT
    const accessToken = await generateAccessToken({
      userId: user.id_user,
      email: user.email,
    });

    const refreshToken = await generateRefreshToken({
      userId: user.id_user,
      email: user.email,
    });

    // Création de la réponse avec les données utilisateur
    const response = NextResponse.json({
      success: true,
      user: {
        id_user: user.id_user,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
      },
      subscription: user.subscription ? {
        planType: user.subscription.planType,
        status: user.subscription.status,
        storageLimit: user.subscription.storageLimit.toString(),
        storageUsed: user.subscription.storageUsed.toString(),
      } : null,
    });

    // Définition des cookies httpOnly directement sur la réponse
    const isProduction = process.env.NODE_ENV === 'production';

    response.cookies.set('access_token', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 15 * 60, // 15 minutes
      path: '/',
    });

    response.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 jours
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
