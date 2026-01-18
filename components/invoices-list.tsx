'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { IconDotsVertical, IconDownload, IconExternalLink, IconX, IconRefresh } from '@tabler/icons-react';

interface Invoice {
  id: string;
  stripeInvoiceId: string;
  amountDue: number;
  amountPaid: number;
  currency: string;
  status: 'DRAFT' | 'OPEN' | 'PAID' | 'VOID' | 'UNCOLLECTIBLE';
  invoiceUrl: string | null;
  hostedInvoiceUrl: string | null;
  periodStart: string | null;
  periodEnd: string | null;
  dueDate: string | null;
  paidAt: string | null;
  voidedAt: string | null;
  description: string | null;
  createdAt: string;
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  DRAFT: { label: 'Brouillon', variant: 'secondary' },
  OPEN: { label: 'En attente', variant: 'outline' },
  PAID: { label: 'Payée', variant: 'default' },
  VOID: { label: 'Annulée', variant: 'destructive' },
  UNCOLLECTIBLE: { label: 'Impayée', variant: 'destructive' },
};

export function InvoicesList() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const fetchInvoices = useCallback(async () => {
    try {
      const response = await fetch('/api/stripe/invoices', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setInvoices(data.data?.invoices || []);
      }
    } catch (error) {
      console.error('Erreur chargement factures:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const response = await fetch('/api/stripe/invoices', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        toast.success('Factures synchronisées');
        fetchInvoices();
      } else {
        throw new Error('Erreur de synchronisation');
      }
    } catch (error) {
      toast.error('Erreur lors de la synchronisation');
    } finally {
      setSyncing(false);
    }
  };

  const handleVoidInvoice = async (invoice: Invoice) => {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette facture ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/stripe/invoices/${invoice.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'void' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Erreur lors de l\'annulation');
      }

      toast.success(data.data?.message || 'Facture annulée');
      fetchInvoices();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'annulation';
      toast.error(errorMessage);
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mes factures</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Chargement...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Mes factures</CardTitle>
          <CardDescription>Historique de vos factures et paiements</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={handleSync} disabled={syncing}>
          <IconRefresh className={`mr-2 h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Synchronisation...' : 'Synchroniser'}
        </Button>
      </CardHeader>
      <CardContent>
        {invoices.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Aucune facture pour le moment</p>
            <p className="text-sm text-muted-foreground mt-1">
              Vos factures apparaîtront ici après votre premier paiement
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">
                    {formatDate(invoice.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{invoice.description || 'Facture'}</p>
                      {invoice.periodStart && invoice.periodEnd && (
                        <p className="text-xs text-muted-foreground">
                          Période: {formatDate(invoice.periodStart)} - {formatDate(invoice.periodEnd)}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {formatAmount(invoice.amountPaid > 0 ? invoice.amountPaid : invoice.amountDue, invoice.currency)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusConfig[invoice.status]?.variant || 'secondary'}>
                      {statusConfig[invoice.status]?.label || invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <IconDotsVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {invoice.invoiceUrl && (
                          <DropdownMenuItem asChild>
                            <a href={invoice.invoiceUrl} target="_blank" rel="noopener noreferrer">
                              <IconDownload className="mr-2 h-4 w-4" />
                              Télécharger PDF
                            </a>
                          </DropdownMenuItem>
                        )}
                        {invoice.hostedInvoiceUrl && (
                          <DropdownMenuItem asChild>
                            <a href={invoice.hostedInvoiceUrl} target="_blank" rel="noopener noreferrer">
                              <IconExternalLink className="mr-2 h-4 w-4" />
                              Voir sur Stripe
                            </a>
                          </DropdownMenuItem>
                        )}
                        {(invoice.status === 'OPEN' || invoice.status === 'PAID') && (
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleVoidInvoice(invoice)}
                          >
                            <IconX className="mr-2 h-4 w-4" />
                            {invoice.status === 'PAID' ? 'Créer un avoir' : 'Annuler'}
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
