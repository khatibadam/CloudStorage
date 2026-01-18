import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/jwt';
import { successResponse, ApiErrors } from '@/lib/api-response';
import { z } from 'zod';

// Schéma de validation pour la création de projet
const createProjectSchema = z.object({
  name: z.string()
    .min(1, 'Le nom du projet est requis')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  description: z.string()
    .max(500, 'La description ne peut pas dépasser 500 caractères')
    .optional(),
});

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
 * GET /api/projects
 * Récupère tous les projets de l'utilisateur connecté
 */
export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return ApiErrors.unauthorized();
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Construire la clause where
    const whereClause: Record<string, unknown> = {
      userId: authUser.userId,
      status: { not: 'DELETED' }, // Ne pas afficher les projets supprimés
    };

    if (status && ['ACTIVE', 'ARCHIVED'].includes(status)) {
      whereClause.status = status;
    }

    // Récupérer les projets
    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where: whereClause,
        orderBy: { updatedAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.project.count({ where: whereClause }),
    ]);

    // Formater les projets pour la réponse
    const formattedProjects = projects.map((project) => ({
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      storageUsed: project.storageUsed.toString(),
      filesCount: project.filesCount,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
    }));

    return successResponse({
      projects: formattedProjects,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Erreur récupération projets:', error);
    return ApiErrors.internalError('Erreur lors de la récupération des projets');
  }
}

/**
 * POST /api/projects
 * Crée un nouveau projet
 */
export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return ApiErrors.unauthorized();
    }

    const body = await req.json();
    const validation = createProjectSchema.safeParse(body);

    if (!validation.success) {
      return ApiErrors.validationError(
        validation.error.issues.map((e) => e.message).join(', ')
      );
    }

    const { name, description } = validation.data;

    // Vérifier les limites du plan
    const user = await prisma.user.findUnique({
      where: { id_user: authUser.userId },
      include: {
        subscription: true,
        projects: { where: { status: { not: 'DELETED' } } },
      },
    });

    if (!user) {
      return ApiErrors.notFound('Utilisateur');
    }

    // Limites par plan
    const planLimits = {
      FREE: 3,
      STANDARD: 20,
      PRO: 100,
    };

    const planType = user.subscription?.planType || 'FREE';
    const maxProjects = planLimits[planType];

    if (user.projects.length >= maxProjects) {
      return ApiErrors.validationError(
        `Limite de projets atteinte (${maxProjects} pour le plan ${planType}). Passez à un plan supérieur pour créer plus de projets.`
      );
    }

    // Créer le projet
    const project = await prisma.project.create({
      data: {
        userId: authUser.userId,
        name,
        description: description || null,
      },
    });

    return successResponse(
      {
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        storageUsed: project.storageUsed.toString(),
        filesCount: project.filesCount,
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString(),
      },
      201
    );
  } catch (error) {
    console.error('Erreur création projet:', error);
    return ApiErrors.internalError('Erreur lors de la création du projet');
  }
}
