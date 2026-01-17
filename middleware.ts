import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-key-change-in-production'
);

// Routes protégées nécessitant une authentification
const protectedRoutes = ['/dashboard', '/analytics', '/settings'];

// Routes publiques (pas de redirection si connecté)
const authRoutes = ['/login', '/signup', '/otp', '/reset-password'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Récupération du token d'accès depuis les cookies
  const accessToken = request.cookies.get('access_token')?.value;

  let isAuthenticated = false;

  if (accessToken) {
    try {
      const { payload } = await jwtVerify(accessToken, JWT_SECRET);
      isAuthenticated = payload.type === 'access';
    } catch {
      // Token invalide ou expiré
      isAuthenticated = false;
    }
  }

  // Protection des routes privées
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirection si déjà connecté (pages de login/signup)
  if (authRoutes.some(route => pathname.startsWith(route))) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/analytics/:path*',
    '/settings/:path*',
    '/login',
    '/signup',
    '/otp',
    '/reset-password',
  ],
};
