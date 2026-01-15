import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendOTPEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    const emailResult = await sendOTPEmail(email);

    if (!emailResult.success) {
      console.error('Erreur email:', emailResult.error);
      
      const errorMessage = emailResult.error instanceof Error && emailResult.error.message.includes('Missing credentials')
        ? 'Configuration email manquante. Vérifiez GMAIL_USER et GMAIL_APP_PASSWORD dans .env'
        : 'Erreur lors de l\'envoi de l\'email';
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }

    const token = emailResult.token;

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    await prisma.otpCode.deleteMany({
      where: {
        email,
        verified: false
      }
    });

    await prisma.otpCode.create({
      data: {
        email,
        code: token,
        expiresAt,
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Code OTP renvoyé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors du renvoi de l\'OTP:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
