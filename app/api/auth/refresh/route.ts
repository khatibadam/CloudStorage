import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  verifyToken,
  generateAccessToken,
  generateRefreshToken,
  setAuthCookies,
  getRefreshToken,
} from '@/lib/jwt';
import { checkRateLimit, RATE_LIMITS, getClientIp } from '@/lib/rate-limit';

/**
 * POST /api/auth/refresh
 * Rafraîchit les tokens JWT en utilisant le refresh token
 *
 * @returns { success: boolean, user: object }
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting pour éviter les abus
    const clientIp = getClientIp(request);
    const rateLimitResult = await checkRateLimit(`refresh:${clientIp}`, RATE_LIMITS.REFRESH);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: `Trop de requêtes. Réessayez dans ${rateLimitResult.retryAfter} secondes.`,
          retryAfter: rateLimitResult.retryAfter,
        },
        { status: 429 }
      );
    }

    const refreshToken = await getRefreshToken();

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token manquant' },
        { status: 401 }
      );
    }

    // Vérification du refresh token
    const payload = await verifyToken(refreshToken);

    if (!payload || payload.type !== 'refresh') {
      return NextResponse.json(
        { error: 'Refresh token invalide' },
        { status: 401 }
      );
    }

    // Vérification que l'utilisateur existe toujours
    const user = await prisma.user.findUnique({
      where: { id_user: payload.userId },
      include: { subscription: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur introuvable' },
        { status: 404 }
      );
    }

    // Génération de nouveaux tokens
    const newAccessToken = await generateAccessToken({
      userId: user.id_user,
      email: user.email,
    });

    const newRefreshToken = await generateRefreshToken({
      userId: user.id_user,
      email: user.email,
    });

    // Mise à jour des cookies
    await setAuthCookies(newAccessToken, newRefreshToken);

    return NextResponse.json({
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
      } : null,
    });

  } catch (error) {
    console.error('Erreur lors du refresh:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
