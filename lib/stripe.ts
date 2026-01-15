import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY manquant dans les variables d\'environnement');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia' as any,
});

type SubscriptionPlan = {
  name: string;
  storageLimit: number;
  price: number;
  priceId: string;
  features: string[];
};

export const SUBSCRIPTION_PLANS: Record<'FREE' | 'STANDARD' | 'PRO', SubscriptionPlan> = {
  FREE: {
    name: 'Free',
    storageLimit: 5 * 1024 * 1024 * 1024,
    price: 0,
    priceId: '',
    features: [
      '5 Go de stockage',
      'Partage de fichiers basique',
      'Support communautaire',
    ],
  },
  STANDARD: {
    name: 'Standard',
    storageLimit: 500 * 1024 * 1024 * 1024,
    price: 9.99,
    priceId: process.env.STRIPE_PRICE_ID_STANDARD || '',
    features: [
      '500 Go de stockage',
      'Partage de fichiers avancé',
      'Support prioritaire',
      'Historique des versions',
    ],
  },
  PRO: {
    name: 'Pro',
    storageLimit: 2 * 1024 * 1024 * 1024 * 1024,
    price: 29.99,
    priceId: process.env.STRIPE_PRICE_ID_PRO || '',
    features: [
      '2 To de stockage',
      'Partage de fichiers illimité',
      'Support premium 24/7',
      'Historique illimité',
      'API d\'accès',
      'Chiffrement avancé',
    ],
  },
};

export type PlanType = keyof typeof SUBSCRIPTION_PLANS;


