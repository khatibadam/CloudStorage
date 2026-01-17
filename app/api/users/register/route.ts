import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ArgonHash } from '@/lib/argon2i';
import { z } from 'zod';

const registerSchema = z.object({
  firstname: z.string()
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .max(50, 'Le prénom ne peut pas dépasser 50 caractères')
    .regex(/^[a-zA-ZÀ-ÿ\s-]+$/, 'Le prénom contient des caractères invalides'),
  lastname: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères')
    .regex(/^[a-zA-ZÀ-ÿ\s-]+$/, 'Le nom contient des caractères invalides'),
  email: z.string()
    .email('Email invalide')
    .max(100, 'L\'email ne peut pas dépasser 100 caractères'),
  password: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .max(100, 'Le mot de passe ne peut pas dépasser 100 caractères'),
  confirmPassword: z.string()
    .min(1, 'La confirmation du mot de passe est requise'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

/**
 * POST /api/users/register
 * Crée un nouveau compte utilisateur
 *
 * @body { firstname: string, lastname: string, email: string, password: string, confirmPassword: string }
 * @returns { success: boolean, message: string, user: object }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation avec Zod
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { firstname, lastname, email, password } = validation.data;

    // Normalisation de l'email
    const normalizedEmail = email.toLowerCase().trim();

    // Vérification si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé' },
        { status: 409 }
      );
    }

    // Hashage du mot de passe avec Argon2
    const hashedPassword = await ArgonHash(password);

    if (!hashedPassword) {
      console.error('Erreur lors du hashage du mot de passe');
      return NextResponse.json(
        { error: 'Erreur lors de la création du compte' },
        { status: 500 }
      );
    }

    // Création de l'utilisateur
    const user = await prisma.user.create({
      data: {
        firstname: firstname.trim(),
        lastname: lastname.trim(),
        email: normalizedEmail,
        password: hashedPassword,
      },
      select: {
        id_user: true,
        firstname: true,
        lastname: true,
        email: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Compte créé avec succès',
      user,
    }, { status: 201 });

  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
