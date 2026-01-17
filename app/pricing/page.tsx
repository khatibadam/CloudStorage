'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, ArrowLeft, Cloud } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

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

function PricingContent({
  isAuthenticated,
  user,
  isLoading,
  currentPlanType
}: {
  isAuthenticated: boolean;
  user: any;
  isLoading: boolean;
  currentPlanType: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (planType: string) => {
    if (planType === currentPlanType) {
      toast.info('Vous utilisez déjà ce plan !');
      return;
    }

    if (!isAuthenticated || !user) {
      toast.error('Veuillez vous connecter pour souscrire à un plan');
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
        credentials: 'include',
        body: JSON.stringify({
          planType,
          userId: user.id_user,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la création de la session');
      }

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

  const handleManageSubscription = async () => {
    if (!isAuthenticated || !user) {
      toast.error('Veuillez vous connecter');
      router.push('/login');
      return;
    }

    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ userId: user.id_user }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur');
      }

      window.location.href = data.url;
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'ouverture du portail');
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Plans d'abonnement</h1>
          <p className="text-muted-foreground mt-1">
            Choisissez le plan adapté à vos besoins
          </p>
        </div>
        {isAuthenticated && user && (
          <Button variant="outline" onClick={handleManageSubscription}>
            Gérer mon abonnement
          </Button>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6 mt-8">
        {plans.map((plan) => (
          <Card
            key={plan.planType}
            className={`relative flex flex-col ${
              plan.popular
                ? 'border-primary shadow-xl scale-[1.02]'
                : 'border-border'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                  Populaire
                </span>
              </div>
            )}

            <CardHeader className="text-center pb-6 pt-6">
              <CardTitle className="text-xl mb-2">{plan.name}</CardTitle>
              <div className="mb-2">
                <span className="text-4xl font-bold">{plan.price}€</span>
                {plan.price > 0 && (
                  <span className="text-muted-foreground">/mois</span>
                )}
              </div>
              <CardDescription className="text-base font-medium">
                {plan.storage} de stockage
              </CardDescription>
            </CardHeader>

            <CardContent className="flex-grow">
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter>
              <Button
                className="w-full"
                variant={plan.planType === currentPlanType ? 'secondary' : plan.popular ? 'default' : 'outline'}
                onClick={() => handleSubscribe(plan.planType)}
                disabled={loading === plan.planType || isLoading || plan.planType === currentPlanType}
              >
                {loading === plan.planType
                  ? 'Chargement...'
                  : plan.planType === currentPlanType
                  ? 'Plan actuel'
                  : 'Souscrire'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          Tous les plans incluent un chiffrement de bout en bout et une disponibilité de 99.9%
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Vous pouvez annuler votre abonnement à tout moment
        </p>
      </div>
    </div>
  );
}

function PublicPricingPage() {
  const router = useRouter();
  const { isLoading, isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Cloud className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">CloudStorage</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Connexion</Button>
            </Link>
            <Link href="/signup">
              <Button>Commencer</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour à l'accueil
            </Link>
          </div>
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
                    onClick={() => router.push('/login')}
                    disabled={isLoading}
                  >
                    Se connecter
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
    </div>
  );
}

export default function PricingPage() {
  const { user, subscription, isLoading, isAuthenticated, isReady } = useAuth();

  // Afficher un loader pendant le chargement initial
  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Chargement...</p>
      </div>
    );
  }

  // Si authentifié, afficher avec le layout sidebar
  if (isAuthenticated && user) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <h1 className="text-lg font-semibold">Plans d'abonnement</h1>
          </header>
          <PricingContent
            isAuthenticated={isAuthenticated}
            user={user}
            isLoading={isLoading}
            currentPlanType={subscription?.planType || 'FREE'}
          />
        </SidebarInset>
      </SidebarProvider>
    );
  }

  // Sinon, afficher la page publique
  return <PublicPricingPage />;
}
