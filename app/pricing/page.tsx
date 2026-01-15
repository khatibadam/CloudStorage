'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';

const plans = [
  {
    name: 'Free',
    price: 0,
    storage: '5 Go',
    planType: 'FREE',
    features: [
      '5 Go de stockage',
      'Partage de fichiers basique',
      'Support communautaire',
    ],
    popular: false,
  },
  {
    name: 'Standard',
    price: 9.99,
    storage: '500 Go',
    planType: 'STANDARD',
    features: [
      '500 Go de stockage',
      'Partage de fichiers avancé',
      'Support prioritaire',
      'Historique des versions',
    ],
    popular: true,
  },
  {
    name: 'Pro',
    price: 29.99,
    storage: '2 To',
    planType: 'PRO',
    features: [
      '2 To de stockage',
      'Partage de fichiers illimité',
      'Support premium 24/7',
      'Historique illimité',
      "API d'accès",
      'Chiffrement avancé',
    ],
    popular: false,
  },
];

export default function PricingPage() {
  const router = useRouter();
  const { user, isReady } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (planType: string) => {
    if (planType === 'FREE') {
      toast.info('Vous utilisez déjà le plan gratuit !');
      return;
    }

    let currentUser = user;
    
    if (!currentUser && typeof window !== 'undefined') {
      const userStr = sessionStorage.getItem('user');
      if (userStr) {
        try {
          currentUser = JSON.parse(userStr);
        } catch (e) {
          console.error('Erreur parsing user:', e);
        }
      }
    }

    if (!currentUser || !currentUser.id_user) {
      toast.error('Veuillez vous connecter');
      router.push('/login');
      return;
    }

    setLoading(planType);

    try {

      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planType,
          userId: currentUser.id_user,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la création de la session');
      }

      // Rediriger vers Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(error.message || 'Une erreur est survenue');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Link>
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Choisissez votre plan
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Stockez vos fichiers en toute sécurité avec notre service cloud.
            Commencez gratuitement et évoluez selon vos besoins.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.planType}
              className={`relative flex flex-col ${
                plan.popular
                  ? 'border-primary shadow-2xl scale-105'
                  : 'border-border'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-sm font-semibold px-4 py-1 rounded-full">
                    Populaire
                  </span>
                </div>
              )}

              <CardHeader className="text-center pb-8 pt-8">
                <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                <div className="mb-2">
                  <span className="text-5xl font-bold">{plan.price}€</span>
                  {plan.price > 0 && (
                    <span className="text-muted-foreground">/mois</span>
                  )}
                </div>
                <CardDescription className="text-lg font-semibold">
                  {plan.storage} de stockage
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-grow">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  className="w-full"
                  size="lg"
                  variant={plan.popular ? 'default' : 'outline'}
                  onClick={() => handleSubscribe(plan.planType)}
                  disabled={loading === plan.planType}
                >
                  {loading === plan.planType
                    ? 'Chargement...'
                    : plan.price === 0
                    ? 'Plan actuel'
                    : 'Commencer'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground">
            Tous les plans incluent un chiffrement de bout en bout et une
            disponibilité de 99.9%
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Vous pouvez annuler votre abonnement à tout moment
          </p>
        </div>
      </div>
    </div>
  );
}


