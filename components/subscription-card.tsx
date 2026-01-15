'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface SubscriptionData {
  planType: 'FREE' | 'STANDARD' | 'PRO';
  status: string;
  storageLimit: string;
  storageUsed: string;
  stripeCurrentPeriodEnd?: string;
  cancelAtPeriodEnd: boolean;
}

const planNames = {
  FREE: 'Gratuit',
  STANDARD: 'Standard',
  PRO: 'Pro',
};

const planPrices = {
  FREE: '0€',
  STANDARD: '9.99€',
  PRO: '29.99€',
};

const planStorage = {
  FREE: '5 Go',
  STANDARD: '500 Go',
  PRO: '2 To',
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
      const response = await fetch(`/api/subscription?userId=${userId}`);
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
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur');
      }

      toast.success('Abonnement synchronisé !');
      await fetchSubscription();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la synchronisation');
    } finally {
      setSyncLoading(false);
    }
  };

  const formatBytes = (bytes: string) => {
    const num = Number(bytes);
    if (num === 0) return '0 Go';
    const k = 1024;
    const sizes = ['octets', 'Ko', 'Mo', 'Go', 'To'];
    const i = Math.floor(Math.log(num) / Math.log(k));
    return Math.round((num / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getStoragePercentage = () => {
    if (!subscription) return 0;
    // Données simulées pour la démo
    const fakeUsedGo = 4.77;
    const limitGo = subscription.planType === 'FREE' ? 5 : subscription.planType === 'STANDARD' ? 500 : 2000;
    return Math.round((fakeUsedGo / limitGo) * 100);
  };

  const getFakeStorageUsed = () => {
    return '4.77 Go';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mon abonnement</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Chargement...</p>
        </CardContent>
      </Card>
    );
  }

  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mon abonnement</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Aucun abonnement trouvé</p>
        </CardContent>
        <CardFooter>
          <Button onClick={handleUpgrade}>Choisir un plan</Button>
        </CardFooter>
      </Card>
    );
  }

  const statusColors: Record<string, string> = {
    ACTIVE: 'bg-green-500',
    INACTIVE: 'bg-gray-500',
    PAST_DUE: 'bg-orange-500',
    CANCELED: 'bg-red-500',
    TRIALING: 'bg-blue-500',
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Mon abonnement</CardTitle>
          <Badge variant="outline" className={statusColors[subscription.status]}>
            {subscription.status}
          </Badge>
        </div>
        <CardDescription>
          Plan {planNames[subscription.planType]} - {planPrices[subscription.planType]}/mois - {planStorage[subscription.planType]} de stockage
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Stockage utilisé</span>
            <span className="text-sm font-medium">{getStoragePercentage()}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${Math.min(getStoragePercentage(), 100)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {getFakeStorageUsed()} sur {planStorage[subscription.planType]}
          </p>
        </div>

        {subscription.stripeCurrentPeriodEnd && (
          <div>
            <p className="text-sm text-muted-foreground">
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
        )}

        {subscription.cancelAtPeriodEnd && (
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
            <p className="text-sm text-orange-600 dark:text-orange-400">
              Votre abonnement sera annulé à la fin de la période en cours.
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button onClick={handleUpgrade} className="w-full">
          {subscription.planType === 'FREE' ? 'Mettre à niveau' : 'Changer de plan'}
        </Button>
      </CardFooter>
    </Card>
  );
}


