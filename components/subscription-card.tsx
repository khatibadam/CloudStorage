'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Sparkles, Zap, Crown, ArrowRight, RefreshCw, HardDrive } from 'lucide-react';

interface SubscriptionData {
  planType: 'FREE' | 'STANDARD' | 'PRO';
  status: string;
  storageLimit: string;
  storageUsed: string;
  stripeCurrentPeriodEnd?: string;
  cancelAtPeriodEnd: boolean;
}

const planConfig = {
  FREE: {
    name: 'Gratuit',
    price: '0€',
    storage: '5 Go',
    icon: Sparkles,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/50',
    gradient: 'from-slate-500/20 to-slate-600/10',
  },
  STANDARD: {
    name: 'Standard',
    price: '9.99€',
    storage: '500 Go',
    icon: Zap,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    gradient: 'from-primary/20 to-accent/10',
  },
  PRO: {
    name: 'Pro',
    price: '29.99€',
    storage: '2 To',
    icon: Crown,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    gradient: 'from-amber-500/20 to-orange-500/10',
  },
};

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  ACTIVE: { label: 'Actif', color: 'text-emerald-600', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  INACTIVE: { label: 'Inactif', color: 'text-slate-600', bg: 'bg-slate-500/10 border-slate-500/20' },
  PAST_DUE: { label: 'En retard', color: 'text-orange-600', bg: 'bg-orange-500/10 border-orange-500/20' },
  CANCELED: { label: 'Annule', color: 'text-red-600', bg: 'bg-red-500/10 border-red-500/20' },
  TRIALING: { label: 'Essai', color: 'text-blue-600', bg: 'bg-blue-500/10 border-blue-500/20' },
};

export function SubscriptionCard({ userId }: { userId: string }) {
  const router = useRouter();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchSubscription();
    }
  }, [userId]);

  const fetchSubscription = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/subscription?userId=${userId}`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
      }
    } catch (error) {
      console.error('Erreur chargement abonnement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setActionLoading(true);
    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur');
      }

      window.location.href = data.url;
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'ouverture du portail');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpgrade = () => {
    router.push('/pricing');
  };

  const handleSync = async () => {
    setSyncLoading(true);
    try {
      const response = await fetch('/api/subscription/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur');
      }

      toast.success('Abonnement synchronise !');
      await fetchSubscription();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la synchronisation');
    } finally {
      setSyncLoading(false);
    }
  };

  const getStoragePercentage = () => {
    if (!subscription) return 0;
    const fakeUsedGo = 4.77;
    const limitGo = subscription.planType === 'FREE' ? 5 : subscription.planType === 'STANDARD' ? 500 : 2000;
    return Math.round((fakeUsedGo / limitGo) * 100);
  };

  const getFakeStorageUsed = () => {
    return '4.77 Go';
  };

  if (loading) {
    return (
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-card to-muted/30 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <HardDrive className="h-4 w-4 text-primary" />
            </div>
            Mon abonnement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground mt-2">Chargement...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!subscription) {
    return (
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-card to-muted/30 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <HardDrive className="h-4 w-4 text-primary" />
            </div>
            Mon abonnement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Aucun abonnement trouve</p>
        </CardContent>
        <CardFooter>
          <Button onClick={handleUpgrade} className="w-full gap-2">
            Choisir un plan
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const plan = planConfig[subscription.planType];
  const status = statusConfig[subscription.status] || statusConfig.INACTIVE;
  const Icon = plan.icon;
  const percentage = getStoragePercentage();

  return (
    <Card className="overflow-hidden border-0 bg-gradient-to-br from-card to-muted/30 shadow-sm hover:shadow-md transition-shadow">
      {/* Gradient top bar */}
      <div className={`h-1 bg-gradient-to-r ${plan.gradient.replace('from-', 'from-').replace('/20', '').replace('/10', '')} from-primary to-accent`} />

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className={`h-8 w-8 rounded-lg ${plan.bgColor} flex items-center justify-center`}>
              <Icon className={`h-4 w-4 ${plan.color}`} />
            </div>
            Mon abonnement
          </CardTitle>
          <Badge variant="outline" className={`${status.bg} ${status.color} border font-medium`}>
            {status.label}
          </Badge>
        </div>
        <CardDescription className="mt-2">
          <span className="font-semibold text-foreground">{plan.name}</span>
          {' - '}
          <span className="text-primary font-medium">{plan.price}/mois</span>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Storage progress */}
        <div className="p-3 rounded-xl bg-muted/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Stockage utilise</span>
            <span className="text-sm font-bold text-primary">{percentage}%</span>
          </div>
          <div className="w-full bg-background rounded-full h-2.5 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${Math.min(percentage, 100)}%`,
                background: `linear-gradient(90deg, oklch(0.55 0.25 275), oklch(0.7 0.2 200))`,
              }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            <span className="font-medium text-foreground">{getFakeStorageUsed()}</span> sur {plan.storage}
          </p>
        </div>

        {subscription.stripeCurrentPeriodEnd && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
            <div>
              <p className="text-xs text-muted-foreground">
                {subscription.cancelAtPeriodEnd ? 'Se termine le' : 'Renouvellement le'}
              </p>
              <p className="text-sm font-medium">
                {new Date(subscription.stripeCurrentPeriodEnd).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSync}
              disabled={syncLoading}
              className="h-8 w-8"
            >
              <RefreshCw className={`h-4 w-4 ${syncLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        )}

        {subscription.cancelAtPeriodEnd && (
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3">
            <p className="text-sm text-orange-600 dark:text-orange-400">
              Votre abonnement sera annule a la fin de la periode en cours.
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-2">
        <Button onClick={handleUpgrade} className="w-full gap-2 glow-sm">
          {subscription.planType === 'FREE' ? 'Mettre a niveau' : 'Changer de plan'}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
