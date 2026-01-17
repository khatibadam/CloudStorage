import { SignJWT, jwtVerify, JWTPayload } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-key-change-in-production'
);

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

export interface TokenPayload extends JWTPayload {
  userId: string;
  email: string;
  type: 'access' | 'refresh';
}

export interface UserSession {
  userId: string;
  email: string;
  firstname: string;
  lastname: string;
}

/**
 * Génère un Access Token JWT (courte durée - 15 min)
 */
export async function generateAccessToken(payload: { userId: string; email: string }): Promise<string> {
  return new SignJWT({ ...payload, type: 'access' as const })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

/**
 * Génère un Refresh Token JWT (longue durée - 7 jours)
 */
export async function generateRefreshToken(payload: { userId: string; email: string }): Promise<string> {
  return new SignJWT({ ...payload, type: 'refresh' as const })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

/**
 * Vérifie et décode un token JWT
 */
export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as TokenPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Définit les cookies d'authentification (httpOnly pour la sécurité)
 */
export async function setAuthCookies(accessToken: string, refreshToken: string): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set('access_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60, // 15 minutes
    path: '/',
  });

  cookieStore.set('refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 jours
    path: '/',
  });
}

/**
 * Supprime les cookies d'authentification
 */
export async function clearAuthCookies(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.delete('access_token');
  cookieStore.delete('refresh_token');
}

/**
 * Récupère l'utilisateur authentifié depuis les cookies
 */
export async function getAuthUser(): Promise<TokenPayload | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  if (!accessToken) {
    return null;
  }

  const payload = await verifyToken(accessToken);

  if (!payload || payload.type !== 'access') {
    return null;
  }

  return payload;
}

/**
 * Récupère le refresh token depuis les cookies
 */
export async function getRefreshToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('refresh_token')?.value || null;
}

/**
 * Vérifie si l'utilisateur est authentifié (pour les API routes)
 */
export async function requireAuth(): Promise<TokenPayload> {
  const user = await getAuthUser();

  if (!user) {
    throw new Error('Non authentifié');
  }

  return user;
}
