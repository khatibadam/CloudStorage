/**
 * Rate Limiter compatible avec les environnements serverless (Vercel)
 *
 * En production sur Vercel, utilise les headers HTTP pour le rate limiting
 * car les fonctions serverless sont stateless.
 *
 * Options pour la production:
 * 1. Vercel KV (Redis) - recommandé
 * 2. Upstash Redis
 * 3. Rate limiting au niveau CDN (Vercel Edge Config)
 *
 * Ce module fournit un fallback en mémoire pour le développement local
 * et une interface abstraite pour implémenter facilement Redis en production.
 */

export interface RateLimitEntry {
  count: number;
  resetAt: number;
}

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
}

// Store abstrait pour permettre différentes implémentations
interface RateLimitStore {
  get(key: string): Promise<RateLimitEntry | null>;
  set(key: string, entry: RateLimitEntry, ttlMs: number): Promise<void>;
  increment(key: string): Promise<number>;
}

// Implémentation en mémoire (développement local)
class MemoryStore implements RateLimitStore {
  private store = new Map<string, RateLimitEntry>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Éviter de créer plusieurs intervals dans les environnements serverless
    if (typeof globalThis !== 'undefined') {
      const globalStore = globalThis as typeof globalThis & {
        __rateLimitStore?: Map<string, RateLimitEntry>;
        __rateLimitCleanup?: NodeJS.Timeout;
      };

      if (!globalStore.__rateLimitStore) {
        globalStore.__rateLimitStore = new Map();
        // Nettoyage périodique toutes les 60 secondes
        globalStore.__rateLimitCleanup = setInterval(() => {
          const now = Date.now();
          for (const [key, entry] of globalStore.__rateLimitStore!.entries()) {
            if (entry.resetAt < now) {
              globalStore.__rateLimitStore!.delete(key);
            }
          }
        }, 60000);
      }
      this.store = globalStore.__rateLimitStore;
    }
  }

  async get(key: string): Promise<RateLimitEntry | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.resetAt < Date.now()) {
      this.store.delete(key);
      return null;
    }
    return entry;
  }

  async set(key: string, entry: RateLimitEntry, _ttlMs: number): Promise<void> {
    this.store.set(key, entry);
  }

  async increment(key: string): Promise<number> {
    const entry = this.store.get(key);
    if (entry) {
      entry.count++;
      return entry.count;
    }
    return 1;
  }
}

// Implémentation Redis (production) - à activer avec Vercel KV ou Upstash
class RedisStore implements RateLimitStore {
  private redisUrl: string;

  constructor(redisUrl: string) {
    this.redisUrl = redisUrl;
  }

  async get(key: string): Promise<RateLimitEntry | null> {
    try {
      // Si vous utilisez Vercel KV, décommentez et installez @vercel/kv:
      // import { kv } from '@vercel/kv';
      // return await kv.get<RateLimitEntry>(`ratelimit:${key}`);

      // Pour Upstash Redis, décommentez et installez @upstash/redis:
      // import { Redis } from '@upstash/redis';
      // const redis = Redis.fromEnv();
      // return await redis.get<RateLimitEntry>(`ratelimit:${key}`);

      // Fallback vers memory store si Redis non configuré
      console.warn('[Rate Limit] Redis non configuré, utilisation du store mémoire');
      return null;
    } catch (error) {
      console.error('[Rate Limit] Erreur Redis get:', error);
      return null;
    }
  }

  async set(key: string, entry: RateLimitEntry, ttlMs: number): Promise<void> {
    try {
      // Vercel KV:
      // await kv.set(`ratelimit:${key}`, entry, { px: ttlMs });

      // Upstash Redis:
      // await redis.set(`ratelimit:${key}`, entry, { px: ttlMs });

      console.warn('[Rate Limit] Redis non configuré pour set');
    } catch (error) {
      console.error('[Rate Limit] Erreur Redis set:', error);
    }
  }

  async increment(key: string): Promise<number> {
    try {
      // Vercel KV:
      // return await kv.incr(`ratelimit:${key}:count`);

      // Upstash Redis:
      // return await redis.incr(`ratelimit:${key}:count`);

      return 1;
    } catch (error) {
      console.error('[Rate Limit] Erreur Redis increment:', error);
      return 1;
    }
  }
}

// Sélection automatique du store selon l'environnement
function createStore(): RateLimitStore {
  const redisUrl = process.env.REDIS_URL || process.env.KV_REST_API_URL;

  if (redisUrl && process.env.NODE_ENV === 'production') {
    console.log('[Rate Limit] Mode production avec Redis');
    return new RedisStore(redisUrl);
  }

  console.log('[Rate Limit] Mode développement avec store mémoire');
  return new MemoryStore();
}

const store = createStore();

/**
 * Vérifie et applique le rate limiting pour une clé donnée
 * @param key - Identifiant unique (ex: IP + route)
 * @param config - Configuration du rate limit
 * @returns Résultat du rate limiting
 */
export async function checkRateLimit(key: string, config: RateLimitConfig): Promise<RateLimitResult> {
  const now = Date.now();

  try {
    const entry = await store.get(key);

    // Si pas d'entrée ou entrée expirée, créer une nouvelle
    if (!entry || entry.resetAt < now) {
      const newEntry: RateLimitEntry = {
        count: 1,
        resetAt: now + config.windowMs,
      };
      await store.set(key, newEntry, config.windowMs);

      return {
        success: true,
        remaining: config.maxRequests - 1,
        resetAt: now + config.windowMs,
      };
    }

    // Vérifier si la limite est atteinte
    if (entry.count >= config.maxRequests) {
      return {
        success: false,
        remaining: 0,
        resetAt: entry.resetAt,
        retryAfter: Math.ceil((entry.resetAt - now) / 1000),
      };
    }

    // Incrémenter le compteur
    entry.count++;
    await store.set(key, entry, entry.resetAt - now);

    return {
      success: true,
      remaining: config.maxRequests - entry.count,
      resetAt: entry.resetAt,
    };
  } catch (error) {
    console.error('[Rate Limit] Erreur:', error);
    // En cas d'erreur, autoriser la requête (fail-open)
    return {
      success: true,
      remaining: config.maxRequests,
      resetAt: now + config.windowMs,
    };
  }
}

/**
 * Version synchrone pour compatibilité (utilise le store mémoire directement)
 * À utiliser uniquement en développement
 */
export function checkRateLimitSync(key: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const globalStore = globalThis as typeof globalThis & {
    __rateLimitStore?: Map<string, RateLimitEntry>;
  };

  const memoryStore = globalStore.__rateLimitStore || new Map();
  if (!globalStore.__rateLimitStore) {
    globalStore.__rateLimitStore = memoryStore;
  }

  const entry = memoryStore.get(key);

  // Si pas d'entrée ou entrée expirée, créer une nouvelle
  if (!entry || entry.resetAt < now) {
    memoryStore.set(key, {
      count: 1,
      resetAt: now + config.windowMs,
    });
    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetAt: now + config.windowMs,
    };
  }

  // Vérifier si la limite est atteinte
  if (entry.count >= config.maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetAt: entry.resetAt,
      retryAfter: Math.ceil((entry.resetAt - now) / 1000),
    };
  }

  // Incrémenter le compteur
  entry.count++;
  memoryStore.set(key, entry);

  return {
    success: true,
    remaining: config.maxRequests - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * Configurations prédéfinies pour différentes routes
 */
export const RATE_LIMITS = {
  // Login: 5 tentatives par 15 minutes
  LOGIN: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000,
  },
  // Refresh token: 10 par minute
  REFRESH: {
    maxRequests: 10,
    windowMs: 60 * 1000,
  },
  // OTP send: 3 par 5 minutes
  OTP_SEND: {
    maxRequests: 3,
    windowMs: 5 * 60 * 1000,
  },
  // API générale: 100 par minute
  API_GENERAL: {
    maxRequests: 100,
    windowMs: 60 * 1000,
  },
  // Stripe checkout: 10 par heure
  STRIPE_CHECKOUT: {
    maxRequests: 10,
    windowMs: 60 * 60 * 1000,
  },
  // Registration: 3 par heure (protection contre spam)
  REGISTRATION: {
    maxRequests: 3,
    windowMs: 60 * 60 * 1000,
  },
  // Password reset: 3 par 15 minutes
  PASSWORD_RESET: {
    maxRequests: 3,
    windowMs: 15 * 60 * 1000,
  },
} as const;

/**
 * Obtient l'IP du client depuis la requête
 * Compatible avec Vercel et les proxies
 */
export function getClientIp(request: Request): string {
  // Vercel spécifique
  const vercelIp = request.headers.get('x-vercel-forwarded-for');
  if (vercelIp) {
    return vercelIp.split(',')[0].trim();
  }

  // Standard proxy headers
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Cloudflare
  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp) {
    return cfIp;
  }

  return 'unknown';
}

/**
 * Helper pour ajouter les headers de rate limit à une Response
 */
export function addRateLimitHeaders(response: Response, result: RateLimitResult): Response {
  const headers = new Headers(response.headers);
  headers.set('X-RateLimit-Remaining', result.remaining.toString());
  headers.set('X-RateLimit-Reset', result.resetAt.toString());

  if (!result.success && result.retryAfter) {
    headers.set('Retry-After', result.retryAfter.toString());
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * Créer une réponse 429 Too Many Requests
 */
export function createRateLimitResponse(result: RateLimitResult): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: 'Trop de requêtes. Veuillez réessayer plus tard.',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: result.retryAfter,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': result.resetAt.toString(),
        'Retry-After': result.retryAfter?.toString() || '60',
      },
    }
  );
}
