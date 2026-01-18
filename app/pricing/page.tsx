'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, ArrowLeft, Sparkles, Zap, Crown } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Logo } from '@/components/logo';

const plans = [
  {
    name: 'Free',
    price: 0,
    storage: '5 Go',
    planType: 'FREE',
    icon: Sparkles,
    features: [
      '5 Go de stockage',
      'Partage de fichiers basique',
      'Support communautaire',
    ],
    popular: false,
    gradient: 'from-muted/50 to-muted/20',
  },
  {
    name: 'Standard',
    price: 9.99,
    storage: '500 Go',
    planType: 'STANDARD',
    icon: Zap,
    features: [
      '500 Go de stockage',
      'Partage de fichiers avance',
      'Support prioritaire',
      'Historique des versions',
    ],
    popular: true,
    gradient: 'from-primary/20 via-primary/10 to-accent/10',
  },
  {
    name: 'Pro',
    price: 29.99,
    storage: '2 To',
    planType: 'PRO',
    icon: Crown,
    features: [
      '2 To de stockage',
      'Partage de fichiers illimite',
      'Support premium 24/7',
      'Historique illimite',
      "API d'acces",
      'Chiffrement avance',
    ],
    popular: false,
    gradient: 'from-accent/20 to-primary/10',
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
      toast.info('Vous utilisez deja ce plan !');
      return;
    }

    if (!isAuthenticated || !user) {
      toast.error('Veuillez vous connecter pour souscrire a un plan');
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
        throw new Error(data.error || 'Erreur lors de la creation de la session');
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
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Plans d'abonnement</h1>
          <p className="text-muted-foreground mt-1">
            Choisissez le plan adapte a vos besoins
          </p>
        </div>
        {isAuthenticated && user && (
          <Button variant="outline" onClick={handleManageSubscription} className="gap-2">
            Gerer mon abonnement
          </Button>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6 mt-4">
        {plans.map((plan) => {
          const Icon = plan.icon;
          return (
            <Card
              key={plan.planType}
              className={`relative flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl ${
                plan.popular
                  ? 'border-primary shadow-lg ring-2 ring-primary/20'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              {/* Gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${plan.gradient} opacity-50`} />

              {plan.popular && (
                <div className="absolute -top-px left-0 right-0 h-1 gradient-primary" />
              )}

              {plan.popular && (
                <div className="absolute top-4 right-4">
                  <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                    Populaire
                  </span>
                </div>
              )}

              <CardHeader className="relative text-center pb-4 pt-8">
                <div className={`h-14 w-14 mx-auto rounded-2xl flex items-center justify-center mb-4 ${
                  plan.popular ? 'gradient-primary' : 'bg-primary/10'
                }`}>
                  <Icon className={`h-7 w-7 ${plan.popular ? 'text-white' : 'text-primary'}`} />
                </div>
                <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                <div className="mb-2">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-2xl font-bold">€</span>
                  {plan.price > 0 && (
                    <span className="text-muted-foreground">/mois</span>
                  )}
                </div>
                <CardDescription className="text-base font-medium">
                  {plan.storage} de stockage
                </CardDescription>
              </CardHeader>

              <CardContent className="relative flex-grow">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="h-5 w-5 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="h-3 w-3 text-success" />
                      </div>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="relative pt-4">
                <Button
                  className={`w-full ${plan.popular ? 'glow-sm' : ''}`}
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
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          Tous les plans incluent un chiffrement de bout en bout et une disponibilite de 99.9%
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Vous pouvez annuler votre abonnement a tout moment
        </p>
      </div>
    </div>
  );
}

function PublicPricingPage() {
  const router = useRouter();
  const { isLoading } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Gradient background effect */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-1/2 -left-40 h-[400px] w-[400px] rounded-full bg-accent/20 blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Logo size="md" />
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Connexion</Button>
            </Link>
            <Link href="/signup">
              <Button className="glow-sm">Commencer</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour a l'accueil
            </Link>
          </div>

          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              Tarification simple et transparente
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Choisissez <span className="gradient-text">votre plan</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Stockez vos fichiers en toute securite avec notre service cloud.
              Commencez gratuitement et evoluez selon vos besoins.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => {
              const Icon = plan.icon;
              return (
                <Card
                  key={plan.planType}
                  className={`relative flex flex-col overflow-hidden transition-all duration-300 hover:shadow-2xl ${
                    plan.popular
                      ? 'border-primary shadow-xl ring-2 ring-primary/20 scale-105'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  {/* Gradient background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${plan.gradient} opacity-50`} />

                  {plan.popular && (
                    <div className="absolute -top-px left-0 right-0 h-1 gradient-primary" />
                  )}

                  {plan.popular && (
                    <div className="absolute top-4 right-4">
                      <span className="bg-primary text-primary-foreground text-sm font-semibold px-4 py-1.5 rounded-full shadow-lg">
                        Populaire
                      </span>
                    </div>
                  )}

                  <CardHeader className="relative text-center pb-6 pt-10">
                    <div className={`h-16 w-16 mx-auto rounded-2xl flex items-center justify-center mb-4 ${
                      plan.popular ? 'gradient-primary glow-sm' : 'bg-primary/10'
                    }`}>
                      <Icon className={`h-8 w-8 ${plan.popular ? 'text-white' : 'text-primary'}`} />
                    </div>
                    <CardTitle className="text-2xl mb-3">{plan.name}</CardTitle>
                    <div className="mb-2">
                      <span className="text-5xl font-bold">{plan.price}</span>
                      <span className="text-2xl font-bold">€</span>
                      {plan.price > 0 && (
                        <span className="text-muted-foreground text-lg">/mois</span>
                      )}
                    </div>
                    <CardDescription className="text-lg font-semibold">
                      {plan.storage} de stockage
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="relative flex-grow">
                    <ul className="space-y-4">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="h-5 w-5 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="h-3 w-3 text-success" />
                          </div>
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  <CardFooter className="relative pt-4 pb-8">
                    <Button
                      className={`w-full h-12 text-base ${plan.popular ? 'glow' : ''}`}
                      size="lg"
                      variant={plan.popular ? 'default' : 'outline'}
                      onClick={() => router.push('/signup')}
                      disabled={isLoading}
                    >
                      Commencer
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-6 flex-wrap justify-center">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="h-4 w-4 text-success" />
                Chiffrement bout en bout
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="h-4 w-4 text-success" />
                99.9% de disponibilite
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="h-4 w-4 text-success" />
                Annulation a tout moment
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; 2026 CloudStorage. Tous droits reserves.
        </div>
      </footer>
    </div>
  );
}

export default function PricingPage() {
  const { user, subscription, isLoading, isAuthenticated, isReady } = useAuth();

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

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

  return <PublicPricingPage />;
}
