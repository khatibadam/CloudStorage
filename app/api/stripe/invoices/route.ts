import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { getAuthUser } from '@/lib/jwt';
import { successResponse, errorResponse, ErrorCodes, ApiErrors } from '@/lib/api-response';

/**
 * GET /api/stripe/invoices
 * Récupère les factures de l'utilisateur connecté
 */
export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return ApiErrors.unauthorized();
    }

    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);
    const status = searchParams.get('status');

    // Récupérer les factures depuis la BDD
    const whereClause: Record<string, unknown> = { userId: authUser.userId };
    if (status && ['DRAFT', 'OPEN', 'PAID', 'VOID', 'UNCOLLECTIBLE'].includes(status)) {
      whereClause.status = status;
    }

    const invoices = await prisma.invoice.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    // Formater les factures pour la réponse
    const formattedInvoices = invoices.map((invoice) => ({
      id: invoice.id,
      stripeInvoiceId: invoice.stripeInvoiceId,
      amountDue: invoice.amountDue / 100, // Convertir centimes en euros
      amountPaid: invoice.amountPaid / 100,
      currency: invoice.currency,
      status: invoice.status,
      invoiceUrl: invoice.invoiceUrl,
      hostedInvoiceUrl: invoice.hostedInvoiceUrl,
      periodStart: invoice.periodStart?.toISOString(),
      periodEnd: invoice.periodEnd?.toISOString(),
      dueDate: invoice.dueDate?.toISOString(),
      paidAt: invoice.paidAt?.toISOString(),
      voidedAt: invoice.voidedAt?.toISOString(),
      description: invoice.description,
      createdAt: invoice.createdAt.toISOString(),
    }));

    return successResponse({
      invoices: formattedInvoices,
      total: invoices.length,
    });
  } catch (error) {
    console.error('Erreur récupération factures:', error);
    return ApiErrors.internalError('Erreur lors de la récupération des factures');
  }
}

/**
 * POST /api/stripe/invoices/sync
 * Synchronise les factures depuis Stripe
 */
export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return ApiErrors.unauthorized();
    }

    // Récupérer l'utilisateur avec son stripeCustomerId
    const user = await prisma.user.findUnique({
      where: { id_user: authUser.userId },
      select: { stripeCustomerId: true },
    });

    if (!user?.stripeCustomerId) {
      return successResponse({ message: 'Aucun compte Stripe associé', synced: 0 });
    }

    // Récupérer les factures depuis Stripe
    const stripeInvoices = await stripe.invoices.list({
      customer: user.stripeCustomerId,
      limit: 100,
    });

    let syncedCount = 0;

    for (const stripeInvoice of stripeInvoices.data) {
      const invoiceStatus = mapStripeStatus(stripeInvoice.status);

      // Extraire les IDs (peuvent être des objets ou des strings)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const invoiceData = stripeInvoice as any;
      const customerId = typeof invoiceData.customer === 'string'
        ? invoiceData.customer
        : invoiceData.customer?.id || '';
      const subscriptionId = invoiceData.subscription
        ? (typeof invoiceData.subscription === 'string'
            ? invoiceData.subscription
            : invoiceData.subscription?.id || null)
        : null;

      await prisma.invoice.upsert({
        where: { stripeInvoiceId: stripeInvoice.id },
        create: {
          userId: authUser.userId,
          stripeInvoiceId: stripeInvoice.id,
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
          amountDue: stripeInvoice.amount_due,
          amountPaid: stripeInvoice.amount_paid,
          currency: stripeInvoice.currency,
          status: invoiceStatus,
          invoiceUrl: stripeInvoice.invoice_pdf || null,
          hostedInvoiceUrl: stripeInvoice.hosted_invoice_url || null,
          periodStart: stripeInvoice.period_start
            ? new Date(stripeInvoice.period_start * 1000)
            : null,
          periodEnd: stripeInvoice.period_end
            ? new Date(stripeInvoice.period_end * 1000)
            : null,
          dueDate: stripeInvoice.due_date
            ? new Date(stripeInvoice.due_date * 1000)
            : null,
          paidAt: stripeInvoice.status === 'paid' && stripeInvoice.status_transitions?.paid_at
            ? new Date(stripeInvoice.status_transitions.paid_at * 1000)
            : null,
          voidedAt: stripeInvoice.status === 'void' && stripeInvoice.status_transitions?.voided_at
            ? new Date(stripeInvoice.status_transitions.voided_at * 1000)
            : null,
          description: stripeInvoice.description || `Facture ${stripeInvoice.number || stripeInvoice.id}`,
        },
        update: {
          amountDue: stripeInvoice.amount_due,
          amountPaid: stripeInvoice.amount_paid,
          status: invoiceStatus,
          invoiceUrl: stripeInvoice.invoice_pdf || null,
          hostedInvoiceUrl: stripeInvoice.hosted_invoice_url || null,
          paidAt: stripeInvoice.status === 'paid' && stripeInvoice.status_transitions?.paid_at
            ? new Date(stripeInvoice.status_transitions.paid_at * 1000)
            : null,
          voidedAt: stripeInvoice.status === 'void' && stripeInvoice.status_transitions?.voided_at
            ? new Date(stripeInvoice.status_transitions.voided_at * 1000)
            : null,
        },
      });
      syncedCount++;
    }

    return successResponse({
      message: 'Factures synchronisées avec succès',
      synced: syncedCount,
    });
  } catch (error) {
    console.error('Erreur synchronisation factures:', error);
    return ApiErrors.internalError('Erreur lors de la synchronisation des factures');
  }
}

/**
 * Mappe le statut Stripe vers notre enum
 */
function mapStripeStatus(status: string | null): 'DRAFT' | 'OPEN' | 'PAID' | 'VOID' | 'UNCOLLECTIBLE' {
  switch (status) {
    case 'draft':
      return 'DRAFT';
    case 'open':
      return 'OPEN';
    case 'paid':
      return 'PAID';
    case 'void':
      return 'VOID';
    case 'uncollectible':
      return 'UNCOLLECTIBLE';
    default:
      return 'DRAFT';
  }
}
