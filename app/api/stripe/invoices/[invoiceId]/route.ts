import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { getAuthUser } from '@/lib/jwt';
import { successResponse, ApiErrors } from '@/lib/api-response';

/**
 * GET /api/stripe/invoices/[invoiceId]
 * Récupère une facture spécifique
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return ApiErrors.unauthorized();
    }

    const { invoiceId } = await params;

    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        userId: authUser.userId,
      },
    });

    if (!invoice) {
      return ApiErrors.notFound('Facture');
    }

    return successResponse({
      id: invoice.id,
      stripeInvoiceId: invoice.stripeInvoiceId,
      amountDue: invoice.amountDue / 100,
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
    });
  } catch (error) {
    console.error('Erreur récupération facture:', error);
    return ApiErrors.internalError('Erreur lors de la récupération de la facture');
  }
}

/**
 * POST /api/stripe/invoices/[invoiceId]/void
 * Annule une facture (crée un avoir)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return ApiErrors.unauthorized();
    }

    const { invoiceId } = await params;
    const body = await req.json().catch(() => ({}));
    const action = body.action || 'void';

    // Récupérer la facture
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        userId: authUser.userId,
      },
    });

    if (!invoice) {
      return ApiErrors.notFound('Facture');
    }

    if (action === 'void') {
      // Annuler la facture dans Stripe
      if (invoice.status === 'VOID') {
        return ApiErrors.validationError('Cette facture est déjà annulée');
      }

      if (invoice.status === 'PAID') {
        // Pour une facture payée, créer un avoir (credit note)
        const creditNote = await stripe.creditNotes.create({
          invoice: invoice.stripeInvoiceId,
          reason: 'order_change',
        });

        // Mettre à jour la facture en BDD
        await prisma.invoice.update({
          where: { id: invoiceId },
          data: {
            status: 'VOID',
            voidedAt: new Date(),
          },
        });

        return successResponse({
          message: 'Avoir créé avec succès',
          creditNoteId: creditNote.id,
          creditNoteUrl: creditNote.pdf,
        });
      }

      // Pour une facture non payée, simplement l'annuler
      if (invoice.status === 'OPEN' || invoice.status === 'DRAFT') {
        await stripe.invoices.voidInvoice(invoice.stripeInvoiceId);

        await prisma.invoice.update({
          where: { id: invoiceId },
          data: {
            status: 'VOID',
            voidedAt: new Date(),
          },
        });

        return successResponse({
          message: 'Facture annulée avec succès',
        });
      }

      return ApiErrors.validationError('Cette facture ne peut pas être annulée');
    }

    return ApiErrors.validationError('Action non reconnue');
  } catch (error: unknown) {
    console.error('Erreur annulation facture:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'annulation de la facture';
    return ApiErrors.stripeError(errorMessage);
  }
}
