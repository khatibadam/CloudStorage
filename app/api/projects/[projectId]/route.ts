import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/jwt';
import { successResponse, ApiErrors } from '@/lib/api-response';
import { z } from 'zod';

// Schéma de validation pour la mise à jour de projet
const updateProjectSchema = z.object({
  name: z.string()
    .min(1, 'Le nom du projet est requis')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères')
    .optional(),
  description: z.string()
    .max(500, 'La description ne peut pas dépasser 500 caractères')
    .optional()
    .nullable(),
  status: z.enum(['ACTIVE', 'ARCHIVED']).optional(),
});

/**
 * GET /api/projects/[projectId]
 * Récupère un projet spécifique
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return ApiErrors.unauthorized();
    }

    const { projectId } = await params;

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: authUser.userId,
        status: { not: 'DELETED' },
      },
    });

    if (!project) {
      return ApiErrors.notFound('Projet');
    }

    return successResponse({
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      storageUsed: project.storageUsed.toString(),
      filesCount: project.filesCount,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('Erreur récupération projet:', error);
    return ApiErrors.internalError('Erreur lors de la récupération du projet');
  }
}

/**
 * PATCH /api/projects/[projectId]
 * Met à jour un projet
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return ApiErrors.unauthorized();
    }

    const { projectId } = await params;
    const body = await req.json();
    const validation = updateProjectSchema.safeParse(body);

    if (!validation.success) {
      return ApiErrors.validationError(
        validation.error.issues.map((e) => e.message).join(', ')
      );
    }

    // Vérifier que le projet existe et appartient à l'utilisateur
    const existingProject = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: authUser.userId,
        status: { not: 'DELETED' },
      },
    });

    if (!existingProject) {
      return ApiErrors.notFound('Projet');
    }

    const { name, description, status } = validation.data;

    // Mettre à jour le projet
    const project = await prisma.project.update({
      where: { id: projectId },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(status !== undefined && { status }),
      },
    });

    return successResponse({
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      storageUsed: project.storageUsed.toString(),
      filesCount: project.filesCount,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('Erreur mise à jour projet:', error);
    return ApiErrors.internalError('Erreur lors de la mise à jour du projet');
  }
}

/**
 * DELETE /api/projects/[projectId]
 * Supprime un projet (soft delete)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return ApiErrors.unauthorized();
    }

    const { projectId } = await params;

    // Vérifier que le projet existe et appartient à l'utilisateur
    const existingProject = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: authUser.userId,
        status: { not: 'DELETED' },
      },
    });

    if (!existingProject) {
      return ApiErrors.notFound('Projet');
    }

    // Soft delete : marquer comme supprimé
    await prisma.project.update({
      where: { id: projectId },
      data: { status: 'DELETED' },
    });

    return successResponse({ message: 'Projet supprimé avec succès' });
  } catch (error) {
    console.error('Erreur suppression projet:', error);
    return ApiErrors.internalError('Erreur lors de la suppression du projet');
  }
}
