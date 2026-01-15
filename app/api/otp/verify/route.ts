import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email et code requis' },
        { status: 400 }
      );
    }

    const otpRecord = await prisma.otpCode.findFirst({
      where: {
        email,
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

    if (new Date() > otpRecord.expiresAt) {
      return NextResponse.json(
        { error: 'Code expiré' },
        { status: 401 }
      );
    }

    await prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { verified: true }
    });

    const user = await prisma.user.findUnique({
      where: { email }
    });

    return NextResponse.json({
      success: true,
      message: 'Code vérifié avec succès',
      user: {
        id_user: user?.id_user,
        email: user?.email,
        firstname: user?.firstname,
        lastname: user?.lastname
      }
    });

  } catch (error) {
    console.error('Erreur lors de la vérification de l\'OTP:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

