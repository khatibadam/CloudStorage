import { NextResponse } from 'next/server';
import { clearAuthCookies } from '@/lib/jwt';

/**
 * POST /api/auth/logout
 * Déconnecte l'utilisateur en supprimant les cookies d'authentification
 *
 * @returns { success: boolean, message: string }
 */
export async function POST() {
  try {
    await clearAuthCookies();

    return NextResponse.json({
      success: true,
      message: 'Déconnexion réussie',
    });

  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
