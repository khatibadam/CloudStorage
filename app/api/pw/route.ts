import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import bcrypt from 'bcrypt'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { currentPassword, newPassword } = await request.json()

    // Vérifier que l'utilisateur est authentifié avec Auth.js v5
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Récupérer l'utilisateur depuis la base de données
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user || !user.password) {
      return NextResponse.json(
        { error: 'Utilisateur introuvable' },
        { status: 404 }
      )
    }

    // Vérifier que le mot de passe actuel est correct
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password)

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Mot de passe actuel incorrect' },
        { status: 401 }
      )
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Mettre à jour le mot de passe dans la base de données
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    })

    return NextResponse.json({
      success: true,
      message: 'Mot de passe changé avec succès'
    })

  } catch (error) {
    console.error('Erreur lors du changement de mot de passe:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    )
  }
}