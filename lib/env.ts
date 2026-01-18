import { z } from "zod";

/**
 * Schéma de validation des variables d'environnement
 *
 * Ce fichier valide toutes les variables d'environnement requises
 * au démarrage de l'application pour éviter les erreurs en runtime.
 */

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, "DATABASE_URL est requis"),

  // JWT
  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET doit contenir au moins 32 caractères"),

  // Stripe
  STRIPE_SECRET_KEY: z
    .string()
    .startsWith("sk_", "STRIPE_SECRET_KEY doit commencer par 'sk_'"),
  STRIPE_WEBHOOK_SECRET: z
    .string()
    .startsWith("whsec_", "STRIPE_WEBHOOK_SECRET doit commencer par 'whsec_'"),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z
    .string()
    .startsWith("pk_", "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY doit commencer par 'pk_'"),

  // Stripe Price IDs
  STRIPE_PRICE_ID_STANDARD: z
    .string()
    .startsWith("price_", "STRIPE_PRICE_ID_STANDARD doit commencer par 'price_'"),
  STRIPE_PRICE_ID_PRO: z
    .string()
    .startsWith("price_", "STRIPE_PRICE_ID_PRO doit commencer par 'price_'"),

  // Application
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url("NEXT_PUBLIC_APP_URL doit être une URL valide"),

  // Email (optionnel en développement)
  GMAIL_USER: z.string().email().optional(),
  GMAIL_APP_PASSWORD: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),
  EMAIL_FROM_NAME: z.string().optional(),

  // Node environment
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // Redis (optionnel - pour rate limiting en production)
  REDIS_URL: z.string().url().optional(),
  KV_REST_API_URL: z.string().url().optional(),
});

// Type des variables d'environnement validées
export type Env = z.infer<typeof envSchema>;

/**
 * Valide les variables d'environnement
 *
 * En développement: affiche des warnings pour les variables manquantes
 * En production: lance une erreur si des variables critiques manquent
 */
export function validateEnv(): Env {
  const isProduction = process.env.NODE_ENV === "production";

  try {
    // En développement, on parse avec des valeurs par défaut plus souples
    if (!isProduction) {
      const devSchema = envSchema.extend({
        // Variables optionnelles en développement
        DATABASE_URL: z.string().default("postgresql://localhost:5432/cloudstorage"),
        JWT_SECRET: z.string().default("dev-secret-key-minimum-32-characters-long"),
        STRIPE_SECRET_KEY: z.string().default("sk_test_placeholder"),
        STRIPE_WEBHOOK_SECRET: z.string().default("whsec_placeholder"),
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().default("pk_test_placeholder"),
        STRIPE_PRICE_ID_STANDARD: z.string().default("price_placeholder_standard"),
        STRIPE_PRICE_ID_PRO: z.string().default("price_placeholder_pro"),
        NEXT_PUBLIC_APP_URL: z.string().default("http://localhost:3000"),
      });

      const result = devSchema.safeParse(process.env);

      if (!result.success) {
        console.warn("⚠️  Variables d'environnement manquantes (mode développement):");
        result.error.issues.forEach((issue) => {
          console.warn(`   - ${issue.path.join(".")}: ${issue.message}`);
        });
      }

      return result.success ? result.data : (process.env as unknown as Env);
    }

    // En production, validation stricte
    const result = envSchema.safeParse(process.env);

    if (!result.success) {
      console.error("❌ Erreur de configuration des variables d'environnement:");
      result.error.issues.forEach((issue) => {
        console.error(`   - ${issue.path.join(".")}: ${issue.message}`);
      });
      throw new Error(
        "Configuration invalide. Vérifiez vos variables d'environnement."
      );
    }

    return result.data;
  } catch (error) {
    if (isProduction) {
      throw error;
    }
    // En développement, on continue même avec des erreurs
    console.warn("⚠️  Erreur lors de la validation des variables d'environnement");
    return process.env as unknown as Env;
  }
}

/**
 * Variables d'environnement validées
 * Utiliser cette variable plutôt que process.env directement
 */
export const env = validateEnv();

/**
 * Vérifie si toutes les variables critiques sont configurées
 */
export function checkCriticalEnvVars(): {
  isValid: boolean;
  missing: string[];
  warnings: string[];
} {
  const missing: string[] = [];
  const warnings: string[] = [];

  // Variables critiques
  const critical = [
    "DATABASE_URL",
    "JWT_SECRET",
    "STRIPE_SECRET_KEY",
    "NEXT_PUBLIC_APP_URL",
  ];

  // Variables importantes mais non critiques
  const important = [
    "STRIPE_WEBHOOK_SECRET",
    "STRIPE_PRICE_ID_STANDARD",
    "STRIPE_PRICE_ID_PRO",
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  ];

  // Variables optionnelles
  const optional = [
    "GMAIL_USER",
    "GMAIL_APP_PASSWORD",
    "EMAIL_FROM",
    "EMAIL_FROM_NAME",
    "REDIS_URL",
  ];

  critical.forEach((key) => {
    if (!process.env[key]) {
      missing.push(key);
    }
  });

  important.forEach((key) => {
    if (!process.env[key]) {
      warnings.push(`${key} non configuré (fonctionnalité limitée)`);
    }
  });

  optional.forEach((key) => {
    if (!process.env[key]) {
      warnings.push(`${key} non configuré (optionnel)`);
    }
  });

  return {
    isValid: missing.length === 0,
    missing,
    warnings,
  };
}

/**
 * Affiche un rapport de configuration au démarrage
 */
export function printEnvReport(): void {
  const { isValid, missing, warnings } = checkCriticalEnvVars();
  const isProduction = process.env.NODE_ENV === "production";

  console.log("\n📋 Rapport de configuration:");
  console.log(`   Environnement: ${process.env.NODE_ENV || "development"}`);

  if (isValid) {
    console.log("   ✅ Toutes les variables critiques sont configurées");
  } else {
    console.log("   ❌ Variables critiques manquantes:");
    missing.forEach((key) => console.log(`      - ${key}`));
  }

  if (warnings.length > 0 && !isProduction) {
    console.log("   ⚠️  Avertissements:");
    warnings.slice(0, 5).forEach((warning) => console.log(`      - ${warning}`));
    if (warnings.length > 5) {
      console.log(`      ... et ${warnings.length - 5} autres`);
    }
  }

  console.log("");
}
