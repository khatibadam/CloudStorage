import { NextResponse } from 'next/server';

/**
 * Format standardisé pour les réponses API
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  timestamp: string;
}

/**
 * Codes d'erreur standardisés
 */
export const ErrorCodes = {
  // Auth
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',

  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_FIELD: 'MISSING_FIELD',

  // Resources
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  CONFLICT: 'CONFLICT',

  // Rate limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',

  // Server
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',

  // Stripe
  STRIPE_ERROR: 'STRIPE_ERROR',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  INVOICE_NOT_FOUND: 'INVOICE_NOT_FOUND',
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

/**
 * Crée une réponse API de succès
 */
export function successResponse<T>(data: T, status: number = 200): NextResponse {
  const response: ApiResponse<T> = {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
  return NextResponse.json(response, { status });
}

/**
 * Crée une réponse API d'erreur
 */
export function errorResponse(
  code: ErrorCode,
  message: string,
  status: number = 400
): NextResponse {
  const response: ApiResponse = {
    success: false,
    error: { code, message },
    timestamp: new Date().toISOString(),
  };
  return NextResponse.json(response, { status });
}

/**
 * Réponses d'erreur prédéfinies
 */
export const ApiErrors = {
  unauthorized: () => errorResponse(ErrorCodes.UNAUTHORIZED, 'Non authentifié', 401),
  forbidden: () => errorResponse(ErrorCodes.FORBIDDEN, 'Accès refusé', 403),
  notFound: (resource: string = 'Ressource') =>
    errorResponse(ErrorCodes.NOT_FOUND, `${resource} non trouvé(e)`, 404),
  validationError: (message: string) =>
    errorResponse(ErrorCodes.VALIDATION_ERROR, message, 400),
  rateLimitExceeded: (retryAfter: number) =>
    errorResponse(
      ErrorCodes.RATE_LIMIT_EXCEEDED,
      `Trop de requêtes. Réessayez dans ${retryAfter} secondes`,
      429
    ),
  internalError: (message: string = 'Erreur serveur interne') =>
    errorResponse(ErrorCodes.INTERNAL_ERROR, message, 500),
  stripeError: (message: string) =>
    errorResponse(ErrorCodes.STRIPE_ERROR, message, 400),
};
